import React, { useState } from 'react';
import { generateCourse } from '../services/aiService';
import CourseCard from './CourseCard';
import { v4 as uuidv4 } from 'uuid';

function CourseGenerator() {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('beginner');
  const [loading, setLoading] = useState(false);
  const [generatedCourses, setGeneratedCourses] = useState([]);

  const handleGenerate = async () => {
    try {
      const raw = await generateCourse(topic, level);
      console.log("Raw response from backend:", raw); // ✅ log this

      const course = parseCourseFromText(raw, topic, level);
      console.log("Parsed course:", course); // ✅ and this

      if (!course) {
        console.error("Course parsing failed");
        return;
      }
      if (!isValidCourse(course)) {
        console.error("Invalid course structure");
        return;
      }
      setGeneratedCourses(prev => [...prev, course]);
    } catch (err) {
      console.error("Generation failed", err);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Generate AI Course</h2>
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter topic"
        className="border p-2 mb-2 w-full rounded"
      />
      <select
        value={level}
        onChange={(e) => setLevel(e.target.value)}
        className="border p-2 mb-2 w-full rounded"
      >
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? 'Generating...' : 'Generate'}
      </button>

      <div className="mt-6 space-y-4">
        {generatedCourses.map((course, idx) =>
          course ? (
            <CourseCard 
              key={course.id || idx} 
              course={course} 
              progress={{ completedLessons: [] }} 
            />
          ) : null
        )}
      </div>
    </div>
  );
}

function parseCourseFromText(text, topic, level) {
  if (!text) {
    console.error('Empty response from backend');
    return null;
  }

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  if (lines.length < 2) {
    console.error('Not enough data in response to build a course');
    return null;
  }

  const course = {
    id: uuidv4(),
    title: `Intro to ${topic.charAt(0).toUpperCase() + topic.slice(1)}`,
    description: lines[0] || `An AI-generated course on ${topic}`,
    level,
    lessons: [],
    quizzes: [],
    recommendation: {
      recommended: true,
      reason: 'AI recommends this course based on your selected topic and level.'
    }
  };

  let lessonCounter = 1;
  for (const line of lines.slice(1)) {
    if (/^lesson\s*\d*[:.-]/i.test(line) || /^[-*]\s/.test(line)) {
      course.lessons.push({
        id: uuidv4(),
        title: line.replace(/^[-*]\s*/, '').replace(/^lesson\s*\d*[:.-]?\s*/i, ''),
        content: '',
        order: lessonCounter++,
        requiresCompletion: []
      });
    }
  }

  if (course.lessons.length === 0) {
    console.error('No lessons parsed from response');
    return null;
  }

  return course;
}

function isValidCourse(course) {
  return course && course.id && Array.isArray(course.lessons);
}



export default CourseGenerator;
