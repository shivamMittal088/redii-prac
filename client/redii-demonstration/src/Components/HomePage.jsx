import { useNavigate } from 'react-router-dom'
import '../App.css'

function HomePage() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // proceed with local logout even if request fails
    }
    navigate('/login')
  }

  return (
    <div className="page">
      <div className="card">
        <h2 className="title">Home</h2>
        <p className="subtitle">You are logged in.</p>
        <button className="btn" onClick={handleLogout}>Log out</button>
      </div>
    </div>
  )
}

export default HomePage
