import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function Layout() {
    const location = useLocation();
    const navigate = useNavigate();

    const currentTab = location.pathname.includes('created') ? 'created'
        : location.pathname.includes('profile') ? 'profile'
            : 'assigned';

    const handleTabChange = (tab: 'assigned' | 'created' | 'profile') => {
        navigate(`/${tab}`);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Outlet />
            <BottomNav activeTab={currentTab} onTabChange={handleTabChange} />
        </div>
    );
}
