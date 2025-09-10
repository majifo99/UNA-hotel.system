/**
 * Enhanced Sidebar Component for UNA Hotel System
 * 
 * Features:
 * - Config-driven navigation (single source of truth)
 * - Numeric keyboard shortcuts with visual hints
 * - Accessibility compliant (WCAG 2.1 AA)
 * - Responsive design with collapsible support
 * - Integration with command palette
 * - Modern UX patterns aligned with PMS systems
 * 
 * Design Preservation:
 * - Maintains existing visual design and color scheme
 * - Preserves UNA brand colors and styling
 * - Keeps professional dark theme approach
 * - Enhances without breaking existing UX
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Building2,
  ChevronRight,
  ChevronLeft,
  Keyboard,
  Search,
} from 'lucide-react';
import {
  getNavigationByCategory,
  NAVIGATION_CATEGORIES,
  type NavigationItem,
  type NavigationCategory,
} from '../router/navigation.config';
import { 
  useNavigationShortcuts, 
  useShortcutDisplay,
  useShortcutsAvailable 
} from '../hooks/useNavigationShortcuts';
import { CommandPalette, useCommandPalette } from './CommandPalette';
import { ShortcutGuide } from './ShortcutGuide';

/**
 * Props for NavigationItem component
 */
interface NavigationItemProps {
  readonly item: NavigationItem;
  readonly isActive: boolean;
  readonly isCollapsed: boolean;
  readonly level: number;
  readonly expandedItems: Set<string>;
  readonly onItemExpansion: (itemPath: string, shouldExpand: boolean) => void;
  readonly shortcutsAvailable: boolean;
  readonly isActiveRoute: (path: string) => boolean;
}

/**
 * Enhanced SidebarNavigationItem with controlled expansion
 */
function SidebarNavigationItem({ 
  item, 
  isActive, 
  isCollapsed, 
  level, 
  expandedItems, 
  onItemExpansion,
  shortcutsAvailable,
  isActiveRoute
}: NavigationItemProps) {
  const location = useLocation();
  const shortcutDisplay = useShortcutDisplay(item.shortcut || []);
  
  const [showTooltip, setShowTooltip] = useState(false);
  const IconComponent = item.icon;
  
  const hasChildren = item.children && item.children.length > 0;
  const isTopLevel = level === 0;
  const isSubmenu = level > 0;
  
  // Check if any child is currently active
  const hasActiveChild = hasChildren && item.children?.some(child => 
    location.pathname === child.path || 
    location.pathname.startsWith(child.path + '/')
  );
  
  // This item is expanded if it has an active child or is in expandedItems
  const isExpanded = hasActiveChild || expandedItems.has(item.path);
  
  // Only show active state for direct matches, not parents with active children
  const isCurrentlyActive = isActive && !hasActiveChild;
  
  /**
   * Enhanced click handling for expandable items
   */
  const handleToggleChildren = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      onItemExpansion(item.path, !isExpanded);
    }
  };
  
  /**
   * Enhanced item classes with cleaner hierarchy
   */
  const getItemClasses = (): string => {
    let classes = 'nav-item-base group';
    
    if (isSubmenu) {
      classes += ' nav-item-submenu';
    } else if (hasChildren) {
      classes += ' nav-item-parent';
    }
    
    if (isCurrentlyActive) {
      classes += ' nav-item-active';
    } else {
      classes += ' nav-item-normal';
    }
    
    return classes;
  };

  /**
   * Improved shortcut display for hierarchical structure
   */
  const shouldShowShortcut = shortcutsAvailable && 
    shortcutDisplay && 
    !isCollapsed && 
    (isTopLevel || (isSubmenu && item.shortcut && item.shortcut.length > 1));

  /**
   * Get contextual shortcut display
   */
  const getShortcutDisplay = (): string => {
    if (!shortcutDisplay) return '';
    
    if (isSubmenu && item.shortcut && item.shortcut.length > 1) {
      // For sub-items, show just the second number
      return item.shortcut[item.shortcut.length - 1].toString();
    }
    
    return shortcutDisplay;
  };

  /**
   * Get accessibility label for the item
   */
  const getAriaLabel = (): string => {
    if (shouldShowShortcut) {
      return `${item.label} - Atajo: ${getShortcutDisplay()}`;
    }
    return item.label;
  };
  
  return (
    <>
      <Link
        to={item.path}
        className={getItemClasses()}
        onClick={handleToggleChildren}
        aria-current={isCurrentlyActive ? 'page' : undefined}
        aria-label={getAriaLabel()}
        title={item.description}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Icon */}
        <div className="nav-icon flex items-center justify-center">
          <IconComponent className="w-full h-full" />
        </div>
        
        {/* Label and content */}
        {!isCollapsed && (
          <div className="flex-1 min-w-0 flex items-center justify-between">
            <span className="font-medium text-sm truncate">
              {item.label}
            </span>
            
            {/* Enhanced shortcut hint for hierarchy */}
            {shouldShowShortcut && (
              <span className={`nav-shortcut-hint ml-2 ${
                isSubmenu ? 'text-xs bg-white/5' : ''
              }`}>
                {getShortcutDisplay()}
              </span>
            )}
            
            {/* Expand/collapse indicator for parent items */}
            {hasChildren && (
              <ChevronRight 
                className={`w-4 h-4 ml-2 transition-transform duration-200 ${
                  isExpanded ? 'rotate-90' : ''
                }`}
              />
            )}
          </div>
        )}
        
        {/* Tooltip for collapsed state or submenu shortcuts */}
        {(isCollapsed || (isSubmenu && shortcutDisplay && showTooltip)) && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
            {item.label}
            {shortcutDisplay && ` (${shortcutDisplay})`}
          </div>
        )}
      </Link>
      
      {/* Child items */}
      {hasChildren && isExpanded && !isCollapsed && (
        <div className="space-y-1">
          {item.children!.map((child) => {
            const childActive = isActiveRoute(child.path);
            return (
              <SidebarNavigationItem
                key={child.id}
                item={child}
                isActive={childActive}
                isCollapsed={isCollapsed}
                level={level + 1}
                expandedItems={expandedItems}
                onItemExpansion={onItemExpansion}
                shortcutsAvailable={shortcutsAvailable}
                isActiveRoute={isActiveRoute}
              />
            );
          })}
        </div>
      )}
    </>
  );
}

