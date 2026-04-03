import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import '../App.css'

const API = 'http://localhost:3000/api/auth'

function HomePage() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [sessionsLoading, setSessionsLoading] = useState(true)

  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true)
    try {
      const res = await fetch(`${API}/sessions`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setSessions(data.sessions)
      }
    } catch {
      // silently fail
    } finally {
      setSessionsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const handleLogout = async () => {
    try {
      await fetch(`${API}/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // proceed even if request fails
    }
    navigate('/login')
  }

  const handleLogoutAll = async () => {
    if (!window.confirm('This will log out ALL users. Are you sure?')) return
    try {
      await fetch(`${API}/logout-all`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // proceed even if request fails
    }
    navigate('/login')
  }

  return (
    <div className="page">
      <div className="card">
        <h2 className="title">Home</h2>
        <p className="subtitle">You are logged in.</p>

        <div className="settings-section">
          <p className="settings-label">Active Sessions</p>
          {sessionsLoading ? (
            <p className="sessions-loading">Loading...</p>
          ) : sessions.length === 0 ? (
            <p className="sessions-empty">No active sessions found.</p>
          ) : (
            <ul className="sessions-list">
              {sessions.map((s) => (
                <li key={s.sid} className={`session-item${s.isCurrent ? ' session-current' : ''}`}>
                  <span className="session-name">{s.name}</span>
                  <span className="session-email">{s.email}</span>
                  {s.isCurrent && <span className="session-badge">You</span>}
                </li>
              ))}
            </ul>
          )}
          <button className="btn btn-refresh" onClick={fetchSessions} disabled={sessionsLoading}>
            Refresh
          </button>
        </div>

        <div className="settings-section" style={{ marginTop: '1rem' }}>
          <p className="settings-label">Session</p>
          <button className="btn" onClick={handleLogout}>Log out</button>
          <button className="btn btn-danger" onClick={handleLogoutAll}>Log out all users</button>
        </div>
      </div>
    </div>
  )
}

export default HomePage
