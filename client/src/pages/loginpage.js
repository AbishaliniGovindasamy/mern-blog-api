import { useState, useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../usercontext";

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [redirect, setRedirect] = useState(false);
  const { setUserInfo } = useContext(UserContext);

  async function login(ev) {
    ev.preventDefault();
    try {
      const response = await fetch('http://localhost:4000/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Ensure cookies are sent
      });

      if (response.ok) {
        const userInfo = await response.json();
        setUserInfo(userInfo); // Store user info in context
        setRedirect(true); // Set redirect flag
      } else {
        alert('Wrong credentials');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    }
  }

  if (redirect) {
    return <Navigate to="/" />;
  }

  return (
    <form className="login-form fade-in" onSubmit={login}>
      <h1>Login</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="input-field"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="input-field"
      />
      <button type="submit" className="submit-btn">Login</button>
    </form>
  );
}
