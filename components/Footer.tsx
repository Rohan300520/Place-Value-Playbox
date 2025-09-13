import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-auto z-20" style={{
        backgroundColor: 'var(--panel-bg)',
        borderTop: '1px solid var(--border-primary)',
    }}>
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm" style={{ color: 'var(--text-secondary)'}}>
          &copy; {new Date().getFullYear()} SMART C. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
