/**
 * Navigation Shortcuts Hook
 * 
 * Provides keyboard shortcut navigation functionality for the UNA Hotel System.
 * Uses react-hotkeys-hook for reliable key sequence handling.
 * 
 * Features:
 * - Sequential numeric shortcuts (Alt+1, Alt+1-2, etc.)
 * - Feature flag support for enabling/disabling shortcuts
 * - Conflict prevention with browser shortcuts
 * - Visual feedback for shortcut states
 * - Accessibility compliance
 */

import { useEffect, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useHotkeys } from 'react-hotkeys-hook';
import { 
  getAllShortcuts, 
  findNavigationItemByShortcut,
  type NavigationItem 
} from '../router/navigation.config';

/**
 * Configuration for shortcut behavior
 */
interface ShortcutConfig {
  /** Enable/disable shortcuts globally */
  enabled: boolean;
  /** Maximum time between keystrokes in a sequence (ms) */
  sequenceTimeout: number;
  /** Show visual feedback for shortcuts */
  showFeedback: boolean;
  /** Key modifier (alt, ctrl, cmd) */
  modifier: 'alt' | 'ctrl' | 'cmd';
}

/**
 * Shortcut state for UI feedback
 */
interface ShortcutState {
  /** Current sequence being typed */
  currentSequence: number[];
  /** Whether currently in a sequence */
  isInSequence: boolean;
  /** Last matched navigation item */
  lastMatch: NavigationItem | null;
  /** Available shortcuts for current context */
  availableShortcuts: Array<{ item: NavigationItem; sequence: number[] }>;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: ShortcutConfig = {
  enabled: true,
  sequenceTimeout: 2000, // 2 seconds
  showFeedback: true,
  modifier: 'alt',
};

/**
 * Feature flag checking utility
 */
function useFeatureFlag(flag: string): boolean {
  // In a real implementation, this would check your feature flag system
  // For now, we'll use environment variables or localStorage
  const envValue = import.meta.env[`VITE_${flag.toUpperCase().replace(/\./g, '_')}`];
  if (envValue !== undefined) {
    return envValue === 'true';
  }
  
  // Check localStorage for development
  const stored = localStorage.getItem(`feature.${flag}`);
  return stored === 'true' || stored === null; // Default to enabled
}

/**
 * Main navigation shortcuts hook
 */
export function useNavigationShortcuts(config: Partial<ShortcutConfig> = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Feature flag check
  const shortcutsEnabled = useFeatureFlag('navigation.shortcuts.enabled');
  const isEnabled = shortcutsEnabled && finalConfig.enabled;
  
  // Shortcut state
  const [state, setState] = useState<ShortcutState>({
    currentSequence: [],
    isInSequence: false,
    lastMatch: null,
    availableShortcuts: getAllShortcuts(),
  });
  
  // Sequence timeout
  const [sequenceTimer, setSequenceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  
  /**
   * Clear current sequence and reset state
   */
  const clearSequence = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentSequence: [],
      isInSequence: false,
      lastMatch: null,
    }));
    
    if (sequenceTimer) {
      clearTimeout(sequenceTimer);
      setSequenceTimer(null);
    }
  }, [sequenceTimer]);
  
  /**
   * Helper function to handle successful navigation match
   */
  const handleNavigationMatch = useCallback((match: NavigationItem) => {
    navigate(match.path);
    clearSequence();
    return {
      currentSequence: [],
      isInSequence: false,
      lastMatch: match,
      availableShortcuts: []
    };
  }, [navigate, clearSequence]);

  /**
   * Helper function to check for potential sequence matches
   */
  const checkPotentialMatches = useCallback((newSequence: number[], availableShortcuts: Array<{ item: NavigationItem; sequence: number[] }>) => {
    return availableShortcuts.filter(({ sequence }) =>
      sequence.length > newSequence.length &&
      sequence.slice(0, newSequence.length).every((num, i) => num === newSequence[i])
    );
  }, []);

  /**
   * Helper function to handle sequence timeout
   */
  const handleSequenceTimeout = useCallback(() => {
    const newTimer = setTimeout(() => {
      clearSequence();
    }, finalConfig.sequenceTimeout);
    setSequenceTimer(newTimer);
  }, [clearSequence, finalConfig.sequenceTimeout]);

  /**
   * Handle numeric key press in sequence
   */
  const handleSequenceKey = useCallback((digit: number) => {
    if (!isEnabled) return;
    
    setState(prev => {
      const newSequence = [...prev.currentSequence, digit];
      const match = findNavigationItemByShortcut(newSequence);
      
      // Clear any existing timer
      if (sequenceTimer) {
        clearTimeout(sequenceTimer);
      }
      
      // Set new timer for sequence timeout
      handleSequenceTimeout();
      
      // If we found a match, navigate immediately
      if (match) {
        return {
          ...prev,
          ...handleNavigationMatch(match)
        };
      }
      
      // Check if this could be the start of a longer sequence
      const potentialMatches = checkPotentialMatches(newSequence, prev.availableShortcuts);
      
      if (potentialMatches.length === 0) {
        // No potential matches, clear sequence
        clearSequence();
        return prev;
      }
      
      return {
        ...prev,
        currentSequence: newSequence,
        isInSequence: true,
        lastMatch: null,
      };
    });
  }, [isEnabled, handleNavigationMatch, checkPotentialMatches, handleSequenceTimeout, sequenceTimer, clearSequence]);
  
  /**
   * Register hotkeys for numeric shortcuts
   */
  // Register hotkeys for ALT+1 through ALT+9 (individual hooks to avoid nesting)
  useHotkeys('alt+1', () => handleSequenceKey(1), { enabled: isEnabled, preventDefault: true }, [handleSequenceKey]);
  useHotkeys('alt+2', () => handleSequenceKey(2), { enabled: isEnabled, preventDefault: true }, [handleSequenceKey]);
  useHotkeys('alt+3', () => handleSequenceKey(3), { enabled: isEnabled, preventDefault: true }, [handleSequenceKey]);
  useHotkeys('alt+4', () => handleSequenceKey(4), { enabled: isEnabled, preventDefault: true }, [handleSequenceKey]);
  useHotkeys(
    'alt+5',
    () => handleSequenceKey(5),
    { enabled: isEnabled, preventDefault: true },
    [handleSequenceKey]
  );
  
  useHotkeys(
    'alt+6',
    () => handleSequenceKey(6),
    { enabled: isEnabled, preventDefault: true },
    [handleSequenceKey]
  );
  
  useHotkeys(
    'alt+7',
    () => handleSequenceKey(7),
    { enabled: isEnabled, preventDefault: true },
    [handleSequenceKey]
  );
  
  useHotkeys(
    'alt+8',
    () => handleSequenceKey(8),
    { enabled: isEnabled, preventDefault: true },
    [handleSequenceKey]
  );
  
  useHotkeys(
    'alt+9',
    () => handleSequenceKey(9),
    { enabled: isEnabled, preventDefault: true },
    [handleSequenceKey]
  );
  
  useHotkeys(
    'alt+0',
    () => handleSequenceKey(0),
    { enabled: isEnabled, preventDefault: true },
    [handleSequenceKey]
  );
  
  // Handle subsequent keys in sequence (1-9 without modifier)
  useHotkeys(
    '1',
    () => state.isInSequence && handleSequenceKey(1),
    { enabled: isEnabled && state.isInSequence, preventDefault: true },
    [handleSequenceKey, state.isInSequence]
  );
  
  useHotkeys(
    '2',
    () => state.isInSequence && handleSequenceKey(2),
    { enabled: isEnabled && state.isInSequence, preventDefault: true },
    [handleSequenceKey, state.isInSequence]
  );
  
  useHotkeys(
    '3',
    () => state.isInSequence && handleSequenceKey(3),
    { enabled: isEnabled && state.isInSequence, preventDefault: true },
    [handleSequenceKey, state.isInSequence]
  );
  
  useHotkeys(
    '4',
    () => state.isInSequence && handleSequenceKey(4),
    { enabled: isEnabled && state.isInSequence, preventDefault: true },
    [handleSequenceKey, state.isInSequence]
  );
  
  useHotkeys(
    '5',
    () => state.isInSequence && handleSequenceKey(5),
    { enabled: isEnabled && state.isInSequence, preventDefault: true },
    [handleSequenceKey, state.isInSequence]
  );
  
  useHotkeys(
    '6',
    () => state.isInSequence && handleSequenceKey(6),
    { enabled: isEnabled && state.isInSequence, preventDefault: true },
    [handleSequenceKey, state.isInSequence]
  );
  
  useHotkeys(
    '7',
    () => state.isInSequence && handleSequenceKey(7),
    { enabled: isEnabled && state.isInSequence, preventDefault: true },
    [handleSequenceKey, state.isInSequence]
  );
  
  useHotkeys(
    '8',
    () => state.isInSequence && handleSequenceKey(8),
    { enabled: isEnabled && state.isInSequence, preventDefault: true },
    [handleSequenceKey, state.isInSequence]
  );
  
  useHotkeys(
    '9',
    () => state.isInSequence && handleSequenceKey(9),
    { enabled: isEnabled && state.isInSequence, preventDefault: true },
    [handleSequenceKey, state.isInSequence]
  );
  
  // Escape key to cancel sequence
  useHotkeys(
    'escape',
    clearSequence,
    { enabled: isEnabled && state.isInSequence },
    [clearSequence, state.isInSequence]
  );
  
  // Clear sequence when location changes
  useEffect(() => {
    clearSequence();
  }, [location.pathname, clearSequence]);
  
  return {
    ...state,
    isEnabled,
    clearSequence,
    config: finalConfig,
  };
}

/**
 * Utility hook for checking if shortcuts are available
 */
export function useShortcutsAvailable(): boolean {
  return useFeatureFlag('navigation.shortcuts.enabled');
}

/**
 * Utility hook to get shortcut display string
 */
export function useShortcutDisplay(sequence: number[]): string {
  const config = { modifier: 'alt' as const };
  
  if (sequence.length === 0) return '';
  if (sequence.length === 1) return `${config.modifier.toUpperCase()}+${sequence[0]}`;
  
  return `${config.modifier.toUpperCase()}+${sequence[0]} → ${sequence.slice(1).join('-')}`;
}
