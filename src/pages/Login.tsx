import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full border border-red-600/30">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">GRIT Admin</h1>
          <p className="text-gray-400">Sign in to access the dashboard</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full bg-gray-800 text-white rounded px-4 py-3 border border-gray-700 focus:outline-none focus:border-red-600"
              placeholder="admin@gritgym.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full bg-gray-800 text-white rounded px-4 py-3 border border-gray-700 focus:outline-none focus:border-red-600"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-600/10 border border-red-600/50 p-3 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded font-bold hover:bg-red-700 transition disabled:bg-gray-700 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
