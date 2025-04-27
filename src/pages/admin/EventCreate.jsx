// frontend/src/pages/admin/EventCreate.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/layouts/AdminLayout';

const EventCreate = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        date: '',
        time: '',
        organizedBy: '',
        venue: '',
        thumbnail: '',
        skillsRequired: '',
        interestsTags: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Convert comma-separated strings to arrays
            const eventData = {
                ...formData,
                skillsRequired: formData.skillsRequired.split(',').map(skill => skill.trim()).filter(Boolean),
                interestsTags: formData.interestsTags.split(',').map(tag => tag.trim()).filter(Boolean)
            };

            const { data } = await axios.post('http://localhost:5000/api/admin/create-event', eventData);

            toast.success(`Event created successfully! Notified ${data.notifiedUsers} matching users.`);
            navigate('/admin/events');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Create New Event</h1>
                    <button
                        onClick={() => navigate('/admin/events')}
                        className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
                    >
                        Back to Events
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Event Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Organized By *
                                </label>
                                <input
                                    type="text"
                                    name="organizedBy"
                                    value={formData.organizedBy}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Time *
                                </label>
                                <input
                                    type="time"
                                    name="time"
                                    value={formData.time}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Venue *
                                </label>
                                <input
                                    type="text"
                                    name="venue"
                                    value={formData.venue}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Thumbnail URL *
                                </label>
                                <input
                                    type="url"
                                    name="thumbnail"
                                    value={formData.thumbnail}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    placeholder="https://example.com/image.jpg"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Skills Required (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    name="skillsRequired"
                                    value={formData.skillsRequired}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    placeholder="leadership, programming, design"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Interest Tags (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    name="interestsTags"
                                    value={formData.interestsTags}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    placeholder="technology, art, sports"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-gray-700 font-medium mb-2">
                                    Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    rows="5"
                                    required
                                ></textarea>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded font-medium"
                                disabled={loading}
                            >
                                {loading ?
                                    'Creating Event...' :
                                    'Create Event'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
};

export default EventCreate;