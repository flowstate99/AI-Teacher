// src/components/debug/ApiDebugger.jsx
import React, { useState } from 'react';

const ApiDebugger = ({ token }) => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testDirectCall = async (endpoint, payload) => {
    setLoading(true);
    setResult(`Testing ${endpoint}...`);
    
    try {
      const url = `http://localhost:3000${endpoint}`;
      
      console.log('=== Direct Fetch Test ===');
      console.log('URL:', url);
      console.log('Payload:', JSON.stringify(payload, null, 2));
      console.log('Token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('Raw response text:', responseText);
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.log('Failed to parse as JSON:', parseError);
        responseData = responseText;
      }
      
      const resultText = `
=== ${endpoint} Test Results ===
Status: ${response.status} ${response.statusText}
Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}

Raw Response:
${responseText}

Parsed Response:
${JSON.stringify(responseData, null, 2)}
      `;
      
      setResult(resultText);
      
    } catch (error) {
      console.error('Direct test failed:', error);
      setResult(`Error: ${error.message}\nStack: ${error.stack}`);
    }
    
    setLoading(false);
  };

  const testCourse = () => testDirectCall('/courses/personalized', { subject: 'Mathematics' });
  const testAssessment = () => testDirectCall('/assessments/generate', { subject: 'Mathematics' });

  // Test with different payload formats
  const testCourseMinimal = () => testDirectCall('/courses/personalized', { subject: 'Mathematics' });
  const testCourseWithOptions = () => testDirectCall('/courses/personalized', { 
    subject: 'Mathematics',
    difficulty: 'intermediate'
  });

  return (
    <div className="fixed bottom-4 left-4 bg-black/90 text-white p-4 rounded-lg max-w-lg z-50 max-h-96 overflow-auto">
      <h3 className="font-bold mb-2 text-green-400">API Debugger</h3>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={testCourse}
          disabled={loading}
          className="bg-blue-600 px-2 py-1 rounded text-xs disabled:opacity-50"
        >
          Test Course
        </button>
        <button
          onClick={testAssessment}
          disabled={loading}
          className="bg-purple-600 px-2 py-1 rounded text-xs disabled:opacity-50"
        >
          Test Assessment
        </button>
        <button
          onClick={testCourseMinimal}
          disabled={loading}
          className="bg-green-600 px-2 py-1 rounded text-xs disabled:opacity-50"
        >
          Course Minimal
        </button>
        <button
          onClick={testCourseWithOptions}
          disabled={loading}
          className="bg-orange-600 px-2 py-1 rounded text-xs disabled:opacity-50"
        >
          Course + Options
        </button>
      </div>
      {result && (
        <pre className="text-xs bg-gray-900 p-2 rounded overflow-auto whitespace-pre-wrap">
          {result}
        </pre>
      )}
    </div>
  );
};

export default ApiDebugger;