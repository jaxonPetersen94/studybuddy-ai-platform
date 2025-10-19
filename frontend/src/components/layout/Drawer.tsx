import React from 'react';
import { X, Sidebar } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  children: React.ReactNode;
  headerHeight?: number;
  title?: string;
}

const Drawer = ({
  isOpen,
  onClose,
  onOpen,
  children,
  headerHeight = 69,
  title = 'Menu',
}: DrawerProps) => {
  return (
    <>
      {/* Drawer */}
      <div className="drawer z-100">
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

          <div className="flex flex-col relative h-full w-[18rem] bg-gradient-to-b from-base-100 via-base-100 to-base-200/80 shadow-2xl overflow-hidden">
            {/* Decorative gradient accent */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 flex justify-between items-center h-[69px] px-4 border-b border-base-300/40 bg-base-200/30 backdrop-blur-sm">
              <div className="flex-1">
                <h2 className="text-base font-bold text-base-content tracking-tight font-mono">
                  {title}
                </h2>
                <p className="text-base-content/50 text-xs font-mono leading-tight">
                  // NAVIGATION
                </p>
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="w-8 h-8 bg-primary/10 hover:bg-primary/15 border border-primary/20 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-95 flex-shrink-0"
                aria-label="Close menu"
              >
                <X size={18} className="text-primary" />
              </button>
            </div>

            {/* Drawer content */}
            <div className="flex-1 overflow-y-auto relative z-10 [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.1)_transparent]">
              {children}
            </div>

            {/* Bottom accent */}
            <div className="relative z-10 h-px bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 mt-auto" />
          </div>
        </div>
      </div>

      {/* Persistent open button */}
      <button
        onClick={onOpen}
        className="fixed z-40 w-8 h-8 bg-primary/10 hover:bg-primary/15 border border-primary/20 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-95 group"
        style={{
          top: `${headerHeight + 25}px`,
          left: '17px',
          opacity: isOpen ? 0 : 1,
          pointerEvents: isOpen ? 'none' : 'auto',
          transition: 'opacity 300ms ease-in-out',
        }}
        aria-label="Open drawer"
      >
        <Sidebar className="w-5 h-5 text-primary transition-transform group-hover:scale-110" />
      </button>
    </>
  );
};

export default Drawer;
