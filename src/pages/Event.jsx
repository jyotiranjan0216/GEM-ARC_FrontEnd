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
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <img
              src={event.thumbnail || "https://via.placeholder.com/1200x600"}
              alt={event.name}
              className="w-full h-96 object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <div className="flex flex-wrap gap-2 mb-3">
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
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{event.name}</h1>
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
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">About This Event</h2>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{event.description}</p>
              </div>

              {/* Required Skills Section */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Skills Required</h2>
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">People</h2>
                  <div className="flex w-full sm:w-auto">
                    <button
                      onClick={togglePeople}
                      className={`flex-1 sm:flex-auto px-4 py-2 text-sm font-medium rounded-l-lg ${showParticipants ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      Participants ({event.participants?.length || 0})
                    </button>
                    <button
                      onClick={togglePeople}
                      className={`flex-1 sm:flex-auto px-4 py-2 text-sm font-medium rounded-r-lg ${!showParticipants ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      Volunteers ({event.volunteers?.length || 0})
                    </button>
                  </div>
                </div>

                {showParticipants ? (
                  <div className="mt-4">
                    {event.participants && event.participants.length > 0 ? (
                      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {event.participants.map((participant, index) => (
                          <div key={index} className="bg-blue-50 border border-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center">
                            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                            <span className="truncate">{typeof participant === 'object' ? participant.name : `User ${index + 1}`}</span>
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
                      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {event.volunteers.map((volunteer, index) => (
                          <div key={index} className="bg-purple-50 border border-purple-100 text-purple-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center">
                            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                            <span className="truncate">{typeof volunteer === 'object' ? volunteer.name : `User ${index + 1}`}</span>
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
              <div className="bg-white rounded-2xl shadow-sm p-6 lg:sticky lg:top-6">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Event;