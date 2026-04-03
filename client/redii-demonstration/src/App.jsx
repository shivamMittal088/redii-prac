import { useState } from 'react'
import './App.css'

const API = 'http://localhost:3000/api/auth'

const EyeIcon = ({ open }) => open ? (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

function validate(fields, isSignup) {
  const errs = {}
  if (isSignup) {
    if (!fields.name.trim()) errs.name = 'Name is required.'
    else if (fields.name.trim().length < 3) errs.name = 'Name must be at least 3 characters.'
  }
  if (!fields.email.trim()) errs.email = 'Email is required.'
  else if (!/^\S+@\S+\.\S+$/.test(fields.email)) errs.email = 'Enter a valid email address.'
  if (!fields.password) errs.password = 'Password is required.'
  else if (fields.password.length < 6) errs.password = 'Password must be at least 6 characters.'
  if (isSignup) {
    if (!fields.confirm) errs.confirm = 'Please confirm your password.'
    else if (fields.confirm !== fields.password) errs.confirm = 'Passwords do not match.'
  }
  return errs
}

function App() {
  const [isSignup, setIsSignup] = useState(false)
  const [fields, setFields] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFields(f => ({ ...f, [name]: value }))
    setErrors(er => ({ ...er, [name]: '' }))
    setServerError('')
  }

  const handleToggle = () => {
    setIsSignup(s => !s)
    setFields({ name: '', email: '', password: '', confirm: '' })
    setErrors({})
    setServerError('')
    setSuccess('')
    setShowPassword(false)
    setShowConfirm(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate(fields, isSignup)
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    setServerError('')
    setSuccess('')

    try {
      const body = isSignup
        ? { name: fields.name, email: fields.email, password: fields.password }
        : { email: fields.email, password: fields.password }

      const res = await fetch(`${API}/${isSignup ? 'signup' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setServerError(data.error || 'Something went wrong.')
      } else {
        setSuccess(isSignup ? 'Account created! You can now log in.' : `Welcome back, ${data.user.name}!`)
        setFields({ name: '', email: '', password: '', confirm: '' })
        if (!isSignup && data.token) {
          localStorage.setItem('token', data.token)
        }
      }
    } catch {
      setServerError('Unable to reach the server. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="card">
        <h2 className="title">{isSignup ? 'Create account' : 'Welcome back'}</h2>
        <p className="subtitle">{isSignup ? 'Sign up to get started.' : 'Log in to your account.'}</p>

        {serverError && <div className="alert error">{serverError}</div>}
        {success && <div className="alert success">{success}</div>}

        <form onSubmit={handleSubmit} noValidate>
          {isSignup && (
            <div className="field">
              <label>Name</label>
              <input
                name="name"
                value={fields.name}
                onChange={handleChange}
                placeholder="John Doe"
                className={errors.name ? 'input-err' : ''}
              />
              {errors.name && <span className="err-msg">{errors.name}</span>}
            </div>
          )}

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={fields.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={errors.email ? 'input-err' : ''}
            />
            {errors.email && <span className="err-msg">{errors.email}</span>}
          </div>

          <div className="field">
            <label>Password</label>
            <div className={`input-wrap ${errors.password ? 'input-err' : ''}`}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={fields.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
              />
              <button type="button" className="eye-btn" onClick={() => setShowPassword(s => !s)} tabIndex={-1}>
                <EyeIcon open={showPassword} />
              </button>
            </div>
            {errors.password && <span className="err-msg">{errors.password}</span>}
          </div>

          {isSignup && (
            <div className="field">
              <label>Confirm Password</label>
              <div className={`input-wrap ${errors.confirm ? 'input-err' : ''}`}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirm"
                  value={fields.confirm}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                />
                <button type="button" className="eye-btn" onClick={() => setShowConfirm(s => !s)} tabIndex={-1}>
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
              {errors.confirm && <span className="err-msg">{errors.confirm}</span>}
            </div>
          )}

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Please wait…' : isSignup ? 'Sign up' : 'Log in'}
          </button>
        </form>

        <p className="toggle">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button className="link-btn" onClick={handleToggle}>
            {isSignup ? 'Log in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default App
