import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import CardPage from './pages/CardPage';
import WelcomePage from './pages/WelcomePage';
import YourIndex from './pages/YourIndex';
//import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/cards" element={<CardPage />} />
        <Route path="/your-index" element={<YourIndex />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;