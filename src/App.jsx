import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import RegistrationPage from './pages/RegistrationPage';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import UserProfile from './pages/UserProfile';
function App() {
  return (
    /*Add the routes here*/
<Router>
      <Routes>
        <Route path="/LoginPage" element={<LoginPage />} />
        <Route path="/RegistrationPage" element={<RegistrationPage />} />
        <Route path="/LandingPage/:clientId" element={<LandingPage />} />
        <Route path="/UserProfile/:clientId" element={<UserProfile/>} />
      
        <Route path="/" element={<Navigate to="/RegistrationPage" />} />
      </Routes>
    </Router>
  );
}

export default App
