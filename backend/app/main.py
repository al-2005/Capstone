from datetime import datetime, timedelta, timezone

from fastapi import Depends, FastAPI, HTTPException, Query, Response, status
from prometheus_fastapi_instrumentator import Instrumentator
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Ticket
from app.schemas import TicketCreate, TicketRead, TicketStats, TicketUpdate

app = FastAPI(title="Campus Helpdesk API", version="1.0.0")
Instrumentator().instrument(app).expose(app, endpoint="/metrics", include_in_schema=True)

SLA_HOURS = {"urgent": 4, "high": 24, "normal": 72, "low": 120}


@app.get("/")
def root() -> dict[str, str]:
    return {"name": "Campus Helpdesk API", "docs": "/docs"}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/ready")
def ready(db: Session = Depends(get_db)) -> dict[str, str]:
    db.execute(select(1))
    return {"status": "ready"}


@app.get("/api/tickets", response_model=list[TicketRead])
def list_tickets(
    status_filter: str | None = Query(default=None, alias="status"),
    priority: str | None = Query(default=None),
    category: str | None = Query(default=None),
    search: str | None = Query(default=None, max_length=180),
    db: Session = Depends(get_db),
) -> list[Ticket]:
    query = select(Ticket)
    if status_filter and status_filter != "all":
        query = query.where(Ticket.status == status_filter)
    if priority and priority != "all":
        query = query.where(Ticket.priority == priority)
    if category and category != "all":
        query = query.where(Ticket.category == category)
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.where(
            or_(
                Ticket.subject.ilike(term),
                Ticket.description.ilike(term),
                Ticket.requester.ilike(term),
            )
        )
    return list(db.scalars(query.order_by(Ticket.created_at.desc(), Ticket.id.desc())))


@app.get("/api/tickets/stats", response_model=TicketStats)
def ticket_stats(db: Session = Depends(get_db)) -> TicketStats:
    rows = db.scalars(select(Ticket)).all()
    now = datetime.now(timezone.utc)
    open_tickets = [ticket for ticket in rows if ticket.status != "resolved"]
    overdue = 0
    for ticket in open_tickets:
        created_at = ticket.created_at
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        if now - created_at > timedelta(hours=SLA_HOURS[ticket.priority]):
            overdue += 1
    return TicketStats(
        total=len(rows),
        open=sum(ticket.status == "open" for ticket in rows),
        in_progress=sum(ticket.status == "in_progress" for ticket in rows),
        waiting=sum(ticket.status == "waiting" for ticket in rows),
        resolved=sum(ticket.status == "resolved" for ticket in rows),
        urgent=sum(ticket.priority == "urgent" and ticket.status != "resolved" for ticket in rows),
        overdue_sla=overdue,
    )


@app.get("/api/tickets/{ticket_id}", response_model=TicketRead)
def get_ticket(ticket_id: int, db: Session = Depends(get_db)) -> Ticket:
    ticket = db.get(Ticket, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
    return ticket


@app.post("/api/tickets", response_model=TicketRead, status_code=status.HTTP_201_CREATED)
def create_ticket(payload: TicketCreate, db: Session = Depends(get_db)) -> Ticket:
    ticket = Ticket(**payload.model_dump())
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


@app.patch("/api/tickets/{ticket_id}", response_model=TicketRead)
def update_ticket(
    ticket_id: int, payload: TicketUpdate, db: Session = Depends(get_db)
) -> Ticket:
    ticket = db.get(Ticket, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(ticket, field, value)
    db.commit()
    db.refresh(ticket)
    return ticket


@app.delete("/api/tickets/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(ticket_id: int, db: Session = Depends(get_db)) -> Response:
    ticket = db.get(Ticket, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
    db.delete(ticket)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
