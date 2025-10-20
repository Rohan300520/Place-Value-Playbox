import React, { useState } from 'react';

interface AdminLoginProps {
  onLogin: (user: string, pass: string) => boolean;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    const success = onLogin(username, password);
    if (!success) {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div
      className="w-full max-w-md p-8 rounded-3xl shadow-2xl animate-pop-in text-center"
      style={{
        backgroundColor: 'var(--backdrop-bg)',
        borderColor: 'var(--border-primary)',
        borderWidth: '1px',
        backdropFilter: 'blur(10px)',
      }}
    >
      <img src="/assets/logo.svg" alt="SMART C Logo" className="h-16 mx-auto mb-4" />
      <h1 className="text-4xl font-black font-display mb-2" style={{ color: 'var(--text-accent)' }}>
        Admin Login
      </h1>
      <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
        Please enter your credentials to access the key management panel.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full p-3 text-lg rounded-lg border-2 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
          style={{
            backgroundColor: 'var(--panel-bg)',
            borderColor: 'var(--border-primary)',
            color: 'var(--text-primary)',
          }}
          aria-label="Username"
          autoComplete="username"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-3 text-lg rounded-lg border-2 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
          style={{
            backgroundColor: 'var(--panel-bg)',
            borderColor: 'var(--border-primary)',
            color: 'var(--text-primary)',
          }}
          aria-label="Password"
          autoComplete="current-password"
        />
        {error && <p className="text-red-500 font-bold">{error}</p>}
        <button
          type="submit"
          className="w-full text-white font-bold text-xl py-3 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 border-b-4 active:border-b-2 font-display"
          style={{
            backgroundColor: 'var(--btn-action-bg)',
            borderColor: 'var(--btn-action-border)',
          }}
        >
          Sign In
        </button>
      </form>
    </div>
  );
};