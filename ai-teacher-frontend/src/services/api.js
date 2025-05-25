// src/services/api.js
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Ensure body is properly serialized
    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
      console.log('Serialized request body:', config.body);
    }

    console.log('API Request Details:', {
      url,
      method: config.method || 'GET',
      headers: config.headers,
      body: config.body,
    });

    try {
      const response = await fetch(url, config);
      
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      console.log('API Response Details:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: data
      });

      if (!response.ok) {
        let errorMessage = 'Request failed';
        
        if (typeof data === 'object' && data !== null) {
          errorMessage = data.message || data.error || JSON.stringify(data);
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
        
        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          errorMessage,
          fullResponse: data
        });
        
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('API request exception:', {
        url,
        method: config.method || 'GET',
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: userData,
    });
  }

  async getProfile(token) {
    return this.request('/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // User endpoints
  async getUserStats(token) {
    return this.request('/users/me/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getUserProgress(token) {
    return this.request('/users/me/progress', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async updateUserPreferences(preferences, token) {
    return this.request('/users/me/preferences', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: preferences,
    });
  }

  // Assessment endpoints
  async generateAssessment(subject, token, options = {}) {
    console.log('=== Assessment API Service Debug ===');
    console.log('Input subject:', subject);
    console.log('Input type:', typeof subject);
    console.log('Token present:', !!token);
    
    // Validate required parameters
    if (!subject || typeof subject !== 'string' || subject.trim() === '') {
      console.error('Subject validation failed in assessment API service');
      throw new Error('Subject is required and must be a non-empty string');
    }
    
    if (!token) {
      console.error('Token validation failed in assessment API service');
      throw new Error('Authentication token is required');
    }

    const cleanSubject = subject.trim();
    
    // Create a minimal payload that matches the backend DTO exactly
    const payload = { 
      subject: cleanSubject
    };
    
    // Only add optional fields if they have values
    if (options.difficulty && options.difficulty.trim()) {
      payload.difficulty = options.difficulty.trim();
    }
    
    if (options.questionCount && typeof options.questionCount === 'number') {
      payload.questionCount = options.questionCount;
    }
    
    if (options.focusArea && options.focusArea.trim()) {
      payload.focusArea = options.focusArea.trim();
    }
    
    if (options.assessmentType && options.assessmentType.trim()) {
      payload.assessmentType = options.assessmentType.trim();
    }

    console.log('Final assessment payload to be sent:', JSON.stringify(payload, null, 2));

    try {
      const result = await this.request('/assessments/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: payload,
      });
      console.log('Assessment API call successful:', result);
      return result;
    } catch (error) {
      console.error('Assessment API call failed with error:', error);
      throw error;
    }
  }

  async submitAssessment(assessmentData, token) {
    return this.request('/assessments/submit', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: assessmentData,
    });
  }

  async getAssessments(token) {
    return this.request('/assessments', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getAssessmentResults(assessmentId, token) {
    return this.request(`/assessments/${assessmentId}/results`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getAssessmentStats(token) {
    return this.request('/assessments/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async retakeAssessment(assessmentId, token) {
    return this.request(`/assessments/${assessmentId}/retake`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Course endpoints
  async getUserCourses(token) {
    return this.request('/courses', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getCourse(courseId, token) {
    return this.request(`/courses/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async generatePersonalizedCourse(subject, token, options = {}) {
    console.log('=== API Service Debug ===');
    console.log('Input subject:', subject);
    console.log('Input type:', typeof subject);
    console.log('Token present:', !!token);
    
    // Validate required parameters
    if (!subject || typeof subject !== 'string' || subject.trim() === '') {
      console.error('Subject validation failed in API service');
      throw new Error('Subject is required and must be a non-empty string');
    }
    
    if (!token) {
      console.error('Token validation failed in API service');
      throw new Error('Authentication token is required');
    }

    const cleanSubject = subject.trim();
    
    // Create a minimal payload that matches the backend DTO exactly
    const payload = { 
      subject: cleanSubject
    };
    
    // Only add optional fields if they have values
    if (options.difficulty && options.difficulty.trim()) {
      payload.difficulty = options.difficulty.trim();
    }
    
    if (options.focusArea && options.focusArea.trim()) {
      payload.focusArea = options.focusArea.trim();
    }
    
    if (options.learningObjective && options.learningObjective.trim()) {
      payload.learningObjective = options.learningObjective.trim();
    }

    console.log('Final payload to be sent:', JSON.stringify(payload, null, 2));

    try {
      const result = await this.request('/courses/personalized', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: payload,
      });
      console.log('API call successful:', result);
      return result;
    } catch (error) {
      console.error('API call failed with error:', error);
      throw error;
    }
  }

  async updateCourseProgress(courseId, progressData, token) {
    return this.request(`/courses/${courseId}/progress`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: progressData,
    });
  }

  async getCourseStats(token) {
    return this.request('/courses/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getRecommendedCourses(token) {
    return this.request('/courses/recommended', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async searchCourses(query, token) {
    return this.request(`/courses/search?q=${encodeURIComponent(query)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async duplicateCourse(courseId, token) {
    return this.request(`/courses/${courseId}/duplicate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}

export default new ApiService();