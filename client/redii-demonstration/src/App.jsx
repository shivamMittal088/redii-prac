import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './Components/Login.jsx'
import HomePage from './Components/HomePage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
