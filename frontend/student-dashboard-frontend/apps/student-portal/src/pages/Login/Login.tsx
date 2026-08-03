import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

interface LoginProps {
  onLoginSuccess?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('CTU1001@busflow.com');
  const [password, setPassword] = useState('demo-password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 Attempting login with:', email);

      // Call backend API
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.data?.accessToken) {
        throw new Error(data.message || 'Login failed');
      }

      console.log('✅ Login successful');

      // Store token
      const token = data.data.accessToken;
      localStorage.setItem('accessToken', token);
      localStorage.setItem('studentToken', token);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userRole', 'STUDENT');
      localStorage.setItem('isAuthenticated', 'true');

      console.log('✅ Token stored in localStorage');

      // Notify App component
      window.dispatchEvent(new Event('authUpdated'));
      onLoginSuccess?.();

      // Navigate to dashboard
      console.log('✅ Navigating to dashboard');
      navigate('/');
    } catch (err: any) {
      const errorMsg = err.message || 'Login failed. Please check your credentials.';
      setError(errorMsg);
      console.error('❌ Login error:', err);
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">🚌 BUS FLOW</h1>
        <p className="login-subtitle">Student Dashboard</p>

        {error && (
          <div className="login-error">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-demo">
          <p>Demo Student Account:</p>
          <code>Email: CTU1001@busflow.com</code>
          <code>Password: demo-password</code>
        </div>
      </div>
    </div>
  );
};