/**
 * Main Sidebar Component
 * 
 * Features preserved from original:
 * - Professional dark green theme
 * - Category-based organization
 * - Hover states and active indicators
 * - UNA Hotel branding
 * 
 * Enhancements added:
 * - Config-driven navigation
 * - Keyboard shortcuts
 * - Command palette integration
 * - Accessibility improvements
 * - Collapsible sidebar support
 */
function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  
  // Hooks for enhanced functionality
  const shortcutState = useNavigationShortcuts();
  const commandPalette = useCommandPalette();
  const shortcutsAvailable = useShortcutsAvailable();
  
  // Get grouped navigation items from config
  const groupedItems = getNavigationByCategory();
  
  /**
   * Check if route is active (preserved from original logic)
   */
  const isActiveRoute = (path: string): boolean => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };
  
  /**
   * Toggle sidebar collapse
   */
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  /**
   * Handle item expansion with single-expansion logic
   */
  const handleItemExpansion = (itemPath: string, shouldExpand: boolean) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (shouldExpand) {
        // Close all others and open this one
        newSet.clear();
        newSet.add(itemPath);
      } else {
        newSet.delete(itemPath);
      }
      return newSet;
    });
  };

  return (
    <>
      {/* Main Sidebar */}
      <nav 
        className={`${isCollapsed ? 'w-20' : 'w-72'} h-screen fixed left-0 top-0 z-10 transition-all duration-300 flex flex-col`}
        style={{ backgroundColor: 'var(--color-darkGreen2)' }}
        aria-label="Navegación principal del sistema"
      >
        {/* Header UNA Hotel (preserved design) */}
        <div className="flex-shrink-0 p-6 border-b" style={{ borderColor: 'rgba(0,0,0,0.2)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" 
              style={{ backgroundColor: 'var(--color-sand)' }}
            >
              <Building2 className="w-6 h-6" style={{ color: 'var(--color-blackCustom)' }} />
            </div>
            
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-white">UNA Hotel</h1>
                <div 
                  className="text-xs font-medium tracking-wider uppercase" 
                  style={{ color: 'var(--color-sand)' }}
                >
                  Management System
                </div>
              </div>
            )}
            
            {/* Collapse toggle */}
            <button
              onClick={toggleCollapse}
              className="ml-auto p-2 rounded-lg text-white/60 hover:text-white hover:bg-black/10 transition-colors"
              aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            >
              <ChevronLeft className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          {!isCollapsed && (
            <div className="text-white/60 text-sm leading-relaxed">
              Sistema integral de gestión hotelera
            </div>
          )}
        </div>

        {/* Quick Actions Bar */}
        {!isCollapsed && shortcutsAvailable && (
          <div className="flex-shrink-0 px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <button
              onClick={commandPalette.toggle}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-black/10 transition-colors text-sm"
              aria-label="Abrir paleta de comandos (Alt+K)"
            >
              <Search className="w-4 h-4" />
              <span>Buscar... </span>
              <div className="ml-auto bg-black/20 px-2 py-1 rounded text-xs font-mono">
                ALT+K
              </div>
            </button>
            
            {/* Shortcut state indicator */}
            {shortcutState.isInSequence && (
              <div className="mt-2 px-3 py-2 rounded-lg bg-black/20 text-center">
                <div className="flex items-center justify-center gap-2 text-white/80">
                  <Keyboard className="w-4 h-4" />
                  <span className="text-sm">
                    Secuencia: {shortcutState.currentSequence.join('-')}
                  </span>
                </div>
                <div className="text-xs text-white/50 mt-1">
                  Presiona ESC para cancelar
                </div>
              </div>
            )}
          </div>
        )}

        {/* Scrollable Navigation Container */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden sidebar-scroll">
          {/* Navigation by categories (enhanced from original) */}
          <ul className="py-6 space-y-6 list-none">
            {Object.entries(NAVIGATION_CATEGORIES)
              .sort(([, a], [, b]) => a.order - b.order)
              .map(([category, categoryConfig]) => {
                const items = groupedItems[category as NavigationCategory] || [];
                if (items.length === 0) return null;
                
                return (
                  <li key={category} aria-labelledby={`category-${category}`}>
                    {/* Category label */}
                    {!isCollapsed && (
                      <div className="mb-3 px-4">
                        <h3 
                          id={`category-${category}`}
                          className="text-xs font-semibold text-white/50 uppercase tracking-wider"
                        >
                          {categoryConfig.label}
                        </h3>
                      </div>
                    )}
                    
                    {/* Category items */}
                    <ul className="space-y-1 list-none">
                      {items.map((item) => (
                        <li key={item.id}>
                          <SidebarNavigationItem
                            item={item}
                            isActive={isActiveRoute(item.path)}
                            isCollapsed={isCollapsed}
                            level={0}
                            expandedItems={expandedItems}
                            onItemExpansion={handleItemExpansion}
                            shortcutsAvailable={shortcutsAvailable}
                            isActiveRoute={isActiveRoute}
                          />
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
          </ul>
        </div>
        
        {/* Footer (preserved from original) */}
        {!isCollapsed && (
          <div className="flex-shrink-0 pt-6 pb-4 px-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="text-xs text-white/40 text-center">
              Universidad Nacional de Costa Rica
            </div>
            <div className="text-xs text-white/30 text-center mt-1">
              Sistema de Gestión Hotelera
            </div>
            
            {/* Shortcuts info with guide */}
            {shortcutsAvailable && (
              <div className="mt-3 space-y-2">
                <div className="text-xs text-white/30 text-center">
                  ALT+1-9 para navegación rápida
                </div>
                <div className="flex justify-center">
                  <ShortcutGuide className="text-xs" />
                </div>
              </div>
            )}
          </div>
        )}
      </nav>
      
      {/* Command Palette */}
      {commandPalette.isEnabled && (
        <CommandPalette
          open={commandPalette.open}
          onClose={commandPalette.close}
        />
      )}
    </>
  );
}

export default Sidebar;