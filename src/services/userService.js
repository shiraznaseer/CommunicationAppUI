import api from './api';

/**
 * User service for fetching user data.
 */

export const userService = {
  async getAllUsers() {
    const response = await api.get('/users');
    return response.data;
  },
};
