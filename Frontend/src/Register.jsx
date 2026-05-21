import React, { useState } from 'react';
import './Register.css';

// Register form: posts new user data to backend, logs in on success
export default function Register({ onSwitch }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Submit handler: POST /auth/register expects { name, email, password }
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        // Registration succeeds, then send the user to the login page instead of signing them in
        alert('Registration successful. Please log in.');
        onSwitch?.();
      } else {
        const firstError = Array.isArray(data.errors) && data.errors.length > 0 ? data.errors[0].msg : '';
        setError(data.message || firstError || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <div className="registerPage">
      <div className="registerCard">
        <h2 className="registerTitle">Create account</h2>
        <p className="registerSubtitle">Join AskAI and start saving your chats securely.</p>
        {error ? <div className="registerError">{error}</div> : null}
        <form className="registerForm" onSubmit={submit}>
          <div className="registerField">
            <label>Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="registerField">
            <label>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="registerField">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password" />
          </div>
          <button className="registerButton" type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
        </form>
        <p className="registerFooter">
          Already have an account? <a className="registerLink" href="/login" onClick={(e) => { e.preventDefault(); onSwitch?.(); }}>Login</a>
        </p>
      </div>
    </div>
  );
}