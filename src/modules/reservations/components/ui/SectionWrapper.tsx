import React from 'react';

interface SectionWrapperProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({
  title,
  description,
  children
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white to-una-neutral-cream rounded-2xl shadow-lg border border-una-bg-300 mb-8">
      {/* Decorative header background */}
      <div className="relative bg-gradient-to-r from-una-primary-900 via-una-primary-800 to-una-primary-900 px-8 py-6">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-una-primary-600/20 to-transparent"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white mb-2">
            {title}
          </h2>
          <p className="text-una-bg-200 text-lg">
            {description}
          </p>
        </div>
        {/* Decorative corner element */}
        <div className="absolute top-4 right-4 w-8 h-8 border-2 border-una-accent-gold/30 rounded-lg rotate-45"></div>
      </div>
      
      {/* Content area with enhanced styling */}
      <div className="p-8 bg-white">
        {children}
      </div>
      
      {/* Subtle bottom accent */}
      <div className="h-1 bg-gradient-to-r from-una-accent-gold via-una-bg-400 to-una-accent-gold"></div>
    </div>
  );
};
