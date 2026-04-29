import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Register from './pages/auth/Register'
import Login from './pages/auth/Login'
import StudentDashboard from './pages/student/Dashboard'

import ProtectedRoute from './router/ProtectedRoute'
import Profile from './pages/student/Profile'
import Clubs from './pages/student/Clubs'
import ClubDetail from './pages/student/ClubDetail'
import Events from './pages/student/Events'
import EventDetail from './pages/student/EventDetail'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Redirect racine */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Routes protégées étudiant */}
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute role="etudiant">
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute role="etudiant">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/events"
          element={
            <ProtectedRoute role="etudiant">
              <Events />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/events/:id"
          element={
            <ProtectedRoute role="etudiant">
              <EventDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/clubs"
          element={
            <ProtectedRoute role="etudiant">
              <Clubs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/clubs/:id"
          element={
            <ProtectedRoute role="etudiant">
              <ClubDetail />

            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App