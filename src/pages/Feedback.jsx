import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';

function Feedback() {
  const [formData, setFormData] = useState({
    feedbackType: 'suggestion',
    subject: '',
    message: '',
    rating: 5,
    anonymous: false,
    eventId: '', // New field for event feedback
    isEventFeedback: false // Flag to indicate if feedback is for a specific event
  });
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingEvents, setFetchingEvents] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Fetch events only once when component mounts
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setFetchingEvents(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const response = await fetch('http://localhost:5000/api/events/allEvents', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const eventData = await response.json();
      setEvents(eventData); // Update the state with the fetched data
    //   console.log('Fetched events:', eventData); // Debugging line
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again.');
    } finally {
      setFetchingEvents(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Special handling for the event feedback checkbox
    if (name === 'isEventFeedback') {
      setFormData({
        ...formData,
        isEventFeedback: checked,
        eventId: checked ? formData.eventId : '' // Clear eventId if unchecked
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleRatingChange = (newRating) => {
    setFormData({
      ...formData,
      rating: newRating
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      // Create submission data, including event information if applicable
      console.log('Submitting feedback:', formData); // Debugging line
      const submissionData = { ...formData };
      
      // Remove the isEventFeedback flag as it's just for UI control
      delete submissionData.isEventFeedback;
      
      // Remove eventId if not providing event feedback
      if (!formData.isEventFeedback) {
        delete submissionData.eventId;
      }

    //   console.log('Submitting feedback:', submissionData); // Debugging line

      const response = await fetch('http://localhost:5000/api/feedback/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to submit feedback');
      }

      setSuccess(true);
      setFormData({
        feedbackType: 'suggestion',
        subject: '',
        message: '',
        rating: 5,
        anonymous: false,
        eventId: '',
        isEventFeedback: false
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
  <Sidebar />
  
  {/* Main content area centered */}
  <div className="flex-1 p-6 flex justify-center overflow-y-auto">
    <div className="w-full max-w-4xl">
      <div className="mb-6 text-center">
        <h1 className="text-4xl font-bold text-gray-800">Share Your Feedback</h1>
        <p className="text-gray-600 mt-2">
          Your feedback helps us improve our platform and create a better experience for everyone.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden p-8"
      >
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6"
          >
            <p className="font-medium">Thank you for your feedback!</p>
            <p>We appreciate your input and will use it to improve our platform.</p>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6"
          >
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Feedback Type */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Feedback Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['suggestion', 'bug', 'feature', 'praise'].map((type) => (
                <label
                  key={type}
                  className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors
                  ${formData.feedbackType === type
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'border-gray-200 hover:bg-gray-50'}
                  `}
                >
                  <input
                    type="radio"
                    name="feedbackType"
                    value={type}
                    checked={formData.feedbackType === type}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className="capitalize">
                    {type === 'bug' ? 'Report a Bug' :
                      type === 'feature' ? 'Feature Request' :
                        type === 'praise' ? 'Share Praise' : 'Suggestion'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Event Feedback Option */}
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isEventFeedback"
                checked={formData.isEventFeedback}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-700">I want to give feedback for a specific event</span>
            </label>
          </div>

          {/* Event Selection */}
          {formData.isEventFeedback && (
            <div className="mb-6">
              <label htmlFor="eventId" className="block text-gray-700 font-medium mb-2">
                Select Event
              </label>
              {fetchingEvents ? (
                <div className="animate-pulse h-10 bg-gray-200 rounded-lg w-full"></div>
              ) : events && events.length > 0 ? (
                <select
                  id="eventId"
                  name="eventId"
                  value={formData.eventId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required={formData.isEventFeedback}
                >
                  <option value="">-- Select an event --</option>
                  {events.map((event) => (
                    <option key={event._id} value={event._id}>
                      {event.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-gray-600 p-2 border border-gray-200 rounded-lg">
                  No events available. Please try again later.
                </div>
              )}
            </div>
          )}

          {/* Subject */}
          <div className="mb-6">
            <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">Subject</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Brief summary of your feedback"
              required
            />
          </div>

          {/* Message */}
          <div className="mb-6">
            <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Please provide details about your feedback"
              required
            ></textarea>
          </div>

          {/* Rating */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">How would you rate your experience?</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange(star)}
                  className="text-3xl focus:outline-none"
                >
                  {star <= formData.rating ? '★' : '☆'}
                </button>
              ))}
              <span className="ml-2 text-gray-600">{formData.rating}/5</span>
            </div>
          </div>

          {/* Anonymous Option */}
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="anonymous"
                checked={formData.anonymous}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-700">Submit anonymously</span>
            </label>
            <p className="text-sm text-gray-500 mt-1">
              If checked, your name will not be associated with this feedback.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 bg-indigo-600 text-white rounded-lg shadow-sm
                hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                ${loading ? 'opacity-75 cursor-not-allowed' : ''}
              `}
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  </div>
</div>

  );
}

export default Feedback;