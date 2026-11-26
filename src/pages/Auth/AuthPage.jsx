import { useState } from 'react'

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function AuthPage({ onLoggedIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [message, setMessage] = useState('')
  const [formVersion, setFormVersion] = useState(0)
  const [emailIsEditable, setEmailIsEditable] = useState(false)
  const [passwordIsEditable, setPasswordIsEditable] = useState(false)

  function clearFields() {
    setEmail('')
    setPassword('')
    setEmailIsEditable(false)
    setPasswordIsEditable(false)
    setFormVersion((currentVersion) => currentVersion + 1)
  }

  async function submitForm(event) {
    event.preventDefault()
    setMessage('')

    try {
      const response = await fetch(`${apiUrl}/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()

      if (!response.ok) {
        setMessage(data.detail || 'Something went wrong')
        return
      }

      if (mode === 'register') {
        setMessage('Registration complete. You can log in now.')
        clearFields()
        setMode('login')
        return
      }

      const savedEmail = email.trim().toLowerCase()
      localStorage.setItem('cookit.token', data.access_token)
      localStorage.setItem('cookit.user-id', data.user_id)
      localStorage.setItem('cookit.user-email', savedEmail)
      onLoggedIn(data.user_id, savedEmail)
    } catch {
      setMessage('Could not connect to the server')
    }
  }

  function changeMode() {
    clearFields()
    setMessage('')
    setMode(mode === 'login' ? 'register' : 'login')
  }

  return (
    <main className="auth-page">
      <form autoComplete="off" className="auth-form" key={formVersion} onSubmit={submitForm}>
        <h1>CookIt</h1>
        <h2>{mode === 'login' ? 'Log in' : 'Create account'}</h2>

        <label>
          Email
          <input
            autoComplete="off"
            inputMode="email"
            name={`cookit-email-${formVersion}`}
            onChange={(event) => setEmail(event.target.value)}
            onFocus={() => setEmailIsEditable(true)}
            readOnly={!emailIsEditable}
            type="text"
            value={email}
            required
          />
        </label>

        <label>
          Password
          <input
            autoComplete="new-password"
            name={`cookit-password-${formVersion}`}
            onChange={(event) => setPassword(event.target.value)}
            onFocus={() => setPasswordIsEditable(true)}
            readOnly={!passwordIsEditable}
            minLength="6"
            type="password"
            value={password}
            required
          />
        </label>

        <button type="submit">{mode === 'login' ? 'Log in' : 'Register'}</button>
        {message && <p>{message}</p>}

        <button className="auth-switch" onClick={changeMode} type="button">
          {mode === 'login' ? 'Create a new account' : 'I already have an account'}
        </button>
      </form>
    </main>
  )
}
