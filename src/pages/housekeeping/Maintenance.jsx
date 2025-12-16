import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext.jsx';
import AdminLayout from '../../components/AdminLayout.jsx';

const Maintenance = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', issueType: '' });
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    resolved: 0
  });

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.issueType) params.issueType = filter.issueType;
      
      const response = await axios.get('/api/maintenance', { params });
      const allRequests = response.data.requests || [];
      setRequests(allRequests);
      
      // Calculate stats
      setStats({
        total: allRequests.length,
        inProgress: allRequests.filter(r => r.status === 'in-progress').length,
        resolved: allRequests.filter(r => r.status === 'resolved').length
      });
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(`/api/maintenance/${id}`, { status });
      fetchRequests();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating request');
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AdminLayout 
      title="Maintenance Requests" 
      subtitle="View and update maintenance request status"
    >

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px', marginBottom: '20px' }}>
        <div className="card">
          <h3 style={{ color: '#4e342e', fontSize: '14px', marginBottom: '8px' }}>Total Requests</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#6d4c41', margin: 0 }}>{stats.total}</p>
          <span style={{ fontSize: '12px', color: '#8d6e63' }}>All requests</span>
        </div>
        <div className="card">
          <h3 style={{ color: '#4e342e', fontSize: '14px', marginBottom: '8px' }}>In Progress</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffb74d', margin: 0 }}>{stats.inProgress}</p>
          <span style={{ fontSize: '12px', color: '#8d6e63' }}>Being fixed</span>
        </div>
        <div className="card">
          <h3 style={{ color: '#4e342e', fontSize: '14px', marginBottom: '8px' }}>Resolved</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffcc80', margin: 0 }}>{stats.resolved}</p>
          <span style={{ fontSize: '12px', color: '#8d6e63' }}>Completed</span>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ 
        marginBottom: '24px', 
        padding: '20px 24px',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 249, 0.95) 100%)',
        border: '2px solid rgba(212, 175, 55, 0.2)',
        borderRadius: '16px',
        boxShadow: '0 8px 30px rgba(139, 115, 85, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)'
      }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid #d7ccc8',
              fontSize: '14px',
              background: '#fffaf5',
              color: '#4e342e',
              cursor: 'pointer',
              minWidth: '150px'
            }}
          >
            <option value="">All Status</option>
            <option value="reported">Reported</option>
            <option value="assigned">Assigned</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={filter.issueType}
            onChange={(e) => setFilter({ ...filter, issueType: e.target.value })}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid #d7ccc8',
              fontSize: '14px',
              background: '#fffaf5',
              color: '#4e342e',
              cursor: 'pointer',
              minWidth: '150px'
            }}
          >
            <option value="">All Types</option>
            <option value="plumbing">Plumbing</option>
            <option value="electrical">Electrical</option>
            <option value="hvac">HVAC</option>
            <option value="furniture">Furniture</option>
            <option value="appliance">Appliance</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="card">
        <h2 style={{ color: '#4e342e', marginBottom: '20px', fontSize: '1.5rem' }}>Maintenance Requests</h2>
        {requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#8d6e63' }}>
            <p style={{ fontSize: '18px', marginBottom: '10px' }}>No maintenance requests found</p>
            <p style={{ fontSize: '14px' }}>All requests have been resolved</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Issue Type</th>
                  <th>Description</th>
                  <th>Priority</th>
                  <th>Reported By</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(request => (
                  <tr key={request._id}>
                    <td style={{ fontWeight: 600, color: '#4e342e' }}>
                      {request.roomId?.roomNumber} - {request.roomId?.roomType}
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        background: 'linear-gradient(135deg, #ffe0b2 0%, #ffcc80 100%)',
                        color: '#4e342e'
                      }}>
                        {request.issueType}
                      </span>
                    </td>
                    <td style={{ maxWidth: '300px', wordWrap: 'break-word' }}>{request.description}</td>
                    <td>
                      <span className={`badge ${
                        request.priority === 'urgent' ? 'badge-danger' :
                        request.priority === 'high' ? 'badge-warning' :
                        'badge-info'
                      }`}>
                        {request.priority}
                      </span>
                    </td>
                    <td>{request.reportedBy?.firstName} {request.reportedBy?.lastName}</td>
                    <td>
                      <span className={`badge ${
                        request.status === 'resolved' ? 'badge-success' :
                        request.status === 'in-progress' ? 'badge-info' :
                        request.status === 'cancelled' ? 'badge-danger' :
                        'badge-warning'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td>
                      {request.status !== 'resolved' && request.status !== 'cancelled' && (
                        <select
                          value={request.status}
                          onChange={(e) => handleStatusUpdate(request._id, e.target.value)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid #d7ccc8',
                            background: '#fffaf5',
                            color: '#4e342e',
                            fontSize: '13px',
                            cursor: 'pointer'
                          }}
                        >
                          {request.status === 'reported' && <option value="assigned">Assigned</option>}
                          {request.status !== 'resolved' && <option value="in-progress">In Progress</option>}
                          <option value="resolved">Resolved</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Maintenance;
