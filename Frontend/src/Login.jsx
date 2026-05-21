import React, { useState, useContext } from 'react';
import { MyContext } from './MyContext.jsx';
import './Login.css';

// Login form: posts credentials to backend, calls context.login on success
export default function Login({ onSwitch }) {
  const { login } = useContext(MyContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Submit handler: POST /auth/login expects { email, password }
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        // Backend should return { token, user }; store them via context
        login({ token: data.token, user: data.user });
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
    setLoading(false);
  };

  return (
    <div className="loginPage">
      <div className="loginCard">
        <h2 className="loginTitle">Login</h2>
        <p className="loginSubtitle">Welcome back. Sign in to continue your chats.</p>
        <form className="loginForm" onSubmit={submit}>
          <div className="loginField">
          <label>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="loginField">
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password" />
          </div>
          <button className="loginButton" type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        </form>
        <p className="loginFooter">
          Don’t have an account? <a className="loginLink" href="/register" onClick={(e) => { e.preventDefault(); onSwitch?.(); }}>Create one</a>
        </p>
      </div>
    </div>
  );
}