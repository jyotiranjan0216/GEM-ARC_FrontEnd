import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { motion } from 'framer-motion';

function Leaderboard() {
  const [allUsers, setAllUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No token found. Please login again.');
      return;
    }

    const fetchLeaderboard = async () => {
      try {
        // Fetch leaderboard data
        const leaderboardResponse = await fetch('https://gem-arc-backend.onrender.com/api/user/leaderboard', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!leaderboardResponse.ok) {
          throw new Error('Failed to fetch leaderboard data');
        }

        const leaderboardData = await leaderboardResponse.json();
        
        // Filter out admin users from the leaderboard
        const filteredUsers = leaderboardData.allUsers.filter(user => !user.isAdmin);
        
        // Now assign ranks based on filtered list
        filteredUsers.forEach((user, index) => {
          console.log(user);
          user.rank = index + 1;
        });
        
        setAllUsers(filteredUsers);
        setCurrentUser(leaderboardData.currentUser);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Failed to load leaderboard. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Assign badge based on rank
  const getBadge = (rank) => {
    if (rank === 1) return { icon: '👑', color: 'text-yellow-500', title: 'Champion' };
    if (rank === 2) return { icon: '🥈', color: 'text-gray-400', title: 'Silver Elite' };
    if (rank === 3) return { icon: '🥉', color: 'text-amber-700', title: 'Bronze Star' };
    if (rank <= 10) return { icon: '⭐', color: 'text-blue-500', title: 'Rising Star' };
    return { icon: '🔹', color: 'text-gray-500', title: 'Member' };
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Sidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Leaderboard</h1>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded-md" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded-md" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="text-red-500 font-semibold">{error}</div>
        ) : (
          <div className="space-y-6">
            {/* Current User Card - Only show if current user is not an admin */}
            {currentUser && !currentUser.isAdmin && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="bg-white text-indigo-600 font-bold text-xl h-12 w-12 rounded-full flex items-center justify-center">
                      #{currentUser.rank}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{currentUser.name}</h3>
                      <p className="text-indigo-200">You</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-indigo-200">Your Coins</p>
                    <p className="text-2xl font-bold flex items-center">
                      <span className="mr-2">🪙</span>
                      {currentUser.coins}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Admin Note - Show a message for admin users */}
            {currentUser && currentUser.isAdmin && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl p-6 text-white shadow-lg"
              >
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-xl font-bold">Admin Dashboard</h3>
                    <p className="text-blue-100 mt-2">
                      As an admin, you can view the leaderboard but your name is not displayed to regular users.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Leaderboard List - Only non-admin users */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gray-100 px-6 py-3 border-b border-gray-200">
                <div className="grid grid-cols-12 font-medium text-gray-500">
                  <div className="col-span-1">Rank</div>
                  <div className="col-span-5">User</div>
                  <div className="col-span-3">Badge</div>
                  <div className="col-span-3 text-right">Coins</div>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {allUsers.map((user, index) => {
                  const badge = getBadge(user.rank);
                  return (
                    <motion.div
                      key={user._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`px-6 py-4 grid grid-cols-12 items-center ${
                        currentUser && user._id === currentUser._id
                          ? 'bg-indigo-50'
                          : ''
                      }`}
                    >
                      <div className="col-span-1 font-bold text-gray-700">
                        #{user.rank}
                      </div>
                      <div className="col-span-5 font-medium">
                        {user.name}
                        {currentUser && user._id === currentUser._id && (
                          <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <div className={`col-span-3 flex items-center ${badge.color}`}>
                        <span className="text-xl mr-2">{badge.icon}</span>
                        <span className="text-sm font-medium">{badge.title}</span>
                      </div>
                      <div className="col-span-3 text-right font-bold flex items-center justify-end">
                        <span className="text-yellow-500 mr-1">🪙</span>
                        {user.coins}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;