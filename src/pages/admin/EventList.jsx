// frontend/src/pages/admin/EventList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/layouts/AdminLayout';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await axios.get('https://gem-arc-backend.onrender.com/api/admin/events');
      setEvents(data.events);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle event deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await axios.delete(`https://gem-arc-backend.onrender.com/api/admin/events/${id}`);
        toast.success('Event deleted successfully');
        setEvents(events.filter(event => event._id !== id));
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to delete event');
      }
    }
  };

  if (loading) return <AdminLayout><div className="text-center py-20">Loading events...</div></AdminLayout>;
  if (error) return <AdminLayout><div className="text-red-500 text-center py-20">Error: {error}</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Events Management</h1>
          <button
            onClick={() => navigate('/admin/events/create')}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            Create New Event
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {events.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Event Name</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Venue</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Organized By</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {events.map((event) => (
                    <tr key={event._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{event.name}</td>
                      <td className="px-4 py-3">{new Date(event.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3">{event.venue}</td>
                      <td className="px-4 py-3">{event.organizedBy}</td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/admin/events/view/${event._id}`)}
                            className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
                          >
                            View
                          </button>
                          <button
                            onClick={() => navigate(`/admin/events/edit/${event._id}`)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(event._id)}
                            className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No events found</p>
              <button
                onClick={() => navigate('/admin/events/create')}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
              >
                Create First Event
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default EventList;