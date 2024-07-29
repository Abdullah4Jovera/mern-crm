import React, { useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../Auth/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AuthorizedRoute = ({ allowedRoles, children }) => {
    const { state } = useContext(AuthContext);
    const { userinfo } = state;

    useEffect(() => {
        if (userinfo && !allowedRoles.includes(userinfo.role)) {
            toast.error("You are not authorized to access this page. Please login again.");
        }
    }, [userinfo, allowedRoles]);

    if (!userinfo) {
        return <Navigate to="/" />;
    }

    if (!allowedRoles.includes(userinfo.role)) {
        toast.error("You are not authorized to access this page. Please login again.");
        return <Navigate to="/" />;
    }

    return children;
}

export default AuthorizedRoute;
