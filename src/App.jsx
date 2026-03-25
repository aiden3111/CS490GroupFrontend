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
<<<<<<< HEAD
import MoodTrackPage from './pages/MoodTrackPage';
import WorkoutLogPage from './pages/WorkoutLogPage';
import SwitchCoach from './pages/SwitchCoach';
import MealTrackPage from './pages/MealTrackPage';
=======
import OnboardingSurvey from './pages/OnboardingSurvey';
>>>>>>> 89bf191 (Onboarding Survey)

function App() {
  return (
    /*Add the routes here*/
    <Router>
      <Routes>
        <Route path="/LoginPage" element={<LoginPage />} />
        <Route path="/RegistrationPage" element={<RegistrationPage />} />
<<<<<<< HEAD
        <Route path="/LandingPage/:clientId" element={ <ProtectedRoutes> <LandingPage /> </ProtectedRoutes> } />
        <Route path="/UserProfile/:clientId" element={ <ProtectedRoutes> <UserProfile/> </ProtectedRoutes> } />
        <Route path="/CoachSearch/:clientId" element={ <ProtectedRoutes> <CoachSearch/> </ProtectedRoutes> } />
        <Route path="/MyCoach/:clientId" element={ <ProtectedRoutes> <MyCoach/> </ProtectedRoutes> } />
        <Route path="/MoodTrackPage/:clientId" element={ <ProtectedRoutes> <MoodTrackPage/> </ProtectedRoutes> } />
        <Route path="/MealTrackPage/:clientId" element={ <ProtectedRoutes> <MealTrackPage/> </ProtectedRoutes> } />
        <Route path="/WorkoutLogPage/:clientId" element={ <ProtectedRoutes> <WorkoutLogPage/> </ProtectedRoutes> } />
        <Route path="/CoachLanding/:clientId" element={ <ProtectedRoutes> <CoachLanding/> </ProtectedRoutes> } />
        <Route path="/SwitchCoach/:clientId" element={ <ProtectedRoutes> <SwitchCoach/> </ProtectedRoutes> } />
=======
        <Route path="/LandingPage/:clientId" element={<ProtectedRoutes> <LandingPage /> </ProtectedRoutes>} />
        <Route path="/UserProfile/:clientId" element={<ProtectedRoutes> <UserProfile /> </ProtectedRoutes>} />
        <Route path="/OnboardingSurvey/:clientId" element={<OnboardingSurvey />} />
        <Route path="/CoachSearch/:clientId" element={<ProtectedRoutes> <CoachSearch /> </ProtectedRoutes>} />
        <Route path="/MyCoach/:clientId" element={<ProtectedRoutes> <MyCoach /> </ProtectedRoutes>} />
        <Route path="/CoachLanding/:clientId" element={<ProtectedRoutes> <CoachLanding /> </ProtectedRoutes>} />
>>>>>>> 89bf191 (Onboarding Survey)
        <Route path="/" element={<Navigate to="/RegistrationPage" />} />
      </Routes>
    </Router>
  );
}

export default App
