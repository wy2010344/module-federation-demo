import React, { useState } from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginScreen } from './components/LoginScreen';
import { Layout } from './components/Layout';
import { AssignedTasks } from './pages/AssignedTasks';
import { CreatedTasks } from './pages/CreatedTasks';
import { Profile } from './pages/Profile';
import { TodoDetail } from './components/TodoDetail';
import { UserProfile } from './pages/UserProfile';
import './App.css';

const convexUrl = import.meta.env.VITE_CONVEX_URL as string;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : undefined;

function AppContent() {
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('taskflow_user_email');
  });

  const handleLogin = (email: string) => {
    localStorage.setItem('taskflow_user_email', email);
    setUserEmail(email);
  };

  const handleLogout = () => {
    localStorage.removeItem('taskflow_user_email');
    setUserEmail(null);
  };

  if (!convex || !convexUrl) {
    return (
      <div className="flex items-center justify-center h-screen p-4 text-center">
        <div>
          <h1 className="text-xl font-bold text-red-600 mb-2">Configuration Error</h1>
          <p>VITE_CONVEX_URL is not defined.</p>
        </div>
      </div>
    );
  }

  return (
    <ConvexProvider client={convex}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={
            userEmail ? <Navigate to="/" /> : <LoginScreen onLogin={handleLogin} />
          } />

          <Route element={userEmail ? <Layout /> : <Navigate to="/login" />}>
            <Route path="/" element={<Navigate to="/assigned" replace />} />
            <Route path="/assigned" element={<AssignedTasks userEmail={userEmail!} />} />
            <Route path="/created" element={<CreatedTasks userEmail={userEmail!} />} />
            <Route path="/profile" element={<Profile userEmail={userEmail!} onLogout={handleLogout} />} />
          </Route>

          <Route path="/todo/:todoId" element={
            userEmail ? <TodoDetail userEmail={userEmail} /> : <Navigate to="/login" />
          } />
          <Route path="/user/:email" element={
            userEmail ? <UserProfile /> : <Navigate to="/login" />
          } />
        </Routes>
      </BrowserRouter>
    </ConvexProvider>
  );
}

export default AppContent;
