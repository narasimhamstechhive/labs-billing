import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
    return (
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
            <Header />
            <div className="flex flex-1 pt-16 overflow-hidden">
                <Sidebar />
                <main className="flex-1 ml-64 h-full overflow-y-auto bg-gray-50 p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
