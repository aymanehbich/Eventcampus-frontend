import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
const Register = lazy(() => import('./pages/auth/Register'))
const Login = lazy(() => import('./pages/auth/Login'))
const GoogleCallback = lazy(() => import('./pages/auth/GoogleCallback'))
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'))

import ProtectedRoute from './router/ProtectedRoute'
const Profile = lazy(() => import('./pages/student/Profile'))
const CreateClub = lazy(() => import('./pages/organiser/CreateClub'))
const Clubs = lazy(() => import('./pages/student/Clubs'))
const ClubDetail = lazy(() => import('./pages/student/ClubDetail'))
const StudentMessaging = lazy(() => import('./pages/student/StudentMessaging'))
const Events = lazy(() => import('./pages/student/Events'))
const EventDetail = lazy(() => import('./pages/student/EventDetail'))
const EventInscrits = lazy(() => import('./pages/organiser/EventInscrits'))
const MesEvenements = lazy(() => import('./pages/organiser/MesEvenements'))
const CreateEvent = lazy(() => import('./pages/organiser/CreateEvent'))
const EditEvent = lazy(() => import('./pages/organiser/EditEvent'))
const Adhesions = lazy(() => import('./pages/organiser/Adhesions'))
const Messaging = lazy(() => import('./pages/organiser/Messaging'))
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const MesClubs = lazy(() => import('./pages/organiser/MesClubs'))
const EditClub = lazy(() => import('./pages/organiser/EditClub'))
const OrganizerDashboard = lazy(() => import('./pages/organiser/OrganizerDashboard'))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div role="status" aria-live="polite" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#5f645d', fontFamily: 'var(--ec-font)' }}>Chargement…</div>}>
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
      </Suspense>
    </BrowserRouter>
  )
}

export default App
