import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Avatar, IconButton, Menu, MenuItem, Divider } from '@mui/material';
import { Settings, LogOut, User } from 'lucide-react';

type JwtPayload = {
  id: string;
  email: string;
  exp: number;
};

function parseJwt(token: string): JwtPayload | null {
  try {
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(atob(base64Payload));
    return payload;
  } catch {
    return null;
  }
}

function Layout() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [user, setUser] = useState<JwtPayload | null>(null);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const decoded = parseJwt(token);

    if (!decoded || decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      navigate('/login');
      return;
    }

    requestAnimationFrame(() => setUser(decoded));
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 text-white">
          <h1 className="text-lg font-bold tracking-wide">Finance Tracker</h1>

          <div className="flex items-center gap-3">
            {/* User info */}
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">{user?.email}</p>
            </div>

            <Avatar sx={{ bgcolor: '#ffffff33' }}>
              <User size={18} />
            </Avatar>

            <IconButton
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ color: 'white' }}
            >
              <Settings size={20} />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  navigate('/dashboard');
                }}
              >
                <User size={18} className="mr-2" />
                Dashbord
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  navigate('/settings');
                }}
              >
                <Settings size={18} className="mr-2" />
                Profile Settings
              </MenuItem>

              <Divider />

              <MenuItem onClick={logout}>
                <LogOut size={18} className="mr-2" />
                Sign Out
              </MenuItem>
            </Menu>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
