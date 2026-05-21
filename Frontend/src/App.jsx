import "./App.css";
import ChatWindow from "./ChatWindow"
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import Sidebar from "./Sidebar"
import { useContext } from "react";
import { MyContext } from "./MyContext.jsx";
import { useEffect, useState } from "react";

function App() {
  const { token } = useContext(MyContext);
  const [pathname, setPathname] = useState(window.location.pathname);

  // Keep the UI in sync with browser navigation without adding a router dependency
  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Redirect authenticated users away from auth pages, and unauthenticated users to login
  useEffect(() => {
    if (token && (pathname === '/login' || pathname === '/register')) {
      window.history.replaceState({}, '', '/');
      setPathname('/');
      return;
    }

    if (!token && pathname !== '/login' && pathname !== '/register') {
      window.history.replaceState({}, '', '/login');
      setPathname('/login');
    }
  }, [token, pathname]);

  const goTo = (path) => {
    window.history.pushState({}, '', path);
    setPathname(path);
  };

  if (pathname === '/login') {
    return <Login onSwitch={() => goTo('/register')} />;
  }

  if (pathname === '/register') {
    return <Register onSwitch={() => goTo('/login')} />;
  }

  if (!token) return null;

  return (
    <div className="app">
      <Sidebar></Sidebar>
      <ChatWindow></ChatWindow>
    </div>
  )
}

export default App
