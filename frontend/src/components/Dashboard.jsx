import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LearningContext } from '../contexts/LearningContext';
import RecommendedCourses from './RecommendedCourses';
import ProgressSummary from './ProgressSummary';
import KnowledgeGraph from './KnowledgeGraph';

const Dashboard = () => {
  const { userProfile, learningPath, currentProgress, loading } = useContext(LearningContext);
  const [strengths, setStrengths] = useState([]);
  const [weaknesses, setWeaknesses] = useState([]);

  useEffect(() => {
    if (currentProgress?.assessments) {
      // Analyze assessment results to determine strengths and weaknesses
      const strengthsArr = [];
      const weaknessesArr = [];
      
      Object.entries(currentProgress.assessments).forEach(([topic, score]) => {
        if (score > 80) {
          strengthsArr.push(topic);
        } else if (score < 60) {
          weaknessesArr.push(topic);
        }
      });
      
      setStrengths(strengthsArr);
      setWeaknesses(weaknessesArr);
    }
  }, [currentProgress]);

  if (loading) {
    return <div className="loading">Loading your personalized dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Welcome back, {userProfile?.name || 'Student'}</h1>
      
      <section className="learning-path">
        <h2>Your Learning Path</h2>
        <p>Based on your performance, we recommend focusing on these topics:</p>
        <ul>
          {learningPath.slice(0, 3).map((item, index) => (
            <li key={index}>
              <Link to={`/course/${item.id}`}>{item.title}</Link>
              <span className="priority-tag">{item.priority}</span>
            </li>
          ))}
        </ul>
      </section>
      
      <section className="progress-overview">
        <h2>Your Progress</h2>
        <ProgressSummary progress={currentProgress} />
      </section>
      
      <div className="dashboard-columns">
        <section className="strengths">
          <h2>Your Strengths</h2>
          <ul>
            {strengths.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>
        
        <section className="areas-to-improve">
          <h2>Areas to Improve</h2>
          <ul>
            {weaknesses.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
      
      <section className="knowledge-visualization">
        <h2>Your Knowledge Map</h2>
        <KnowledgeGraph progress={currentProgress} />
      </section>
      
      <section className="recommended">
        <h2>Recommended Next Steps</h2>
        <RecommendedCourses learningPath={learningPath} />
      </section>
    </div>
  );
};

export default Dashboard;