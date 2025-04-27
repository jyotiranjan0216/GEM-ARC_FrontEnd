import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

function Event() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [showParticipants, setShowParticipants] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    // Get user ID from token
    try {
      const decodedToken = parseJwt(token);
      setUserId(decodedToken.id);
    } catch (err) {
      console.error('Error parsing token:', err);
    }

    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`https://gem-arc-backend.onrender.com/api/events/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvent(response.data);
        // Check if user is participant or volunteer
        if (
          response.data.participants?.some(
            (participant) => participant._id === userId || participant === userId
          )
        ) {
          setUserRole('participant');
        } else if (
          response.data.volunteers?.some(
            (volunteer) => volunteer._id === userId || volunteer === userId
          )
        ) {
          setUserRole('volunteer');
        }
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchEventDetails();
    }
  }, [id, userId, navigate]);

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  const createNotification = async (title, message, type, link = '') => {
    const token = localStorage.getItem('token');
    if (!token || !userId) return;
  
    try {
      console.log('Sending notification data:', {
        user: userId,
        title, 
        message,
        type,
        link
      });
      
      const response = await axios.post(
        'https://gem-arc-backend.onrender.com/api/notifications/add',
        {
          userId: userId,
          title,
          message,
          type,
          link
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log('Notification response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to create notification:', error);
      console.error('Error response data:', error.response?.data);
      throw error;
    }
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return '';
    const dateObj = new Date(isoDate);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleJoin = async (role) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to join an event.');
      return;
    }

    try {
      // First join the event
      const response = await axios.post(
        'https://gem-arc-backend.onrender.com/api/events/join',
        {
          eventId: event._id,
          role,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Determine coin amount based on role
      const coinAmount = role === 'volunteer' ? 50 : 20;
      
      try {
        // Create notification for joining event
        const notificationTitle = `Joined ${event.name}`;
        const notificationMessage = `You have joined "${event.name}" as a ${role}. You earned ${coinAmount} coins!`;
        await createNotification(
          notificationTitle,
          notificationMessage,
          'coin',
          `/event/${event._id}`
        );
        
        alert(`${response.data.message} You earned ${coinAmount} coins!`);
      } catch (notificationError) {
        console.error('Notification creation failed:', notificationError);
        alert(`${response.data.message} (Notification system error: coins may be added but notification failed)`);
      }
      
      setUserRole(role);
      
      // Refresh event data
      const updatedEvent = await axios.get(`https://gem-arc-backend.onrender.com/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvent(updatedEvent.data);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to join the event.';
      alert(msg);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const togglePeople = () => {
    setShowParticipants(!showParticipants);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-gray-200 w-32 rounded-md mb-6" />
              <div className="h-96 bg-gray-200 rounded-2xl shadow" />
              <div className="h-10 bg-gray-200 w-3/4 rounded-lg" />
              <div className="flex gap-2">
                <div className="h-6 w-24 bg-gray-200 rounded-full" />
                <div className="h-6 w-24 bg-gray-200 rounded-full" />
                <div className="h-6 w-24 bg-gray-200 rounded-full" />
              </div>
              <div className="h-32 bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
              <h2 className="text-xl font-semibold mb-2">Error</h2>
              <p>{error}</p>
              <button 
                onClick={handleBack} 
                className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <button 
            onClick={handleBack} 
            className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Dashboard
          </button>
          
          {/* Hero Section */}
          <div className="relative rounded-3xl overflow-hidden shadow-lg mb-8">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
            <img 
              src={event.thumbnail || "https://via.placeholder.com/1200x600"} 
              alt={event.name} 
              className="w-full h-96 object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-20">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <div className="flex gap-2 mb-3">
                    {event.interestsTags && event.interestsTags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                    {event.interestsTags && event.interestsTags.length > 3 && (
                      <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                        +{event.interestsTags.length - 3} more
                      </span>
                    )}
                  </div>
                  <h1 className="text-4xl font-bold text-white mb-2">{event.name}</h1>
                  <div className="flex flex-wrap gap-4 text-white/90">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      <span>{event.venue || 'Location not specified'}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                      <span>{event.organizedBy || 'Organizer not specified'}</span>
                    </div>
                  </div>
                </div>
                
                {userRole ? (
                  <div className="bg-white/10 backdrop-blur-sm text-white py-2 px-5 rounded-full font-semibold flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Joined as {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleJoin('participant')}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-full text-sm font-medium transition flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                      </svg>
                      Join as Participant
                      <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-xs">+20 coins</span>
                    </button>
                    <button
                      onClick={() => handleJoin('volunteer')}
                      className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-full text-sm font-medium transition flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 11V9a2 2 0 00-2-2m2 4v4a2 2 0 104 0v-1m-4-3H9m2 0h4m6 1a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Join as Volunteer
                      <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-xs">+50 coins</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description Section */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">About This Event</h2>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{event.description}</p>
              </div>
              
              {/* Required Skills Section */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Skills Required</h2>
                <div className="flex flex-wrap gap-2">
                  {event.skillsRequired && event.skillsRequired.length > 0 ? (
                    event.skillsRequired.map((skill, index) => (
                      <div key={index} className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-full text-sm font-medium">
                        {skill}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No specific skills required</p>
                  )}
                </div>
              </div>
              
              {/* People Section with Toggle */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">People</h2>
                  <div className="flex">
                    <button 
                      onClick={togglePeople}
                      className={`px-4 py-2 text-sm font-medium rounded-l-lg ${showParticipants ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      Participants ({event.participants?.length || 0})
                    </button>
                    <button 
                      onClick={togglePeople}
                      className={`px-4 py-2 text-sm font-medium rounded-r-lg ${!showParticipants ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      Volunteers ({event.volunteers?.length || 0})
                    </button>
                  </div>
                </div>
                
                {showParticipants ? (
                  <div className="mt-4">
                    {event.participants && event.participants.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {event.participants.map((participant, index) => (
                          <div key={index} className="bg-blue-50 border border-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                            {typeof participant === 'object' ? participant.name : `User ${index + 1}`}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                        </svg>
                        <p>No participants have joined yet</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4">
                    {event.volunteers && event.volunteers.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {event.volunteers.map((volunteer, index) => (
                          <div key={index} className="bg-purple-50 border border-purple-100 text-purple-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                            {typeof volunteer === 'object' ? volunteer.name : `User ${index + 1}`}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 11V9a2 2 0 00-2-2m2 4v4a2 2 0 104 0v-1m-4-3H9m2 0h4m6 1a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p>No volunteers have joined yet</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Event Summary Card */}
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Event Summary</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm text-gray-500 font-medium">Organizer</h4>
                      <p className="text-gray-800 font-medium">{event.organizedBy || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-indigo-100 p-2 rounded-full mr-3">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm text-gray-500 font-medium">Date</h4>
                      <p className="text-gray-800 font-medium">{formatDate(event.date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-amber-100 p-2 rounded-full mr-3">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm text-gray-500 font-medium">Time</h4>
                      <p className="text-gray-800 font-medium">{event.time || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-rose-100 p-2 rounded-full mr-3">
                      <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm text-gray-500 font-medium">Location</h4>
                      <p className="text-gray-800 font-medium">{event.venue || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Event Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.interestsTags && event.interestsTags.length > 0 ? (
                      event.interestsTags.map((tag, index) => (
                        <div key={index} className="bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1 rounded-full text-xs font-medium">
                          {tag}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">No tags available</p>
                    )}
                  </div>
                </div>
                
                {!userRole && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="text-center space-y-4">
                      <button
                        onClick={() => handleJoin('participant')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl text-sm font-medium transition flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                        </svg>
                        Join as Participant
                        <span className="ml-2 bg-blue-500/20 px-2 py-1 rounded-full text-xs">+20 coins</span>
                      </button>
                      <button
                        onClick={() => handleJoin('volunteer')}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-xl text-sm font-medium transition flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 11V9a2 2 0 00-2-2m2 4v4a2 2 0 104 0v-1m-4-3H9m2 0h4m6 1a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Join as Volunteer
                        <span className="ml-2 bg-purple-500/20 px-2 py-1 rounded-full text-xs">+50 coins</span>
                      </button>
                    </div>
                  </div>
                )}
                
                {userRole && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center bg-green-50 text-green-700 p-4 rounded-xl">
                      <svg className="w-6 h-6 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <div>
                        <p className="font-medium">You're registered!</p>
                        <p className="text-sm text-green-600">Joined as {userRole.charAt(0).toUpperCase() + userRole.slice(1)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Stats Card */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="grid grid-cols-2 divide-x divide-gray-100">
                  <div className="p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600">{event.participants?.length || 0}</div>
                    <div className="text-sm font-medium text-gray-500 mt-1">Participants</div>
                  </div>
                  <div className="p-6 text-center">
                    <div className="text-3xl font-bold text-purple-600">{event.volunteers?.length || 0}</div>
                    <div className="text-sm font-medium text-gray-500 mt-1">Volunteers</div>
                  </div>
                </div>
              </div>
              
              {/* Share Card */}
              {/* <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Share This Event</h3>
                <div className="flex justify-center gap-4">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full transition">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </button>
                  <button className="bg-blue-400 hover:bg-blue-500 text-white p-3 rounded-full transition">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z"/>
                    </svg>
                  </button>
                  <button className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full transition">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </button>
                  <button className="bg-pink-500 hover:bg-pink-600 text-white p-3 rounded-full transition">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                    </svg>
                  </button>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Event;