import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import ProgressRing from "@/components/molecules/ProgressRing";
import ApperIcon from "@/components/ApperIcon";
import { formatDuration } from "@/utils/formatters";

const ModuleCard = ({ module, progress, onClick }) => {
  const completedVideos = progress?.completedVideos || 0;
  const progressPercentage = (completedVideos / module.totalVideos) * 100;

  return (
    <Card 
      className="p-6 cursor-pointer group hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
      onClick={() => onClick(module)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-secondary-800 group-hover:text-primary-600 transition-colors">
            {module.name}
          </h3>
          {module.description && (
            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
              {module.description}
            </p>
          )}
        </div>
        
        <ProgressRing 
          progress={progressPercentage}
          size={50}
          strokeWidth={3}
          className="ml-4"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <ApperIcon name="PlayCircle" className="w-4 h-4" />
            <span>{module.totalVideos} videos</span>
          </div>
          
          <div className="flex items-center gap-1">
            <ApperIcon name="Clock" className="w-4 h-4" />
            <span>{formatDuration(module.estimatedTime)}</span>
          </div>
        </div>

        <Badge 
          variant={progressPercentage === 100 ? "success" : progressPercentage > 0 ? "primary" : "default"}
        >
          {progressPercentage === 100 ? "Completed" : `${completedVideos}/${module.totalVideos}`}
        </Badge>
      </div>
    </Card>
  );
};

export default ModuleCard;