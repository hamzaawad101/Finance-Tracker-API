import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import Login from '../components/Login';
import Signup from '../components/Signup';
import Dashboard from '../ pages/Dashboard';
import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/Layout';
import Settings from '../components/Settings';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes (no layout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes WITH layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          {/* add more protected pages here */}
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Root redirect */}
        <Route
          path="/"
          element={
            localStorage.getItem('token') ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
