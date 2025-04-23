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
        const response = await axios.get(`http://localhost:5000/api/events/${id}`, {
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

  // Create notification function
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
        'http://localhost:5000/api/notifications/add',
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
        'http://localhost:5000/api/events/join',
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
        // If notification fails, still show success for joining but mention notification error
        console.error('Notification creation failed:', notificationError);
        alert(`${response.data.message} (Notification system error: coins may be added but notification failed)`);
      }
      
      setUserRole(role);
      
      // Refresh event data
      const updatedEvent = await axios.get(`http://localhost:5000/api/events/${id}`, {
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

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Sidebar />
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-80 bg-gray-200 rounded-md" />
            <div className="h-8 bg-gray-200 w-2/3 rounded" />
            <div className="h-6 bg-gray-200 w-1/3 rounded" />
            <div className="h-32 bg-gray-200 rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Sidebar />
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="text-red-500 font-semibold">{error}</div>
          <button 
            onClick={handleBack} 
            className="mt-4 bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Sidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        <button 
          onClick={handleBack} 
          className="mb-4 flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back to Dashboard
        </button>
        
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <img 
            src={event.thumbnail} 
            alt={event.name} 
            className="w-full h-150 object-cover"
          />
          
          <div className="p-6">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold text-gray-800">{event.name}</h1>
              
              {userRole ? (
                <div className={`py-2 px-4 text-sm font-semibold rounded-lg text-white ${
                  userRole === 'participant' ? 'bg-green-500' : 'bg-purple-500'
                }`}>
                  ✅ You joined as {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                </div>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleJoin('participant')}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 text-sm rounded-lg transition"
                  >
                    Join as Participant (+20 coins)
                  </button>
                  <button
                    onClick={() => handleJoin('volunteer')}
                    className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 text-sm rounded-lg transition"
                  >
                    Join as Volunteer (+50 coins)
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center text-indigo-700">
                <span className="mr-2">📅</span>
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center text-indigo-700">
                <span className="mr-2">🕒</span>
                <span>{event.time}</span>
              </div>
              <div className="flex items-center text-indigo-700">
                <span className="mr-2">📍</span>
                <span>{event.venue || 'Location not specified'}</span>
              </div>
              <div className="flex items-center text-indigo-700">
                <span className="mr-2">👥</span>
                <span>{event.organizedBy || 'Organizer not specified'}</span>
              </div>
            </div>
            
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Description</h2>
              <p className="text-gray-600">{event.description}</p>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Participants ({event.participants?.length || 0})</h2>
                <div className="bg-blue-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                  {event.participants && event.participants.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {event.participants.map((participant, index) => (
                        <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {typeof participant === 'object' ? participant.name : `User ${index + 1}`}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No participants yet</p>
                  )}
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Volunteers ({event.volunteers?.length || 0})</h2>
                <div className="bg-purple-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                  {event.volunteers && event.volunteers.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {event.volunteers.map((volunteer, index) => (
                        <div key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                          {typeof volunteer === 'object' ? volunteer.name : `User ${index + 1}`}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No volunteers yet</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Skills Required</h2>
              <div className="flex flex-wrap gap-2">
                {event.skillsRequired && event.skillsRequired.length > 0 ? (
                  event.skillsRequired.map((skill, index) => (
                    <div key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No specific skills required</p>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {event.interestsTags && event.interestsTags.length > 0 ? (
                  event.interestsTags.map((tag, index) => (
                    <div key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                      {tag}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No tags available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Event;