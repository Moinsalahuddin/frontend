import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext.jsx';
import AdminLayout from '../../components/AdminLayout.jsx';

const ReceptionistDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todayCheckIns: 0,
    todayCheckOuts: 0,
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    cleaningRooms: 0,
    pendingReservations: 0,
    checkedInGuests: 0
  });
  const [loading, setLoading] = useState(true);
  const [todayReservations, setTodayReservations] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const reservationsResponse = await axios.get('/api/reservations');
      const allReservations = reservationsResponse.data.reservations || [];
      
      const todayCheckIns = allReservations.filter(r => {
        const checkInDate = new Date(r.checkInDate);
        checkInDate.setHours(0, 0, 0, 0);
        return checkInDate.getTime() === today.getTime() && r.status === 'confirmed';
      });

      const todayCheckOuts = allReservations.filter(r => {
        const checkOutDate = new Date(r.checkOutDate);
        checkOutDate.setHours(0, 0, 0, 0);
        return checkOutDate.getTime() === today.getTime() && r.status === 'checked-in';
      });

      const checkedInGuests = allReservations.filter(r => r.status === 'checked-in').length;
      const pendingReservations = allReservations.filter(r => r.status === 'pending' || r.status === 'confirmed').length;

      const roomsResponse = await axios.get('/api/rooms');
      const allRooms = roomsResponse.data.rooms || [];
      
      const availableRooms = allRooms.filter(r => r.status === 'available').length;
      const occupiedRooms = allRooms.filter(r => r.status === 'occupied').length;
      const cleaningRooms = allRooms.filter(r => r.status === 'cleaning').length;

      const todayRes = allReservations.filter(r => {
        const checkIn = new Date(r.checkInDate);
        checkIn.setHours(0, 0, 0, 0);
        const checkOut = new Date(r.checkOutDate);
        checkOut.setHours(0, 0, 0, 0);
        return (checkIn.getTime() === today.getTime() || checkOut.getTime() === today.getTime()) &&
               ['confirmed', 'checked-in'].includes(r.status);
      }).slice(0, 5);

      setStats({
        todayCheckIns: todayCheckIns.length,
        todayCheckOuts: todayCheckOuts.length,
        totalRooms: allRooms.length,
        availableRooms,
        occupiedRooms,
        cleaningRooms,
        pendingReservations,
        checkedInGuests
      });

      setTodayReservations(todayRes);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const occupiedRooms = stats.occupiedRooms || 0;
  const totalRooms = stats.totalRooms || 0;
  const availableRooms = stats.availableRooms || 0;
  const occupancyPercent = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const dashboardTitle = 'Dashboard';
  const dashboardSubtitle = 'Coffee-brown overview of your LuxuryStay reception operations';

  return (
    <AdminLayout title={dashboardTitle} subtitle={dashboardSubtitle}>
      {/* Top metric cards */}
      <div className="grid grid-4 mb-4" style={{ gap: '16px', gridTemplateColumns: 'repeat(4, 1fr)', width: '100%', boxSizing: 'border-box' }}>
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 249, 0.95) 100%)',
          border: '2px solid rgba(212, 175, 55, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 8px 30px rgba(139, 115, 85, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
          padding: '24px'
        }}>
          <h3 style={{ color: '#4e342e', marginBottom: '12px', fontSize: '0.95rem', fontWeight: 600 }}>Today's Check-ins</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#6d4c41', margin: '8px 0' }}>{stats.todayCheckIns || 0}</p>
          <span style={{ fontSize: '13px', color: '#8d6e63' }}>Guests arriving today</span>
        </div>
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 249, 0.95) 100%)',
          border: '2px solid rgba(212, 175, 55, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 8px 30px rgba(139, 115, 85, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
          padding: '24px'
        }}>
          <h3 style={{ color: '#4e342e', marginBottom: '12px', fontSize: '0.95rem', fontWeight: 600 }}>Today's Check-outs</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#a1887f', margin: '8px 0' }}>{stats.todayCheckOuts || 0}</p>
          <span style={{ fontSize: '13px', color: '#8d6e63' }}>Departing guests</span>
        </div>
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 249, 0.95) 100%)',
          border: '2px solid rgba(212, 175, 55, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 8px 30px rgba(139, 115, 85, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
          padding: '24px'
        }}>
          <h3 style={{ color: '#4e342e', marginBottom: '12px', fontSize: '0.95rem', fontWeight: 600 }}>Occupancy Rate</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#ffb74d', margin: '8px 0' }}>{occupancyPercent || 0}%</p>
          <span style={{ fontSize: '13px', color: '#8d6e63' }}>{stats.occupiedRooms || 0} / {stats.totalRooms || 0} rooms occupied</span>
        </div>
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 249, 0.95) 100%)',
          border: '2px solid rgba(212, 175, 55, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 8px 30px rgba(139, 115, 85, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
          padding: '24px'
        }}>
          <h3 style={{ color: '#4e342e', marginBottom: '12px', fontSize: '0.95rem', fontWeight: 600 }}>Checked-in Guests</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#ffcc80', margin: '8px 0' }}>{stats.checkedInGuests || 0}</p>
          <span style={{ fontSize: '13px', color: '#8d6e63' }}>Currently in hotel</span>
        </div>
      </div>

      {/* Chart + side widgets layout similar to Admin Dashboard */}
      <div className="admin-dashboard-grid" style={{ gap: '20px', marginBottom: '24px' }}>
        {/* Today's Reservations */}
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 249, 0.95) 100%)',
          border: '2px solid rgba(212, 175, 55, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 8px 30px rgba(139, 115, 85, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
          padding: '24px',
          overflow: 'hidden',
          maxWidth: '100%'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ color: '#4e342e', marginBottom: '6px', fontSize: '1.4rem', fontWeight: 700 }}>Today's Reservations</h2>
              <p style={{ fontSize: '13px', color: '#8d6e63', margin: 0 }}>Check-ins and check-outs scheduled</p>
            </div>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/reservations')}
              style={{ 
                padding: '10px 20px', 
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '10px',
                border: '2px solid rgba(199, 146, 91, 0.3)',
                background: 'linear-gradient(135deg, #c7925b 0%, #8d6e63 100%)',
                boxShadow: '0 4px 12px rgba(139, 111, 71, 0.2)'
              }}
            >
              View All
            </button>
          </div>

          {todayReservations.length > 0 ? (
            <div style={{ overflowX: 'auto', maxWidth: '100%', width: '100%' }}>
              <table className="table" style={{ 
                fontSize: '11px',
                width: '100%',
                tableLayout: 'fixed',
                minWidth: '600px'
              }}>
                <colgroup>
                  <col style={{ width: '18%' }} />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '13%' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th style={{ padding: '10px 6px', fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Confirmation #</th>
                    <th style={{ padding: '10px 6px', fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Guest Name</th>
                    <th style={{ padding: '10px 6px', fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Room</th>
                    <th style={{ padding: '10px 6px', fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Check-in</th>
                    <th style={{ padding: '10px 6px', fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Check-out</th>
                    <th style={{ padding: '10px 6px', fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Status</th>
                    <th style={{ padding: '10px 6px', fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {todayReservations.map(reservation => (
                    <tr key={reservation._id}>
                      <td style={{ padding: '10px 6px', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><strong style={{ fontSize: '11px' }}>{reservation.confirmationNumber}</strong></td>
                      <td style={{ padding: '10px 6px', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{reservation.guestId?.firstName} {reservation.guestId?.lastName}</td>
                      <td style={{ padding: '10px 6px', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{reservation.roomId?.roomNumber} - {reservation.roomId?.roomType}</td>
                      <td style={{ padding: '10px 6px', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{new Date(reservation.checkInDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}</td>
                      <td style={{ padding: '10px 6px', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{new Date(reservation.checkOutDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}</td>
                      <td style={{ padding: '10px 6px', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span className={`badge ${
                          reservation.status === 'confirmed' ? 'badge-success' :
                          reservation.status === 'checked-in' ? 'badge-info' :
                          'badge-warning'
                        }`} style={{ fontSize: '9px', padding: '3px 6px', whiteSpace: 'nowrap' }}>
                          {reservation.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 6px', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {reservation.status === 'confirmed' && (
                          <button
                            className="btn btn-success"
                            onClick={() => navigate(`/reservations`)}
                            style={{ padding: '3px 6px', fontSize: '9px', whiteSpace: 'nowrap', minWidth: 'auto' }}
                          >
                            Check-in
                          </button>
                        )}
                        {reservation.status === 'checked-in' && (
                          <button
                            className="btn btn-primary"
                            onClick={() => navigate(`/reservations`)}
                            style={{ padding: '3px 6px', fontSize: '9px', whiteSpace: 'nowrap', minWidth: 'auto' }}
                          >
                            Check-out
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#8d6e63' }}>
              <p>No reservations scheduled for today</p>
            </div>
          )}
        </div>

        {/* Side widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '320px' }}>
          <div className="card" style={{ 
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 249, 0.95) 100%)',
            border: '2px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 30px rgba(139, 115, 85, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)'
          }}>
            <h3 style={{ 
              color: '#4e342e', 
              marginBottom: '16px', 
              fontSize: '1.1rem', 
              fontWeight: 700,
              borderBottom: '2px solid rgba(212, 175, 55, 0.3)',
              paddingBottom: '12px'
            }}>
              Room Status
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '14px',
                padding: '12px',
                background: 'linear-gradient(90deg, rgba(212, 175, 55, 0.05) 0%, rgba(255, 255, 255, 1) 100%)',
                borderRadius: '10px',
                border: '1px solid rgba(212, 175, 55, 0.15)',
                transition: 'all 0.3s ease'
              }}>
                <span style={{ fontSize: '14px', color: '#5a4a3a', fontWeight: 500 }}>Available rooms</span>
                <span className="badge badge-success" style={{ 
                  fontSize: '13px', 
                  fontWeight: 700,
                  padding: '6px 14px',
                  borderRadius: '20px'
                }}>{stats.availableRooms || 0}</span>
              </li>
              <li style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '14px',
                padding: '12px',
                background: 'linear-gradient(90deg, rgba(212, 175, 55, 0.05) 0%, rgba(255, 255, 255, 1) 100%)',
                borderRadius: '10px',
                border: '1px solid rgba(212, 175, 55, 0.15)',
                transition: 'all 0.3s ease'
              }}>
                <span style={{ fontSize: '14px', color: '#5a4a3a', fontWeight: 500 }}>Occupied rooms</span>
                <span className="badge badge-info" style={{ 
                  fontSize: '13px', 
                  fontWeight: 700,
                  padding: '6px 14px',
                  borderRadius: '20px'
                }}>{stats.occupiedRooms || 0}</span>
              </li>
              <li style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px',
                background: 'linear-gradient(90deg, rgba(212, 175, 55, 0.05) 0%, rgba(255, 255, 255, 1) 100%)',
                borderRadius: '10px',
                border: '1px solid rgba(212, 175, 55, 0.15)',
                transition: 'all 0.3s ease'
              }}>
                <span style={{ fontSize: '14px', color: '#5a4a3a', fontWeight: 500 }}>Cleaning</span>
                <span className="badge badge-warning" style={{ 
                  fontSize: '13px', 
                  fontWeight: 700,
                  padding: '6px 14px',
                  borderRadius: '20px'
                }}>{stats.cleaningRooms || 0}</span>
              </li>
            </ul>
          </div>

          <div className="card" style={{ 
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 249, 0.95) 100%)',
            border: '2px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 30px rgba(139, 115, 85, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)'
          }}>
            <h3 style={{ 
              color: '#4e342e', 
              marginBottom: '16px', 
              fontSize: '1.1rem', 
              fontWeight: 700,
              borderBottom: '2px solid rgba(212, 175, 55, 0.3)',
              paddingBottom: '12px'
            }}>
              Quick Links
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
              <a 
                href="/reservations" 
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '14px',
                  textAlign: 'center',
                  textDecoration: 'none',
                  border: '2px solid rgba(199, 146, 91, 0.3)',
                  transition: 'all 0.3s ease',
                  background: 'linear-gradient(135deg, #c7925b 0%, #8d6e63 100%)',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(139, 111, 71, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(139, 111, 71, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(139, 111, 71, 0.2)';
                }}
              >
                Manage Reservations
              </a>
              <a 
                href="/rooms" 
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '14px',
                  textAlign: 'center',
                  textDecoration: 'none',
                  border: '2px solid rgba(199, 146, 91, 0.3)',
                  transition: 'all 0.3s ease',
                  background: 'linear-gradient(135deg, #c7925b 0%, #8d6e63 100%)',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(139, 111, 71, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(139, 111, 71, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(139, 111, 71, 0.2)';
                }}
              >
                View Rooms
              </a>
              <a 
                href="/reservations?status=confirmed" 
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '14px',
                  textAlign: 'center',
                  textDecoration: 'none',
                  border: '2px solid rgba(199, 146, 91, 0.3)',
                  transition: 'all 0.3s ease',
                  background: 'linear-gradient(135deg, #c7925b 0%, #8d6e63 100%)',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(139, 111, 71, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(139, 111, 71, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(139, 111, 71, 0.2)';
                }}
              >
                Pending Check-ins
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Additional analytics widgets */}
      <div className="grid grid-2 mt-4" style={{ gap: '20px' }}>
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 249, 0.95) 100%)',
          border: '2px solid rgba(212, 175, 55, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 8px 30px rgba(139, 115, 85, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
          padding: '24px'
        }}>
          <h3 style={{ color: '#4e342e', marginBottom: '8px', fontSize: '1.1rem', fontWeight: 700 }}>Room Status Snapshot</h3>
          <p style={{ fontSize: '13px', color: '#8d6e63', marginBottom: '20px' }}>Occupancy vs availability</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div
              style={{
                position: 'relative',
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: `conic-gradient(#ffcc80 0deg, #ffcc80 ${Math.min(occupancyPercent, 100) * 3.6}deg, #f3e5dc ${Math.min(occupancyPercent, 100) * 3.6}deg)`,
                boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 76,
                  height: 76,
                  borderRadius: '50%',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}
              >
                <span style={{ fontSize: 20, fontWeight: 700, color: '#6d4c41' }}>{occupancyPercent || 0}%</span>
                <span style={{ fontSize: 10, color: '#8d6e63' }}>Occupied</span>
              </div>
            </div>
            <div style={{ fontSize: 13, color: '#5d4037' }}>
              <div style={{ marginBottom: 6 }}>
                <strong>{occupiedRooms}</strong> occupied rooms
              </div>
              <div style={{ marginBottom: 6 }}>
                <strong>{availableRooms}</strong> available rooms
              </div>
              <div>
                <strong>{totalRooms}</strong> total rooms
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ 
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 249, 0.95) 100%)',
          border: '2px solid rgba(212, 175, 55, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 8px 30px rgba(139, 115, 85, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
          padding: '24px'
        }}>
          <h3 style={{ color: '#4e342e', marginBottom: '8px', fontSize: '1.1rem', fontWeight: 700 }}>Today's Summary</h3>
          <p style={{ fontSize: '13px', color: '#8d6e63', marginBottom: '20px' }}>Key metrics for today</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f3e5dc' }}>
              <span style={{ fontSize: '13px', color: '#5d4037' }}>Pending Reservations</span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#6d4c41' }}>{stats.pendingReservations || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f3e5dc' }}>
              <span style={{ fontSize: '13px', color: '#5d4037' }}>Rooms Cleaning</span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#ffb74d' }}>{stats.cleaningRooms || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
              <span style={{ fontSize: '13px', color: '#5d4037' }}>Total Rooms</span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#8d6e63' }}>{stats.totalRooms || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ReceptionistDashboard;
