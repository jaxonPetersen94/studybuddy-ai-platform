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
  headerHeight = 60,
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
          top: `${headerHeight + 4}px`,
          height: `calc(100vh - ${headerHeight}px)`,
          width: `${width}rem`,
          clipPath: sidebarOpen ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)',
          transition: hasInteracted ? 'clip-path 500ms ease-in-out' : 'none',
        }}
      >
        <div className="h-full flex flex-col bg-base-100 border-r border-base-300 overflow-hidden">
          <div className="flex items-center p-4 border-b border-base-300">
            {/* Toggle button to close sidebar */}
            <button
              onClick={handleToggle}
              className="btn btn-ghost mr-3 p-1 h-auto"
              aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              <Sidebar size={24} />
            </button>
            <h2 className="font-medium">{title}</h2>
          </div>
          <div className="mb-1 overflow-y-auto flex-1">{children}</div>
        </div>
      </div>

      {/* Toggle button to re-open sidebar */}
      {!sidebarOpen && (
        <div
          className="fixed z-10"
          style={{
            top: `${headerHeight + 20}px`,
            left: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={handleToggle}
            className="btn btn-ghost p-1 h-auto"
            aria-label="Open sidebar"
          >
            <Sidebar size={24} />
          </button>
        </div>
      )}
    </>
  );
};

export default SidebarComponent;
