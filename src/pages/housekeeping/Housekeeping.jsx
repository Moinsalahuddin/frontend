import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext.jsx';
import AdminLayout from '../../components/AdminLayout.jsx';

const Housekeeping = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const [formData, setFormData] = useState({
    roomId: '',
    issueType: 'plumbing',
    description: '',
    priority: 'medium'
  });
  const [filter, setFilter] = useState({ status: '', taskType: '' });

  useEffect(() => {
    fetchTasks();
    fetchRooms();
  }, [filter]);

  const fetchRooms = async () => {
    try {
      const response = await axios.get('/api/rooms');
      setRooms(response.data.rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.taskType) params.taskType = filter.taskType;
      if (user?._id) params.assignedTo = user._id;
      
      const response = await axios.get('/api/housekeeping', { params });
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(`/api/housekeeping/${id}`, { status });
      if (status === 'completed') {
        await axios.put(`/api/housekeeping/${id}`, { completedDate: new Date() });
      }
      fetchTasks();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating task');
    }
  };

  const handleReportIssue = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/maintenance', formData);
      setShowReportForm(false);
      setFormData({
        roomId: '',
        issueType: 'plumbing',
        description: '',
        priority: 'medium'
      });
      alert('Issue reported successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Error reporting issue');
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
      title="My Housekeeping Tasks" 
      subtitle="Manage and track your assigned housekeeping tasks"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowReportForm(!showReportForm)}
          style={{ 
            padding: '10px 24px',
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: '14px',
            border: '2px solid rgba(199, 146, 91, 0.3)',
            background: 'linear-gradient(135deg, #c7925b 0%, #8d6e63 100%)',
            boxShadow: '0 4px 12px rgba(139, 111, 71, 0.2)'
          }}
        >
          {showReportForm ? '✕ Cancel' : '+ Report Issue'}
        </button>
      </div>

      {showReportForm && (
        <div className="card" style={{ 
          marginBottom: '24px', 
          animation: 'fadeIn 0.3s ease',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 249, 0.95) 100%)',
          border: '2px solid rgba(212, 175, 55, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 8px 30px rgba(139, 115, 85, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
          padding: '24px'
        }}>
          <h2 style={{ color: '#4e342e', marginBottom: '20px', fontSize: '1.5rem', fontWeight: 600 }}>Report Room Issue</h2>
          <form onSubmit={handleReportIssue}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group">
                <label>Room</label>
                <select
                  value={formData.roomId}
                  onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                  required
                >
                  <option value="">Select Room</option>
                  {rooms.map(room => (
                    <option key={room._id} value={room._id}>
                      {room.roomNumber} - {room.roomType}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Issue Type</label>
                <select
                  value={formData.issueType}
                  onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
                  required
                >
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="hvac">HVAC</option>
                  <option value="furniture">Furniture</option>
                  <option value="appliance">Appliance</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                placeholder="Describe the issue in detail..."
                rows="4"
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '15px', fontWeight: 600 }}>
              Report Issue
            </button>
          </form>
        </div>
      )}

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
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={filter.taskType}
            onChange={(e) => setFilter({ ...filter, taskType: e.target.value })}
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
            <option value="cleaning">Cleaning</option>
            <option value="maintenance">Maintenance</option>
            <option value="inspection">Inspection</option>
            <option value="deep-cleaning">Deep Cleaning</option>
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 249, 0.95) 100%)',
        border: '2px solid rgba(212, 175, 55, 0.2)',
        borderRadius: '16px',
        boxShadow: '0 8px 30px rgba(139, 115, 85, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
        padding: '24px',
        overflow: 'hidden'
      }}>
        <h2 style={{ color: '#4e342e', marginBottom: '20px', fontSize: '1.5rem', fontWeight: 600 }}>My Tasks</h2>
        {tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#8d6e63' }}>
            <p style={{ fontSize: '18px', marginBottom: '10px' }}>No tasks found</p>
            <p style={{ fontSize: '14px' }}>You'll see your assigned tasks here</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Task Type</th>
                  <th>Scheduled Date</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
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
                        task.status === 'cancelled' ? 'badge-danger' :
                        'badge-warning'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td>
                      {task.status !== 'completed' && (
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusUpdate(task._id, e.target.value)}
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
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
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

export default Housekeeping;
