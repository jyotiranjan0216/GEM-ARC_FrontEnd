import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Clock, MapPin, ThumbsUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Carousel = () => {
  const [events, setEvents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      const token = localStorage.getItem('token');
      setLoading(true);

      try {
        const res = await axios.get('https://gem-arc-backend.onrender.com/api/events/recommended', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setEvents(res.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching recommended events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    if (events.length === 0 || !autoplay) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [events, autoplay]);

  const formatDate = (isoDate) => {
    const dateObj = new Date(isoDate);
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Intl.DateTimeFormat('en-GB', options).format(dateObj);
  };

  const handlePrev = (e) => {
    e.stopPropagation(); // Prevent click from bubbling to parent (event link)
    setAutoplay(false);
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? events.length - 1 : prevIndex - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation(); // Prevent click from bubbling to parent (event link)
    setAutoplay(false);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
  };

  const handleRecommend = async (e, eventId) => {
    e.stopPropagation(); // Prevent click from bubbling to parent (event link)
    const token = localStorage.getItem('token');
    
    try {
      await axios.post(`https://gem-arc-backend.onrender.com/api/events/${eventId}/recommend`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Update UI to show the event was recommended
      setEvents(events.map(event => 
        event._id === eventId 
          ? { ...event, recommended: true, recommendCount: (event.recommendCount || 0) + 1 } 
          : event
      ));
      
    } catch (err) {
      console.error('Error recommending event:', err);
    }
  };

  const handleEventClick = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  const handleDotClick = (e, idx) => {
    e.stopPropagation(); // Prevent click from bubbling to parent (event link)
    setAutoplay(false);
    setCurrentIndex(idx);
  };

  if (loading) {
    return (
      <div className="w-full h-96 bg-gray-100 flex flex-col items-center justify-center text-gray-600 rounded-xl shadow mb-6">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-semibold">Loading recommended events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-96 bg-red-50 flex items-center justify-center text-red-600 rounded-xl shadow mb-6">
        <p className="text-lg font-semibold">{error}</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-100 flex items-center justify-center text-gray-600 rounded-xl shadow mb-6">
        <p className="text-lg font-semibold">No recommended events available</p>
      </div>
    );
  }

  const currentEvent = events[currentIndex];

  return (
    <div className="w-full bg-gray-200 rounded-xl overflow-hidden shadow-lg mb-6 relative">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-300 z-10">
        <div 
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / events.length) * 100}%` }}
        ></div>
      </div>
      
      {/* Carousel content */}
      <div 
        className="relative h-96 cursor-pointer"
        onClick={() => handleEventClick(currentEvent._id)}
      >
        {events.map((event, index) => (
          <div
            key={event._id}
            className={`absolute w-full h-full transition-all duration-700 ease-in-out transform ${
              index === currentIndex 
                ? 'opacity-100 translate-x-0' 
                : index < currentIndex 
                  ? 'opacity-0 -translate-x-full' 
                  : 'opacity-0 translate-x-full'
            }`}
          >
            <img
              src={event.thumbnail || "/api/placeholder/800/500"}
              alt={event.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
          </div>
        ))}
        
        {/* Event details overlay */}
        <div className="absolute bottom-0 left-0 w-full px-6 py-4 text-white z-10">
          <div className="flex justify-between items-end">
            <div className="space-y-2 w-full">
              <div className="flex justify-between items-center">
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {currentEvent.category || 'Event'}
                </span>
              </div>
              <h3 className="text-2xl font-bold">{currentEvent.name}</h3>
              <div className="flex items-center text-sm opacity-90 mt-1">
                <Clock className="w-4 h-4 mr-1" />
                <span>{formatDate(currentEvent.date)}</span>
                {currentEvent.location && (
                  <>
                    <span className="mx-2">•</span>
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{currentEvent.location}</span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-200 line-clamp-2 mt-1">{currentEvent.description}</p>
            </div>
          </div>
          
          <div className="flex justify-center items-center mt-3">
            <div className="flex space-x-1">
              {events.map((_, idx) => (
                <button
                  key={idx}
                  className={`w-2 h-2 rounded-full ${
                    idx === currentIndex ? 'bg-white' : 'bg-gray-400'
                  }`}
                  onClick={(e) => handleDotClick(e, idx)}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Navigation buttons */}
        <button 
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full z-10 transition-opacity opacity-70 hover:opacity-100"
          onClick={handlePrev}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <button 
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full z-10 transition-opacity opacity-70 hover:opacity-100"
          onClick={handleNext}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default Carousel;