import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Register from './pages/auth/Register'
import Login from './pages/auth/Login'
import GoogleCallback from './pages/auth/GoogleCallback'
import StudentDashboard from './pages/student/Dashboard'

import ProtectedRoute from './router/ProtectedRoute'
import Profile from './pages/student/Profile'
import CreateClub from './pages/organiser/CreateClub'
import Clubs from './pages/student/Clubs'
import ClubDetail from './pages/student/ClubDetail'
import StudentMessaging from './pages/student/StudentMessaging'
import Events from './pages/student/Events'
import EventDetail from './pages/student/EventDetail'
import EventInscrits from './pages/organiser/EventInscrits'
import MesEvenements from './pages/organiser/MesEvenements'
import CreateEvent from './pages/organiser/CreateEvent'
import EditEvent from './pages/organiser/EditEvent'
import Adhesions from './pages/organiser/Adhesions'
import Messaging from './pages/organiser/Messaging'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import MesClubs from './pages/organiser/MesClubs'
import EditClub from './pages/organiser/EditClub'
import OrganizerDashboard from './pages/organiser/OrganizerDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route path="/admin/login" element={<AdminLogin />} />

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
        <Route
          path="/student/messages"
          element={
            <ProtectedRoute role="etudiant">
              <StudentMessaging />
            </ProtectedRoute>
          }
        />

        {/* Routes organisateur */}
        <Route
          path="/organiser/dashboard"
          element={
            <ProtectedRoute role="organisateur">
              <OrganizerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organiser/events"
          element={
            <ProtectedRoute role="organisateur">
              <MesEvenements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organiser/events/create"
          element={
            <ProtectedRoute role="organisateur">
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organiser/events/:id/edit"
          element={
            <ProtectedRoute role="organisateur">
              <EditEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organiser/events/:id/inscrits"
          element={
            <ProtectedRoute role="organisateur">
              <EventInscrits />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organiser/adhesions"
          element={
            <ProtectedRoute role="organisateur">
              <Adhesions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organiser/messages"
          element={
            <ProtectedRoute role="organisateur">
              <Messaging />
            </ProtectedRoute>
          }
        />
         <Route
          path="/organiser/clubs"
          element={
            <ProtectedRoute role="organisateur">
              <MesClubs />
            </ProtectedRoute>
          }
        />
         <Route
          path="/organiser/clubs/create"
          element={
            <ProtectedRoute role="organisateur">
              <CreateClub />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organiser/clubs/:id/edit"
          element={
            <ProtectedRoute role="organisateur">
              <EditClub />
            </ProtectedRoute>
          }
        />

        {/* Routes admin */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
