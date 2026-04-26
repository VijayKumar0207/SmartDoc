import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, FilePlus, Search, LogOut } from 'lucide-react';
import { useAuth } from '../services/AuthContext';

const Sidebar = ({ isOpen }) => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, color: 'text-blue-400' },
    { name: 'Academic', path: '/academic', icon: BookOpen, color: 'text-purple-400', adminOnly: true },
    { name: 'Generate', path: '/generate', icon: FilePlus, color: 'text-emerald-400', adminOnly: true },
    { name: 'Verify', path: '/verify', icon: Search, color: 'text-amber-400' },
  ];

  return (
    <div className={`${isOpen ? 'w-64' : 'w-0 overflow-hidden border-none'} transition-all duration-300 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 z-[60]`}>
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-xl font-black text-white tracking-tighter uppercase whitespace-nowrap">SCV System</h2>
      </div>

      <nav className="flex-grow py-6 px-4 space-y-2 text-left">
        {navItems.map((item) => {
          if (item.adminOnly && !isAdmin) return null;
          
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all group ${
                isActive 
                  ? 'bg-blue-600/10 text-white border border-blue-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? item.color : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span className="font-semibold text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-bold text-sm group"
        >
          <LogOut className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
