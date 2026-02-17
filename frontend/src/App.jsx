import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AboutPage from './pages/About/AboutPage';
import LoginPage from './pages/Login/LoginPage';

import './App.scss';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AboutPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
