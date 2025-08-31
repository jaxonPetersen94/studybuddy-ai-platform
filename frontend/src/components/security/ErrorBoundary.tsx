import React from 'react';

interface ErrorPageProps {
  statusCode?: number;
  title?: string;
  message?: string;
  showGoBack?: boolean;
}

const ErrorPage: React.FC<ErrorPageProps> = ({
  statusCode = 404,
  title,
  message,
  showGoBack = true,
}) => {
  const handleGoBack = () => {
    window.history.back();
  };

  const getDefaultContent = (code: number) => {
    switch (code) {
      case 404:
        return {
          title: title || '404',
          message: message || 'Page not found',
        };
      case 403:
        return {
          title: title || '403',
          message: message || 'Access forbidden',
        };
      case 500:
        return {
          title: title || '500',
          message: message || 'Internal server error',
        };
      default:
        return {
          title: title || `${code}`,
          message: message || 'Something went wrong',
        };
    }
  };

  const { title: displayTitle, message: displayMessage } =
    getDefaultContent(statusCode);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{displayTitle}</h1>
        <p className="text-base-content/60 mb-4">{displayMessage}</p>
        {showGoBack && (
          <button onClick={handleGoBack} className="btn btn-primary">
            Go Back
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorPage;
