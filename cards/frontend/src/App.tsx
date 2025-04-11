import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import CardPage from './pages/CardPage';
import WelcomePage from './pages/WelcomePage';
import YourGallery from './pages/YourGallery';
import Discover from './pages/Discover';
import Map from './pages/Map';
import ResendVerification from './pages/ResendVerification';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/cards" element={<CardPage />} />
        <Route path="/your-gallery" element={<YourGallery />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/map" element={<Map />} />
        <Route path="/resend-verification" element={<ResendVerification />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;