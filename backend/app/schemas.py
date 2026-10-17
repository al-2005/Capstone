from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Category = Literal["IT", "Facilities", "Classroom", "Accounts"]
Priority = Literal["low", "normal", "high", "urgent"]
TicketStatus = Literal["open", "in_progress", "waiting", "resolved"]


class TicketCreate(BaseModel):
    subject: str = Field(min_length=5, max_length=180)
    description: str = Field(min_length=10, max_length=5000)
    category: Category = "IT"
    priority: Priority = "normal"
    requester: str = Field(min_length=2, max_length=100)


class TicketUpdate(BaseModel):
    status: TicketStatus | None = None
    priority: Priority | None = None
    assignee: str | None = Field(default=None, max_length=100)


class TicketRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    subject: str
    description: str
    category: Category
    priority: Priority
    status: TicketStatus
    requester: str
    assignee: str | None
    created_at: datetime
    updated_at: datetime


class TicketStats(BaseModel):
    total: int
    open: int
    in_progress: int
    waiting: int
    resolved: int
    urgent: int
    overdue_sla: int
