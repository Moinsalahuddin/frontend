import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext.jsx';
import AdminLayout from '../../components/AdminLayout.jsx';

const Rooms = () => {
  const { user } = useContext(AuthContext);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', roomType: '' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRooms();
  }, [filter]);

  const fetchRooms = async () => {
    try {
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.roomType) params.roomType = filter.roomType;
      
      const response = await axios.get('/api/rooms', { params });
      setRooms(response.data.rooms || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      alert('Error loading rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to change room status to "${newStatus}"?`)) {
      return;
    }
    try {
      await axios.put(`/api/rooms/${id}`, { status: newStatus });
      alert('Room status updated successfully!');
      fetchRooms();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating room status');
    }
  };

  const filteredRooms = rooms.filter(room => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      room.roomNumber?.toLowerCase().includes(searchLower) ||
      room.roomType?.toLowerCase().includes(searchLower) ||
      room.floor?.toString().includes(searchLower)
    );
  });

  const statusCounts = {
    available: rooms.filter(r => r.status === 'available').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    cleaning: rooms.filter(r => r.status === 'cleaning').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
    reserved: rooms.filter(r => r.status === 'reserved').length
  };

  if (loading) {
    return (
      <AdminLayout title="Rooms" subtitle="Room Management">
        <div className="loading"><div className="spinner"></div></div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Rooms" subtitle="View and manage rooms">
      {/* Status Summary Cards */}
      <div className="grid grid-5 mb-3">
        <div className="card">
          <h3>Available</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#4CAF50' }}>{statusCounts.available}</p>
          <span style={{ fontSize: '12px', color: '#8d6e63' }}>Ready for guests</span>
        </div>
        <div className="card">
          <h3>Occupied</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#2196F3' }}>{statusCounts.occupied}</p>
          <span style={{ fontSize: '12px', color: '#8d6e63' }}>Currently in use</span>
        </div>
        <div className="card">
          <h3>Cleaning</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#FFA726' }}>{statusCounts.cleaning}</p>
          <span style={{ fontSize: '12px', color: '#8d6e63' }}>Under maintenance</span>
        </div>
        <div className="card">
          <h3>Maintenance</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#EF5350' }}>{statusCounts.maintenance}</p>
          <span style={{ fontSize: '12px', color: '#8d6e63' }}>Repairs needed</span>
        </div>
        <div className="card">
          <h3>Reserved</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#8b6f47' }}>{statusCounts.reserved}</p>
          <span style={{ fontSize: '12px', color: '#8d6e63' }}>Booked</span>
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
              placeholder="Search by room number, type, or floor..."
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
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="cleaning">Cleaning</option>
              <option value="maintenance">Maintenance</option>
              <option value="reserved">Reserved</option>
            </select>
          </div>
          <div className="form-group">
            <label>Filter by Type</label>
            <select
              className="form-control"
              value={filter.roomType}
              onChange={(e) => setFilter({ ...filter, roomType: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Suite">Suite</option>
              <option value="Deluxe">Deluxe</option>
              <option value="Presidential">Presidential</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rooms Cards */}
      <div className="card">
        <h2 style={{ marginBottom: '16px' }}>Rooms ({filteredRooms.length})</h2>
        
        {filteredRooms.length > 0 ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '24px' 
          }}>
            {filteredRooms.map(room => (
              <div 
                key={room._id}
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                }}
              >
                {/* Room Image */}
                <div style={{ 
                  width: '100%', 
                  height: '220px', 
                  overflow: 'hidden',
                  background: '#f5f5f5',
                  position: 'relative'
                }}>
                  {room.images && room.images.length > 0 ? (
                    <img 
                      src={room.images[0]} 
                      alt={`Room ${room.roomNumber}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
                      color: '#999',
                      fontSize: '14px'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '64px', marginBottom: '10px' }}>🛏️</div>
                        <div style={{ fontWeight: '600' }}>No Image</div>
                      </div>
                    </div>
                  )}
                  {/* Room Type Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(199, 146, 91, 0.95)',
                    color: '#fff',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {room.roomType}
                  </div>
                  {/* Status Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 
                      room.status === 'available' ? 'rgba(76, 175, 80, 0.95)' :
                      room.status === 'occupied' ? 'rgba(33, 150, 243, 0.95)' :
                      room.status === 'cleaning' ? 'rgba(255, 167, 38, 0.95)' :
                      room.status === 'maintenance' ? 'rgba(239, 83, 80, 0.95)' :
                      'rgba(139, 111, 71, 0.95)',
                    color: '#fff',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'capitalize',
                    letterSpacing: '0.5px'
                  }}>
                    {room.status}
                  </div>
                </div>

                {/* Room Details */}
                <div style={{ padding: '24px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '16px'
                  }}>
                    <div>
                      <h3 style={{ 
                        margin: 0, 
                        fontSize: '24px', 
                        fontWeight: 'bold',
                        color: '#333',
                        marginBottom: '6px'
                      }}>
                        Room {room.roomNumber}
                      </h3>
                      <p style={{ 
                        margin: 0, 
                        color: '#666', 
                        fontSize: '14px'
                      }}>
                        Floor {room.floor}
                      </p>
                    </div>
                    <div style={{
                      textAlign: 'right'
                    }}>
                      <div style={{
                        fontSize: '28px',
                        fontWeight: 'bold',
                        color: '#c7925b',
                        lineHeight: '1'
                      }}>
                        ${room.pricePerNight?.toFixed(2)}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        fontWeight: 'normal',
                        color: '#999',
                        marginTop: '4px'
                      }}>
                        per night
                      </div>
                    </div>
                  </div>

                  {/* Room Info Grid */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '12px',
                    marginBottom: '16px',
                    padding: '16px',
                    background: '#f9f9f9',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px' }}>👥</span>
                      <div>
                        <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', fontWeight: '600' }}>
                          Max Guests
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#333' }}>
                          {room.maxOccupancy}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px' }}>🏢</span>
                      <div>
                        <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', fontWeight: '600' }}>
                          Floor
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#333' }}>
                          {room.floor}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {room.description && (
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#666', 
                      marginBottom: '16px',
                      lineHeight: '1.6',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {room.description}
                    </p>
                  )}

                  {/* Status Update Dropdown */}
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      color: '#666',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Update Status
                    </label>
                    <select
                      value={room.status}
                      onChange={(e) => handleStatusUpdate(room._id, e.target.value)}
                      style={{ 
                        width: '100%',
                        padding: '12px 16px', 
                        fontSize: '14px', 
                        borderRadius: '8px', 
                        border: '2px solid #d7ccc8',
                        background: '#ffffff',
                        cursor: 'pointer',
                        fontWeight: '500',
                        color: '#333',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#c7925b';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#d7ccc8';
                      }}
                    >
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="cleaning">Cleaning</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="reserved">Reserved</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#8d6e63' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏨</div>
            <p style={{ fontSize: '18px', fontWeight: '600' }}>No rooms found</p>
            <p style={{ fontSize: '14px', color: '#999', marginTop: '8px' }}>
              Try adjusting your filters
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Rooms;
