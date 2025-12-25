import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { isAxiosError } from 'axios';
import {
  User,
  Lock,
  Mail,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

type UserType = {
  id: string;
  name: string;
  email: string;
};

function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.id;
        const res = await api.get(`/user/${userId}`);
        setUser(res.data);
        setName(res.data.name || '');
        setEmail(res.data.email || '');
      } catch {
        localStorage.removeItem('token');
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleUpdate = async (field: 'name' | 'email' | 'password') => {
    if (!user) return;
    setLoading(true);
    setMessage('');

    const payload: { name?: string; email?: string; password?: string } = {};
    if (field === 'name') payload.name = name;
    if (field === 'email') payload.email = email;
    if (field === 'password') payload.password = password;

    try {
      const res = await api.patch(`/user/${user.id}`, payload);
      setUser(res.data);
      if (field === 'password') setPassword('');
      setMessage(
        `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } updated successfully!`
      );
    } catch (err) {
      if (isAxiosError(err)) {
        setMessage(err.response?.data?.message || `Error updating ${field}`);
      } else {
        setMessage(`Error updating ${field}. Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    if (
      !confirm(
        'Are you sure you want to delete your account? This cannot be undone.'
      )
    )
      return;

    try {
      await api.delete(`/user/${user.id}`);
      localStorage.removeItem('token');
      navigate('/login');
    } catch (err) {
      if (isAxiosError(err)) {
        setMessage(err.response?.data?.message || 'Error deleting account');
      } else {
        setMessage('Error deleting account. Please try again.');
      }
    }
  };

  const toggleCard = (card: string) => {
    setExpanded(expanded === card ? null : card);
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-4">
      <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
        <User size={28} /> Account Settings
      </h2>

      {message && (
        <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm font-medium">
          {message}
        </div>
      )}

      {/* Card Menu */}
      <div className="space-y-4">
        {/* Update Name */}
        <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
          <button
            className="w-full px-6 py-4 flex justify-between items-center focus:outline-none hover:bg-gray-50"
            onClick={() => toggleCard('name')}
          >
            <span className="flex items-center gap-2 font-medium text-gray-700">
              <Edit2 size={18} /> Update Name
            </span>
            {expanded === 'name' ? (
              <ChevronUp size={18} />
            ) : (
              <ChevronDown size={18} />
            )}
          </button>
          {expanded === 'name' && (
            <div className="px-6 pb-4">
              <input
                type="text"
                className="w-full mt-2 rounded-md border px-3 py-2 focus:ring focus:ring-blue-300"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <button
                onClick={() => handleUpdate('name')}
                disabled={loading}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Save Name
              </button>
            </div>
          )}
        </div>

        {/* Update Email */}
        <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
          <button
            className="w-full px-6 py-4 flex justify-between items-center focus:outline-none hover:bg-gray-50"
            onClick={() => toggleCard('email')}
          >
            <span className="flex items-center gap-2 font-medium text-gray-700">
              <Mail size={18} /> Update Email
            </span>
            {expanded === 'email' ? (
              <ChevronUp size={18} />
            ) : (
              <ChevronDown size={18} />
            )}
          </button>
          {expanded === 'email' && (
            <div className="px-6 pb-4">
              <input
                type="email"
                className="w-full mt-2 rounded-md border px-3 py-2 focus:ring focus:ring-blue-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                onClick={() => handleUpdate('email')}
                disabled={loading}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Save Email
              </button>
            </div>
          )}
        </div>

        {/* Update Password */}
        <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
          <button
            className="w-full px-6 py-4 flex justify-between items-center focus:outline-none hover:bg-gray-50"
            onClick={() => toggleCard('password')}
          >
            <span className="flex items-center gap-2 font-medium text-gray-700">
              <Lock size={18} /> Update Password
            </span>
            {expanded === 'password' ? (
              <ChevronUp size={18} />
            ) : (
              <ChevronDown size={18} />
            )}
          </button>
          {expanded === 'password' && (
            <div className="px-6 pb-4">
              <input
                type="password"
                placeholder="Leave blank to keep current password"
                className="w-full mt-2 rounded-md border px-3 py-2 focus:ring focus:ring-blue-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                onClick={() => handleUpdate('password')}
                disabled={loading}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Save Password
              </button>
            </div>
          )}
        </div>

        {/* Delete Account */}
        <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
          <button
            className="w-full px-6 py-4 flex justify-between items-center focus:outline-none hover:bg-gray-50"
            onClick={() => toggleCard('delete')}
          >
            <span className="flex items-center gap-2 font-medium text-red-600">
              <Trash2 size={18} /> Delete Account
            </span>
            {expanded === 'delete' ? (
              <ChevronUp size={18} />
            ) : (
              <ChevronDown size={18} />
            )}
          </button>
          {expanded === 'delete' && (
            <div className="px-6 pb-4">
              <p className="text-red-600 font-medium">
                Are you sure? This will permanently delete your account.
              </p>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="mt-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Delete Account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
