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
          // Handle array of error messages
          if (Array.isArray(data.message)) {
            errorMessage = data.message.join(', ');
          } else {
            errorMessage = data.message || data.error || JSON.stringify(data);
          }
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

  // Assessment endpoints
async generateAssessment(subject, token, options = {}) {
  if (!subject || typeof subject !== 'string' || subject.trim() === '') {
    throw new Error('Subject is required and must be a non-empty string');
  }
  
  if (!token) {
    throw new Error('Authentication token is required');
  }

  // Create a proper DTO object matching the backend's GenerateAssessmentDto
  const payload = { 
    subject: subject.trim(),
    difficulty: options.difficulty || 'medium',
    questionCount: options.questionCount || 15,
    focusArea: options.focusArea || undefined,
    assessmentType: options.assessmentType || 'diagnostic'
  };

  console.log('Sending assessment generation request:', payload);

  return this.request('/assessments/generate', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: payload,
  });
}

async generatePersonalizedCourse(subject, token, options = {}) {
  if (!subject || typeof subject !== 'string' || subject.trim() === '') {
    throw new Error('Subject is required and must be a non-empty string');
  }
  
  if (!token) {
    throw new Error('Authentication token is required');
  }

  // Create a proper DTO object matching the backend's GeneratePersonalizedCourseDto
  const payload = { 
    subject: subject.trim(),
    difficulty: options.difficulty || undefined,
    focusArea: options.focusArea || undefined,
    learningObjective: options.learningObjective || undefined
  };

  console.log('Sending personalized course generation request:', payload);

  return this.request('/courses/personalized', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: payload,
  });
}

async updateCourseProgress(courseId, progressData, token) {
  if (!courseId) {
    throw new Error('Course ID is required');
  }
  
  if (!token) {
    throw new Error('Authentication token is required');
  }

  return this.request(`/courses/${courseId}/progress`, {
    method: 'PATCH',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: progressData,
  });
}

  async submitAssessment(assessmentData, token) {
    console.log('=== Submit Assessment API Debug ===');
    console.log('Raw assessment data:', assessmentData);
    
    // Validate required fields
    if (!assessmentData.assessmentId) {
      throw new Error('Assessment ID is required');
    }
    
    if (!assessmentData.answers || !Array.isArray(assessmentData.answers)) {
      throw new Error('Answers must be provided as an array');
    }
    
    if (!token) {
      throw new Error('Authentication token is required');
    }

    // Convert to numbers and validate
    const assessmentId = Number(assessmentData.assessmentId);
    if (isNaN(assessmentId) || assessmentId <= 0) {
      throw new Error('Assessment ID must be a positive number');
    }

    // Format the payload properly
    const payload = {
      assessmentId: assessmentId,
      answers: assessmentData.answers.map(answer => ({
        selectedAnswer: Number(answer.selectedAnswer),
        timeSpent: Number(answer.timeSpent || 30000),
        confidence: String(answer.confidence || 'medium')
      })),
      totalTimeSpent: Number(assessmentData.totalTimeSpent || 0)
    };

    // Validate payload
    if (payload.answers.some(answer => isNaN(answer.selectedAnswer))) {
      throw new Error('All selected answers must be valid numbers');
    }

    console.log('Formatted payload:', JSON.stringify(payload, null, 2));

    return this.request('/assessments/submit', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: payload,
    });
  }

  // Debug method
  async debugSubmitAssessment(assessmentData, token) {
    console.log('=== Debug Submit Test ===');
    return this.request('/assessments/debug-submit', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: assessmentData,
    });
  }

  // Course endpoints
  async getUserCourses(token) {
    return this.request('/courses', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async generatePersonalizedCourse(subject, token, options = {}) {
  if (!subject || typeof subject !== 'string' || subject.trim() === '') {
    throw new Error('Subject is required and must be a non-empty string');
  }
  
  if (!token) {
    throw new Error('Authentication token is required');
  }

  // Create a proper DTO object matching the backend's GeneratePersonalizedCourseDto
  const payload = { 
    subject: subject.trim(),
    difficulty: options.difficulty || undefined,
    focusArea: options.focusArea || undefined,
    learningObjective: options.learningObjective || undefined
  };

  console.log('Sending personalized course generation request:', payload);

  return this.request('/courses/personalized', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: payload,
  });
}

  // User endpoints
  async getUserStats(token) {
    return this.request('/users/me/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getAssessmentStats(token) {
    return this.request('/assessments/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getAssessments(token) {
    return this.request('/assessments', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getCourseStats(token) {
    return this.request('/courses/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}

export default new ApiService();