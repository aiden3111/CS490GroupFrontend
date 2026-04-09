import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import ProtectedRoutes from './ProtectedRoutes';

import RegistrationPage from './pages/RegistrationPage';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import UserProfile from './pages/UserProfile';
import CoachSearch from './pages/CoachSearch';
import MyCoach from './pages/MyCoach';
import CoachLanding from './pages/CoachLanding';
import MoodTrackPage from './pages/MoodTrackPage';
import WorkoutLogPage from './pages/WorkoutLogPage';
import SwitchCoach from './pages/SwitchCoach';
import MealTrackPage from './pages/MealTrackPage';
import OnboardingSurveyPage from './pages/OnboardingSurvey';
import AssignMealPlan from './pages/AssignMealPlan';
import WorkoutPlanPage from './pages/WorkoutPlanPage';
import WorkoutSearchPage from './pages/WorkoutSearchPage';
import StepsTracker from './pages/StepsTracker';
import CustomExercise from './pages/CustomExercise';

function App() {
  return (
    /*Add the routes here*/
    <Router>
      <Routes>
        <Route path="/LoginPage" element={<LoginPage />} />
        <Route path="/OnboardingSurvey/:clientId" element={<OnboardingSurveyPage />} />
        <Route path="/RegistrationPage" element={<RegistrationPage />} />
        <Route path="/LandingPage/:clientId" element={<ProtectedRoutes> <LandingPage /> </ProtectedRoutes>} />
        <Route path="/UserProfile/:clientId" element={<ProtectedRoutes> <UserProfile /> </ProtectedRoutes>} />
        <Route path="/CoachSearch/:clientId" element={<ProtectedRoutes> <CoachSearch /> </ProtectedRoutes>} />
        <Route path="/WorkoutPlan/:clientId" element={<ProtectedRoutes> <WorkoutPlanPage /> </ProtectedRoutes>} />
        <Route path="/MyCoach/:clientId" element={<ProtectedRoutes> <MyCoach /> </ProtectedRoutes>} />
        <Route path="/MoodTrackPage/:clientId" element={<ProtectedRoutes> <MoodTrackPage /> </ProtectedRoutes>} />
        <Route path="/MealTrackPage/:clientId" element={<ProtectedRoutes> <MealTrackPage /> </ProtectedRoutes>} />
        <Route path="/WorkoutLogPage/:clientId" element={<ProtectedRoutes> <WorkoutLogPage /> </ProtectedRoutes>} />
        <Route path="/WorkoutSearchPage/:clientId" element={<ProtectedRoutes> <WorkoutSearchPage /> </ProtectedRoutes>} />
        <Route path="/CoachLanding/:clientId" element={<ProtectedRoutes> <CoachLanding /> </ProtectedRoutes>} />
        <Route path="/SwitchCoach/:clientId" element={<ProtectedRoutes> <SwitchCoach /> </ProtectedRoutes>} />
        <Route path="/AssignMealPlan/:clientId" element={<ProtectedRoutes> <AssignMealPlan /> </ProtectedRoutes>} />
        <Route path="/StepsTracker/:clientId" element={<ProtectedRoutes> <StepsTracker /> </ProtectedRoutes>} />
        <Route path="/CustomExercise/:clientId" element={<ProtectedRoutes> <CustomExercise /> </ProtectedRoutes>} />
        <Route path="/" element={<Navigate to="/RegistrationPage" />} />
      </Routes>
    </Router>
  );
}

export default App
