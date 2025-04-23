import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

function MyProposals() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState(null);

  useEffect(() => {
    const fetchMyProposals = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found. Please login again.');
        }
        
        const response = await fetch('https://gem-arc-backend.onrender.com/api/event-proposals/my-proposals', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch your proposals');
        }
        
        const data = await response.json();
        setProposals(data.data);
      } catch (err) {
        console.error('Error fetching proposals:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMyProposals();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">Rejected</span>;
      default:
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Pending</span>;
    }
  };

  const viewProposalDetails = (proposal) => {
    setSelectedProposal(proposal);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Sidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Event Proposals</h1>
          <Link 
            to="/propose-event" 
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Propose New Event
          </Link>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-md" />
            ))}
          </div>
        ) : proposals.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <p className="text-lg text-gray-600 mb-4">You haven't proposed any events yet.</p>
            <Link 
              to="/propose-event" 
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Propose Your First Event
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {proposals.map((proposal) => (
              <div 
                key={proposal._id} 
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{proposal.name}</h2>
                    <p className="text-gray-600 mt-1">{new Date(proposal.date).toLocaleDateString()} at {proposal.time}</p>
                    <p className="text-gray-600 mt-1">{proposal.venue}</p>
                  </div>
                  <div>
                    {getStatusBadge(proposal.status)}
                  </div>
                </div>
                
                <p className="mt-3 text-gray-700 line-clamp-2">{proposal.description}</p>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {proposal.skillsRequired.map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Proposed on {new Date(proposal.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => viewProposalDetails(proposal)}
                    className="px-3 py-1 border border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {selectedProposal && (
            <div className="fixed inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{selectedProposal.name}</h2>
                <div>
                  {getStatusBadge(selectedProposal.status)}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-gray-600 font-medium mb-2">Event Details</h3>
                  <p className="text-gray-800 mb-2">
                    <span className="font-medium">Date:</span> {new Date(selectedProposal.date).toLocaleDateString()}
                  </p>
                  <p className="text-gray-800 mb-2">
                    <span className="font-medium">Time:</span> {selectedProposal.time}
                  </p>
                  <p className="text-gray-800 mb-2">
                    <span className="font-medium">Venue:</span> {selectedProposal.venue}
                  </p>
                  <p className="text-gray-800 mb-2">
                    <span className="font-medium">Organized By:</span> {selectedProposal.organizedBy}
                  </p>
                </div>
                
                <div>
                  {selectedProposal.thumbnail && (
                    <img 
                      src={selectedProposal.thumbnail} 
                      alt={selectedProposal.name} 
                      className="w-full h-40 object-cover rounded-md mb-2"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/400x200?text=Event+Image'}
                    />
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-gray-600 font-medium mb-2">Description</h3>
                <p className="text-gray-800">{selectedProposal.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-gray-600 font-medium mb-2">Skills Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProposal.skillsRequired.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-gray-600 font-medium mb-2">Interest Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProposal.interestsTags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {selectedProposal.status !== 'pending' && (
                <div className="mb-6">
                  <h3 className="text-gray-600 font-medium mb-2">Admin Feedback</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    {selectedProposal.adminFeedback ? (
                      <p className="text-gray-800">{selectedProposal.adminFeedback}</p>
                    ) : (
                      <p className="text-gray-500 italic">No feedback provided</p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedProposal(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyProposals;