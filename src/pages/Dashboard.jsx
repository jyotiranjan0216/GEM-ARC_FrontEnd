import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Carousel from '../components/Carousel';
import EventCard from '../components/EventCard';
import NotificationDisplay from './NotificationDisplay';
import Chatbot from '../components/Chatbot'; // Import the Chatbot component

function Dashboard() {
  const [user, setUser] = useState({});
  const [events, setEvents] = useState([]);
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No token found. Please login again.');
      return;
    }

    const fetchData = async () => {
      try {
        const userResponse = await fetch('http://localhost:5000/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await userResponse.json();
        const { name, coins } = userData;
        setUser({ name });
        setCoins(coins || 0);

        const eventResponse = await fetch('http://localhost:5000/api/events/allEvents', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!eventResponse.ok) {
          throw new Error('Failed to fetch events');
        }

        const eventData = await eventResponse.json();
        console.log('Fetched events:', eventData);
        setEvents(eventData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load events. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Sidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome, <span className="text-indigo-600">{user.name || 'User'}</span> 👋
          </h1>
          <div className="flex items-center gap-6">
            <span className="text-lg font-semibold text-yellow-600 bg-yellow-100 px-4 py-1 rounded-full flex items-center">
              <span className="mr-1">🪙</span> {coins} Coins
            </span>
            <NotificationDisplay />
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-40 bg-gray-200 rounded-md" />
            <div className="h-6 bg-gray-200 w-1/3 rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="h-40 bg-gray-200 rounded-md" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="text-red-500 font-semibold">{error}</div>
        ) : (
          <>
            <Carousel newEvents={events} />

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
              Upcoming Events 
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div key={event._id}>
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      

    </div>
  );
}

export default Dashboard;