import React from 'react';
import { Clock, AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { formatTimestamp } from '../../utils/dateUtils';

interface NotificationCardProps {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  createdAt: string;
  isRead?: boolean;
  onMarkAsRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  id,
  type,
  title,
  message,
  createdAt,
  isRead = false,
  onMarkAsRead,
  onDismiss,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-warning" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-error" />;
      default:
        return <Info className="w-4 h-4 text-info" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-l-success';
      case 'warning':
        return 'border-l-warning';
      case 'error':
        return 'border-l-error';
      default:
        return 'border-l-info';
    }
  };

  const handleClick = () => {
    if (!isRead && onMarkAsRead) {
      onMarkAsRead(id);
    }
  };

  return (
    <div
      className={`relative ${
        !isRead
          ? `border-l-4 ${getBorderColor()}`
          : 'border-l-4 border-l-transparent'
      } ${
        !isRead ? 'bg-base-100' : 'bg-base-200/30'
      } hover:bg-base-200/50 transition-colors cursor-pointer group`}
      onClick={handleClick}
    >
      {onDismiss && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(id);
          }}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity btn btn-ghost btn-xs p-1"
        >
          <X className="w-3 h-3" />
        </button>
      )}

      <div className="p-3 pr-8">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h4
                className={`text-sm font-medium ${
                  isRead ? 'text-base-content/70' : 'text-base-content'
                } leading-tight`}
              >
                {title}
              </h4>
            </div>

            <p
              className={`text-xs mt-1 ${
                isRead ? 'text-base-content/50' : 'text-base-content/70'
              } leading-relaxed`}
            >
              {message}
            </p>

            <div className="flex items-center mt-2 text-xs text-base-content/40">
              <Clock className="w-3 h-3 mr-1" />
              {formatTimestamp(createdAt)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
