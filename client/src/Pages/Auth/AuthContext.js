import React, { createContext, useReducer, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const initialState = {
  userinfo: JSON.parse(localStorage.getItem('userinfo')) || null,
  loans: [],
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        userinfo: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        userinfo: null,
        loans: [],
      };
    case 'UPDATE_USER':
      return {
        ...state,
        userinfo: action.payload,
      };
    case 'SET_INITIAL_USER':
      return {
        ...state,
        userinfo: state.userinfo || action.payload,
      };
    case 'SET_LOANS':
      return {
        ...state,
        loans: action.payload,
      };
    default:
      return state;
  }
};

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userinfo = JSON.parse(localStorage.getItem('userinfo'));
    if (userinfo) {
      dispatch({ type: 'SET_INITIAL_USER', payload: userinfo });

      if (userinfo.role === 'superadmin') {
        fetchLoans(userinfo.token);
      } else if (userinfo.role === 'businessfinanceloanmanger') {
        fetchBusinessLoans(userinfo.token);
      }
    }
  }, [dispatch]);

  const fetchLoans = async (token) => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/loans/all-loans', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch({ type: 'SET_LOANS', payload: response.data });
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch loans:', error);
      setLoading(false);
    }
  };

  const fetchBusinessLoans = async (token) => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/businessfinance-loans/all-business-finance-loans', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch({ type: 'SET_LOANS', payload: response.data });
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch loans:', error);
      setLoading(false);
    }
  };

  const login = (userData) => {
    dispatch({ type: 'LOGIN', payload: userData });
    localStorage.setItem('userinfo', JSON.stringify(userData));

    if (userData.role === 'superadmin') {
      fetchLoans(userData.token);
    } else if (userData.role === 'businessfinanceloanmanger') {
      fetchBusinessLoans(userData.token);
    }
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
    localStorage.setItem('userinfo', JSON.stringify(userData));

    if (userData.role === 'superadmin') {
      fetchLoans(userData.token);
    } else if (userData.role === 'businessfinanceloanmanger') {
      fetchBusinessLoans(userData.token);
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('userinfo');
  };



  return (
    <AuthContext.Provider value={{ state, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
