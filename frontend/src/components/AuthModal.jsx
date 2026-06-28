import React, { useState } from 'react';
import axios from 'axios';
import { X, Lock, Mail, User } from 'lucide-react';

function AuthModal({ isOpen, onClose, mode, setMode, onAuthSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = mode === 'login' 
        ? '/api/auth/login' 
        : '/api/auth/register';

      const payload = mode === 'login' 
        ? { email, password } 
        : { name, email, password };

      const response = await axios.post(url, payload);

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        onAuthSuccess(response.data.user, response.data.token);
        onClose();
      } else {
        setError(response.data.message || 'Authentication failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please check your connections.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <h2 className="gradient-text" style={{ fontSize: '28px', marginBottom: '8px', textAlign: 'center' }}>
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '24px', fontSize: '14px' }}>
          {mode === 'login' ? 'Access your dashboard & book rooms' : 'Register to unlock exclusive pricing'}
        </p>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--error)',
            color: 'var(--error)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mode === 'register' && (
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="John Doe"
                  className="input-field"
                  style={{ width: '100%', paddingLeft: '44px' }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
              <input
                type="email"
                placeholder="your@email.com"
                className="input-field"
                style={{ width: '100%', paddingLeft: '44px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
              <input
                type="password"
                placeholder="••••••••"
                className="input-field"
                style={{ width: '100%', paddingLeft: '44px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '8px', padding: '14px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
          {mode === 'login' ? (
            <p>
              New to Beach Resort?{' '}
              <span 
                style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }}
                onClick={() => setMode('register')}
              >
                Create an Account
              </span>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <span 
                style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }}
                onClick={() => setMode('login')}
              >
                Sign In
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
