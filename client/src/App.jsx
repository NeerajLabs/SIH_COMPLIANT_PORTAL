import { useEffect, useMemo, useState } from "react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

const initialLogin = {
  employeeId: "",
  password: ""
};

const initialComplaint = {
  name: "",
  complaint: ""
};

function api(path, options = {}) {
  const token = localStorage.getItem("resolve_token");

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
}

function App() {
  const [page, setPage] = useState(
    localStorage.getItem("resolve_token") ? "dashboard" : "login"
  );

  const [login, setLogin] = useState(initialLogin);
  const [complaint, setComplaint] = useState(initialComplaint);

  const [employeeId, setEmployeeId] = useState(
    localStorage.getItem("resolve_employee_id") || ""
  );

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const firstName = useMemo(() => {
    return complaint.name.trim().split(/\s+/)[0] || "there";
  }, [complaint.name]);

  useEffect(() => {
    if (page === "history") {
      loadHistory();
    }
  }, [page]);

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify(login)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to sign in.");
      }

      localStorage.setItem("resolve_token", data.token);
      localStorage.setItem("resolve_employee_id", data.employeeId);

      setEmployeeId(data.employeeId);
      setComplaint((current) => ({
        ...current,
        name: ""
      }));

      setPage("dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleComplaint(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    try {
      const response = await api("/tickets", {
        method: "POST",
        body: JSON.stringify({
          employeeName: complaint.name,
          complaint: complaint.complaint
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to submit complaint.");
      }

      setTickets((current) => [data.ticket, ...current]);
      setNotice("Your complaint has been submitted successfully.");

      setTimeout(() => {
        setComplaint((current) => ({
          ...current,
          complaint: ""
        }));
        setNotice("");
        setPage("dashboard");
      }, 700);
    } catch (err) {
      if (err.message.toLowerCase().includes("session")) {
        logout();
        return;
      }

      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory() {
    setHistoryLoading(true);
    setError("");

    try {
      const response = await api("/tickets/my");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load history.");
      }

      setTickets(data.tickets || []);
    } catch (err) {
      if (err.message.toLowerCase().includes("session")) {
        logout();
        return;
      }

      setError(err.message);
    } finally {
      setHistoryLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("resolve_token");
    localStorage.removeItem("resolve_employee_id");
    setEmployeeId("");
    setTickets([]);
    setComplaint(initialComplaint);
    setLogin(initialLogin);
    setPage("login");
  }

  const avatarLetter =
    (complaint.name.trim()[0] || employeeId.trim()[0] || "U").toUpperCase();

  return (
    <main className="shell">
      <div className="brand">
        <span className="brand-mark">✓</span>
        Resolve
      </div>

      {page === "login" && (
        <section className="page">
          <div className="intro">
            <h1>Welcome back</h1>
            <p>Sign in to access the employee complaint portal.</p>
          </div>

          <form className="card form-card" onSubmit={handleLogin}>
            <div className="field">
              <label htmlFor="login-id">Employee ID</label>
              <input
                id="login-id"
                value={login.employeeId}
                onChange={(e) =>
                  setLogin({ ...login, employeeId: e.target.value })
                }
                placeholder="e.g. EMP-1048"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={login.password}
                onChange={(e) =>
                  setLogin({ ...login, password: e.target.value })
                }
                placeholder="Enter your password"
                required
              />
            </div>

            {error && <div className="error">{error}</div>}

            <button className="primary" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </section>
      )}

      {page === "dashboard" && (
        <section className="page">
          <div className="topbar">
            <div>
              <strong>
                Good day, <span>{firstName}</span>
              </strong>
              <p className="sub">How can we help today?</p>
            </div>

            <div className="topbar-right">
              <div className="avatar">{avatarLetter}</div>
              <button className="logout" onClick={logout}>
                Sign out
              </button>
            </div>
          </div>

          <div className="card dashboard">
            <h1>Support centre</h1>
            <p className="sub">
              Raise a new request or check the progress of your earlier tickets.
            </p>

            <div className="actions">
              <button
                className="action"
                type="button"
                onClick={() => {
                  setError("");
                  setPage("submit");
                }}
              >
                <span className="icon">＋</span>
                <strong>Raise a ticket</strong>
                <span>Tell us about a new issue</span>
              </button>

              <button
                className="action"
                type="button"
                onClick={() => setPage("history")}
              >
                <span className="icon">◷</span>
                <strong>History</strong>
                <span>View your complaint history</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {page === "submit" && (
        <section className="page">
          <div className="intro">
            <h1>We’re here to help.</h1>
            <p>
              Tell us what happened and our support team will get back to you
              shortly.
            </p>
          </div>

          <form className="card form-card" onSubmit={handleComplaint}>
            <div className="field">
              <label htmlFor="id">Employee ID</label>
              <input id="id" value={employeeId} readOnly />
            </div>

            <div className="field">
              <label htmlFor="name">Employee name</label>
              <input
                id="name"
                value={complaint.name}
                onChange={(e) =>
                  setComplaint({ ...complaint, name: e.target.value })
                }
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="complaint">Complaint</label>
              <textarea
                id="complaint"
                value={complaint.complaint}
                onChange={(e) =>
                  setComplaint({ ...complaint, complaint: e.target.value })
                }
                placeholder="Describe your issue here..."
                required
              />
            </div>

            {error && <div className="error">{error}</div>}

            {notice && <div className="notice show">{notice}</div>}

            <div className="form-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => setPage("dashboard")}
              >
                Cancel
              </button>

              <button className="primary" disabled={loading}>
                {loading ? "Submitting..." : "Submit complaint"}
              </button>
            </div>
          </form>
        </section>
      )}

      {page === "history" && (
        <section className="page">
          <div className="history-head">
            <div>
              <h1>Your history</h1>
              <p className="sub">A record of your support requests.</p>
            </div>

            <button
              className="back"
              type="button"
              onClick={() => setPage("dashboard")}
            >
              ← Back
            </button>
          </div>

          {error && <div className="error history-error">{error}</div>}

          <div className="card history">
            {historyLoading ? (
              <article className="ticket empty">
                <div>
                  <h3>Loading history...</h3>
                  <p>Please wait.</p>
                </div>
              </article>
            ) : tickets.length ? (
              tickets.map((ticket) => (
                <article className="ticket" key={ticket._id}>
                  <span className="ticket-id">{ticket.ticketId}</span>

                  <div>
                    <h3>{ticket.complaint}</h3>
                    <p>
                      Raised by {ticket.employeeName} ·{" "}
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span
                    className={`status ${
                      ticket.status === "Open" ? "open" : ""
                    }`}
                  >
                    {ticket.status}
                  </span>
                </article>
              ))
            ) : (
              <article className="ticket empty">
                <div>
                  <h3>No tickets yet</h3>
                  <p>Your submitted complaints will appear here.</p>
                </div>
              </article>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

export default App;
