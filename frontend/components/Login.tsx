import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { isAxiosError } from 'axios';
import { LogIn } from 'lucide-react';
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    api
      .get('/user/me')
      .then(() => navigate('/'))
      .catch(() => localStorage.removeItem('token'));
  }, [navigate]);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/user/login', { email, password });
      console.log('Login successful:', res.data);
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || 'Invalid email or password.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {' '}
      <div className="max-w-md w-full bg-white shadow-xl border border-blue-100 rounded-2xl p-8">
        {' '}
        <div className="mb-6 text-center">
          {' '}
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto flex items-center justify-center mb-4">
            {' '}
            <LogIn className="w-8 h-8 text-white" />{' '}
          </div>{' '}
          <h2 className="text-3xl font-bold text-gray-800">Finance Tracker</h2>{' '}
          <p className="text-gray-500 text-sm mt-2">
            {' '}
            Sign in to manage your finances efficiently{' '}
          </p>{' '}
        </div>{' '}
        <form onSubmit={handleLogin} className="space-y-5">
          {' '}
          <input
            type="email"
            value={email}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
          />{' '}
          <input
            type="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
          />{' '}
          {error && <p className="text-red-500 text-sm">{error}</p>}{' '}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {' '}
            {loading ? 'Logging in...' : 'Login'}{' '}
          </button>{' '}
        </form>{' '}
        <p className="text-center text-gray-400 text-sm mt-4">
          {' '}
          Don't have an account?{' '}
          <span
            className="text-blue-500 cursor-pointer"
            onClick={() => navigate('/signup')}
          >
            Sign up
          </span>{' '}
        </p>{' '}
      </div>{' '}
    </div>
  );
}
export default Login;
