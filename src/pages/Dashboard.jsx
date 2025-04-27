import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Carousel from '../components/Carousel';
import EventCard from '../components/EventCard';
import NotificationDisplay from './NotificationDisplay';

function Dashboard() {
  const [user, setUser] = useState({});
  const [allEvents, setAllEvents] = useState([]);
  const [categoryEvents, setCategoryEvents] = useState({
    personalized: [], // Added personalized category
    upcoming: [],
    tech: [],
    business: [],
    creative: [],
    education: [],
    social: [],
    other: []
  });
  const [eventStats, setEventStats] = useState({
    totalEvents: 0,
    personalizedCount: 0,
    upcomingCount: 0
  });
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [activeCategory, setActiveCategory] = useState('personalized'); // Default to personalized
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No token found. Please login again.');
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch user profile
        const userResponse = await fetch('https://gem-arc-backend.onrender.com/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await userResponse.json();
        const { name, coins } = userData;
        setUser({ name });
        setCoins(coins || 0);

        // Fetch all events
        const eventResponse = await fetch('https://gem-arc-backend.onrender.com/api/events/allEvents', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!eventResponse.ok) {
          throw new Error('Failed to fetch events');
        }

        const eventData = await eventResponse.json();
        setAllEvents(eventData);
        
        // Fetch personalized user recommendations
        const personalizedResponse = await axios.get('https://gem-arc-backend.onrender.com/api/events/userRecommended', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Extract the categorized events and stats from the response
        const { categorized, stats } = personalizedResponse.data;
        
        setCategoryEvents({
          personalized: categorized.personalized || [],
          upcoming: categorized.upcoming || [],
          tech: categorized.tech || [],
          business: categorized.business || [],
          creative: categorized.creative || [],
          education: categorized.education || [],
          social: categorized.social || [],
          other: categorized.other || []
        });
        
        setEventStats({
          totalEvents: stats.totalEvents || 0,
          personalizedCount: stats.personalizedCount || 0
        });
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load events. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleCoinClick = () => {
    navigate('/leaderboard');
  };

  const toggleEventView = () => {
    setShowAllEvents(!showAllEvents);
    setActiveCategory(showAllEvents ? 'personalized' : 'all');
  };

  // Filter events based on search query - apply to ALL events
  const filterEvents = (eventsArray) => {
    if (!searchQuery) return eventsArray;
    
    return eventsArray.filter(event => 
      event.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      event.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      event.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Get currently active events based on category filter
  const getActiveEvents = () => {
    if (showAllEvents) return filterEvents(allEvents);
    
    // Get events for the selected category and filter by search
    let eventsToFilter;
    switch(activeCategory) {
      case 'personalized':
        eventsToFilter = categoryEvents.personalized;
        break;
      case 'upcoming':
        eventsToFilter = categoryEvents.upcoming;
        break;
      case 'tech':
        eventsToFilter = categoryEvents.tech;
        break;
      case 'business':
        eventsToFilter = categoryEvents.business;
        break;
      case 'creative':
        eventsToFilter = categoryEvents.creative;
        break;
      case 'education':
        eventsToFilter = categoryEvents.education;
        break;
      case 'social':
        eventsToFilter = categoryEvents.social;
        break;
      case 'other':
        eventsToFilter = categoryEvents.other;
        break;
      case 'all':
      default:
        eventsToFilter = [...categoryEvents.personalized];
        break;
    }
    
    return filterEvents(eventsToFilter);
  };

  // Determine which events to display
  const eventsToDisplay = getActiveEvents();

  // Calculate filtered category counts
  const getCategoryCounts = () => {
    if (searchQuery) {
      return {
        personalized: filterEvents(categoryEvents.personalized).length,
        upcoming: filterEvents(categoryEvents.upcoming).length,
        tech: filterEvents(categoryEvents.tech).length,
        business: filterEvents(categoryEvents.business).length,
        creative: filterEvents(categoryEvents.creative).length,
        education: filterEvents(categoryEvents.education).length,
        social: filterEvents(categoryEvents.social).length,
        other: filterEvents(categoryEvents.other).length
      };
    }
    
    return {
      personalized: categoryEvents.personalized.length,
      upcoming: categoryEvents.upcoming.length,
      tech: categoryEvents.tech.length,
      business: categoryEvents.business.length,
      creative: categoryEvents.creative.length,
      education: categoryEvents.education.length,
      social: categoryEvents.social.length,
      other: categoryEvents.other.length
    };
  };

  const counts = getCategoryCounts();

  // Category info for display
  const categoryInfo = {
    personalized: { name: 'For You', icon: '✨', color: 'bg-gradient-to-r from-purple-600 to-pink-600' },
    upcoming: { name: 'Upcoming Soon', icon: '📅', color: 'bg-blue-600' },
    tech: { name: 'Tech', icon: '💻', color: 'bg-indigo-600' },
    business: { name: 'Business', icon: '💼', color: 'bg-yellow-600' },
    creative: { name: 'Creative', icon: '🎨', color: 'bg-purple-600' },
    education: { name: 'Education', icon: '📚', color: 'bg-green-600' },
    social: { name: 'Social', icon: '👥', color: 'bg-pink-600' },
    other: { name: 'Other', icon: '🌟', color: 'bg-gray-600' }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100">
      <Sidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Header with welcome message and stats */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Welcome, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">{user.name || 'User'}</span> 👋
              </h1>
              <p className="text-gray-500 mt-1">Discover events happening around you</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleCoinClick} 
                className="text-lg font-semibold text-yellow-600 bg-yellow-100 px-6 py-2 rounded-full flex items-center transition-all hover:bg-yellow-200 hover:shadow-md cursor-pointer"
              >
                <span className="mr-2 text-2xl">🪙</span> {coins} Coins
              </button>
              <NotificationDisplay />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-white rounded-xl shadow-md opacity-60" />
            <div className="h-8 bg-white w-1/3 rounded-lg opacity-60" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="h-64 bg-white rounded-xl shadow-md opacity-60" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Carousel for featured events */}
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-8">
              <Carousel />
            </div>
            
            {/* Events Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{eventStats.totalEvents}</h3>
                    <p className="text-amber-100">Total Events</p>
                  </div>
                  <div className="text-3xl">🗓️</div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{counts.personalized}</h3>
                    <p className="text-pink-100">Recommended For You</p>
                  </div>
                  <div className="text-3xl">✨</div>
                </div>
              </div>
            </div>
            
            {/* Combined Events Section */}
            <div className="mb-12">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  {showAllEvents ? 'All Events' : categoryInfo[activeCategory]?.name || 'Events'}
                  <span className="ml-2 bg-indigo-100 text-indigo-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                    {eventsToDisplay.length}
                  </span>
                </h2>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                  {/* Search bar - now visible at all times */}
                  <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                      </svg>
                    </div>
                    <input 
                      type="search" 
                      className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500" 
                      placeholder="Search events..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <button 
                    onClick={toggleEventView} 
                    className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 whitespace-nowrap"
                  >
                  
                    {showAllEvents ? 'Discover For You' : 'View All Events'}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Category filters for recommended events */}
              {!showAllEvents && (
                <div className="mb-6 overflow-x-auto pb-3">
                  <div className="flex gap-2 min-w-max">
                    {Object.entries(categoryInfo).map(([key, info]) => {
                      if (counts[key] > 0) {
                        return (
                          <button 
                            key={key}
                            onClick={() => setActiveCategory(key)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                              activeCategory === key 
                                ? key === 'personalized' 
                                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                                  : `${info.color} text-white` 
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <span className="mr-1">{info.icon}</span> {info.name} ({counts[key]})
                          </button>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {eventsToDisplay.length > 0 ? (
                  eventsToDisplay.map((event) => (
                    <div key={event._id} className="transform transition-all hover:scale-105">
                      <EventCard 
                        event={event} 
                        categoryInfo={!showAllEvents && event.recommendation ? {
                          ...categoryInfo[event.recommendation.primaryCategory || 'personalized'],
                          reason: event.recommendation.reason
                        } : null}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 bg-white rounded-xl shadow-md p-8 text-center">
                    <div className="text-4xl mb-4">{showAllEvents ? '🔍' : categoryInfo[activeCategory]?.icon || '✨'}</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      {searchQuery 
                        ? 'No events found matching your search' 
                        : showAllEvents 
                          ? 'No events found' 
                          : `No ${categoryInfo[activeCategory]?.name || ''} events found`}
                    </h3>
                    <p className="text-gray-500">
                      {searchQuery 
                        ? 'Try a different search term' 
                        : 'Check back later for new events!'}
                    </p>
                  </div>
                )}
              </div>

              {/* CTA to create event */}
              {eventsToDisplay.length > 0 && (
                <div className="mt-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white text-center">
                  <h3 className="text-2xl font-bold mb-2">Want to host an event?</h3>
                  <p className="text-indigo-100 mb-4">Share your knowledge, build your network, and grow your community.</p>
                  <button 
                    onClick={() => navigate('/propose-event')}
                    className="bg-white text-indigo-700 font-medium px-6 py-2 rounded-full hover:shadow-lg transition-all"
                  >
                    Create Your Event
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;