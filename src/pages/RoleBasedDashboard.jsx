import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import AdminDashboard from './admin/Dashboard.jsx';
import ManagerDashboard from './manager/Dashboard.jsx';
import ReceptionistDashboard from './receptionist/Dashboard.jsx';
import HousekeepingDashboard from './housekeeping/Dashboard.jsx';
import GuestDashboard from './guest/Dashboard.jsx';

const RoleBasedDashboard = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Render dashboard based on user role
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    case 'receptionist':
      return <ReceptionistDashboard />;
    case 'housekeeping':
      return <HousekeepingDashboard />;
    case 'guest':
      return <GuestDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default RoleBasedDashboard;

