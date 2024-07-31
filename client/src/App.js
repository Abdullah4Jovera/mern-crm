import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import OTP from './pages/Auth/OTP';
import AuthorizedRoute from './pages/routes/AuthorizedRoute'
import BusinessFinanceDashboard from './pages/BusinessFinance/BusinessFinanceDashboard.jsx'
import BusinessFinanceLeadDetails from './pages/BusinessFinance/BusinessFinanceLeadDetails.jsx';
import CeoDashboard from './pages/CEO/CeoDashboard.jsx';
import MdDashboard from './pages/MD/MdDashboard.jsx';
import SuperadminDashboard from './pages/Superadmin/SuperadminDashboard.jsx';
import MarketingDashboard from './pages/Marketing/MarketingDashboard.jsx';
import TeleSaleDashboard from './pages/TeleSales/TeleSaleDashboard.jsx';
const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<OTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Business Finance Routes */}
          <Route
            path="/businessfinancedashboard"
            element={
              <AuthorizedRoute allowedRoles={["businessfinanceloanmanger", "businessfinanceloanHOD", "businessfinanceloancordinator", "businessfinanceloanteamleader", "businessfinanceloansales"]}>
                <BusinessFinanceDashboard />
              </AuthorizedRoute>} />
          <Route
            path="/businessfinanceleaddetails/:id"
            element={
              <AuthorizedRoute allowedRoles={["superadmin", "CEO", "MD", "businessfinanceloanmanger", "businessfinanceloanHOD", "businessfinanceloancordinator", "businessfinanceloanteamleader", "businessfinanceloansales"]}>
                <BusinessFinanceLeadDetails />
              </AuthorizedRoute>} />

          {/* CEO */}
          <Route
            path="/ceodashboard"
            element={
              <AuthorizedRoute allowedRoles={["CEO"]}>
                <CeoDashboard />
              </AuthorizedRoute>} />

          {/* MD */}
          <Route
            path="/mddashboard"
            element={
              <AuthorizedRoute allowedRoles={["MD"]}>
                <MdDashboard />
              </AuthorizedRoute>} />

          {/* Superadmin */}
          <Route
            path="/superadmindashboard"
            element={
              <AuthorizedRoute allowedRoles={["superadmin"]}>
                <SuperadminDashboard />
              </AuthorizedRoute>} />

          {/* Marketing */}
          <Route
            path="/marketingdashboard"
            element={
              <AuthorizedRoute allowedRoles={["marketingagent", "marketingmanager"]}>
                <MarketingDashboard />
              </AuthorizedRoute>} />

          {/* TeleSale */}
          <Route
            path="/telesaledashboard"
            element={
              <AuthorizedRoute allowedRoles={["telesaleagent", "telesaleteamleader"]}>
                <TeleSaleDashboard />
              </AuthorizedRoute>} />
        </Routes>




      </BrowserRouter>
    </>
  )
}

export default App
