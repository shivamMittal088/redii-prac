import { useNavigate } from 'react-router-dom'
import '../App.css'

function HomePage() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
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
