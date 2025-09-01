/**
 * Main Types Index - UNA Hotel System
 * 
 * Central export point for all application types.
 * This file has been refactored to use the new modular structure.
 * 
 * Import from here to ensure you're using the latest consolidated types.
 * 
 * New structure:
 * - /core/ - Core business entities and shared types
 * - /shared/ - Utility types and common interfaces
 * - /modules/ - Module-specific types should be imported directly from their modules
 */

// =================== CORE TYPES ===================
export * from './core';

// =================== SHARED UTILITIES ===================
export * from './shared/utility';
