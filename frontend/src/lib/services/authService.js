const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/users';

export const register = async (email, password) => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  
  return data;
};

export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  if (!response.ok) {
    if (data.needsVerification) {
      throw new Error('Please verify your email before logging in');
    }
    throw new Error(data.message);
  }
  
  localStorage.setItem('user', JSON.stringify(data));
  return data;
};

export const logout = async () => {
  const user = getCurrentUser();
  if (user) {
    try {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  localStorage.removeItem('user');
};

export const verifyEmail = async (token) => {
  const response = await fetch(`${API_URL}/verify-email/${token}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
};

export const requestPasswordReset = async (email) => {
  const response = await fetch(`${API_URL}/request-password-reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await fetch(`${API_URL}/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, newPassword }),
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const getProfile = async () => {
  const user = getCurrentUser();
  if (!user) throw new Error('No user logged in');

  const response = await fetch(`${API_URL}/profile`, {
    headers: {
      'Authorization': `Bearer ${user.token}`,
    },
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  
  return data;
}; 