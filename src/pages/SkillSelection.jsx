import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';

// Updated skill options for dashboard personalization
const availableSkills = [
  'Web Development',
  'UI/UX Design',
  'Event Planning',
  'Public Speaking',
  'Video Production',
  'Content Creation',
  'Photography',
  'Digital Marketing',
  'Project Management',
  'Social Media',
  'Leadership',
  'Graphic Design'
];

function SkillSelection() {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const navigate = useNavigate();

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    if (!token) {
      alert('No token found. Please sign in again.');
      navigate('/');
      return;
    }

    try {
      await axios.post(
        'https://gem-arc-backend.onrender.com/api/user/skills',
        { skills: selectedSkills },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate('/interests');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save skills');
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* GEM-ARC Logo */}
      <motion.div 
        className="mb-8 text-center"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-3xl font-extrabold tracking-wide bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
          GEM-ARC
        </h1>
        <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-indigo-500 mx-auto mt-1 rounded-full"></div>
        <p className="text-sm text-gray-600 mt-1">Campus Event Management</p>
      </motion.div>

      <motion.h2
        className="text-2xl font-bold mb-3 text-gray-800"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        What skills are you interested in?
      </motion.h2>
      
      <motion.p
        className="text-gray-600 mb-6 text-center max-w-md"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Select your areas of expertise to personalize your event dashboard experience
      </motion.p>

      <motion.div
        className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md border border-blue-100"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            {availableSkills.map((skill) => (
              <motion.div
                key={skill}
                className={`relative rounded-lg overflow-hidden shadow-sm transition-all duration-200 ${
                  selectedSkills.includes(skill) ? 'ring-2 ring-blue-500' : ''
                }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`w-full h-full p-3 text-center text-sm font-medium ${
                    selectedSkills.includes(skill)
                      ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {skill}
                  {selectedSkills.includes(skill) && (
                    <motion.div 
                      className="absolute top-1 right-1 bg-blue-500 rounded-full p-0.5"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    >
                      <Check size={12} className="text-white" />
                    </motion.div>
                  )}
                </button>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <motion.div 
              className="text-center text-sm text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <span>Your dashboard will be customized based on your selections</span>
            </motion.div>
            
            <motion.button
              type="submit"
              disabled={selectedSkills.length === 0}
              className={`flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md transition-all duration-300 ${
                selectedSkills.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
              }`}
              whileHover={selectedSkills.length > 0 ? { scale: 1.02 } : {}}
              whileTap={selectedSkills.length > 0 ? { scale: 0.98 } : {}}
            >
              <span>Personalize My Dashboard</span>
              <ChevronRight size={18} />
            </motion.button>
          </div>
        </form>
      </motion.div>
      
      <motion.p 
        className="mt-4 text-xs text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Step 1 of 2: Dashboard Personalization
      </motion.p>
    </motion.div>
  );
}

export default SkillSelection;