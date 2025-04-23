import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const availableInterests = [
  'Tech Events',
  'Cultural Events',
  'Hackathons',
  'Debates',
  'Gaming',
  'Sports',
  'Workshops',
  'Webinars',
];

function InterestSelection() {
  const [selectedInterests, setSelectedInterests] = useState([]);
  const navigate = useNavigate();

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token'); // retrieve token
    console.log('Selected Interests:', selectedInterests, " ", "token: ", token); // Debugging line

    try {
      await axios.post(
        'http://localhost:5000/api/user/interests',
        { interests: selectedInterests },
        {
          headers: {
            Authorization: `Bearer ${token}`, // attach token in header
          },
        }
      );
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save interests');
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex flex-col items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.h2
        className="text-3xl font-extrabold mb-6 text-gray-800"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Select Your Interests
      </motion.h2>

      <motion.form
        onSubmit={handleSubmit}
        className="bg-white shadow-2xl rounded-xl p-8 w-full max-w-md"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="grid grid-cols-2 gap-4 mb-6">
          {availableInterests.map((interest) => (
            <motion.label
              key={interest}
              className={`flex items-center p-2 rounded-lg shadow-sm border transition-all duration-200 cursor-pointer ${
                selectedInterests.includes(interest)
                  ? 'bg-green-100 border-green-400'
                  : 'bg-white border-gray-300 hover:border-blue-400'
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <input
                type="checkbox"
                value={interest}
                checked={selectedInterests.includes(interest)}
                onChange={() => toggleInterest(interest)}
                className="mr-2 accent-green-500"
              />
              <span className="text-sm font-medium">{interest}</span>
            </motion.label>
          ))}
        </div>

        <motion.button
          type="submit"
          className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white font-semibold py-2 rounded shadow hover:from-green-500 hover:to-green-700 transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          🚀 Go to Dashboard
        </motion.button>
      </motion.form>
    </motion.div>
  );
}

export default InterestSelection;
