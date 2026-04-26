import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon, ChevronDown, ChevronUp, Menu } from 'lucide-react';
import { useAuth } from '../services/AuthContext';

const Navbar = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-slate-950/50 border-b border-slate-900 text-white sticky top-0 z-50 backdrop-blur-xl">
      <div className="w-full px-6 py-4 flex justify-between items-center relative">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-slate-900 rounded-xl transition-colors text-slate-400 hover:text-white"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          {!isSidebarOpen && (
            <h2 className="text-xl font-black text-white tracking-tighter uppercase animate-in fade-in slide-in-from-left-4 duration-500">
              SCV System
            </h2>
          )}
        </div>
        
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-4 bg-slate-900 border border-slate-800 px-4 py-2 rounded-full hover:border-blue-500/50 transition-all active:scale-95 shadow-lg shadow-black/50"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border border-white/10">
              <UserIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-300">Access Identity</span>
            {isOpen ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-4 w-64 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-300 z-[100]">
              <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 border-b border-slate-800">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Authenticated As</p>
                <p className="text-lg font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 uppercase font-medium">{user.role}</p>
              </div>
              <div className="p-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-sm font-bold group"
                >
                  <LogOut className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  <span>Terminate Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
