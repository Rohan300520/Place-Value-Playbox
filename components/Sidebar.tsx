import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModel: (model: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onSelectModel }) => {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <div
        className={`fixed top-0 left-0 h-full w-72 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sidebar-title"
        style={{ backgroundColor: 'var(--modal-bg)'}}
      >
        <div className="p-4 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-primary)'}}>
          <h2 id="sidebar-title" className="text-xl font-bold font-display" style={{ color: 'var(--text-primary)'}}>Math Models</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full"
            style={{ color: 'var(--text-secondary)'}}
            aria-label="Close sidebar"
          >
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="p-4">
          <ul>
            <li>
              <button
                onClick={() => {
                  onSelectModel('place-value-playbox');
                  onClose();
                }}
                className="w-full text-left px-4 py-3 rounded-lg text-lg hover:bg-orange-400 hover:text-white transition-colors font-display"
                style={{ color: 'var(--text-secondary)'}}
              >
                Place Value Playbox
              </button>
            </li>
            {/* Future models can be added here */}
          </ul>
        </nav>
      </div>
    </>
  );
};
