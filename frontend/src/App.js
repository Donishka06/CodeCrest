import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './components/layout/Navbar';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/common/ProtectedRoute';
import ChallengeList from './components/challenges/ChallengeList';
import ChallengeForm from './components/challenges/ChallengeForm';
import ChallengeTakingScreen from './components/challenges/ChallengeTakingScreen';
import ContestList from './components/contests/ContestList';
import ContestForm from './components/contests/ContestForm';
import ContestArena from './components/contests/ContestArena';
import AiQuestionGenerator from './components/contests/AiQuestionGenerator';
import Leaderboard from './components/Leaderboard';
import Playground from './components/playground/Playground';
import ContestantProfile from './components/profile/ContestantProfile';
import AdminDashboard from './components/dashboard/AdminDashboard';
import SetterDashboard from './components/dashboard/SetterDashboard';
import StudentDashboard from './components/dashboard/StudentDashboard';
import './App.css';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth || {});
  const role = (user?.role || '').toUpperCase();
  const username = (user?.username || '').toLowerCase();

  const isAdmin = Boolean(
    user && (
      role.includes('ADMIN') ||
      role === 'PLATFORM_ADMIN' ||
      role === 'ROLE_ADMIN' ||
      username === 'admin'
    )
  );

  const isSetter = Boolean(
    user && (
      role.includes('SETTER') ||
      role === 'PROBLEM_SETTER' ||
      role === 'ROLE_PROBLEM_SETTER' ||
      username === 'setter'
    )
  );

  if (isAdmin) {
    return <AdminDashboard />;
  }

  if (isSetter) {
    return <SetterDashboard />;
  }

  return <StudentDashboard />;
};

const ContestantPlaygroundRoute = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth || {});

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = (user?.role || '').toUpperCase();
  const username = (user?.username || '').toLowerCase();

  const isAdmin = Boolean(
    user && (
      role.includes('ADMIN') ||
      role === 'PLATFORM_ADMIN' ||
      role === 'ROLE_ADMIN' ||
      username === 'admin'
    )
  );

  const isSetter = Boolean(
    user && (
      role.includes('SETTER') ||
      role === 'PROBLEM_SETTER' ||
      role === 'ROLE_PROBLEM_SETTER' ||
      username === 'setter'
    )
  );

  // Prevent direct access for Admin and Setter, redirect to their respective dashboard
  if (isAdmin || isSetter) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Playground />;
};

const ContestantProfileRoute = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth || {});

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = (user?.role || '').toUpperCase();
  const username = (user?.username || '').toLowerCase();

  const isAdmin = Boolean(
    user && (
      role.includes('ADMIN') ||
      role === 'PLATFORM_ADMIN' ||
      role === 'ROLE_ADMIN' ||
      username === 'admin'
    )
  );

  const isSetter = Boolean(
    user && (
      role.includes('SETTER') ||
      role === 'PROBLEM_SETTER' ||
      role === 'ROLE_PROBLEM_SETTER' ||
      username === 'setter'
    )
  );

  // Prevent direct access for Admin and Setter, redirect to their respective dashboard
  if (isAdmin || isSetter) {
    return <Navigate to="/dashboard" replace />;
  }

  return <ContestantProfile />;
};

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth || {});

  return (
    <div className="App">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/challenges" element={<ProtectedRoute><ChallengeList /></ProtectedRoute>} />
          <Route path="/challenges/new" element={<ProtectedRoute><ChallengeForm /></ProtectedRoute>} />
          <Route path="/challenges/edit/:id" element={<ProtectedRoute><ChallengeForm /></ProtectedRoute>} />
          <Route path="/challenges/:id" element={<ProtectedRoute><ChallengeTakingScreen /></ProtectedRoute>} />
          <Route path="/contests" element={<ProtectedRoute><ContestList /></ProtectedRoute>} />
          <Route path="/contests/new" element={<ProtectedRoute><ContestForm /></ProtectedRoute>} />
          <Route path="/contests/:contestId/arena" element={<ProtectedRoute><ContestArena /></ProtectedRoute>} />
          <Route path="/contests/:contestId/generate-ai" element={<ProtectedRoute><AiQuestionGenerator /></ProtectedRoute>} />
          <Route path="/ai/generate-questions" element={<ProtectedRoute><AiQuestionGenerator /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/playground" element={<ContestantPlaygroundRoute />} />
          <Route path="/profile" element={<ContestantProfileRoute />} />
          
          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
