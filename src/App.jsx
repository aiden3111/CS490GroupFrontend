import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import RegistrationPage from './pages/RegistrationPage';
import LoginPage from './pages/LoginPage';
function App() {
  return (
    /*Add the links here*/
<Router>
      <Routes>
        <Route path="/LoginPage" element={<LoginPage />} />
        <Route path="/RegistrationPage" element={<RegistrationPage />} />
      
        <Route path="/" element={<Navigate to="/RegistrationPage" />} />
      </Routes>
    </Router>
  );
}

export default App
