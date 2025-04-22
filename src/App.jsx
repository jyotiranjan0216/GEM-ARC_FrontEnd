// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import SkillSelection from './pages/SkillSelection';
import InterestSelection from './pages/InterestSelection';
import Dashboard from './pages/Dashboard';
import Event from './pages/Event';
import UserProfile from './pages/UserProfile';
import Leaderboard from './pages/LeaderBoard';
import Feedback from './pages/Feedback';
import EventProposal from './pages/EventProposal';
import MyProposals from './pages/MyProposal';
import AdminDashboard from './pages/admin/AdminDashboard';
import EventList from './pages/admin/EventList';
import EventEdit from './pages/admin/EventEdit';
import EventProposalList from './pages/admin/EventProposalList';
import FeedbackList from './pages/admin/FeedbackList';
import EventCreate from './pages/admin/EventCreate';

function App() {
  const user = JSON.parse(localStorage.getItem('user')); // Assume user object like { isAdmin: true }

  return (
    <Router>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/login" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/skills" element={<SkillSelection />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/interests" element={<InterestSelection />} />
        
        {/* Dynamic routing for dashboard based on user role */}
        <Route
          path="/dashboard"
          element={
            user?.isAdmin ? <Navigate to="/admin/dashboard" replace /> : <Dashboard />
          }
        />

        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/propose-event" element={<EventProposal />} />
        <Route path="/my-proposals" element={<MyProposals />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/event/:id" element={<Event />} />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/events" element={<EventList />} />
        <Route path="/admin/events/create" element={<EventCreate />} />
        <Route path="/admin/events/edit/:id" element={<EventEdit />} />
        <Route path="/admin/event-proposals" element={<EventProposalList />} />
        <Route path="/admin/feedback" element={<FeedbackList />} />
      </Routes>
    </Router>
  );
}

export default App;
