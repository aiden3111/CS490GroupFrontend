import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import RegistrationPage from './pages/RegistrationPage';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
function App() {
  return (
    /*Add the routes here*/
<Router>
      <Routes>
        <Route path="/LoginPage" element={<LoginPage />} />
        <Route path="/RegistrationPage" element={<RegistrationPage />} />
        <Route path="/LandingPage" element={<LandingPage />} />
      
        <Route path="/" element={<Navigate to="/RegistrationPage" />} />
      </Routes>
    </Router>
  );
}

export default App
