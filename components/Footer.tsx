import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-900/50 border-t border-sky-400/20 mt-auto z-20">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} SMART C. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
