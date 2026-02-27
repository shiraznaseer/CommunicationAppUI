import api from './api';

/**
 * Authentication service for register and login operations.
 * Stores JWT token and user info in localStorage.
 * 
 * SECURITY NOTE:
 * - localStorage is used for simplicity (demo only)
 * - Production should consider httpOnly cookies or more secure storage
 */

export const authService = {
  async register(username, password) {
    const response = await api.post('/auth/register', { username, password });
    const { token, userId, username: userName } = response.data;
    
    // Store authentication data
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId.toString());
    localStorage.setItem('username', userName);
    
    return response.data;
  },

  async login(username, password) {
    const response = await api.post('/auth/login', { username, password });
    const { token, userId, username: userName } = response.data;
    
    // Store authentication data
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId.toString());
    localStorage.setItem('username', userName);
    
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  getCurrentUser() {
    return {
      userId: parseInt(localStorage.getItem('userId')),
      username: localStorage.getItem('username'),
      token: localStorage.getItem('token'),
    };
  },
};
