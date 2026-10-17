def ticket_payload(**overrides):
    payload = {
        "subject": "Classroom projector is offline",
        "description": "The projector in room 204 is not connecting to the laptop.",
        "category": "Classroom",
        "priority": "high",
        "requester": "Sample Student",
    }
    return {**payload, **overrides}


def test_submit_and_read_ticket(client):
    response = client.post("/api/tickets", json=ticket_payload())
    assert response.status_code == 201
    ticket = response.json()
    assert ticket["subject"] == "Classroom projector is offline"
    assert ticket["status"] == "open"
    assert ticket["assignee"] is None
    assert client.get(f"/api/tickets/{ticket['id']}").json()["requester"] == "Sample Student"


def test_list_filters_and_search(client):
    client.post("/api/tickets", json=ticket_payload(priority="high"))
    client.post(
        "/api/tickets",
        json=ticket_payload(subject="Campus Wi-Fi keeps dropping", category="IT", priority="urgent"),
    )
    assert len(client.get("/api/tickets", params={"category": "Classroom"}).json()) == 1
    assert len(client.get("/api/tickets", params={"priority": "urgent"}).json()) == 1
    assert len(client.get("/api/tickets", params={"search": "Wi-Fi"}).json()) == 1
    assert len(client.get("/api/tickets").json()) == 2


def test_staff_can_triage_and_resolve(client):
    ticket_id = client.post("/api/tickets", json=ticket_payload()).json()["id"]
    update = client.patch(
        f"/api/tickets/{ticket_id}",
        json={"status": "in_progress", "assignee": "Helpdesk Agent", "priority": "urgent"},
    )
    assert update.status_code == 200
    assert update.json()["assignee"] == "Helpdesk Agent"
    assert update.json()["status"] == "in_progress"
    assert client.patch(f"/api/tickets/{ticket_id}", json={"status": "resolved"}).json()[
        "status"
    ] == "resolved"


def test_stats_count_ticket_statuses_and_priority(client):
    client.post("/api/tickets", json=ticket_payload(priority="urgent"))
    in_progress_id = client.post("/api/tickets", json=ticket_payload(priority="normal")).json()["id"]
    client.patch(f"/api/tickets/{in_progress_id}", json={"status": "in_progress"})
    resolved_id = client.post("/api/tickets", json=ticket_payload(priority="low")).json()["id"]
    client.patch(f"/api/tickets/{resolved_id}", json={"status": "resolved"})

    stats = client.get("/api/tickets/stats").json()
    assert stats["total"] == 3
    assert stats["open"] == 1
    assert stats["in_progress"] == 1
    assert stats["resolved"] == 1
    assert stats["urgent"] == 1


def test_validation_not_found_and_delete(client):
    assert client.post("/api/tickets", json=ticket_payload(subject="no")).status_code == 422
    assert client.get("/api/tickets/999").status_code == 404
    assert client.patch("/api/tickets/999", json={"status": "resolved"}).status_code == 404
    ticket_id = client.post("/api/tickets", json=ticket_payload()).json()["id"]
    assert client.delete(f"/api/tickets/{ticket_id}").status_code == 204
    assert client.get(f"/api/tickets/{ticket_id}").status_code == 404


def test_health_readiness_and_metrics(client):
    assert client.get("/health").json() == {"status": "ok"}
    assert client.get("/ready").json() == {"status": "ready"}
    assert client.get("/metrics").status_code == 200
