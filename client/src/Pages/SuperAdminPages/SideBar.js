import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import './SuperAdmin.css';
import { RiDashboardHorizontalFill } from "react-icons/ri";
import { MdLeaderboard } from "react-icons/md";
import { RiContractLine } from "react-icons/ri";
import { AuthContext } from '../Auth/AuthContext';

const SideBar = () => {
    const { state } = useContext(AuthContext);
    
    return (
        <div>
            <div className="sidebarContainer">
                <img src={state.userinfo.image && state.userinfo.image} alt='user_Image' className='imagesidebar' />
                <h6 className='userName' > {state.userinfo.name && state.userinfo.name} </h6>
                <h6 className='userRole'> {state.userinfo.role && state.userinfo.role} </h6>
                <Link to={'/Lead'} className='linkClass'>
                    <MdLeaderboard style={{ fontSize: '30px' }} />
                    Lead
                </Link>

                <Link to={'/Dashboard'} className='linkClass'>
                    <RiDashboardHorizontalFill style={{ fontSize: '30px' }} />
                    Dashboard   
                </Link>

                <Link to={'/Contract'} className='linkClass'>
                    <RiContractLine style={{ fontSize: '30px' }} />
                    Contract
                </Link>
            </div>
        </div>
    );
};

export default SideBar;
