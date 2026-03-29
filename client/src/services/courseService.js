import api from './api';

const courseService = {
  // Get all courses with filters
  getCourses: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/api/courses?${queryString}`);
    return response.data;
  },

  // Get single course by ID
  getCourse: async (id) => {
    const response = await api.get(`/api/courses/${id}`);
    return response.data;
  },

  // Get course by slug
  getCourseBySlug: async (slug) => {
    const response = await api.get(`/api/courses/slug/${slug}`);
    return response.data;
  },

  // Get enrolled courses
  getEnrolledCourses: async () => {
    const response = await api.get('/api/courses/enrolled');
    return response.data;
  },

  // Create course (instructor/admin)
  createCourse: async (courseData) => {
    const response = await api.post('/api/courses', courseData);
    return response.data;
  },

  // Update course
  updateCourse: async (id, courseData) => {
    const response = await api.put(`/api/courses/${id}`, courseData);
    return response.data;
  },

  // Delete course
  deleteCourse: async (id) => {
    const response = await api.delete(`/api/courses/${id}`);
    return response.data;
  },

  // Upload course thumbnail
  uploadThumbnail: async (id, formData) => {
    const response = await api.post(`/api/courses/${id}/thumbnail`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Add lesson to course
  addLesson: async (courseId, lessonData) => {
    const response = await api.post(`/api/courses/${courseId}/lessons`, lessonData);
    return response.data;
  },

  // Update lesson
  updateLesson: async (courseId, lessonId, lessonData) => {
    const response = await api.put(`/api/courses/${courseId}/lessons/${lessonId}`, lessonData);
    return response.data;
  },

  // Delete lesson
  deleteLesson: async (courseId, lessonId) => {
    const response = await api.delete(`/api/courses/${courseId}/lessons/${lessonId}`);
    return response.data;
  },

  // Upload lesson video
  uploadLessonVideo: async (courseId, lessonId, formData) => {
    const response = await api.post(
      `/api/courses/${courseId}/lessons/${lessonId}/video`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  // Enroll in free course
  enrollCourse: async (courseId) => {
    const response = await api.post(`/api/courses/${courseId}/enroll`);
    return response.data;
  },

  // Add review
  addReview: async (courseId, reviewData) => {
    const response = await api.post(`/api/courses/${courseId}/reviews`, reviewData);
    return response.data;
  },

  // Get categories
  getCategories: async () => {
    const response = await api.get('/api/courses/categories');
    return response.data;
  }
};

export default courseService;
