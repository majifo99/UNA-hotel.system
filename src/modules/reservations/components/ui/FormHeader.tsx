import React from 'react';

interface FormHeaderProps {
  title: string;
  subtitle: string;
  badge?: string;
}

export const FormHeader: React.FC<FormHeaderProps> = ({
  title,
  subtitle,
  badge
}) => {
  return (
    <div className="border-b border-una-bg-300 pb-6 mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-una-primary-900 tracking-tight">
            {title}
          </h1>
          <p className="text-una-primary-600 mt-2 text-lg">
            {subtitle}
          </p>
        </div>
        {badge && (
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-una-accent-gold text-una-primary-900">
              {badge}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
