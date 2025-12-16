import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext.jsx';
import GuestFooter from '../../components/GuestFooter.jsx';

const Services = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    reservationId: '',
    serviceType: 'room-service',
    description: '',
    scheduledTime: ''
  });
  const [filter, setFilter] = useState({ status: '', serviceType: '' });

  useEffect(() => {
    fetchRequests();
    fetchReservations();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      const params = { guestId: user?._id };
      if (filter.status) params.status = filter.status;
      if (filter.serviceType) params.serviceType = filter.serviceType;
      
      const response = await axios.get('/api/services', { params });
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      const response = await axios.get('/api/reservations', { 
        params: { status: 'checked-in', guestId: user._id } 
      });
      setReservations(response.data.reservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/services', formData);
      setShowForm(false);
      setFormData({
        reservationId: '',
        serviceType: 'room-service',
        description: '',
        scheduledTime: ''
      });
      fetchRequests();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating service request');
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this service request?')) {
      try {
        await axios.put(`/api/services/${id}`, { status: 'cancelled' });
        fetchRequests();
      } catch (error) {
        alert(error.response?.data?.message || 'Error cancelling request');
      }
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  const activeRequests = requests.filter(r => ['pending', 'confirmed', 'in-progress'].includes(r.status)).length;
  const completedRequests = requests.filter(r => r.status === 'completed').length;
  const totalCost = requests.reduce((sum, r) => sum + (r.cost || 0), 0);

  return (
    <div className="guest-page-container">
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-title-section">
            <div className="page-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path>
              </svg>
            </div>
            <div>
              <h1 className="page-title">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <span>Service Requests</span>
              </h1>
              <p className="page-subtitle">Request room service, spa, concierge, and other premium services</p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            {showForm ? 'Cancel' : '+ REQUEST SERVICE'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="page-stats-grid">
        <div className="page-stat-card">
          <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #2196F3 0%, #1565C0 100%)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="stat-card-content">
            <div className="stat-card-value">{activeRequests}</div>
            <div className="stat-card-label">Active Requests</div>
          </div>
        </div>
        <div className="page-stat-card">
          <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div className="stat-card-content">
            <div className="stat-card-value">{completedRequests}</div>
            <div className="stat-card-label">Completed</div>
          </div>
        </div>
        <div className="page-stat-card">
          <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #8b6f47 0%, #6b5a4a 100%)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className="stat-card-content">
            <div className="stat-card-value">${totalCost.toFixed(2)}</div>
            <div className="stat-card-label">Total Spent</div>
          </div>
        </div>
        <div className="page-stat-card">
          <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
              <path d="M16 3.13a4 4 0 010 7.75"></path>
            </svg>
          </div>
          <div className="stat-card-content">
            <div className="stat-card-value">{requests.length}</div>
            <div className="stat-card-label">Total Requests</div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <h2 className="section-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span>Request Service</span>
          </h2>
          <p style={{ color: '#8b6f47', marginBottom: '1.5rem' }}>Fill in the details to request a premium service</p>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>Reservation</label>
                <select
                  value={formData.reservationId}
                  onChange={(e) => setFormData({ ...formData, reservationId: e.target.value })}
                  required
                >
                  <option value="">Select Reservation</option>
                  {reservations.map(res => (
                    <option key={res._id} value={res._id}>
                      {res.confirmationNumber} - Room {res.roomId?.roomNumber}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Service Type</label>
                <select
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  required
                >
                  <option value="room-service">Room Service</option>
                  <option value="wake-up-call">Wake-up Call</option>
                  <option value="transportation">Transportation</option>
                  <option value="laundry">Laundry</option>
                  <option value="spa">Spa</option>
                  <option value="concierge">Concierge</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Scheduled Time (Optional)</label>
                <input
                  type="datetime-local"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                placeholder="Describe your service request..."
              />
            </div>
            <button type="submit" className="btn btn-primary">Submit Request</button>
          </form>
        </div>
      )}

      <div className="glass-card">
        <h2 className="section-title section-title-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          <span>Service History</span>
        </h2>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={filter.serviceType}
            onChange={(e) => setFilter({ ...filter, serviceType: e.target.value })}
            className="filter-select"
          >
            <option value="">All Types</option>
            <option value="room-service">Room Service</option>
            <option value="wake-up-call">Wake-up Call</option>
            <option value="transportation">Transportation</option>
            <option value="laundry">Laundry</option>
            <option value="spa">Spa</option>
            <option value="concierge">Concierge</option>
            <option value="other">Other</option>
          </select>
        </div>

        {requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path>
              </svg>
            </div>
            <p className="empty-state-text">No service requests found</p>
            <p style={{ color: '#8b6f47', marginTop: '0.5rem' }}>Request a service to get started</p>
          </div>
        ) : (
          <table className="table">
          <thead>
            <tr>
              <th>Service Type</th>
              <th>Description</th>
              <th>Scheduled Time</th>
              <th>Status</th>
              <th>Cost</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(request => (
              <tr key={request._id}>
                <td>{request.serviceType}</td>
                <td>{request.description}</td>
                <td>{request.scheduledTime ? new Date(request.scheduledTime).toLocaleString() : '-'}</td>
                <td>
                  <span className={`badge ${
                    request.status === 'completed' ? 'badge-success' :
                    request.status === 'confirmed' ? 'badge-info' :
                    request.status === 'in-progress' ? 'badge-warning' :
                    request.status === 'cancelled' ? 'badge-danger' :
                    'badge-secondary'
                  }`}>
                    {request.status}
                  </span>
                </td>
                <td>${request.cost?.toFixed(2) || '0.00'}</td>
                <td>
                  {['pending', 'confirmed'].includes(request.status) && (
                    <button
                      className="btn btn-danger"
                      onClick={() => handleCancel(request._id)}
                      style={{ padding: '5px 10px', fontSize: '12px' }}
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
      <GuestFooter />
    </div>
  );
};

export default Services;
