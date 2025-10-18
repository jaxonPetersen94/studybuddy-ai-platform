import React, { useState, useRef, useLayoutEffect, useCallback } from 'react';
import { Sidebar } from 'lucide-react';

interface SidebarProps {
  children: React.ReactNode;
  title?: string;
  isOpen?: boolean;
  onToggle?: () => void;
  width?: number;
  headerHeight?: number;
}

const SidebarComponent = ({
  children,
  title,
  isOpen = true,
  onToggle,
  width = 18,
  headerHeight = 69,
}: SidebarProps) => {
  const [internalOpen, setInternalOpen] = useState(isOpen);
  const [hasInteracted, setHasInteracted] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isControlled = typeof onToggle === 'function';
  const sidebarOpen = isControlled ? isOpen : internalOpen;

  const handleToggle = useCallback(() => {
    setHasInteracted(true);
    if (isControlled) {
      onToggle?.();
    } else {
      setInternalOpen((prev) => !prev);
    }
  }, [isControlled, onToggle]);

  useLayoutEffect(() => {
    const sidebar = sidebarRef.current;

    if (sidebar?.parentElement) {
      sidebar.parentElement.classList.add('has-sidebar-layout');

      const siblings = Array.from(sidebar.parentElement.children).filter(
        (node) => node !== sidebar,
      );

      siblings.forEach((sibling) => {
        const element = sibling as HTMLElement;
        if (element.dataset.sidebarButton === 'true') return;

        element.style.marginLeft = sidebarOpen ? `${width}rem` : '0';
        element.setAttribute(
          'data-sidebar-open',
          sidebarOpen ? 'true' : 'false',
        );
        element.style.transition = hasInteracted
          ? 'margin-left 500ms ease-in-out'
          : 'none';
      });
    }

    return () => {
      if (sidebar?.parentElement) {
        sidebar.parentElement.classList.remove('has-sidebar-layout');
      }
    };
  }, [sidebarOpen, width, hasInteracted]);

  return (
    <>
      {/* Main sidebar */}
      <div
        ref={sidebarRef}
        className="fixed left-0 z-10 h-full sidebar-component"
        style={{
          top: `${headerHeight + 8}px`,
          height: `calc(100vh - ${headerHeight + 8}px)`,
          width: `${width}rem`,
          clipPath: sidebarOpen ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)',
          transition: hasInteracted ? 'clip-path 500ms ease-in-out' : 'none',
        }}
      >
        <div className="h-full flex flex-col bg-base-200/60 backdrop-blur-lg border border-base-300/40 shadow-md rounded-box overflow-hidden">
          <div className="flex items-center px-4 py-3 border-b border-base-300/40">
            {/* Close button */}
            <button
              onClick={handleToggle}
              className="flex-shrink-0 w-8 h-8 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center mr-3 transition-opacity cursor-pointer"
              style={{
                opacity: sidebarOpen ? 1 : 0,
                pointerEvents: sidebarOpen ? 'auto' : 'none',
                transition: hasInteracted
                  ? 'opacity 300ms ease-in-out'
                  : 'none',
              }}
              aria-label="Close sidebar"
            >
              <Sidebar className="w-5 h-5 text-primary" />
            </button>

            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-base-content tracking-tight font-mono">
                {title || 'Sidebar'}
              </h2>
              <p className="text-base-content/50 text-xs font-mono leading-tight">
                // NAVIGATION
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>

      {/* Reopen button */}
      <button
        data-sidebar-button="true"
        onClick={handleToggle}
        className="fixed z-20 w-8 h-8 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
        style={{
          top: `${headerHeight + 25}px`,
          left: '17px',
          opacity: sidebarOpen ? 0 : 1,
          pointerEvents: sidebarOpen ? 'none' : 'auto',
          transition: hasInteracted ? 'opacity 300ms ease-in-out' : 'none',
        }}
        aria-label="Open sidebar"
      >
        <Sidebar className="w-5 h-5 text-primary" />
      </button>
    </>
  );
};

export default SidebarComponent;
