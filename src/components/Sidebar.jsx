import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Home, User, Trophy, Pencil, Send, FileText, X } from 'lucide-react';
import Chatbot from './Chatbot';

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div>
      {/* Desktop Sidebar */}
      <div className={`bg-white shadow-lg ${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 p-4 h-screen sticky top-0 z-20 hidden md:flex flex-col justify-between`}>
        <div>
          {/* Header with Toggle */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setIsCollapsed(!isCollapsed)} className="hover:bg-blue-100 p-2 rounded-full transition-all">
              <Menu className="text-blue-700" />
            </button>
            {!isCollapsed && (
              <div className="flex-1 text-center">
                <h2 className="text-2xl font-extrabold tracking-wide bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                  GEM-ARC
                </h2>
                <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-indigo-500 mx-auto mt-1 rounded-full"></div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <Link to="/dashboard" className={`flex items-center space-x-3 p-2 rounded-lg transition-all ${isActive('/dashboard') ? 'bg-blue-200 text-blue-800 shadow-sm' : 'hover:bg-blue-100'}`}>
              <Home size={20} className={isActive('/dashboard') ? 'text-blue-600' : 'text-gray-600'} />
              {!isCollapsed && <span className="font-medium">Home</span>}
            </Link>
            <Link to="/profile" className={`flex items-center space-x-3 p-2 rounded-lg transition-all ${isActive('/profile') ? 'bg-blue-200 text-blue-800 shadow-sm' : 'hover:bg-blue-100'}`}>
              <User size={20} className={isActive('/profile') ? 'text-blue-600' : 'text-gray-600'} />
              {!isCollapsed && <span className="font-medium">Profile</span>}
            </Link>
            <Link to="/leaderboard" className={`flex items-center space-x-3 p-2 rounded-lg transition-all ${isActive('/leaderboard') ? 'bg-blue-200 text-blue-800 shadow-sm' : 'hover:bg-blue-100'}`}>
              <Trophy size={20} className={isActive('/leaderboard') ? 'text-blue-600' : 'text-gray-600'} />
              {!isCollapsed && <span className="font-medium">Leaderboard</span>}
            </Link>
            <Link to="/feedback" className={`flex items-center space-x-3 p-2 rounded-lg transition-all ${isActive('/feedback') ? 'bg-blue-200 text-blue-800 shadow-sm' : 'hover:bg-blue-100'}`}>
              <Pencil size={20} className={isActive('/feedback') ? 'text-blue-600' : 'text-gray-600'} />
              {!isCollapsed && <span className="font-medium">Feedback</span>}
            </Link>
            <Link to="/propose-event" className={`flex items-center space-x-3 p-2 rounded-lg transition-all ${isActive('/propose-event') ? 'bg-blue-200 text-blue-800 shadow-sm' : 'hover:bg-blue-100'}`}>
              <Send size={20} className={isActive('/propose-event') ? 'text-blue-600' : 'text-gray-600'} />
              {!isCollapsed && <span className="font-medium">Event Proposal</span>}
            </Link>
            <Link to="/my-proposals" className={`flex items-center p-2 rounded-lg transition-all ${isActive('/my-proposals') ? 'bg-blue-200 text-blue-800 shadow-sm' : 'hover:bg-blue-100'}`}>
              <span className="mr-3"><FileText size={20} className={isActive('/my-proposals') ? 'text-blue-600' : 'text-gray-600'} /></span>
              {!isCollapsed && <span className="font-medium">My Proposals</span>}
            </Link>
          </nav>
        </div>

        <div className="mt-auto">
          {/* Bottom Logo Area */}
          {!isCollapsed ? (
            <div className="py-4 px-2">
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-3 shadow-md">
                <div className="text-center">
                  <div className="inline-block bg-white rounded-full p-2 mb-2 shadow-sm">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-black text-2xl tracking-tight">
                      GEM-ARC
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 font-medium">Campus Event Management</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold shadow-md">
                GA
              </div>
            </div>
          )}
          
          {/* Chatbot Component */}
          {!isCollapsed && <Chatbot />}
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`md:hidden fixed inset-0 bg-white bg-opacity-90 z-30 ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="flex flex-col space-y-4 p-4 bg-white shadow-lg h-full justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1 text-center">
                <h2 className="text-2xl font-extrabold tracking-wide bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                  GEM-ARC
                </h2>
                <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-indigo-500 mx-auto mt-1 rounded-full"></div>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-600 hover:bg-blue-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <nav className="space-y-2 mt-4">
              <Link to="/dashboard" className={`flex items-center space-x-3 p-2 rounded-lg transition-all ${isActive('/dashboard') ? 'bg-blue-200 text-blue-800 shadow-sm' : 'hover:bg-blue-100'}`}>
                <Home size={20} className={isActive('/dashboard') ? 'text-blue-600' : 'text-gray-600'} />
                <span className="font-medium">Home</span>
              </Link>
              <Link to="/profile" className={`flex items-center space-x-3 p-2 rounded-lg transition-all ${isActive('/profile') ? 'bg-blue-200 text-blue-800 shadow-sm' : 'hover:bg-blue-100'}`}>
                <User size={20} className={isActive('/profile') ? 'text-blue-600' : 'text-gray-600'} />
                <span className="font-medium">Profile</span>
              </Link>
              <Link to="/leaderboard" className={`flex items-center space-x-3 p-2 rounded-lg transition-all ${isActive('/leaderboard') ? 'bg-blue-200 text-blue-800 shadow-sm' : 'hover:bg-blue-100'}`}>
                <Trophy size={20} className={isActive('/leaderboard') ? 'text-blue-600' : 'text-gray-600'} />
                <span className="font-medium">Leaderboard</span>
              </Link>
              <Link to="/feedback" className={`flex items-center space-x-3 p-2 rounded-lg transition-all ${isActive('/feedback') ? 'bg-blue-200 text-blue-800 shadow-sm' : 'hover:bg-blue-100'}`}>
                <Pencil size={20} className={isActive('/feedback') ? 'text-blue-600' : 'text-gray-600'} />
                <span className="font-medium">Feedback</span>
              </Link>
              <Link to="/propose-event" className={`flex items-center space-x-3 p-2 rounded-lg transition-all ${isActive('/propose-event') ? 'bg-blue-200 text-blue-800 shadow-sm' : 'hover:bg-blue-100'}`}>
                <Send size={20} className={isActive('/propose-event') ? 'text-blue-600' : 'text-gray-600'} />
                <span className="font-medium">Event Proposal</span>
              </Link>
              <Link to="/my-proposals" className={`flex items-center p-2 rounded-lg transition-all ${isActive('/my-proposals') ? 'bg-blue-200 text-blue-800 shadow-sm' : 'hover:bg-blue-100'}`}>
                <span className="mr-3"><FileText size={20} className={isActive('/my-proposals') ? 'text-blue-600' : 'text-gray-600'} /></span>
                <span className="font-medium">My Proposals</span>
              </Link>
            </nav>
          </div>

          {/* Bottom Logo for Mobile */}
          <div className="mt-auto mb-4">
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-3 shadow-md">
              <div className="text-center">
                <div className="inline-block bg-white rounded-full p-2 mb-2 shadow-sm">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-black text-2xl tracking-tight">
                    GEM-ARC
                  </div>
                </div>
                <div className="text-xs text-gray-600 font-medium">Campus Event Management</div>
              </div>
            </div>
          </div>

          {/* Chatbot in Mobile Menu */}
          <Chatbot />
        </div>
      </div>

      {/* Hamburger Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-40 bg-white p-2 rounded-full shadow-md text-blue-600 hover:bg-blue-50 transition-all"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu className="w-6 h-6" />
      </button>
    </div>
  );
}

export default Sidebar;