import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface AlertProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onDismiss?: () => void;
  autoDismiss?: boolean;
  timeout?: number;
}

export default function Alert({ message, type, onDismiss }: AlertProps) {
  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-200 text-green-800',
          icon: CheckCircle,
          iconColor: 'text-green-600',
        };
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 text-red-800',
          icon: AlertCircle,
          iconColor: 'text-red-600',
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          icon: AlertTriangle,
          iconColor: 'text-yellow-600',
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: Info,
          iconColor: 'text-blue-600',
        };
      default:
        return {
          container: 'bg-gray-50 border-gray-200 text-gray-800',
          icon: Info,
          iconColor: 'text-gray-600',
        };
    }
  };

  const styles = getAlertStyles();
  const Icon = styles.icon;

  return (
    <div className={`border rounded-lg px-4 py-3 flex items-start space-x-3 ${styles.container}`}>
      <Icon className={`h-5 w-5 mt-0.5 ${styles.iconColor}`} />
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={`flex-shrink-0 ${styles.iconColor} hover:opacity-75 transition-opacity`}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
