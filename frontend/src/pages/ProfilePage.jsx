import { useContext, useState } from 'react';
import { UserContext } from '../contexts/UserContext';
import { CourseContext } from '../contexts/CourseContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ProfilePage = () => {
  const { user, setUser, loading: userLoading } = useContext(UserContext);
  const { courses, loading: coursesLoading } = useContext(CourseContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    preferences: {
      difficulty: 'adaptive',
      contentFormat: 'mixed',
    }
  });
  
  if (userLoading || coursesLoading) {
    return <LoadingSpinner />;
  }

  // Calculate overall progress stats
  const calculateStats = () => {
    if (!user?.progress || !courses.length) return { completed: 0, inProgress: 0 };
    
    let completedCourses = 0;
    let inProgressCourses = 0;
    
    courses.forEach(course => {
      const progress = user.progress[course.id];
      if (!progress) return;
      
      const completionRate = course.lessons.length > 0 
        ? progress.completedLessons.length / course.lessons.length 
        : 0;
      
      if (completionRate === 1) completedCourses++;
      else if (completionRate > 0) inProgressCourses++;
    });
    
    return { completed: completedCourses, inProgress: inProgressCourses };
  };
  
  const stats = calculateStats();

  const handleEditProfile = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      preferences: user.preferences || {
        difficulty: 'adaptive',
        contentFormat: 'mixed',
      }
    });
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      preferences: {
        ...formData.preferences,
        [name]: value
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const updatedUser = {
      ...user,
      name: formData.name,
      email: formData.email,
      preferences: formData.preferences
    };
    
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="profile-page">
        <h1>Profile</h1>
        <p>Please log in to view your profile.</p>
      </div>
    );
  }
  
  return (
    <div className="profile-page">
      <h1>Your Profile</h1>
      
      {isEditing ? (
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label>Preferred Difficulty</label>
            <select 
              name="difficulty" 
              value={formData.preferences.difficulty}
              onChange={handlePreferenceChange}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="adaptive">Adaptive (Based on Performance)</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Content Format Preference</label>
            <select 
              name="contentFormat" 
              value={formData.preferences.contentFormat}
              onChange={handlePreferenceChange}
            >
              <option value="text">Text-focused</option>
              <option value="visual">Visual-focused</option>
              <option value="interactive">Interactive-focused</option>
              <option value="mixed">Mixed format</option>
            </select>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="save-btn">Save Changes</button>
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-info">
          <div className="user-details">
            <h2>{user.name || 'Student'}</h2>
            <p>{user.email || 'No email provided'}</p>
            <button 
              className="edit-btn"
              onClick={handleEditProfile}
            >
              Edit Profile
            </button>
          </div>
          
          <div className="learning-stats">
            <h2>Your Learning Stats</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Completed Courses</h3>
                <span className="stat-number">{stats.completed}</span>
              </div>
              <div className="stat-card">
                <h3>In Progress</h3>
                <span className="stat-number">{stats.inProgress}</span>
              </div>
            </div>
          </div>
          
          <div className="learning-preferences">
            <h2>Learning Preferences</h2>
            <p>Difficulty: {user.preferences?.difficulty || 'Adaptive'}</p>
            <p>Content Format: {user.preferences?.contentFormat || 'Mixed'}</p>
          </div>
        </div>
      )}
      
      <div className="learning-history">
        <h2>Your Learning History</h2>
        {courses.filter(course => user.progress?.[course.id]).map(course => {
              const progress = user.progress[course.id];
              const completionRate = course.lessons.length > 0 
                ? progress.completedLessons.length / course.lessons.length 
                : 0;
              
              return (
                <div key={course.id} className="history-item">
                  <h3>{course.title}</h3>
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${completionRate * 100}%` }}
                      ></div>
                    </div>
                    <span>{(completionRate * 100).toFixed(0)}% Complete</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p>You haven't started any courses yet.</p>
        )
    </div>
  );
};

export default ProfilePage;