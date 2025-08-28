import React from 'react';

const Background: React.FC = () => {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-gradient-to-br from-base-100 via-base-200 to-base-100"></div>
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(var(--color-grid-lines) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-grid-lines) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      ></div>
    </div>
  );
};

export default Background;
