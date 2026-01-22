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
                <main className="flex-1 ml-64 h-full overflow-y-auto bg-gray-50 p-8 flex flex-col">
                    <div className="flex-1">
                        <Outlet />
                    </div>
                    <footer className="mt-8 pb-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                        All rights reserved by <span className="bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent font-black">Ms tech Hive</span>
                    </footer>
                </main>
            </div>
        </div>
    );
};

export default Layout;
