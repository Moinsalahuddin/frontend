import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext.jsx';
import AdminLayout from '../../components/AdminLayout.jsx';

const ReceptionistReservations = () => {
  const { user } = useContext(AuthContext);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReservations();
  }, [filter]);

  const fetchReservations = async () => {
    try {
      const params = {};
      if (filter.status) params.status = filter.status;
      
      const response = await axios.get('/api/reservations', { params });
      setReservations(response.data.reservations || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      alert('Error loading reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (id) => {
    if (!window.confirm('Are you sure you want to check-in this guest?')) {
      return;
    }
    try {
      await axios.put(`/api/reservations/${id}/checkin`);
      alert('Guest checked in successfully!');
      fetchReservations();
    } catch (error) {
      alert(error.response?.data?.message || 'Error checking in guest');
    }
  };

  const handleCheckOut = async (id) => {
    if (!window.confirm('Are you sure you want to check-out this guest?')) {
      return;
    }
    try {
      await axios.put(`/api/reservations/${id}/checkout`);
      alert('Guest checked out successfully!');
      fetchReservations();
    } catch (error) {
      alert(error.response?.data?.message || 'Error checking out guest');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }
    try {
      await axios.put(`/api/reservations/${id}`, { status: 'cancelled' });
      alert('Reservation cancelled successfully!');
      fetchReservations();
    } catch (error) {
      alert(error.response?.data?.message || 'Error cancelling reservation');
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      reservation.confirmationNumber?.toLowerCase().includes(searchLower) ||
      reservation.guestId?.firstName?.toLowerCase().includes(searchLower) ||
      reservation.guestId?.lastName?.toLowerCase().includes(searchLower) ||
      reservation.guestId?.email?.toLowerCase().includes(searchLower) ||
      reservation.roomId?.roomNumber?.toLowerCase().includes(searchLower)
    );
  });

  const confirmedCount = reservations.filter(r => r.status === 'confirmed').length;
  const checkedInCount = reservations.filter(r => r.status === 'checked-in').length;
  const totalAmount = reservations.reduce((sum, r) => sum + (r.totalAmount || 0), 0);

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  const pageTitle = 'Reservations';
  const pageSubtitle = 'Manage guest check-ins and check-outs';

  return (
    <AdminLayout title={pageTitle} subtitle={pageSubtitle}>
      {/* Stats Cards */}
      <div className="grid grid-4 mb-3">
        <div className="card">
          <h3>Confirmed</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#6d4c41' }}>{confirmedCount}</p>
          <span style={{ fontSize: '12px', color: '#8d6e63' }}>Pending check-ins</span>
        </div>
        <div className="card">
          <h3>Checked In</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#a1887f' }}>{checkedInCount}</p>
          <span style={{ fontSize: '12px', color: '#8d6e63' }}>Active guests</span>
        </div>
        <div className="card">
          <h3>Total Value</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffb74d' }}>${totalAmount.toFixed(2)}</p>
          <span style={{ fontSize: '12px', color: '#8d6e63' }}>Reservation value</span>
        </div>
        <div className="card">
          <h3>Total Reservations</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffcc80' }}>{reservations.length}</p>
          <span style={{ fontSize: '12px', color: '#8d6e63' }}>All bookings</span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card mb-3">
        <h2 style={{ marginBottom: '16px' }}>Filters</h2>
        <div className="form-row">
          <div className="form-group">
            <label>Search</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search by confirmation #, guest name, email, or room number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Filter by Status</label>
            <select
              className="form-control"
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked-in">Checked-in</option>
              <option value="checked-out">Checked-out</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 249, 0.95) 100%)',
        border: '2px solid rgba(212, 175, 55, 0.2)',
        borderRadius: '16px',
        boxShadow: '0 8px 30px rgba(139, 115, 85, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
        padding: '24px',
        overflow: 'hidden',
        maxWidth: '100%'
      }}>
        <h2 style={{ color: '#4e342e', marginBottom: '20px', fontSize: '1.3rem', fontWeight: 700 }}>Reservation History ({filteredReservations.length})</h2>
        
        {filteredReservations.length > 0 ? (
          <div style={{ overflowX: 'auto', maxWidth: '100%', width: '100%' }}>
            <table className="table" style={{ 
              fontSize: '11px',
              width: '100%',
              tableLayout: 'fixed',
              minWidth: '1000px'
            }}>
              <colgroup>
                <col style={{ width: '12%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '5%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={{ padding: '10px 6px', fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Confirmation #</th>
                  <th style={{ padding: '10px 6px', fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Guest Name</th>
                  <th style={{ padding: '10px 6px', fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Email</th>
                  <th style={{ padding: '10px 6px', fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Phone</th>
                  <th style={{ padding: '10px 6px', fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Room</th>
                  <th style={{ padding: '10px 6px', fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Check-in</th>
                  <th style={{ padding: '10px 6px', fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Check-out</th>
                  <th style={{ padding: '10px 6px', fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Guests</th>
                  <th style={{ padding: '10px 6px', fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Amount</th>
                  <th style={{ padding: '10px 6px', fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Status</th>
                  <th style={{ padding: '10px 6px', fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map(reservation => (
                  <tr key={reservation._id}>
                    <td style={{ padding: '10px 6px', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <strong style={{ fontSize: '11px' }}>{reservation.confirmationNumber}</strong>
                    </td>
                    <td style={{ padding: '10px 6px', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {reservation.guestId?.firstName} {reservation.guestId?.lastName}
                    </td>
                    <td style={{ padding: '10px 6px', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{reservation.guestId?.email || '-'}</td>
                    <td style={{ padding: '10px 6px', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{reservation.guestId?.phone || '-'}</td>
                    <td style={{ padding: '10px 6px', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <strong style={{ fontSize: '11px' }}>{reservation.roomId?.roomNumber}</strong> {reservation.roomId?.roomType}
                    </td>
                    <td style={{ padding: '10px 6px', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{new Date(reservation.checkInDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}</td>
                    <td style={{ padding: '10px 6px', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{new Date(reservation.checkOutDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}</td>
                    <td style={{ padding: '10px 6px', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{reservation.numberOfGuests}</td>
                    <td style={{ padding: '10px 6px', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>${reservation.totalAmount?.toFixed(2)}</td>
                    <td style={{ padding: '10px 6px', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span className={`badge ${
                        reservation.status === 'confirmed' ? 'badge-success' :
                        reservation.status === 'checked-in' ? 'badge-info' :
                        reservation.status === 'checked-out' ? 'badge-secondary' :
                        reservation.status === 'cancelled' ? 'badge-danger' :
                        'badge-warning'
                      }`} style={{ fontSize: '9px', padding: '3px 6px', whiteSpace: 'nowrap' }}>
                        {reservation.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 6px', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'nowrap' }}>
                        {reservation.status === 'confirmed' && (
                          <button
                            className="btn btn-success"
                            onClick={() => handleCheckIn(reservation._id)}
                            style={{ padding: '3px 6px', fontSize: '9px', whiteSpace: 'nowrap', minWidth: 'auto' }}
                            title="Check-in Guest"
                          >
                            Check-in
                          </button>
                        )}
                        {reservation.status === 'checked-in' && (
                          <button
                            className="btn btn-primary"
                            onClick={() => handleCheckOut(reservation._id)}
                            style={{ padding: '3px 6px', fontSize: '9px', whiteSpace: 'nowrap', minWidth: 'auto' }}
                            title="Check-out Guest"
                          >
                            Check-out
                          </button>
                        )}
                        {['pending', 'confirmed'].includes(reservation.status) && (
                          <button
                            className="btn btn-danger"
                            onClick={() => handleCancel(reservation._id)}
                            style={{ padding: '3px 6px', fontSize: '9px', whiteSpace: 'nowrap', minWidth: 'auto' }}
                            title="Cancel Reservation"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#8d6e63' }}>
            <p>No reservations found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ReceptionistReservations;
