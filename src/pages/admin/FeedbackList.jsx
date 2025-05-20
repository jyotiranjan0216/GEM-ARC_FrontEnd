// frontend/src/pages/admin/FeedbackList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import { toast } from 'react-toastify';
import AdminLayout from '../../components/layouts/AdminLayout';

// Improved sentiment analysis function
const analyzeSentiment = (text) => {
  if (!text || text.trim() === '') return 'neutral';
  
  // Convert text to lowercase for easier comparison
  const lowercaseText = text.toLowerCase();
  
  // Define positive and negative word lists
  const positiveWords = [
    'good', 'great', 'excellent', 'amazing', 'fantastic', 'wonderful', 'awesome',
    'love', 'best', 'perfect', 'enjoy', 'helpful', 'impressive', 'outstanding',
    'incredible', 'happy', 'satisfied', 'thanks', 'thank you', 'appreciate',
    'easy', 'smooth', 'well', 'nice', 'liked', 'impressed', 'superb', 'brilliant',
    'exceptional', 'delighted', 'pleased', 'favorite', 'convenient', 'efficient',
    'fast', 'quick', 'intuitive', 'reliable', 'supportive', 'user-friendly',
    'top-notch', 'flawless', 'clean', 'clear', 'understandable', 'responsive',
    'time-saving', 'flexible', 'accessible', 'affordable', 'beautiful',
    'seamless', 'love it', 'great job', 'well done', 'very good', 'very helpful'
  ];

  const negativeWords = [
    'bad', 'poor', 'terrible', 'awful', 'horrible', 'disappointing', 'worst',
    'hate', 'dislike', 'difficult', 'confusing', 'frustrating', 'annoying',
    'issue', 'problem', 'error', 'fail', 'failed', 'broken', 'not working',
    'slow', 'complicated', 'buggy', 'useless', 'waste', 'negative', 'hard',
    'expensive', 'unhappy', 'dissatisfied', 'trouble', 'crash', 'lag', 'glitch',
    'inaccurate', 'misleading', 'unresponsive', 'delayed', 'too slow',
    'very bad', 'poor quality', 'not helpful', 'doesn’t work', 'worst experience',
    'very disappointed', 'hate it', 'can’t use', 'problematic', 'lack', 'missing',
    'confused', 'terribly slow', 'needs improvement'
  ];

  
  // Count occurrences of positive and negative words
  let positiveCount = 0;
  let negativeCount = 0;
  
  // Check for positive words
  positiveWords.forEach(word => {
    const regex = new RegExp('\\b' + word + '\\b', 'gi');
    const matches = lowercaseText.match(regex);
    if (matches) positiveCount += matches.length;
  });
  
  // Check for negative words
  negativeWords.forEach(word => {
    const regex = new RegExp('\\b' + word + '\\b', 'gi');
    const matches = lowercaseText.match(regex);
    if (matches) negativeCount += matches.length;
  });
  
  // Factor in the star rating to weight the sentiment
  const scoreFromRating = (rating) => {
    if (rating >= 4) return 2; // Strongly positive
    if (rating === 3) return 0; // Neutral
    return -2; // Negative
  };
  
  // Calculate overall sentiment - improved scoring
  const sentimentScore = positiveCount - negativeCount;
  
  // Determine sentiment category with improved thresholds
  if (sentimentScore > 0) return 'positive'; // Changed from >2 to >0
  if (sentimentScore < 0) return 'negative';
  
  // If no clear sentiment from words, check if rating is available
  if (text.rating) {
    const ratingScore = scoreFromRating(text.rating);
    if (ratingScore > 0) return 'positive';
    if (ratingScore < 0) return 'negative';
  }
  
  return 'neutral';
};

