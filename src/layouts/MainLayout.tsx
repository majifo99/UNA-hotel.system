import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';

/**
 * Props interface for MainLayout component
 */
interface MainLayoutProps {
  readonly children: React.ReactNode;
}

/**
 * Main Layout Component
 * 
 * Provides the core application layout structure:
 * - Left sidebar with navigation (collapsible)
 * - Main content area with padding (responsive to sidebar state)
 * - Responsive design
 * - Full height layout
 * 
 * Layout Structure:
 * ┌─────────────────────────────────┐
 * │ Sidebar │    Main Content       │
 * │         │                       │
 * │  Nav    │      {children}       │
 * │  Items  │                       │
 * │         │                       │
 * └─────────────────────────────────┘
 * 
 * Usage:
 * <MainLayout>
 *   <YourPageComponent />
 * </MainLayout>
 */
export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Listen for sidebar collapse changes
  useEffect(() => {
    const handleSidebarToggle = (e: CustomEvent) => {
      setSidebarCollapsed(e.detail.isCollapsed);
    };

    window.addEventListener('sidebar-toggle' as any, handleSidebarToggle);
    
    return () => {
      window.removeEventListener('sidebar-toggle' as any, handleSidebarToggle);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Navigation Sidebar */}
      <Sidebar />
      
      {/* Main Content Area - responsive to sidebar state */}
      <main 
        className={`flex-1 overflow-auto transition-all duration-300 bg-gray-50 ${
          sidebarCollapsed ? 'ml-20' : 'ml-72'
        }`}
      >
        {/* Content container with padding */}
        <div className="min-h-full p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
