import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { UserProvider, useUser } from '@/context/UserContext';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Home from '@/pages/Home';
import DepositWithdraw from '@/pages/DepositWithdraw';
import InviteFriends from '@/pages/InviteFriends';
import Profile from '@/pages/Profile';
import AdminLogin from '@/pages/AdminLogin';
import AdminPanel from '@/pages/AdminPanel';
import Quantify from '@/pages/Quantify';
import SpinWheel from '@/pages/SpinWheel';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useUser();
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useUser();
  return !isLoggedIn ? <>{children}</> : <Navigate to="/dashboard" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/deposit-withdraw" 
        element={
          <PrivateRoute>
            <DepositWithdraw />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/quantify" 
        element={
          <PrivateRoute>
            <Quantify />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/spin-wheel" 
        element={
          <PrivateRoute>
            <SpinWheel />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/invite" 
        element={
          <PrivateRoute>
            <InviteFriends />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } 
      />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminPanel />} />
    </Routes>
  );
}

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster 
          position="top-right" 
          richColors 
          theme="dark"
          toastOptions={{
            style: {
              background: '#1a1f2e',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              color: '#fff',
            },
          }}
        />
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
