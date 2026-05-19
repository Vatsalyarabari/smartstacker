import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Boxes from './pages/Boxes'
import Presets from './pages/Presets'
import Optimizer from './pages/Optimizer'
import './index.css'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-gray-950" />
  if (!user) return <Navigate to="/login" />
  return children
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/boxes" element={<ProtectedRoute><Boxes /></ProtectedRoute>} />
          <Route path="/presets" element={<ProtectedRoute><Presets /></ProtectedRoute>} />
          <Route path="/optimizer" element={<ProtectedRoute><Optimizer /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)