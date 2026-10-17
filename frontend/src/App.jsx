import { useCallback, useEffect, useMemo, useState } from "react";

const statusFilters = [
  ["all", "All tickets"],
  ["open", "Open"],
  ["in_progress", "In progress"],
  ["waiting", "Waiting"],
  ["resolved", "Resolved"],
];

const initialForm = {
  subject: "",
  description: "",
  category: "IT",
  priority: "normal",
  requester: "",
};

const categoryIcons = { IT: "⌘", Facilities: "⌂", Classroom: "▤", Accounts: "$" };

function App() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    in_progress: 0,
    waiting: 0,
    resolved: 0,
    urgent: 0,
    overdue_sla: 0,
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      if (search.trim()) params.set("search", search.trim());
      const [ticketResponse, statsResponse] = await Promise.all([
        fetch(`/api/tickets?${params}`),
        fetch("/api/tickets/stats"),
      ]);
      if (!ticketResponse.ok || !statsResponse.ok) {
        throw new Error("The helpdesk API returned an error. Please retry.");
      }
      const [ticketData, statsData] = await Promise.all([
        ticketResponse.json(),
        statsResponse.json(),
      ]);
      setTickets(ticketData);
      setStats(statsData);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to connect to the helpdesk API.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, search]);

  useEffect(() => {
    const timer = window.setTimeout(loadDashboard, 180);
    return () => window.clearTimeout(timer);
  }, [loadDashboard]);

  const resolutionRate = useMemo(
    () => (stats.total ? Math.round((stats.resolved / stats.total) * 100) : 0),
    [stats],
  );

  async function submitTicket(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error("Ticket submission failed. Check the form and retry.");
      setForm(initialForm);
      setDialogOpen(false);
      await loadDashboard();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to submit ticket.");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateTicket(ticket, patch) {
    setError("");
    try {
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!response.ok) throw new Error("Ticket could not be updated.");
      await loadDashboard();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update ticket.");
    }
  }

  async function deleteTicket(ticketId) {
    setError("");
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Ticket could not be deleted.");
      await loadDashboard();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to delete ticket.");
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="Campus Helpdesk home">
          <span className="brand-symbol">+</span>
          <span>campus<span className="brand-light">desk</span></span>
        </a>
        <div className="workspace-caption">CAMPUS SERVICES</div>
        <button className="campus-switch">
          <span className="campus-mark">N</span>
          <span className="campus-copy"><strong>Northwood Campus</strong><small>Student services</small></span>
          <span className="switch-caret">⌄</span>
        </button>

        <div className="nav-heading">SERVICE DESK</div>
        <nav className="side-nav" aria-label="Service desk navigation">
          <a href="#overview" className="side-link active"><span className="nav-glyph">▦</span> Overview</a>
          <a href="#tickets" className="side-link"><span className="nav-glyph">▤</span> Ticket queue <span className="side-badge">{stats.open}</span></a>
          <a href="#tickets" className="side-link"><span className="nav-glyph">◷</span> My assignments</a>
          <a href="#insights" className="side-link"><span className="nav-glyph">▥</span> Service insights</a>
        </nav>

        <div className="sidebar-gap" />
        <div className="on-call-card">
          <div className="on-call-top"><span className="on-call-dot" /> ON-CALL SUPPORT</div>
          <div className="on-call-person"><span className="person-avatar">HA</span><span><strong>Helpdesk Agent</strong><small>IT · Available now</small></span></div>
          <button onClick={() => setDialogOpen(true)}>Submit a request <span>↗</span></button>
        </div>
        <a href="#settings" className="side-link settings-link"><span className="nav-glyph">⚙</span> Settings</a>
        <div className="user-profile"><div className="profile-avatar">CS</div><span className="profile-copy"><strong>Campus Student</strong><small>Student · Year 3</small></span><span className="profile-menu">···</span></div>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar">
          <div className="breadcrumb"><span>Northwood Campus</span><b>/</b><strong>Service desk</strong></div>
          <div className="top-actions">
            <label className="search-field"><span>⌕</span><input aria-label="Search tickets" placeholder="Search tickets..." value={search} onChange={(event) => setSearch(event.target.value)} /><kbd>⌘ K</kbd></label>
            <button className="notification" aria-label="Notifications">♧<i /></button>
            <div className="top-user">CS</div>
          </div>
        </header>

        <section className="welcome-row">
          <div>
            <div className="eyebrow">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).toUpperCase()}</div>
            <h1>Service desk overview <span>✳</span></h1>
            <p>Every request matters. Here's the latest across campus.</p>
          </div>
          <button className="new-ticket-button" onClick={() => setDialogOpen(true)}><span>＋</span> Submit a ticket</button>
        </section>

        {error && <div className="error-banner" role="alert"><span>{error}</span><button aria-label="Dismiss error" onClick={() => setError("")}>×</button></div>}

        <section className="metric-grid" aria-label="Service desk metrics">
          <article className="metric-card"><div className="metric-top"><span>All requests</span><span className="metric-icon violet">▤</span></div><strong>{stats.total}</strong><div className="metric-note"><i className="tiny-dot violet-dot" /> Lifetime tickets</div></article>
          <article className="metric-card"><div className="metric-top"><span>Needs attention</span><span className="metric-icon amber">◷</span></div><strong>{stats.open + stats.in_progress + stats.waiting}</strong><div className="metric-note"><i className="tiny-dot amber-dot" /> {stats.open} new · {stats.in_progress} in progress</div></article>
          <article className="metric-card"><div className="metric-top"><span>Resolved</span><span className="metric-icon green">✓</span></div><strong>{stats.resolved}</strong><div className="metric-note"><i className="tiny-dot green-dot" /> {resolutionRate}% resolution rate</div></article>
          <article className="metric-card"><div className="metric-top"><span>Urgent tickets</span><span className="metric-icon red">!</span></div><strong>{stats.urgent}</strong><div className="metric-note"><i className="tiny-dot red-dot" /> {stats.overdue_sla} past response target</div></article>
        </section>

        <div className="content-grid">
          <section className="panel queue-panel" id="tickets">
            <div className="panel-head">
              <div><h2>Support queue</h2><p>Track and triage incoming campus requests.</p></div>
              <button className="filter-button" onClick={() => { setStatusFilter("all"); setCategoryFilter("all"); setSearch(""); }}><span>☷</span> Clear filters</button>
            </div>
            <div className="queue-controls">
              <div className="status-tabs" role="tablist" aria-label="Filter tickets by status">
                {statusFilters.map(([value, label]) => <button key={value} role="tab" aria-selected={statusFilter === value} className={statusFilter === value ? "selected" : ""} onClick={() => setStatusFilter(value)}>{label}{value === "all" && <span className="tab-count">{stats.total}</span>}</button>)}
              </div>
              <select className="category-select" aria-label="Filter by category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                <option value="all">All categories</option><option>IT</option><option>Facilities</option><option>Classroom</option><option>Accounts</option>
              </select>
            </div>
            {loading ? <div className="loading-state">Loading campus requests…</div> : tickets.length === 0 ? (
              <div className="empty-state"><span className="empty-icon">✓</span><strong>{search || statusFilter !== "all" || categoryFilter !== "all" ? "No tickets match those filters" : "The queue is clear"}</strong><p>{search || statusFilter !== "all" || categoryFilter !== "all" ? "Try adjusting your search or filters." : "New campus requests will appear here."}</p><button onClick={() => setDialogOpen(true)}>Submit a request <span>↗</span></button></div>
            ) : (
              <div className="ticket-table-wrap">
                <table className="ticket-table">
                  <thead><tr><th>REQUEST</th><th>REQUESTER</th><th>ASSIGNEE</th><th>PRIORITY</th><th>STATUS</th><th>AGE</th><th><span className="sr-only">Actions</span></th></tr></thead>
                  <tbody>{tickets.map((ticket) => <tr key={ticket.id}>
                    <td><div className="request-cell"><span className={`category-icon ${ticket.category.toLowerCase()}`}>{categoryIcons[ticket.category]}</span><span className="request-info"><strong>HD-{String(ticket.id).padStart(4, "0")} · {ticket.subject}</strong><small>{ticket.category} <i>·</i> {ticket.assignee ? `Assigned to ${ticket.assignee}` : "Unassigned"}</small></span></div></td>
                    <td><span className="requester-cell"><i>{ticket.requester.slice(0, 1).toUpperCase()}</i>{ticket.requester}</span></td>
                    <td><select aria-label={`Assignee for ticket HD-${ticket.id}`} className="assignee-select" value={ticket.assignee || ""} onChange={(event) => updateTicket(ticket, { assignee: event.target.value || null })}><option value="">Unassigned</option><option>Helpdesk Agent</option><option>Facilities Support</option><option>Classroom Support</option></select></td>
                    <td><select aria-label={`Priority for ticket HD-${ticket.id}`} className={`priority-select ${ticket.priority}`} value={ticket.priority} onChange={(event) => updateTicket(ticket, { priority: event.target.value })}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></td>
                    <td><select aria-label={`Status for ticket HD-${ticket.id}`} className={`ticket-status ${ticket.status}`} value={ticket.status} onChange={(event) => updateTicket(ticket, { status: event.target.value })}><option value="open">Open</option><option value="in_progress">In progress</option><option value="waiting">Waiting</option><option value="resolved">Resolved</option></select></td>
                    <td className="age-cell">{formatAge(ticket.created_at)}</td>
                    <td><button className="delete-ticket" aria-label={`Delete ticket HD-${ticket.id}`} onClick={() => deleteTicket(ticket.id)}>×</button></td>
                  </tr>)}</tbody>
                </table>
              </div>
            )}
            <div className="table-footer"><span>Showing <strong>{tickets.length}</strong> of <strong>{stats.total}</strong> requests</span><button onClick={() => { setStatusFilter("all"); setCategoryFilter("all"); setSearch(""); }}>View complete queue <span>→</span></button></div>
          </section>

          <aside className="right-column">
            <section className="panel health-panel" id="insights">
              <div className="panel-head compact"><div><h2>Service health</h2><p>Current request status</p></div><button className="more-button" aria-label="More service health options">···</button></div>
              <div className="health-chart"><div className="health-ring" style={{ "--resolution": `${resolutionRate}%` }}><div><strong>{resolutionRate}%</strong><span>resolved</span></div></div><div className="health-legend"><div><span><i className="legend-dot resolved-dot" /> Resolved</span><strong>{stats.resolved}</strong></div><div><span><i className="legend-dot progress-dot" /> In progress</span><strong>{stats.in_progress}</strong></div><div><span><i className="legend-dot waiting-dot" /> Waiting</span><strong>{stats.waiting}</strong></div><div><span><i className="legend-dot open-dot" /> Open</span><strong>{stats.open}</strong></div></div></div>
              <div className="health-footer"><span className="service-indicator" /> API and database operational</div>
            </section>
            <section className="panel priority-panel">
              <div className="panel-head compact"><div><h2>Priority watch</h2><p>Items that need a closer look</p></div><span className="watch-icon">⌁</span></div>
              <div className="watch-content">
                {tickets.filter((ticket) => ticket.status !== "resolved" && ["urgent", "high"].includes(ticket.priority)).slice(0, 3).map((ticket) => <div className="watch-ticket" key={ticket.id}><span className={`watch-priority ${ticket.priority}`}><i /></span><span className="watch-copy"><strong>HD-{String(ticket.id).padStart(4, "0")} · {ticket.subject}</strong><small>{ticket.priority} priority <i>·</i> {ticket.status.replace("_", " ")}</small></span><button aria-label={`Resolve ticket HD-${ticket.id}`} onClick={() => updateTicket(ticket, { status: "resolved" })}>✓</button></div>)}
                {!tickets.some((ticket) => ticket.status !== "resolved" && ["urgent", "high"].includes(ticket.priority)) && <div className="no-urgent">No urgent or high-priority requests in this view.</div>}
              </div>
              <button className="watch-footer" onClick={() => { setStatusFilter("all"); setCategoryFilter("all"); setSearch(""); }}>Review all open requests <span>→</span></button>
            </section>
          </aside>
        </div>

        <section className="workflow" aria-label="Support workflow">
          <div className="workflow-label"><span className="workflow-pulse" /> SUPPORT WORKFLOW <span className="live-tag">LIVE</span></div>
          <div className="workflow-stages"><span><i className="stage-open" /> Open <strong>{stats.open}</strong></span><b /><span><i className="stage-progress" /> In progress <strong>{stats.in_progress}</strong></span><b /><span><i className="stage-waiting" /> Waiting <strong>{stats.waiting}</strong></span><b /><span><i className="stage-resolved" /> Resolved <strong>{stats.resolved}</strong></span></div>
          <span className="workflow-rate">{resolutionRate}% resolution</span>
        </section>
        <footer className="page-footer"><span>Campus Helpdesk <i>·</i> Northwood University</span><span><i className="footer-online" /> Service status: operational</span><a href="http://localhost:8000/docs" target="_blank" rel="noreferrer">API documentation ↗</a></footer>
      </main>

      {dialogOpen && <div className="modal-shade" onMouseDown={(event) => { if (event.target === event.currentTarget) setDialogOpen(false); }}><section className="ticket-modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><header className="modal-head"><div><span className="modal-overline">CAMPUS SUPPORT REQUEST</span><h2 id="dialog-title">Submit a ticket</h2><p>Tell the service team what's happening.</p></div><button className="modal-close" aria-label="Close dialog" onClick={() => setDialogOpen(false)}>×</button></header><form onSubmit={submitTicket}>
        <label>Your name<input required minLength="2" maxLength="100" placeholder="e.g. Campus Student" value={form.requester} onChange={(event) => setForm({ ...form, requester: event.target.value })} /></label>
        <label>What do you need help with?<input required minLength="5" maxLength="180" placeholder="Briefly describe the issue" value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} /></label>
        <label>Details<textarea required minLength="10" maxLength="5000" rows="4" placeholder="Share details that will help us resolve your request..." value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        <div className="modal-row"><label>Service area<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option>IT</option><option>Facilities</option><option>Classroom</option><option>Accounts</option></select></label><label>Priority<select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></label></div>
        <div className="modal-actions"><button className="cancel-button" type="button" onClick={() => setDialogOpen(false)}>Cancel</button><button className="submit-button" type="submit" disabled={submitting}>{submitting ? "Submitting…" : "Submit request ↗"}</button></div>
      </form></section></div>}
    </div>
  );
}

function formatAge(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "—";
  const hours = Math.max(0, Math.floor((Date.now() - date.getTime()) / 3_600_000));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default App;
