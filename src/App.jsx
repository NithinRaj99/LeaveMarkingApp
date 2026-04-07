import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CalendarView from './pages/CalendarView';
import LeaveList from './pages/LeaveList';
import Allocations from './pages/Allocations';
import AdminDashboard from './pages/admin/AdminDashboard';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="calendar" element={<CalendarView />} />
            <Route path="leaves" element={<LeaveList />} />
            <Route path="allocations" element={<Allocations />} />
            <Route
              path="admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#2a2a3e',
            color: '#cdd6f4',
            border: '1px solid rgba(54, 54, 80, 0.5)',
            borderRadius: '12px',
          },
        }}
      />
    </AuthProvider>
  );
}
