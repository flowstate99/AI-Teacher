import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { CourseContext } from '../contexts/CourseContext';
import CourseCard from '../components/CourseCard';
import LoadingSpinner from '../components/LoadingSpinner';
import CourseGenerator from '../components/CourseGenerator';

const Dashboard = () => {
  const { user, loading: userLoading } = useContext(UserContext);
  const { courses, loading: coursesLoading } = useContext(CourseContext);

  if (userLoading || coursesLoading) {
    return <LoadingSpinner />;
  }

  // Optional: filter out recommended courses based on embedded data
  const recommendedCourses = courses.filter(
    course => course.recommendation && course.recommendation.recommended
  );

  return (
    <div className="dashboard">
      <h1>Welcome, {user?.name || 'Student'}</h1>
      <CourseGenerator />

      {recommendedCourses.length > 0 && (
        <section className="recommendations">
          <h2>Recommended For You</h2>
          <div className="course-grid">
            {recommendedCourses.map(course => (
              <CourseCard 
                key={course.id} 
                course={course} 
                progress={user?.progress?.[course.id]} 
              />
            ))}
          </div>
        </section>
      )}
      
      <section className="all-courses">
        <h2>All Courses</h2>
        <div className="course-grid">
          {courses.map(course => (
            <CourseCard 
              key={course.id} 
              course={course} 
              progress={user?.progress?.[course.id]} 
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
