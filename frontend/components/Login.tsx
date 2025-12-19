import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    axios
      .get('/user/me')
      .then(() => navigate('/'))
      .catch(() => localStorage.removeItem('token'));
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/user/login', {
        email,
        password,
      });
      console.log('Login successful:', res.data);
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      if (err instanceof Error) {
        console.error('Login failed:', err.message);
        setError(err.message);
      } else {
        console.error('Login failed: unknown error');
        setError('Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        value={password}
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error && <p>{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}

export default Login;
