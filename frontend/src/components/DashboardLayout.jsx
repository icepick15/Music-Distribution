import React, { useState } from 'react';
import Navbar from './Navbar';
import ModernFooter from './ModernFooter';
import EnhancedSidebar from './EnhancedSidebar';
import { 
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Navbar />
      
      <div className="flex flex-1">
        {/* Mobile sidebar */}
        <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
          <div className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`} 
               onClick={() => setSidebarOpen(false)} />
          
          <div className={`fixed inset-y-0 left-0 flex w-full max-w-xs transform transition ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="relative flex w-full flex-col bg-white shadow-xl mt-16">
              <div className="flex items-center justify-between px-4 py-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500"
                  onClick={() => setSidebarOpen(false)}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <EnhancedSidebar />
              </div>
            </div>
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:z-30">
          <EnhancedSidebar />
        </div>

        {/* Main content */}
        <div className="flex-1 lg:pl-0">
          {/* Mobile header */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-4">
              <button
                type="button"
                className="text-gray-500 hover:text-gray-900"
                onClick={() => setSidebarOpen(true)}
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
              <div className="w-6" /> {/* Spacer */}
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
      
      {/* Footer */}
      <ModernFooter />
    </div>
  );
};

export default DashboardLayout;