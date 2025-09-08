import React from 'react';
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
 * - Left sidebar with navigation
 * - Main content area with padding
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
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--color-darkGreen1)' }}>
      {/* Navigation Sidebar */}
      <Sidebar />
      
      {/* Main Content Area - con margen para sidebar fija */}
      <main className="flex-1 overflow-auto ml-72" style={{ backgroundColor: 'var(--color-darkGreen1)' }}>
        {/* Content container matching Figma design */}
        <div className="p-8 min-h-full">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
