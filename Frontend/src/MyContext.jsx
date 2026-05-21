import React, { createContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Create a shared context for auth + chat UI state
export const MyContext = createContext(null);

// Provider component: keeps token, user and chat UI state, and exposes helpers
export function MyProvider({ children }) {
  // Persisted auth token (kept in localStorage for refreshes)
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  // Persisted user object (optional), stored as JSON in localStorage
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });

  // Chat UI state used by ChatWindow/Chat components
  const [prompt, setPrompt] = useState('');       // current input text
  const [reply, setReply] = useState('');         // latest assistant reply
  const [currThreadId, setCurrThreadId] = useState(() => uuidv4()); // selected thread id
  const [prevChats, setPrevChats] = useState([]); // messages shown in the window
  const [newChat, setNewChat] = useState(true);   // whether to start a new thread
  const [allThreads, setAllThreads] = useState([]); // sidebar thread list

  // Keep localStorage in sync with token/user
  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  // Login helper: save token + user to state (and via effects, localStorage)
  const login = ({ token: t, user: u }) => {
    setToken(t);
    setUser(u);
  };

  // Logout helper: clear auth and chat state
  const logout = () => {
    setToken(null);
    setUser(null);
    setPrompt('');
    setReply('');
    setCurrThreadId(null);
    setPrevChats([]);
    setNewChat(true);
    setAllThreads([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Expose everything components will need
  return (
    <MyContext.Provider value={{
      token, user, login, logout,
      prompt, setPrompt, reply, setReply,
      currThreadId, setCurrThreadId,
      prevChats, setPrevChats,
      newChat, setNewChat,
      allThreads, setAllThreads
    }}>
      {children}
    </MyContext.Provider>
  );
}