const getSentimentColor = (sentiment) => {
  switch (sentiment) {
    case 'positive':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'negative':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getSentimentIcon = (sentiment) => {
  switch (sentiment) {
    case 'positive':
      return '😊';
    case 'negative':
      return '😔';
    default:
      return '😐';
  }
};

const FeedbackList = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    rating: 'all',
    search: '',
    event: 'all',
    sentiment: 'all'
  });
  const [events, setEvents] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  useEffect(() => {
    fetchFeedback();
    fetchEvents();
  }, []);

  const fetchFeedback = async () => {
    try {
      const { data } = await axios.get('https://gem-arc-backend.onrender.com/api/admin/feedback/all');
      
      // Add sentiment analysis to each feedback item
      const feedbackWithSentiment = data.feedback.map(item => ({
        ...item,
        sentiment: analyzeSentiment(item.message || '')
      }));
      console.log(feedbackWithSentiment);
      
      setFeedback(feedbackWithSentiment);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch feedback');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data } = await axios.get('https://gem-arc-backend.onrender.com/api/events/allEvents');
      setEvents(data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const viewFeedbackDetails = (item) => {
    setSelectedFeedback(item);
    console.log(item);
  };

  const closeModal = () => {
    setSelectedFeedback(null);
  };

  const getRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<span key={i} className="text-yellow-500">★</span>);
      } else {
        stars.push(<span key={i} className="text-gray-300">★</span>);
      }
    }
    return stars;
  };

  const filteredFeedback = feedback
    .filter(item => 
      (filters.rating === 'all' || Number(item.rating) === Number(filters.rating)) &&
      (filters.event === 'all' || item.eventId === filters.event) &&
      (filters.sentiment === 'all' || item.sentiment === filters.sentiment) &&
      (filters.search === '' || 
        (item.eventName && item.eventName.toLowerCase().includes(filters.search.toLowerCase())) ||
        (item.userName && item.userName.toLowerCase().includes(filters.search.toLowerCase())) ||
        (item.message && item.message.toLowerCase().includes(filters.search.toLowerCase())))
    );

  // Calculate sentiment statistics based on filtered feedback
  const positiveCount = filteredFeedback.filter(item => item.sentiment === 'positive').length;
  const negativeCount = filteredFeedback.filter(item => item.sentiment === 'negative').length;

  if (loading) return <AdminLayout><div className="text-center py-20">Loading feedback...</div></AdminLayout>;
  if (error) return <AdminLayout><div className="text-red-500 text-center py-20">Error: {error}</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Event Feedback Management</h1>
        
        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Search
              </label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Search feedback message"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Rating Filter
              </label>
              <select
                name="rating"
                value={filters.rating}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Event Filter
              </label>
              <select
                name="event"
                value={filters.event}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="all">All Events</option>
                {events.map(event => (
                  <option key={event._id} value={event._id}>{event.name}</option>
                ))}
              </select>
            </div>
            
            {/* Sentiment Filter */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Sentiment Filter
              </label>
              <select
                name="sentiment"
                value={filters.sentiment}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="all">All Sentiments</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-purple-500 text-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">Total Feedback</h3>
            <p className="text-3xl font-bold">{filteredFeedback.length}</p>
          </div>
          
          <div className="bg-indigo-600 text-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">Average Rating</h3>
            <p className="text-3xl font-bold">
              {filteredFeedback.length > 0 
                ? (filteredFeedback.reduce((sum, item) => sum + item.rating, 0) / filteredFeedback.length).toFixed(1)
                : '0.0'}
              <span className="text-xl"> / 5</span>
            </p>
          </div>
          
          {/* Sentiment Statistics based on filtered feedback */}
          <div className="bg-green-500 text-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">Positive Feedback</h3>
            <p className="text-3xl font-bold">
              {positiveCount}
              <span className="text-xl ml-2">
                ({filteredFeedback.length > 0 ? Math.round((positiveCount / filteredFeedback.length) * 100) : 0}%)
              </span>
            </p>
          </div>
          
          <div className="bg-red-600 text-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">Negative Feedback</h3>
            <p className="text-3xl font-bold">
              {negativeCount}
              <span className="text-xl ml-2">
                ({filteredFeedback.length > 0 ? Math.round((negativeCount / filteredFeedback.length) * 100) : 0}%)
              </span>
            </p>
          </div>
        </div>
        
        {/* Feedback Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredFeedback.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Event</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">User</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Rating</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Sentiment</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Message</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredFeedback.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{item.name || "General"}</td>
                      <td className="px-4 py-3">{item.userName || "Anonymous"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          {getRatingStars(item.rating)}
                          <span className="ml-2">({item.rating})</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSentimentColor(item.sentiment)}`}>
                          {getSentimentIcon(item.sentiment)} {item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="max-w-xs truncate">{item.message}</div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => viewFeedbackDetails(item)}
                          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No feedback found matching your filters</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Feedback Detail Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl border-t-4 border-indigo-500 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-indigo-800">Feedback Details</h2>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded-full p-1"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-indigo-50 p-3 rounded-lg">
                <p className="text-indigo-700 font-medium">Event</p>
                <p className="font-semibold">{selectedFeedback.eventName || "General"}</p>
              </div>
              
              <div className="bg-indigo-50 p-3 rounded-lg">
                <p className="text-indigo-700 font-medium">User</p>
                <p className="font-semibold">{selectedFeedback.userName || "Anonymous"}</p>
              </div>
              
              <div className="bg-indigo-50 p-3 rounded-lg">
                <p className="text-indigo-700 font-medium">Rating</p>
                <div className="flex items-center">
                  {getRatingStars(selectedFeedback.rating)}
                  <span className="ml-2 font-semibold">({selectedFeedback.rating}/5)</span>
                </div>
              </div>
              
              <div className="bg-indigo-50 p-3 rounded-lg">
                <p className="text-indigo-700 font-medium">Submitted On</p>
                <p className="font-semibold">{new Date(selectedFeedback.createdAt).toLocaleString()}</p>
              </div>
              
              <div className="bg-indigo-50 p-3 rounded-lg">
                <p className="text-indigo-700 font-medium">Sentiment Analysis</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-1 ${getSentimentColor(selectedFeedback.sentiment)}`}>
                  {getSentimentIcon(selectedFeedback.sentiment)} {selectedFeedback.sentiment.charAt(0).toUpperCase() + selectedFeedback.sentiment.slice(1)}
                </span>
              </div>
              
              <div className="bg-indigo-50 p-3 rounded-lg">
                <p className="text-indigo-700 font-medium">Feedback Type</p>
                <p className="capitalize font-semibold">{selectedFeedback.feedbackType || "General"}</p>
              </div>
            </div>
            
            <div className="mb-4 bg-indigo-50 p-3 rounded-lg">
              <p className="text-indigo-700 font-medium">Subject</p>
              <p className="mt-1 font-semibold">{selectedFeedback.subject}</p>
            </div>
            
            <div className="mb-4">
              <p className="text-indigo-700 font-medium">Feedback Message</p>
              <div className={`mt-2 p-4 rounded-lg border-2 ${getSentimentColor(selectedFeedback.sentiment)}`}>
                <p className="whitespace-pre-line">{selectedFeedback.message}</p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={closeModal}
                className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded shadow transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default FeedbackList;