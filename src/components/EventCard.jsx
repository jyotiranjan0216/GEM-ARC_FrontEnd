import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function EventCard({ event }) {
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
      if (event.participants.includes(userId)) {
        setUserRole('participant');
      } else if (event.volunteers.includes(userId)) {
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
      
      setUserRole(role); // Update UI after successful join
    } catch (error) {
      const msg =
        error.response?.data?.message || 'Failed to join the event.';
      alert(msg);
    }
  };

  const formatDate = (isoDate) => {
    const dateObj = new Date(isoDate);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const isJoined = userRole !== null;
  
  const handleCardClick = () => {
    navigate(`/event/${event._id}`);
  };

  return (
    <div 
      className="bg-white rounded-2xl shadow-md overflow-hidden h-[360px] flex flex-col cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleCardClick}
    >
      <img
        src={event.thumbnail}
        alt={event.name}
        className="w-full h-40 object-cover"
      />

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{event.name}</h3>
          <p className="text-sm text-gray-600 mt-1 truncate">
            {event.description}
          </p>

          <p className="text-sm text-indigo-700 font-medium mt-2">
            📅 {formatDate(event.date)} | 🕒 {event.time}
          </p>
        </div>

        <div className="flex gap-2 mt-4">
          {isJoined ? (
            <div
              className={`w-full py-2 px-3 text-sm font-semibold rounded-lg text-white text-center cursor-not-allowed ${userRole === 'participant' ? 'bg-green-500' : 'bg-purple-500'
                }`}
              onClick={(e) => e.stopPropagation()}
            >
              ✅ Joined as {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventCard;