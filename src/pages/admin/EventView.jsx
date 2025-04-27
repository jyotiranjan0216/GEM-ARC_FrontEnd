// frontend/src/pages/admin/EventView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/layouts/AdminLayout';
import UserDetailsModal from './UserDetailsModal';
// import UserDetailsModal from '../../components/admin/UserDetailsModal';

const EventView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`https://gem-arc-backend.onrender.com/api/admin/events/${id}`);
      setEvent(data.event);
    //   console.log(data.event);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch event details');
      toast.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  if (loading) return <AdminLayout><div className="text-center py-20">Loading event details...</div></AdminLayout>;
  if (error) return <AdminLayout><div className="text-red-500 text-center py-20">Error: {error}</div></AdminLayout>;
  if (!event) return <AdminLayout><div className="text-center py-20">Event not found</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Event Details</h1>
          <button
            onClick={() => navigate('/admin/events')}
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
          >
            Back to Events
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">{event.name}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600"><span className="font-semibold">Date:</span> {new Date(event.date).toLocaleDateString()}</p>
                <p className="text-gray-600"><span className="font-semibold">Time:</span> {event.time}</p>
                <p className="text-gray-600"><span className="font-semibold">Venue:</span> {event.venue}</p>
                <p className="text-gray-600"><span className="font-semibold">Organized By:</span> {event.organizedBy}</p>
              </div>
              <div>
                {event.thumbnail && (
                  <img 
                    src={event.thumbnail} 
                    alt={event.name} 
                    className="w-full h-48 object-cover rounded-md"
                  />
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-2">Description</h3>
              <p className="text-gray-700">{event.description || 'No description available'}</p>
            </div>
            
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-2">Skills Required</h3>
              {event.skillsRequired && event.skillsRequired.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {event.skillsRequired.map((skill, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No specific skills required</p>
              )}
            </div>
            
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-2">Interests Tags</h3>
              {event.interestsTags && event.interestsTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {event.interestsTags.map((tag, index) => (
                    <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No interests tags</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Participants Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Participants ({event.participants?.length || 0})</h2>
            
            {event.participants && event.participants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Phone</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {event.participants.map((participant) => (
                      <tr key={participant._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{participant.name}</td>
                        <td className="px-4 py-3">{participant.email}</td>
                        <td className="px-4 py-3">{participant.phone}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleUserClick(participant)}
                            className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No participants yet</p>
            )}
          </div>
        </div>
        
        {/* Volunteers Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Volunteers ({event.volunteers?.length || 0})</h2>
            
            {event.volunteers && event.volunteers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Phone</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {event.volunteers.map((volunteer) => (
                      <tr key={volunteer._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{volunteer.name}</td>
                        <td className="px-4 py-3">{volunteer.email}</td>
                        <td className="px-4 py-3">{volunteer.phone}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleUserClick(volunteer)}
                            className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No volunteers yet</p>
            )}
          </div>
        </div>
      </div>
      
      {/* User Details Modal */}
      {modalOpen && selectedUser && (
        <UserDetailsModal user={selectedUser} onClose={closeModal} />
      )}
    </AdminLayout>
  );
};

export default EventView;