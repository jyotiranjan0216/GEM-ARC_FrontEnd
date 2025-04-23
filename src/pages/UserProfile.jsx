import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import NotificationIcon from '../components/NotificationIcon';
import axios from 'axios';
import { FaEdit, FaCheck, FaTimes, FaCamera, FaSignOutAlt } from 'react-icons/fa';
import NotificationDisplay from './NotificationDisplay';

function UserProfile() {
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    skills: [],
    interests: [],
    coins: 0,
    profilePhoto: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState({
    name: false,
    phone: false,
    skills: false,
    interests: false
  });
  
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [tempUser, setTempUser] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No token found. Please login again.');
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get('https://gem-arc-backend.onrender.com/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
        setTempUser(response.data);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const toggleEditMode = (field) => {
    if (editMode[field]) {
      // If we're saving, update the user object
      setUser({...user, ...tempUser});
      updateUserData(field);
    } else {
      // If we're entering edit mode, copy current values to temp
      setTempUser({...tempUser, [field]: user[field]});
    }
    
    setEditMode({...editMode, [field]: !editMode[field]});
  };

  const cancelEdit = (field) => {
    setEditMode({...editMode, [field]: false});
  };

  const handleInputChange = (field, value) => {
    setTempUser({...tempUser, [field]: value});
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !tempUser.skills.includes(newSkill.trim())) {
      setTempUser({...tempUser, skills: [...tempUser.skills, newSkill.trim()]});
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setTempUser({
      ...tempUser,
      skills: tempUser.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !tempUser.interests.includes(newInterest.trim())) {
      setTempUser({...tempUser, interests: [...tempUser.interests, newInterest.trim()]});
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interestToRemove) => {
    setTempUser({
      ...tempUser,
      interests: tempUser.interests.filter(interest => interest !== interestToRemove)
    });
  };

  const updateUserData = async (field) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const updateData = {};
      updateData[field] = tempUser[field];
      console.log('Updating user data:', updateData); // Debugging line
      
      await axios.put('https://gem-arc-backend.onrender.com/api/user/update', updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update was successful
      setUser({...user, [field]: tempUser[field]});
    } catch (err) {
      console.error('Error updating user data:', err);
      // Revert to previous data if update failed
      setTempUser({...tempUser, [field]: user[field]});
    }
  };

  const handleProfilePhotoUpload = async (e) => {
    const file = e.target.files[0];
    console.log('Selected file:', file); // Debugging line to check the file
  
    if (!file) {
      console.error('No file selected');
      return;
    }
  
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }
  
    const formData = new FormData();
    formData.append('profilePhoto', file);
  
    try {
      console.log('Sending request to upload photo...');
      const response = await axios.post(
        'https://gem-arc-backend.onrender.com/api/user/upload-profile-photo',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
  
      console.log('Upload successful', response); // Log the response
  
      if (response.status === 200) {
        // Assuming backend returns the updated profile photo URL
        setUser((prevUser) => ({ ...prevUser, profilePhoto: response.data.profilePhoto }));
      } else {
        console.error('Error in response', response);
      }
    } catch (err) {
      console.error('Error uploading profile photo:', err);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to login page
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
        <Sidebar />
        <div className="flex-1 p-6 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
        <Sidebar />
        <div className="flex-1 p-6 flex justify-center items-center">
          <div className="text-red-500 font-semibold bg-white p-6 rounded-lg shadow-md">
            {error}
            <button 
              onClick={() => window.location.href = '/login'} 
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors block w-full"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      <Sidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          <div className="flex items-center gap-6">
            <span className="text-lg font-semibold text-yellow-600 bg-yellow-100 px-4 py-1 rounded-full flex items-center">
              <span className="mr-1">🪙</span> {user.coins} Coins
            </span>
            <NotificationDisplay />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100 transform transition-all hover:shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="relative group">
              <div className="w-36 h-36 rounded-full overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center border-4 border-white shadow-lg">
                {user.profilePhoto ? (
                  <img 
                    src={user.profilePhoto} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl font-bold text-white">{user.name?.charAt(0)?.toUpperCase()}</span>
                )}
              </div>
              <label className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <FaCamera className="text-white text-2xl" />
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleProfilePhotoUpload}
                />
              </label>
            </div>

            <div className="flex-1">
              <div className="mb-6">
                <div className="flex items-center">
                  <h2 className="text-3xl font-bold text-gray-800 mr-3 transition-all">
                    {editMode.name ? (
                      <input 
                        type="text" 
                        value={tempUser.name || ''} 
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="border-b-2 border-indigo-500 focus:outline-none px-1 py-0.5 bg-indigo-50 rounded"
                      />
                    ) : (
                      user.name
                    )}
                  </h2>
                  {editMode.name ? (
                    <div className="flex items-center">
                      <button 
                        onClick={() => toggleEditMode('name')} 
                        className="text-green-500 hover:text-green-700 mr-2 bg-green-100 p-1.5 rounded-full"
                      >
                        <FaCheck />
                      </button>
                      <button 
                        onClick={() => cancelEdit('name')} 
                        className="text-red-500 hover:text-red-700 bg-red-100 p-1.5 rounded-full"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => toggleEditMode('name')} 
                      className="text-gray-400 hover:text-indigo-500 bg-gray-100 p-1.5 rounded-full hover:bg-indigo-100 transition-colors"
                    >
                      <FaEdit />
                    </button>
                  )}
                </div>
                <p className="text-gray-500 mt-1 text-lg">{user.email}</p>
              </div>

              <div className="mb-2">
                <div className="flex items-center">
                  <span className="font-medium text-gray-600 mr-2">Phone:</span>
                  {editMode.phone ? (
                    <div className="flex items-center">
                      <input 
                        type="text" 
                        value={tempUser.phone || ''} 
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="border-b-2 border-indigo-500 focus:outline-none px-2 py-1 mr-2 bg-indigo-50 rounded"
                      />
                      <button 
                        onClick={() => toggleEditMode('phone')} 
                        className="text-green-500 hover:text-green-700 mr-2 bg-green-100 p-1.5 rounded-full"
                      >
                        <FaCheck />
                      </button>
                      <button 
                        onClick={() => cancelEdit('phone')} 
                        className="text-red-500 hover:text-red-700 bg-red-100 p-1.5 rounded-full"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span className="mr-2 text-lg">{user.phone || 'Not provided'}</span>
                      <button 
                        onClick={() => toggleEditMode('phone')} 
                        className="text-gray-400 hover:text-indigo-500 bg-gray-100 p-1.5 rounded-full hover:bg-indigo-100 transition-colors"
                      >
                        <FaEdit />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 transform transition-all hover:shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">Skills</h3>
              {editMode.skills ? (
                <div className="flex items-center">
                  <button 
                    onClick={() => toggleEditMode('skills')} 
                    className="text-green-500 hover:text-green-700 mr-2 bg-green-100 p-1.5 rounded-full"
                  >
                    <FaCheck />
                  </button>
                  <button 
                    onClick={() => cancelEdit('skills')} 
                    className="text-red-500 hover:text-red-700 bg-red-100 p-1.5 rounded-full"
                  >
                    <FaTimes />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => toggleEditMode('skills')} 
                  className="text-gray-400 hover:text-indigo-500 bg-gray-100 p-1.5 rounded-full hover:bg-indigo-100 transition-colors"
                >
                  <FaEdit />
                </button>
              )}
            </div>

            {editMode.skills && (
              <div className="mb-4 flex">
                <input 
                  type="text" 
                  value={newSkill} 
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a new skill"
                  className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                />
                <button 
                  onClick={handleAddSkill}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Add
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {(editMode.skills ? tempUser.skills : user.skills)?.map((skill, index) => (
                <div 
                  key={index} 
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    editMode.skills 
                    ? "bg-indigo-100 text-indigo-800 pr-2 flex items-center shadow-sm" 
                    : "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md"
                  }`}
                >
                  {skill}
                  {editMode.skills && (
                    <button 
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-2 text-indigo-800 hover:text-indigo-900 bg-indigo-200 rounded-full p-1"
                    >
                      <FaTimes size={12} />
                    </button>
                  )}
                </div>
              ))}
              {(editMode.skills ? tempUser.skills : user.skills)?.length === 0 && (
                <p className="text-gray-500 italic">No skills added yet</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 transform transition-all hover:shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">Interests</h3>
              {editMode.interests ? (
                <div className="flex items-center">
                  <button 
                    onClick={() => toggleEditMode('interests')} 
                    className="text-green-500 hover:text-green-700 mr-2 bg-green-100 p-1.5 rounded-full"
                  >
                    <FaCheck />
                  </button>
                  <button 
                    onClick={() => cancelEdit('interests')} 
                    className="text-red-500 hover:text-red-700 bg-red-100 p-1.5 rounded-full"
                  >
                    <FaTimes />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => toggleEditMode('interests')} 
                  className="text-gray-400 hover:text-indigo-500 bg-gray-100 p-1.5 rounded-full hover:bg-indigo-100 transition-colors"
                >
                  <FaEdit />
                </button>
              )}
            </div>

            {editMode.interests && (
              <div className="mb-4 flex">
                <input 
                  type="text" 
                  value={newInterest} 
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Add a new interest"
                  className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                />
                <button 
                  onClick={handleAddInterest}
                  className="bg-green-600 text-white px-4 py-2 rounded-r-lg hover:bg-green-700 transition-colors shadow-sm"
                >
                  Add
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {(editMode.interests ? tempUser.interests : user.interests)?.map((interest, index) => (
                <div 
                  key={index} 
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    editMode.interests 
                    ? "bg-green-100 text-green-800 pr-2 flex items-center shadow-sm" 
                    : "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md"
                  }`}
                >
                  {interest}
                  {editMode.interests && (
                    <button 
                      onClick={() => handleRemoveInterest(interest)}
                      className="ml-2 text-green-800 hover:text-green-900 bg-green-200 rounded-full p-1"
                    >
                      <FaTimes size={12} />
                    </button>
                  )}
                </div>
              ))}
              {(editMode.interests ? tempUser.interests : user.interests)?.length === 0 && (
                <p className="text-gray-500 italic">No interests added yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mt-8 border border-gray-100 transform transition-all hover:shadow-xl">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Account Information</h3>
          <div className="space-y-4">
            <div className="flex items-center bg-gray-50 p-4 rounded-lg">
              <span className="font-medium text-gray-700 w-40">Member Since:</span>
              <span className="text-indigo-600 font-medium">{new Date(parseInt(user._id.substring(0, 8), 16) * 1000).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center bg-gray-50 p-4 rounded-lg">
              <span className="font-medium text-gray-700 w-40">User ID:</span>
              <span className="text-gray-500 font-mono text-sm">{user._id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;