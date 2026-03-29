import api from './api';

const progressService = {
  // Get all progress
  getAllProgress: async () => {
    const response = await api.get('/api/progress');
    return response.data;
  },

  // Get course progress
  getCourseProgress: async (courseId) => {
    const response = await api.get(`/api/progress/${courseId}`);
    return response.data;
  },

  // Mark lesson complete
  markLessonComplete: async (courseId, lessonId, watchedDuration = 0) => {
    const response = await api.post(
      `/api/progress/${courseId}/lessons/${lessonId}/complete`,
      { watchedDuration }
    );
    return response.data;
  },

  // Update watch time
  updateWatchTime: async (courseId, lessonId, watchedDuration) => {
    const response = await api.put(
      `/api/progress/${courseId}/lessons/${lessonId}/watch-time`,
      { watchedDuration }
    );
    return response.data;
  },

  // Get certificates
  getCertificates: async () => {
    const response = await api.get('/api/progress/certificates');
    return response.data;
  },

  // Get single certificate
  getCertificate: async (id) => {
    const response = await api.get(`/api/progress/certificates/${id}`);
    return response.data;
  },

  // Verify certificate (public)
  verifyCertificate: async (certificateId) => {
    const response = await api.get(`/api/progress/certificates/verify/${certificateId}`);
    return response.data;
  }
};

export default progressService;
