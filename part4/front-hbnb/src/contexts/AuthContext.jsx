import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    if (saved && token) {
      setUser(JSON.parse(saved));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const { access_token } = data;
      const payload = JSON.parse(atob(access_token.split('.')[1]));
      const userInfo = { id: payload.sub, is_admin: payload.is_admin, email };

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(userInfo));

      // Sync axios default header immediately
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      setUser(userInfo);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Identifiants invalides' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      loading,
      isAuthenticated: !!user,
      isAdmin: !!user?.is_admin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
