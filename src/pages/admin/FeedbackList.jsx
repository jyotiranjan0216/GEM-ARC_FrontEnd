// frontend/src/pages/admin/FeedbackList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/layouts/AdminLayout';

const FeedbackList = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    rating: 'all',
    search: '',
    event: 'all'
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
      setFeedback(data.feedback);
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
      (filters.search === '' || 
        (item.eventName && item.eventName.toLowerCase().includes(filters.search.toLowerCase())) ||
        (item.userName && item.userName.toLowerCase().includes(filters.search.toLowerCase())) ||
        (item.message && item.message.toLowerCase().includes(filters.search.toLowerCase())))
    );

  if (loading) return <AdminLayout><div className="text-center py-20">Loading feedback...</div></AdminLayout>;
  if (error) return <AdminLayout><div className="text-red-500 text-center py-20">Error: {error}</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Event Feedback Management</h1>
        
        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-500 text-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">Total Feedback</h3>
            <p className="text-3xl font-bold">{feedback.length}</p>
          </div>
          
          <div className="bg-green-500 text-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">Average Rating</h3>
            <p className="text-3xl font-bold">
              {feedback.length > 0 
                ? (feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length).toFixed(1)
                : '0.0'}
              <span className="text-xl"> / 5</span>
            </p>
          </div>
          
          <div className="bg-yellow-500 text-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">Events with Feedback</h3>
            <p className="text-3xl font-bold">
              {new Set(feedback.map(item => item.eventId)).size - 1}
            </p>
          </div>
          
          <div className="bg-purple-500 text-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">5-Star Reviews</h3>
            <p className="text-3xl font-bold">
              {feedback.filter(item => item.rating === 5).length}
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
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Message</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredFeedback.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{item.name}</td>
                      <td className="px-4 py-3">{item.userName}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          {getRatingStars(item.rating)}
                          <span className="ml-2">({item.rating})</span>
                        </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Feedback Details</h2>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-600 font-medium">Event</p>
                <p>{selectedFeedback.name}</p>
              </div>
              
              <div>
                <p className="text-gray-600 font-medium">User</p>
                <p>{selectedFeedback.userName}</p>
              </div>
              
              <div>
                <p className="text-gray-600 font-medium">Rating</p>
                <div className="flex items-center">
                  {getRatingStars(selectedFeedback.rating)}
                  <span className="ml-2">({selectedFeedback.rating}/5)</span>
                </div>
              </div>
              
              <div>
                <p className="text-gray-600 font-medium">Submitted On</p>
                <p>{new Date(selectedFeedback.createdAt).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 font-medium">Feedback Message</p>
              <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
                <p className="whitespace-pre-line">{selectedFeedback.message}</p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={closeModal}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
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