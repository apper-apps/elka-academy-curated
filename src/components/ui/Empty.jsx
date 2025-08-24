import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  title = "No content found", 
  message = "It looks like there's nothing here yet.", 
  actionText = "Get Started",
  onAction,
  icon = "FileX"
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-gray-100 p-6 rounded-full mb-6">
        <ApperIcon name={icon} className="w-16 h-16 text-gray-400" />
      </div>
      
      <div className="text-center max-w-md">
        <h3 className="font-semibold text-xl text-secondary-800 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 mb-8">
          {message}
        </p>
        
        {onAction && (
          <Button onClick={onAction} className="flex items-center gap-2">
            <ApperIcon name="Plus" className="w-4 h-4" />
            {actionText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Empty;