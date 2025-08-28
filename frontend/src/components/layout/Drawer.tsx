import React from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Drawer = ({ isOpen, onClose, children }: DrawerProps) => {
  return (
    <div className="drawer-end z-50">
      <input
        type="checkbox"
        className="drawer-toggle"
        checked={isOpen}
        readOnly
      />

      <div className="drawer-side">
        <button
          onClick={onClose}
          className="drawer-overlay"
          aria-label="close sidebar"
        ></button>

        <div className="bg-base-100 w-64 h-full shadow-lg">
          <div className="flex flex-col h-full">
            {/* Close button */}
            <div className="flex justify-end p-4">
              <button
                onClick={onClose}
                className="btn btn-ghost btn-sm"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* Drawer content */}
            <div className="flex-1 p-4 overflow-y-auto">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Drawer;
