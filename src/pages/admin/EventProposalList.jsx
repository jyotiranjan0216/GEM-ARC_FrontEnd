import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/layouts/AdminLayout';

const EventProposalList = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [adminFeedback, setAdminFeedback] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const { data } = await axios.get('https://gem-arc-backend.onrender.com/api/admin/event-proposals/all');
      setProposals(data.proposals);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch proposals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!adminFeedback.trim()) {
      return toast.error('Please provide feedback before approving');
    }
    
    setProcessing(true);
    try {
      await axios.put(`https://gem-arc-backend.onrender.com/api/admin/event-proposals/approve/${selectedProposal._id}`, {
        adminFeedback
      });
      
      toast.success('Proposal approved and event created successfully');
      
      // Update proposals list
      setProposals(proposals.map(p => 
        p._id === selectedProposal._id ? { ...p, status: 'approved', adminFeedback } : p
      ));
      
      // Reset modal state
      setSelectedProposal(null);
      setActionType(null);
      setAdminFeedback('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to approve proposal');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!adminFeedback.trim()) {
      return toast.error('Please provide feedback before rejecting');
    }
    
    setProcessing(true);
    try {
      await axios.put(`https://gem-arc-backend.onrender.com/api/admin/event-proposals/reject/${selectedProposal._id}`, {
        adminFeedback
      });
      
      toast.success('Proposal rejected successfully');
      
      // Update proposals list
      setProposals(proposals.map(p => 
        p._id === selectedProposal._id ? { ...p, status: 'rejected', adminFeedback } : p
      ));
      
      // Reset modal state
      setSelectedProposal(null);
      setActionType(null);
      setAdminFeedback('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reject proposal');
    } finally {
      setProcessing(false);
    }
  };

  const openModal = (proposal, action) => {
    setSelectedProposal(proposal);
    setActionType(action);
    setAdminFeedback('');
  };

  const closeModal = () => {
    setSelectedProposal(null);
    setActionType(null);
    setAdminFeedback('');
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) return <AdminLayout><div className="text-center py-20">Loading proposals...</div></AdminLayout>;
  if (error) return <AdminLayout><div className="text-red-500 text-center py-20">Error: {error}</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Event Proposals</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {proposals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Event Name</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Proposed By</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {proposals.map((proposal) => (
                    <tr key={proposal._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{proposal.name}</td>
                      <td className="px-4 py-3">{proposal.proposedBy?.name || 'Unknown'}</td>
                      <td className="px-4 py-3">{new Date(proposal.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span 
                          className={`px-2 py-1 rounded-full text-xs ${getStatusClass(proposal.status)}`}
                        >
                          {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openModal(proposal, 'view')}
                            className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
                          >
                            View
                          </button>
                          
                          {proposal.status === 'pending' && (
                            <>
                              <button
                                onClick={() => openModal(proposal, 'approve')}
                                className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-sm"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => openModal(proposal, 'reject')}
                                className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No event proposals found</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {actionType === 'approve' 
                  ? 'Approve Proposal' 
                  : actionType === 'reject' 
                  ? 'Reject Proposal' 
                  : 'View Proposal'}
              </h2>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-600 font-medium">Event Name</p>
                <p>{selectedProposal.name}</p>
              </div>
              
              <div>
                <p className="text-gray-600 font-medium">Proposed By</p>
                <p>{selectedProposal.proposedBy?.name || 'Unknown'}</p>
              </div>
              
              <div>
                <p className="text-gray-600 font-medium">Date</p>
                <p>{new Date(selectedProposal.date).toLocaleDateString()}</p>
              </div>
              
              <div>
                <p className="text-gray-600 font-medium">Time</p>
                <p>{selectedProposal.time}</p>
              </div>
              
              <div>
                <p className="text-gray-600 font-medium">Organized By</p>
                <p>{selectedProposal.organizedBy}</p>
              </div>
              
              <div>
                <p className="text-gray-600 font-medium">Venue</p>
                <p>{selectedProposal.venue}</p>
              </div>
              
              <div>
                <p className="text-gray-600 font-medium">Skills Required</p>
                <p>
                  {selectedProposal.skillsRequired.length > 0 
                    ? selectedProposal.skillsRequired.join(', ') 
                    : 'None specified'}
                </p>
              </div>
              
              <div>
                <p className="text-gray-600 font-medium">Interest Tags</p>
                <p>
                  {selectedProposal.interestsTags.length > 0 
                    ? selectedProposal.interestsTags.join(', ') 
                    : 'None specified'}
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 font-medium">Description</p>
              <p className="whitespace-pre-line">{selectedProposal.description}</p>
            </div>
            
            {selectedProposal.thumbnail && (
              <div className="mb-4">
                <p className="text-gray-600 font-medium">Thumbnail</p>
                <img 
                  src={selectedProposal.thumbnail} 
                  alt={selectedProposal.name}
                  className="mt-2 w-full max-h-64 object-cover rounded"
                />
              </div>
            )}
            
            {selectedProposal.status !== 'pending' && (
              <div className="mb-4">
                <p className="text-gray-600 font-medium">Admin Feedback</p>
                <p className="whitespace-pre-line">{selectedProposal.adminFeedback}</p>
              </div>
            )}
            
            {(actionType === 'approve' || actionType === 'reject') && (
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Admin Feedback *
                </label>
                <textarea
                  value={adminFeedback}
                  onChange={(e) => setAdminFeedback(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows="4"
                  placeholder={actionType === 'approve' 
                    ? 'Provide feedback for approval' 
                    : 'Explain why this proposal is being rejected'}
                  required
                ></textarea>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <button 
                onClick={closeModal}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
              >
                {(actionType === 'approve' || actionType === 'reject') ? 'Cancel' : 'Close'}
              </button>
              
              {actionType === 'approve' && (
                <button 
                  onClick={handleApprove}
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
                  disabled={processing}
                >
                  {processing ? 'Processing...' : 'Approve and Create Event'}
                </button>
              )}
              
              {actionType === 'reject' && (
                <button 
                  onClick={handleReject}
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                  disabled={processing}
                >
                  {processing ? 'Processing...' : 'Reject Proposal'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default EventProposalList;