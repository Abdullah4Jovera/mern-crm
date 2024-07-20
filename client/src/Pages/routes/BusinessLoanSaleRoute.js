import React, { useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../Auth/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BusinessLoanSaleRoute = ({ children }) => {
    const { state } = useContext(AuthContext);
    const { userinfo } = state;

    useEffect(() => {
        if (userinfo && userinfo.role !== "businessfinanceloansales") {
            toast.error("You are not authorized. Please login again.");
        }
    }, [userinfo]);

    if (!userinfo) {
        return <Navigate to="/" />;
    }

    if (userinfo.role !== "businessfinanceloansales") {
        toast.error("You are not authorized. Please login again.");
        return <Navigate to="/" />;
    }

    return children;
}

export default BusinessLoanSaleRoute;