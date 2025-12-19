import { useState } from 'react';
import axios from '../api/axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('/user/login', {
        email: email,
        password: password,
      });

      console.log('Login success:', response.data);
    } catch (error) {
      console.log('Login failed:', error);
    }
  };

  return (
    <div>
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;
