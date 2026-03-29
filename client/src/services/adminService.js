import api from './api';

const adminService = {
  // Get dashboard stats
  getDashboardStats: async () => {
    const response = await api.get('/api/admin/stats');
    return response.data;
  },

  // Get all users
  getUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/api/admin/users?${queryString}`);
    return response.data;
  },

  // Get single user
  getUser: async (id) => {
    const response = await api.get(`/api/admin/users/${id}`);
    return response.data;
  },

  // Update user role
  updateUserRole: async (id, role) => {
    const response = await api.put(`/api/admin/users/${id}/role`, { role });
    return response.data;
  },

  // Delete user
  deleteUser: async (id) => {
    const response = await api.delete(`/api/admin/users/${id}`);
    return response.data;
  },

  // Get all courses (admin view)
  getCourses: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/api/admin/courses?${queryString}`);
    return response.data;
  },

  // Toggle course publish
  toggleCoursePublish: async (id) => {
    const response = await api.put(`/api/admin/courses/${id}/publish`);
    return response.data;
  },

  // Toggle course featured
  toggleCourseFeatured: async (id) => {
    const response = await api.put(`/api/admin/courses/${id}/featured`);
    return response.data;
  },

  // Get all payments
  getPayments: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/api/payments?${queryString}`);
    return response.data;
  }
};

export default adminService;
