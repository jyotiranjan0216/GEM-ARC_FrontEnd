// frontend/src/pages/admin/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import AdminLayout from '../../components/layouts/AdminLayout';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                const { data } = await axios.get('https://gem-arc-backend.onrender.com/api/admin/dashboard-stats');
                setStats(data.stats);
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to fetch dashboard stats');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardStats();
    }, []);

    if (loading) return <AdminLayout><div className="text-center py-20">Loading dashboard statistics...</div></AdminLayout>;
    if (error) return <AdminLayout><div className="text-red-500 text-center py-20">Error: {error}</div></AdminLayout>;

    const dummyStats = {
        totalEvents: 10,
        upcomingEvents: 4,
        totalProposals: 20,
        pendingProposals: 5,
        totalUsers: 50,
        totalParticipants: 30,
        recentEvents: [],
        recentProposals: [],
    };

    const totalEvents = stats?.totalEvents ?? dummyStats.totalEvents;
    const upcomingEvents = stats?.upcomingEvents ?? dummyStats.upcomingEvents;
    const totalProposals = stats?.totalProposals ?? dummyStats.totalProposals;
    const pendingProposals = stats?.pendingProposals ?? dummyStats.pendingProposals;
    const totalUsers = stats?.totalUsers ?? dummyStats.totalUsers;
    const totalParticipants = stats?.totalParticipants ?? dummyStats.totalParticipants;
    const recentEvents = stats?.recentEvents ?? dummyStats.recentEvents;
    const recentProposals = stats?.recentProposals ?? dummyStats.recentProposals;

    const statusData = {
        labels: ['Total Events', 'Upcoming Events', 'Total Proposals', 'Pending Proposals'],
        datasets: [
            {
                label: 'Count',
                data: [totalEvents, upcomingEvents, totalProposals, pendingProposals],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(255, 99, 132, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <AdminLayout>
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-500 text-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold mb-2">Total Events</h3>
                    <p className="text-3xl font-bold">{totalEvents}</p>
                </div>

                <div className="bg-green-500 text-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold mb-2">Upcoming Events</h3>
                    <p className="text-3xl font-bold">{upcomingEvents}</p>
                </div>

                <div className="bg-yellow-500 text-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold mb-2">Pending Proposals</h3>
                    <p className="text-3xl font-bold">{pendingProposals}</p>
                </div>

                <div className="bg-purple-500 text-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold mb-2">Total Users</h3>
                    <p className="text-3xl font-bold">{totalUsers}</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold mb-4">Events and Proposals</h3>
                    <Bar
                        data={statusData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: { position: 'top' },
                                title: {
                                    display: true,
                                    text: 'Events and Proposals Summary',
                                },
                            },
                        }}
                    />
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold mb-4">Participation Stats</h3>
                    <Pie
                        data={{
                            labels: ['Total Participants', 'Total Users'],
                            datasets: [
                                {
                                    data: [totalParticipants, totalUsers],
                                    backgroundColor: [
                                        'rgba(75, 192, 192, 0.6)',
                                        'rgba(153, 102, 255, 0.6)',
                                    ],
                                    borderColor: [
                                        'rgba(75, 192, 192, 1)',
                                        'rgba(153, 102, 255, 1)',
                                    ],
                                    borderWidth: 1,
                                },
                            ],
                        }}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: { position: 'top' },
                                title: {
                                    display: true,
                                    text: 'User Participation',
                                },
                            },
                        }}
                    />
                </div>
            </div>

            {/* Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold mb-4">Recent Events</h3>
                    {recentEvents.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2 text-left">Name</th>
                                        <th className="px-4 py-2 text-left">Date</th>
                                        <th className="px-4 py-2 text-left">Venue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentEvents.map((event) => (
                                        <tr key={event._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2">{event.name}</td>
                                            <td className="px-4 py-2">{new Date(event.date).toLocaleDateString()}</td>
                                            <td className="px-4 py-2">{event.venue}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500">No recent events found</p>
                    )}
                    <button
                        onClick={() => navigate('/admin/events')}
                        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                    >
                        View All Events
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold mb-4">Recent Proposals</h3>
                    {recentProposals.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2 text-left">Name</th>
                                        <th className="px-4 py-2 text-left">Proposed By</th>
                                        <th className="px-4 py-2 text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentProposals.map((proposal) => (
                                        <tr key={proposal._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2">{proposal.name}</td>
                                            <td className="px-4 py-2">{proposal.proposedBy?.name || 'Unknown'}</td>
                                            <td className="px-4 py-2">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs ${
                                                        proposal.status === 'approved'
                                                            ? 'bg-green-100 text-green-800'
                                                            : proposal.status === 'rejected'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                                >
                                                    {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500">No recent proposals found</p>
                    )}
                    <button
                        onClick={() => navigate('/admin/event-proposals')}
                        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                    >
                        View All Proposals
                    </button>
                </div>
            </div>
        </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
