import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import ProtectedRoutes from './ProtectedRoutes';

import RegistrationPage from './pages/RegistrationPage';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import UserProfile from './pages/UserProfile';
import CoachSearch from './pages/CoachSearch';
import MyCoach from './pages/MyCoach';

function App() {
  return (
    /*Add the routes here*/
<Router>
      <Routes>
        <Route path="/LoginPage" element={<LoginPage />} />
        <Route path="/RegistrationPage" element={<RegistrationPage />} />
        <Route path="/LandingPage/:clientId" element={ <ProtectedRoutes> <LandingPage /> </ProtectedRoutes> } />
        <Route path="/UserProfile/:clientId" element={ <ProtectedRoutes> <UserProfile/> </ProtectedRoutes> } />
        <Route path="/CoachSearch/:clientId" element={ <ProtectedRoutes> <CoachSearch/> </ProtectedRoutes> } />
         <Route path="/MyCoach/:clientId" element={ <ProtectedRoutes> <MyCoach/> </ProtectedRoutes> } />
        <Route path="/" element={<Navigate to="/RegistrationPage" />} />
      </Routes>
    </Router>
  );
}

export default App
