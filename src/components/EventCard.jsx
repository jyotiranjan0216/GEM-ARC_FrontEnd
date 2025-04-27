import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

function EventCard({ event, categoryInfo }) {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'participant', 'volunteer', or null

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = parseJwt(token);
      setUserId(decodedToken.id);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      if (event.participants && event.participants.includes(userId)) {
        setUserRole('participant');
      } else if (event.volunteers && event.volunteers.includes(userId)) {
        setUserRole('volunteer');
      }
    }
  }, [userId, event.participants, event.volunteers]);

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

  const handleJoin = async (e, role) => {
    e.stopPropagation(); // Prevent navigation when clicking join buttons

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
        // If notification fails, still show success for joining but mention notification error
        console.error('Notification creation failed:', notificationError);
        alert(`${response.data.message} (Notification system error: coins may be added but notification failed)`);
      }

      setUserRole(role); // Update UI after successful join
    } catch (error) {
      const msg =
        error.response?.data?.message || 'Failed to join the event.';
      alert(msg);
    }
  };

  // Format date
  const formattedDate = event.date ? new Date(event.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  }) : 'Date TBA';

  // Calculate time until event
  const timeUntil = event.date ? formatDistanceToNow(new Date(event.date), { addSuffix: true }) : '';

  const isJoined = userRole !== null;

  const handleCardClick = () => {
    navigate(`/event/${event._id}`);
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Event Image */}
      <div className="relative h-48 overflow-hidden bg-indigo-100">
        {event.thumbnail ? (
          <img
            src={event.thumbnail}
            alt={event.name || 'Event'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-indigo-100 to-purple-100">
            <span className="text-5xl">🎪</span>
          </div>
        )}

        {/* Date badge */}
        <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-3 py-1 rounded-full shadow-md text-sm font-semibold text-gray-700">
          {formattedDate}
        </div>

        {/* Category badge if provided */}
        {categoryInfo && (
          <div className={`absolute top-4 left-4 ${categoryInfo.color} text-white px-3 py-1 rounded-full shadow-md text-xs font-medium flex items-center`}>
            <span className="mr-1">{categoryInfo.icon}</span> {categoryInfo.name}
          </div>
        )}
      </div>

      {/* Event Details */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{event.name || 'Untitled Event'}</h3>

        {/* Time and venue info */}
        <div className="flex items-center text-gray-600 text-sm mb-2">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{event.time} · {timeUntil}</span>
        </div>

        <div className="flex items-center text-gray-600 text-sm mb-4">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          <span className="line-clamp-1">{event.venue || 'Location TBA'}</span>
        </div>

        {/* Event description (truncated) */}
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{event.description || 'No description available'}</p>

        {/* Show personalized reason if available */}
        {categoryInfo && categoryInfo.reason && (
          <div className="mt-2 p-3 bg-purple-50 rounded-lg border border-purple-100">
            <div className="flex items-center space-x-2">
              <div className="text-lg">✨</div>
              <p className="text-xs text-purple-800">
                <span className="font-medium">Recommended for you: </span>
                {categoryInfo.reason}
              </p>
            </div>
          </div>

        )}

        {/* Join Buttons or Status */}
        <div className="mt-4">
          {isJoined ? (
            <div
              className={`w-full py-2 px-3 text-sm font-semibold rounded-lg text-white text-center cursor-not-allowed ${userRole === 'participant' ? 'bg-green-500' : 'bg-purple-500'}`}
              onClick={(e) => e.stopPropagation()}
            >
              ✅ Joined as {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={(e) => handleJoin(e, 'participant')}
                className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-3 text-sm rounded-lg transition"
              >
                Join as Participant
              </button>
              <button
                onClick={(e) => handleJoin(e, 'volunteer')}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 text-sm rounded-lg transition"
              >
                Join as Volunteer
              </button>
            </div>
          )}
        </div>

        {/* Tags / Skills */}
        {event.skillsRequired && event.skillsRequired.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {event.skillsRequired.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-full"
              >
                {skill}
              </span>
            ))}
            {event.skillsRequired.length > 3 && (
              <span className="bg-gray-50 text-gray-500 text-xs px-2 py-1 rounded-full">
                +{event.skillsRequired.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Organizer and participant count */}
        <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
          <div>
            <span className="font-medium">By:</span> {event.organizedBy || 'Unknown'}
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            {event.participants ? event.participants.length : 0} joined
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventCard;