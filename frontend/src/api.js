const API_BASE = '/api';

function getAuthHeaders(isFormData = false) {
  const token = localStorage.getItem('token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

async function handleResponse(res) {
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
      window.location.href = '/login';
    }
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

export const api = {
  // Auth
  auth: {
    login: (credentials) =>
      fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      }).then(handleResponse),
    register: (userData) =>
      fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      }).then(handleResponse),
    me: () =>
      fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders(),
      }).then(handleResponse),
    updateProfile: (profileData) =>
      fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData),
      }).then(handleResponse),
  },

  // Courses
  courses: {
    getAll: () =>
      fetch(`${API_BASE}/courses`, {
        headers: getAuthHeaders(),
      }).then(handleResponse),
    browse: () =>
      fetch(`${API_BASE}/courses/browse`, {
        headers: getAuthHeaders(),
      }).then(handleResponse),
    getById: (id) =>
      fetch(`${API_BASE}/courses/${id}`, {
        headers: getAuthHeaders(),
      }).then(handleResponse),
    create: (data) =>
      fetch(`${API_BASE}/courses`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),
    update: (id, data) =>
      fetch(`${API_BASE}/courses/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),
    delete: (id) =>
      fetch(`${API_BASE}/courses/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }).then(handleResponse),
    enroll: (id) =>
      fetch(`${API_BASE}/courses/${id}/enroll`, {
        method: 'POST',
        headers: getAuthHeaders(),
      }).then(handleResponse),
    getStudents: (id) =>
      fetch(`${API_BASE}/courses/${id}/students`, {
        headers: getAuthHeaders(),
      }).then(handleResponse),
  },

  // Learning Objectives (Bloom's Taxonomy)
  objectives: {
    getByCourse: (courseId) =>
      fetch(`${API_BASE}/objectives/course/${courseId}`, {
        headers: getAuthHeaders(),
      }).then(handleResponse),
    create: (data) =>
      fetch(`${API_BASE}/objectives`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),
    update: (id, data) =>
      fetch(`${API_BASE}/objectives/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),
    delete: (id) =>
      fetch(`${API_BASE}/objectives/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }).then(handleResponse),
  },

  // Course Materials
  materials: {
    getByCourse: (courseId) =>
      fetch(`${API_BASE}/materials/course/${courseId}`, {
        headers: getAuthHeaders(),
      }).then(handleResponse),
    upload: (formData) =>
      fetch(`${API_BASE}/materials/upload`, {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: formData,
      }).then(handleResponse),
    delete: (id) =>
      fetch(`${API_BASE}/materials/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }).then(handleResponse),
  },

  // Question Bank & AI Generator
  questions: {
    generateAI: (data) =>
      fetch(`${API_BASE}/questions/generate-ai`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),
    getByCourse: (courseId, bloomLevel) => {
      const url = bloomLevel
        ? `${API_BASE}/questions/course/${courseId}?bloom_level=${bloomLevel}`
        : `${API_BASE}/questions/course/${courseId}`;
      return fetch(url, { headers: getAuthHeaders() }).then(handleResponse);
    },
    create: (data) =>
      fetch(`${API_BASE}/questions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),
    update: (id, data) =>
      fetch(`${API_BASE}/questions/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),
    delete: (id) =>
      fetch(`${API_BASE}/questions/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }).then(handleResponse),
  },

  // Assessments
  assessments: {
    getByCourse: (courseId) =>
      fetch(`${API_BASE}/assessments/course/${courseId}`, {
        headers: getAuthHeaders(),
      }).then(handleResponse),
    getById: (id) =>
      fetch(`${API_BASE}/assessments/${id}`, {
        headers: getAuthHeaders(),
      }).then(handleResponse),
    create: (data) =>
      fetch(`${API_BASE}/assessments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),
    togglePublish: (id) =>
      fetch(`${API_BASE}/assessments/${id}/toggle-publish`, {
        method: 'POST',
        headers: getAuthHeaders(),
      }).then(handleResponse),
    delete: (id) =>
      fetch(`${API_BASE}/assessments/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }).then(handleResponse),
  },

  // Assessment Attempts & Grading
  attempts: {
    start: (assessmentId) =>
      fetch(`${API_BASE}/attempts/start/${assessmentId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      }).then(handleResponse),
    submit: (attemptId, answers) =>
      fetch(`${API_BASE}/attempts/submit/${attemptId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ answers }),
      }).then(handleResponse),
    getResult: (attemptId) =>
      fetch(`${API_BASE}/attempts/result/${attemptId}`, {
        headers: getAuthHeaders(),
      }).then(handleResponse),
    getHistory: (courseId) => {
      const url = courseId
        ? `${API_BASE}/attempts/student/history?course_id=${courseId}`
        : `${API_BASE}/attempts/student/history`;
      return fetch(url, { headers: getAuthHeaders() }).then(handleResponse);
    },
  },

  // Analytics
  analytics: {
    getFacultyCourse: (courseId) =>
      fetch(`${API_BASE}/analytics/faculty/course/${courseId}`, {
        headers: getAuthHeaders(),
      }).then(handleResponse),
    getStudentProfile: (courseId) => {
      const url = courseId
        ? `${API_BASE}/analytics/student/cognitive-profile?course_id=${courseId}`
        : `${API_BASE}/analytics/student/cognitive-profile`;
      return fetch(url, { headers: getAuthHeaders() }).then(handleResponse);
    },
    getFacultyStudentDrilldown: (studentId, courseId) =>
      fetch(`${API_BASE}/analytics/faculty/student/${studentId}/course/${courseId}`, {
        headers: getAuthHeaders(),
      }).then(handleResponse),
  },

  // Recommendations
  recommendations: {
    getStudent: (courseId) => {
      const url = courseId
        ? `${API_BASE}/recommendations/student?course_id=${courseId}`
        : `${API_BASE}/recommendations/student`;
      return fetch(url, { headers: getAuthHeaders() }).then(handleResponse);
    },
    getDetail: (id) =>
      fetch(`${API_BASE}/recommendations/${id}`, {
        headers: getAuthHeaders(),
      }).then(handleResponse),
  },
};
