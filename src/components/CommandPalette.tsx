/**
 * Command Palette Component
 * 
 * A modern command palette for quick navigation and actions in the UNA Hotel System.
 * Provides fuzzy search, keyboard navigation, and discoverable shortcuts.
 * 
 * Features:
 * - Fuzzy search for navigation items
 * - Keyboard shortcuts display
 * - Recent actions history
 * - Grouped results by category
 * - Accessibility compliant
 * - Modern design aligned with UNA theme
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHotkeys } from 'react-hotkeys-hook';
import { Search } from 'lucide-react';
import {
  getAllNavigationItems,
  NAVIGATION_CATEGORIES,
  type NavigationItem,
  type NavigationCategory,
} from '../router/navigation.config';
import { useShortcutDisplay } from '../hooks/useNavigationShortcuts';

/**
 * Props for the CommandPalette component
 */
interface CommandPaletteProps {
  /** Whether the command palette is open */
  open: boolean;
  /** Callback when the command palette should close */
  onClose: () => void;
}

/**
 * Props for individual command items
 */
interface CommandItemProps {
  item: NavigationItem;
  onSelect: () => void;
  isSelected?: boolean;
}

/**
 * Individual command item component
 */
function NavigationCommandItem({ item, onSelect, isSelected = false }: CommandItemProps) {
  const shortcutDisplay = useShortcutDisplay(item.shortcut || []);
  const IconComponent = item.icon;

  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors duration-200 mx-1 text-left group ${
        isSelected 
          ? 'bg-white/10 shadow-sm' 
          : 'hover:bg-white/5'
      }`}
    >
      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-white/8 group-hover:bg-white/12 transition-colors">
        <IconComponent className="w-3.5 h-3.5 text-white/80" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-white font-medium text-sm truncate">
          {item.label}
        </div>
        <div className="text-white/40 text-xs truncate">
          {item.description}
        </div>
      </div>
      
      {shortcutDisplay && (
        <div className="text-white/30 text-xs font-mono bg-black/20 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          {shortcutDisplay}
        </div>
      )}
    </button>
  );
}

/**
 * Main CommandPalette component
 */
export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Get all navigation items
  const allItems = getAllNavigationItems();
  
  // Group items by category for better organization
  const groupedItems = React.useMemo(() => {
    const groups: Record<NavigationCategory, NavigationItem[]> = {};
    NAVIGATION_CATEGORIES.forEach(category => {
      groups[category] = [];
    });
    
    allItems.forEach(item => {
      groups[item.category].push(item);
    });
    
    return groups;
  }, [allItems]);
  
  /**
   * Handle item selection
   */
  const handleSelect = (item: NavigationItem) => {
    navigate(item.path);
    onClose();
    setQuery(''); // Clear search after navigation
  };
  
  /**
   * Handle escape key and click outside
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => {
            const allVisible = Object.values(groupedItems).flat().filter(item => 
              query === '' || 
              item.label.toLowerCase().includes(query.toLowerCase()) ||
              item.description.toLowerCase().includes(query.toLowerCase())
            );
            return Math.min(prev + 1, allVisible.length - 1);
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          const allVisible = Object.values(groupedItems).flat().filter(item => 
            query === '' || 
            item.label.toLowerCase().includes(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase())
          );
          if (allVisible[selectedIndex]) {
            handleSelect(allVisible[selectedIndex]);
          }
          break;
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, onClose, selectedIndex, query, groupedItems]);

  /**
   * Reset selected index when query changes
   */
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  /**
   * Clear search when dialog closes
   */
  useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  if (!open) return null;

  // Calculate total filtered items for empty state
  const totalFilteredItems = Object.values(groupedItems).reduce((total, items) => {
    const filtered = items.filter(item => 
      query === '' || 
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
    );
    return total + filtered.length;
  }, 0);

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 z-50 command-palette-overlay"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Command palette container */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
        <div 
          className="command-palette-content border rounded-lg overflow-hidden relative w-full max-w-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-3 py-2.5 border-b border-white/10">
            <Search className="w-4 h-4 text-white/60" />
            <input
              type="text"
              placeholder="Buscar..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-white/50 border-none outline-none text-sm"
              autoFocus
              onKeyDown={(e) => {
                // Prevent default behavior for navigation keys to handle them in the global handler
                if (['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
            />
            <div className="text-xs text-white/30 hidden sm:block">
              ESC
            </div>
          </div>
          
          {/* Results */}
          <div className="max-h-96 overflow-y-auto sidebar-scroll">
            {/* Empty state */}
            {query !== '' && totalFilteredItems === 0 && (
              <div className="py-6 text-center px-4">
                <div className="text-white/60 text-sm">
                  Sin resultados para "{query}"
                </div>
                <div className="text-white/40 text-xs mt-1">
                  Prueba otros términos
                </div>
              </div>
            )}
            
            {/* Navigation Groups - Only show relevant ones */}
            {Object.entries(groupedItems).map(([category, items]) => {
              const categoryConfig = NAVIGATION_CATEGORIES[category as NavigationCategory];
              const filteredItems = items.filter(item => 
                query === '' || 
                item.label.toLowerCase().includes(query.toLowerCase()) ||
                item.description.toLowerCase().includes(query.toLowerCase())
              );
              
              if (filteredItems.length === 0) return null;
              
              return (
                <div key={category} className="py-1">
                  {/* Only show category headers when there's a search or when there are multiple categories with results */}
                  {(query !== '' || totalFilteredItems > 6) && (
                    <div className="text-xs text-white/40 uppercase tracking-wide font-medium mb-1 px-3 pt-2">
                      {categoryConfig.label}
                    </div>
                  )}
                  
                  {filteredItems.slice(0, query ? 8 : 6).map((item, index) => {
                    // Calculate global index for keyboard navigation
                    const globalIndex = Object.entries(groupedItems)
                      .slice(0, Object.keys(groupedItems).indexOf(category))
                      .reduce((acc, [, catItems]) => {
                        const filtered = catItems.filter(catItem => 
                          query === '' || 
                          catItem.label.toLowerCase().includes(query.toLowerCase()) ||
                          catItem.description.toLowerCase().includes(query.toLowerCase())
                        );
                        return acc + Math.min(filtered.length, query ? 8 : 6);
                      }, 0) + index;

                    return (
                      <NavigationCommandItem
                        key={item.id}
                        item={item}
                        onSelect={() => handleSelect(item)}
                        isSelected={globalIndex === selectedIndex}
                      />
                    );
                  })}
                  
                  {/* Show "more results" hint if there are many results */}
                  {filteredItems.length > (query ? 8 : 6) && (
                    <div className="text-xs text-white/30 px-3 py-1">
                      +{filteredItems.length - (query ? 8 : 6)} más resultados...
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Quick help - only when empty search */}
            {query === '' && (
              <div className="border-t border-white/10 px-3 py-2 bg-black/10">
                <div className="flex items-center justify-between text-xs text-white/50">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <div className="bg-black/30 px-1.5 py-0.5 rounded font-mono text-xs">↑↓</div>
                      <span>navegar</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="bg-black/30 px-1.5 py-0.5 rounded font-mono text-xs">↵</div>
                      <span>seleccionar</span>
                    </div>
                  </div>
                  <div className="text-white/30">
                    ALT+1-9 → 1-4 navegación jerárquica
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Hook to manage command palette state
 */
export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  
  // Feature flag check
  const isEnabled = React.useMemo(() => {
    const envValue = import.meta.env.VITE_NAVIGATION_COMMAND_PALETTE_ENABLED;
    if (envValue !== undefined) {
      return envValue === 'true';
    }
    
    const stored = localStorage.getItem('feature.navigation.commandPalette.enabled');
    return stored === 'true' || stored === null; // Default to enabled
  }, []);
  
  // Keyboard shortcut to open command palette
  useHotkeys(
    'alt+k',
    () => setOpen(true),
    { enabled: isEnabled, preventDefault: true },
    [isEnabled]
  );
  
  // Also support Cmd+K on Mac
  useHotkeys(
    'cmd+k',
    () => setOpen(true),
    { enabled: isEnabled, preventDefault: true },
    [isEnabled]
  );
  
  const toggle = () => setOpen(!open);
  const close = () => setOpen(false);
  
  return {
    open,
    toggle,
    close,
    isEnabled,
  };
}
