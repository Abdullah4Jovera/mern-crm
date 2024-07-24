import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './Pages/Auth/Login';
import SuperAdminRoute from './Pages/routes/SuperAdminRoute'
import UserRoute from './Pages/routes/UserRoute'
import SuperAdminDashboard from './Pages/SuperAdminPages/SuperAdminDashboard'
import BusinessManagerDashboard from './Pages/BusinessFinanceLoan/BusinessFinanceDashboard/BusinessManagerDashboard'
import UserDashboard from './Pages/UserPages/UserDashboard'
import RealestateManagerDashboard from './Pages/RealestateLoan/RealEstateManagerDashboard/RealestateMangerDashboard'
import MortgageManagerDashboard from './Pages/MortgageLoan/MortagageManagerDashboard/MortagageManagerDashboard'
import Register from './Pages/Auth/Register';
import ForgotPassword from './Pages/Auth/ForgotPassword';
import ResetPassword from './Pages/Auth/ResetPassword';
import OTP from './Pages/Auth/OTP';
import Loans from './Pages/UserPages/Loans';
import LoanDetails from './Pages/UserPages/LoanDetails';
import Massages from './Pages/UserPages/Massages';
import MemberShip from './Pages/UserPages/MemberShip';
import Flights from './Pages/UserPages/Flights';
import BusinessDetails from './Pages/BusinessFinanceLoan/BusinessDetails/BusinessDetails';
import CustomMessagePage from './Pages/SuperAdminPages/CustomMessagePage';
import CeoDashboard from './Pages/Ceo/CeoDashboard';
import CeoRoute from './Pages/routes/CeoRoute'
import MdRoute from './Pages/routes/MdRoute';
import MdDashboard from './Pages/Md/MdDashboard';
import PersonalManagerDashboard from './Pages/PersonalLoan/PersonalLoanManagerDashboard/PersonalManagerDashboard'
import BusinessManagerRoute from './Pages/routes/BusinessManagerRoute';
import BusinessCoordinatorRoute from './Pages/routes/BusinessCoordinatorRoute';
import BusinessCordinatorDashboard from './Pages/BusinessFinanceLoan/BusinessCordinator/BusinessCordinatorDashBoard';
import BusinessTeamLeadRoute from './Pages/routes/BusinessTeamleadRoute';
import BusinessLoanSaleRoute from './Pages/routes/BusinessLoanSaleRoute';
import BusinessLoanHODRoute from './Pages/routes/BusinessLoanHOD';
import BusinessTeamLeadDashboard from './Pages/BusinessFinanceLoan/BusinessFinanceTeamLead/BusinessTeamLeadDashboard';
import BusinessLoanSaleDashboard from './Pages/BusinessFinanceLoan/BusinessLoanSale/BusinessLoanSaleDashboard';
import BusinessHODDashboard from './Pages/BusinessFinanceLoan/BusinessLoanHOD/BusinessHODDashboard';
import PersonalLoanHODDashboard from './Pages/PersonalLoan/PersonalLoanHOD/PersonalLoanHODDashboard';
import PersonalLoanCordinatorDashboard from './Pages/PersonalLoan/PersonalLoanCordinator/PersonalLoanCordinatorDashboard';
import PersonalLoanSalesDashboard from './Pages/PersonalLoan/PersonalLoanSales/PersonalLoanSalesDashboard';
import PersonaLoanTeamleadDashboard from './Pages/PersonalLoan/PersonalLoanTeamLead/PersonaLoanTeamleadDashboard';
import PersonalManagerRoute from './Pages/routes/PersonalManagerRoute';
import PersonalLoanHODRoute from './Pages/routes/PersonalLoanHODRoute';
import PersonalLoanCoordinatorRoute from './Pages/routes/PersonalLoanCoordinatorRoute';
import PersonalLoanTeamLeadRoute from './Pages/routes/PersonalLoanTeamLeadRoute';
import PersonalLoanSalesRoute from './Pages/routes/PersonalLoanSalesRoute';
import RealestateDashboardRoute from './Pages/routes/RealestateRoute';
import RealEstateLoanHODDashboard from './Pages/RealestateLoan/RealEstateLoanHOD/RealEstateLoanHODDashboard';
import RealEstateHODRoute from './Pages/routes/RealEstateHODRoute';
import RealEstateCoordinatorDashboard from './Pages/RealestateLoan/RealEstateCoordinator/RealEstateCoordinatorDashboard';
import RealEstateCoordinatorRoute from './Pages/routes/RealEstateCoordinatorRoute';
import RealEstateTeamLeadDashboard from './Pages/RealestateLoan/RealEstateTeamLead/RealEstateTeamLeadDashboard';
import RealestateTeamLeadRoute from './Pages/routes/RealEstateTeamleadRoute';
import RealEstateLoanSalesDashboard from './Pages/RealestateLoan/RealEstateLoanSales/RealEstateLoanSalesDashboard';
import RealEstateSalesRoute from './Pages/routes/RealEstateSalesRoute';
import MortgageManagerRoute from './Pages/routes/MortgageManagerRoute';
import MortgageHODDashboard from './Pages/MortgageLoan/MortgageLoanHOD/MortgageHODDashboard';
import MortgageHODRoute from './Pages/routes/MortgageHODRoute';
import MortgageLoanCordinatorDashboard from './Pages/MortgageLoan/MortgageLoanCordinator/MortgageLoanCordinatorDashboard';
import MortgageLoanCoordinatorRoute from './Pages/routes/MortgageLoanCoordinator';
import MortgageLoanTeamLeadDashboard from './Pages/MortgageLoan/MortgageTeamLead/MortgageLoanTeamLeadDashboard';
import MortgageTeamLeadRoute from './Pages/routes/MortgageTeamLeadRoute';
import MortgageLoanSaleDashboard from './Pages/MortgageLoan/MortgageLoanSale/MortgageLoanSaleDashboard';
import MortgageLoanSaleRoute from './Pages/routes/MortgageLoanSaleRoute';
import UpdateRolePermissions from './Pages/Ceo/UpdateRolePermissions';
import BusinessLeadDetails from './Pages/BusinessFinanceLoan/BusinessDetails/BusinessLeadDetails';
import AuthorizedRoute from './Pages/routes/AuthorizedRoute';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<OTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* CEO Routes */}
          <Route path='/ceodashboard' element={<CeoRoute><CeoDashboard /></CeoRoute>} />
          {/* MD Routes */}
          <Route path='/mddashboard' element={<MdRoute><MdDashboard /></MdRoute>} />


          {/* Super Admin Routes */}
          <Route path="/superadmindashboard" element={<SuperAdminRoute ><SuperAdminDashboard /></SuperAdminRoute>} />
          <Route path="/custommassage" element={<SuperAdminRoute ><CustomMessagePage /></SuperAdminRoute>} />
          <Route path="/users" element={<SuperAdminRoute ><UpdateRolePermissions /></SuperAdminRoute>} />


          {/* Busines Routes */}
          <Route
            path="/businessfinanceloanmangerdashboard"
            element={
              <AuthorizedRoute allowedRoles={["CEO", "MD", "businessfinanceloanmanger"]}>
                <BusinessManagerDashboard />

              </AuthorizedRoute>
            }
          />
          <Route path="/businessfinanceloancordinator" element={<BusinessCoordinatorRoute ><BusinessCordinatorDashboard /></BusinessCoordinatorRoute>} />
          <Route path="/businessfinanceloanteamleader" element={<BusinessTeamLeadRoute ><BusinessTeamLeadDashboard /></BusinessTeamLeadRoute>} />
          <Route path="/businessfinanceloansales" element={<BusinessLoanSaleRoute ><BusinessLoanSaleDashboard /></BusinessLoanSaleRoute>} />
          <Route path="/businessfinanceloanHOD" element={<BusinessLoanHODRoute ><BusinessHODDashboard /></BusinessLoanHODRoute>} />
          {/* <Route path="/businessDetails/:id" element={<BusinessManagerRoute ><BusinessDetails /></BusinessManagerRoute>} /> */}
          <Route path="/business-lead-details/:id" element={<AuthorizedRoute allowedRoles={["superadmin", "CEO", "MD", "businessfinanceloanmanger"]}><BusinessLeadDetails /></AuthorizedRoute>} />
          {/* Personal Routes */}
          <Route path="/personalloanmanger" element={<PersonalManagerRoute ><PersonalManagerDashboard /></PersonalManagerRoute>} />
          <Route path="/personalloanHOD" element={<PersonalLoanHODRoute ><PersonalLoanHODDashboard /></PersonalLoanHODRoute>} />
          <Route path="/personalloancordinator" element={<PersonalLoanCoordinatorRoute   ><PersonalLoanCordinatorDashboard /></PersonalLoanCoordinatorRoute>} />
          <Route path="/personalloanteamleader" element={<PersonalLoanTeamLeadRoute ><PersonaLoanTeamleadDashboard /></PersonalLoanTeamLeadRoute>} />
          <Route path="/personalloansales" element={<PersonalLoanSalesRoute ><PersonalLoanSalesDashboard /></PersonalLoanSalesRoute>} />

          {/* Realestate Routes */}
          <Route path="/realestateloanmanger" element={<RealestateDashboardRoute ><RealestateManagerDashboard /></RealestateDashboardRoute>} />
          <Route path="/realestateloanHOD" element={<RealEstateHODRoute ><RealEstateLoanHODDashboard /></RealEstateHODRoute>} />
          <Route path="/realestateloancordinator" element={<RealEstateCoordinatorRoute ><RealEstateCoordinatorDashboard /></RealEstateCoordinatorRoute>} />
          <Route path="/realestateloanteamleader" element={<RealestateTeamLeadRoute ><RealEstateTeamLeadDashboard /></RealestateTeamLeadRoute>} />
          <Route path="/realestateloansales" element={<RealEstateSalesRoute ><RealEstateLoanSalesDashboard /></RealEstateSalesRoute>} />

          {/* Mortgage Routes */}
          <Route path="/mortgageloanmanger" element={<MortgageManagerRoute ><MortgageManagerDashboard /></MortgageManagerRoute>} />
          <Route path="/mortgageloanHOD" element={<MortgageHODRoute ><MortgageHODDashboard /></MortgageHODRoute>} />
          <Route path="/mortgageloancordinator" element={<MortgageLoanCoordinatorRoute ><MortgageLoanCordinatorDashboard /></MortgageLoanCoordinatorRoute>} />
          <Route path="/mortgageloanteamleader" element={<MortgageTeamLeadRoute ><MortgageLoanTeamLeadDashboard /></MortgageTeamLeadRoute>} />
          <Route path="/mortgageloansales" element={<MortgageLoanSaleRoute ><MortgageLoanSaleDashboard /></MortgageLoanSaleRoute>} />

          {/* User Routes */}
          <Route path="/userdashboard" element={<UserRoute ><UserDashboard /></UserRoute>} />
          <Route path="/loans" element={<UserRoute ><Loans /></UserRoute>} />
          <Route path="/loan/:loanType/:loanId" element={<UserRoute ><LoanDetails /></UserRoute>} />
          <Route path="/usermassages" element={<UserRoute ><Massages /></UserRoute>} />
          <Route path="/membership" element={<UserRoute ><MemberShip /></UserRoute>} />
          <Route path="/flights" element={<UserRoute ><Flights /></UserRoute>} />

        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;





