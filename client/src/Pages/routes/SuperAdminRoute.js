import React, { useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../Auth/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SuperAdminRoute = ({ children }) => {
  const { state } = useContext(AuthContext);
  const { userinfo } = state;

  useEffect(() => {
    if (userinfo && userinfo.role !== "superadmin") {
      toast.error("You are not authorized. Please login again.");
      // Redirect userinfo or perform other actions here if needed
    }
  }, [userinfo]);

  if (!userinfo) {
    // If userinfo is not logged in, redirect to login page
    return <Navigate to="/" />;
  }

  if (userinfo.role !== "superadmin") {
    // If userinfo is logged in but not a superadmin, show error and redirect
    toast.error("You are not authorized. Please login again.");
    return <Navigate to="/" />;
  }

  // If userinfo is logged in and is a superadmin, render children
  return children;
}

export default SuperAdminRoute;