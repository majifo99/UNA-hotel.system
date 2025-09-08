/**
 * Web Layout - Public Website Layout
 * 
 * Layout component for the public-facing website.
 * Includes header, navigation, main content area, and footer.
 * Different from MainLayout which includes admin sidebar.
 */

import type { ReactNode } from 'react';
import { WebHeader } from '../components/WebHeader';
import { WebFooter } from '../components/WebFooter';

// =================== TYPES ===================

interface WebLayoutProps {
  readonly children: ReactNode;
}

// =================== COMPONENT ===================

/**
 * WebLayout Component
 * 
 * Main layout structure for the public website:
 * - Fixed header with navigation
 * - Main content area with proper spacing
 * - Footer
 * - Responsive design
 */
export function WebLayout({ children }: WebLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-una-bg-100">
      {/* Header */}
      <WebHeader />
      
      {/* Main Content */}
      <main className="flex-1 w-full">
        {children}
      </main>
      
      {/* Footer */}
      <WebFooter />
    </div>
  );
}
