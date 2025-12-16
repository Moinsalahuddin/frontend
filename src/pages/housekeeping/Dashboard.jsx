import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext.jsx';
import AdminLayout from '../../components/AdminLayout.jsx';

const HousekeepingDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [myTasks, setMyTasks] = useState([]);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [inProgressTasks, setInProgressTasks] = useState(0);
  const [completedToday, setCompletedToday] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHousekeepingStats();
  }, []);

  const fetchHousekeepingStats = async () => {
    try {
      const response = await axios.get('/api/housekeeping', { 
        params: { assignedTo: user?._id } 
      });
      
      const tasks = response.data.tasks || [];
      setMyTasks(tasks);
      setPendingTasks(tasks.filter(t => t.status === 'pending').length);
      setInProgressTasks(tasks.filter(t => t.status === 'in-progress').length);
      setCompletedToday(tasks.filter(t => t.status === 'completed' && new Date(t.completedDate).toDateString() === new Date().toDateString()).length);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
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
      title="Dashboard" 
      subtitle={`Welcome back, ${user?.firstName || 'Housekeeping'}! Manage your assigned tasks efficiently.`}
    >

      {/* Beautiful Stats Cards with Icons */}
      <div className="grid grid-4 mb-4" style={{ gap: '20px' }}>
        <div className="card" style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 249, 0.95) 100%)',
          border: '2px solid rgba(212, 175, 55, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 8px 30px rgba(139, 115, 85, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(109, 76, 65, 0.1) 0%, rgba(109, 76, 65, 0.05) 100%)',
            zIndex: 0
          }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '28px' }}>📋</span>
              <h3 style={{ color: '#4e342e', margin: 0, fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>My Tasks</h3>
            </div>
            <p style={{ fontSize: '40px', fontWeight: 800, color: '#6d4c41', margin: '8px 0', lineHeight: 1 }}>{myTasks.length}</p>
            <span style={{ fontSize: '12px', color: '#8d6e63', fontWeight: 500 }}>Total assigned tasks</span>
          </div>
        </div>
        
        <div className="card" style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 249, 0.95) 100%)',
          border: '2px solid rgba(212, 175, 55, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 8px 30px rgba(139, 115, 85, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '28px' }}>⏳</span>
              <h3 style={{ color: '#4e342e', margin: 0, fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending Tasks</h3>
            </div>
            <p style={{ fontSize: '40px', fontWeight: 800, color: '#a1887f', margin: '8px 0', lineHeight: 1 }}>{pendingTasks}</p>
            <span style={{ fontSize: '13px', color: '#8d6e63', fontWeight: 500 }}>Awaiting start</span>
          </div>
        </div>
        
        <div className="card" style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 249, 0.95) 100%)',
          border: '2px solid rgba(212, 175, 55, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 8px 30px rgba(139, 115, 85, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '28px' }}>⚙️</span>
              <h3 style={{ color: '#4e342e', margin: 0, fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>In Progress</h3>
            </div>
            <p style={{ fontSize: '40px', fontWeight: 800, color: '#ffb74d', margin: '8px 0', lineHeight: 1 }}>{inProgressTasks}</p>
            <span style={{ fontSize: '13px', color: '#8d6e63', fontWeight: 500 }}>Currently working</span>
          </div>
        </div>
        
        <div className="card" style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 249, 0.95) 100%)',
          border: '2px solid rgba(212, 175, 55, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 8px 30px rgba(139, 115, 85, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '28px' }}>✅</span>
              <h3 style={{ color: '#4e342e', margin: 0, fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Completed Today</h3>
            </div>
            <p style={{ fontSize: '40px', fontWeight: 800, color: '#ffcc80', margin: '8px 0', lineHeight: 1 }}>{completedToday}</p>
            <span style={{ fontSize: '13px', color: '#8d6e63', fontWeight: 500 }}>Finished today</span>
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="card" style={{ 
        marginBottom: '24px', 
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 249, 0.95) 100%)',
        border: '2px solid rgba(212, 175, 55, 0.2)',
        borderRadius: '16px',
        boxShadow: '0 8px 30px rgba(139, 115, 85, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #ffcc80 0%, #ffb74d 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            boxShadow: '0 4px 12px rgba(255, 183, 77, 0.3)'
          }}>
            📝
          </div>
          <h2 style={{ color: '#4e342e', margin: 0, fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.3px' }}>My Recent Tasks</h2>
        </div>
        {myTasks.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Task Type</th>
                  <th>Scheduled Date</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myTasks.slice(0, 5).map(task => (
                  <tr key={task._id}>
                    <td style={{ fontWeight: 600, color: '#4e342e' }}>
                      {task.roomId?.roomNumber} - {task.roomId?.roomType}
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
                        {task.taskType}
                      </span>
                    </td>
                    <td>{new Date(task.scheduledDate).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${
                        task.priority === 'urgent' ? 'badge-danger' :
                        task.priority === 'high' ? 'badge-warning' :
                        'badge-info'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        task.status === 'completed' ? 'badge-success' :
                        task.status === 'in-progress' ? 'badge-info' :
                        'badge-warning'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#8d6e63' }}>
            <p style={{ fontSize: '18px', marginBottom: '10px' }}>No tasks assigned</p>
            <p style={{ fontSize: '14px' }}>You'll see your assigned tasks here</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 249, 0.95) 100%)',
        border: '2px solid rgba(212, 175, 55, 0.2)',
        borderRadius: '16px',
        boxShadow: '0 8px 30px rgba(139, 115, 85, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #c7925b 0%, #8d6e63 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            boxShadow: '0 4px 12px rgba(199, 146, 91, 0.3)'
          }}>
            ⚡
          </div>
          <h2 style={{ color: '#4e342e', margin: 0, fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.3px' }}>Quick Actions</h2>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <a 
            href="/housekeeping" 
            style={{ 
              padding: '14px 28px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '14px',
              textDecoration: 'none',
              background: 'linear-gradient(135deg, #c7925b 0%, #8d6e63 100%)',
              color: 'white',
              border: 'none',
              boxShadow: '0 4px 16px rgba(199, 146, 91, 0.4)',
              transition: 'all 0.3s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              letterSpacing: '0.5px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(199, 146, 91, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 16px rgba(199, 146, 91, 0.4)';
            }}
          >
            📋 VIEW ALL TASKS
          </a>
          <a 
            href="/maintenance" 
            style={{ 
              padding: '14px 28px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '14px',
              textDecoration: 'none',
              background: 'linear-gradient(135deg, #c7925b 0%, #8d6e63 100%)',
              color: 'white',
              border: 'none',
              boxShadow: '0 4px 16px rgba(199, 146, 91, 0.4)',
              transition: 'all 0.3s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              letterSpacing: '0.5px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(199, 146, 91, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 16px rgba(199, 146, 91, 0.4)';
            }}
          >
            🔧 MAINTENANCE REQUESTS
          </a>
        </div>
      </div>
    </AdminLayout>
  );
};

export default HousekeepingDashboard;

