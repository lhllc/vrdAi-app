import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AnalysisPage from './pages/AnalysisPage';
import AccountPage from './pages/AccountPage';
import SettingsPage from './pages/SettingsPage';
import PaymentGate from './components/PaymentGate';
import PostPayment from './pages/PostPayment';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/payment" element={<PaymentGate />} />
        <Route path="/post-payment" element={<PostPayment />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App; 