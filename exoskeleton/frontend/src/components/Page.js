import React from 'react';

// Simple page wrapper to apply consistent padding and a fade-in animation
export default function Page({ children, ...props }) {
  return (
    <div className="page fade-in-up" {...props}>
      {children}
    </div>
  );
}
