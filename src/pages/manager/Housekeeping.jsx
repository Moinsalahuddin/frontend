import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext.jsx';

const Housekeeping = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    roomId: '',
    taskType: 'cleaning',
    scheduledDate: '',
    priority: 'medium',
    notes: '',
    assignedTo: ''
  });
  const [filter, setFilter] = useState({ status: '', taskType: '' });

  useEffect(() => {
    fetchTasks();
    fetchRooms();
    fetchUsers();
  }, [filter]);

  const fetchTasks = async () => {
    try {
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.taskType) params.taskType = filter.taskType;
      
      const response = await axios.get('/api/housekeeping', { params });
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await axios.get('/api/rooms');
      setRooms(response.data.rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users', { params: { role: 'housekeeping' } });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/housekeeping', formData);
      setShowForm(false);
      setFormData({
        roomId: '',
        taskType: 'cleaning',
        scheduledDate: '',
        priority: 'medium',
        notes: '',
        assignedTo: ''
      });
      fetchTasks();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating task');
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

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Housekeeping Management</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'New Task'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2>Create New Task</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
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
                <label>Task Type</label>
                <select
                  value={formData.taskType}
                  onChange={(e) => setFormData({ ...formData, taskType: e.target.value })}
                  required
                >
                  <option value="cleaning">Cleaning</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inspection">Inspection</option>
                  <option value="deep-cleaning">Deep Cleaning</option>
                </select>
              </div>
              <div className="form-group">
                <label>Scheduled Date</label>
                <input
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="form-group">
                <label>Assign To</label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>
                      {u.firstName} {u.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary">Create Task</button>
          </form>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            style={{ padding: '8px' }}
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
            style={{ padding: '8px' }}
          >
            <option value="">All Types</option>
            <option value="cleaning">Cleaning</option>
            <option value="maintenance">Maintenance</option>
            <option value="inspection">Inspection</option>
            <option value="deep-cleaning">Deep Cleaning</option>
          </select>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Room</th>
              <th>Task Type</th>
              <th>Scheduled Date</th>
              <th>Priority</th>
              <th>Assigned To</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task._id}>
                <td>{task.roomId?.roomNumber} - {task.roomId?.roomType}</td>
                <td>{task.taskType}</td>
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
                <td>{task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : 'Unassigned'}</td>
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
                      style={{ padding: '5px' }}
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
    </div>
  );
};

export default Housekeeping;

