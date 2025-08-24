import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Error = ({ 
  title = "Something went wrong", 
  message = "We encountered an error while loading the content.", 
  onRetry,
  showRetry = true 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-red-100 p-4 rounded-full mb-6">
        <ApperIcon name="AlertTriangle" className="w-12 h-12 text-red-600" />
      </div>
      
      <div className="text-center max-w-md">
        <h3 className="font-semibold text-xl text-secondary-800 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        
        {showRetry && onRetry && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={onRetry} className="flex items-center gap-2">
              <ApperIcon name="RefreshCw" className="w-4 h-4" />
              Try Again
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <ApperIcon name="RotateCcw" className="w-4 h-4" />
              Refresh Page
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Error;