import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Generate from './pages/Generate';
import Verify from './pages/Verify';
import AcademicEntry from './pages/AcademicEntry';
import Login from './pages/Login';
import PublicVerify from './pages/PublicVerify';

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-slate-950 flex w-full font-sans transition-all duration-300">
      {isAuthenticated && <Sidebar isOpen={sidebarOpen} />}
      
      <div className="flex-grow flex flex-col min-h-screen overflow-x-hidden">
        {isAuthenticated && <Navbar onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />}
        <main className={`flex-grow w-full ${isAuthenticated ? 'px-10 py-10' : ''}`}>
          <div className={`${isAuthenticated ? 'max-w-7xl' : ''} mx-auto w-full h-full`}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/verify/:uuid" element={<PublicVerify />} />
              
              {/* Protected Routes */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/generate" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <Generate />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/academic" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AcademicEntry />
                  </ProtectedRoute>
                } 
              />

              {/* Redirect any unknown routes to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
        {isAuthenticated && (
          <footer className="bg-slate-950 text-slate-600 py-8 text-center border-t border-slate-900 mx-10">
            <p className="text-[10px] tracking-[0.3em] uppercase font-black">
              &copy; 2026 Smart Certificate Verification System | SECURED BY RSA-2048
            </p>
          </footer>
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
