import { useState } from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ProgressRing from "@/components/molecules/ProgressRing";
import ApperIcon from "@/components/ApperIcon";
import { formatDuration } from "@/utils/formatters";

const CourseSidebar = ({ 
  module, 
  videos, 
  currentVideo, 
  progress, 
  onVideoSelect,
  className = ""
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const completedVideos = videos.filter(video => 
    progress[video.Id]?.completed
  ).length;
  const moduleProgress = (completedVideos / videos.length) * 100;

  const getVideoProgress = (video) => {
    const videoProgress = progress[video.Id];
    if (!videoProgress) return 0;
    return (videoProgress.watchedSeconds / video.duration) * 100;
  };

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Module Header */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-secondary-800">{module.name}</h3>
          <Button
            variant="ghost"
            size="small"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 lg:hidden"
          >
            <ApperIcon 
              name={isCollapsed ? "ChevronDown" : "ChevronUp"} 
              className="w-4 h-4" 
            />
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <div>{completedVideos} of {videos.length} completed</div>
            <div className="flex items-center gap-1 mt-1">
              <ApperIcon name="Clock" className="w-3 h-3" />
              <span>{formatDuration(module.estimatedTime)}</span>
            </div>
          </div>
          
          <ProgressRing 
            progress={moduleProgress}
            size={40}
            strokeWidth={3}
          />
        </div>
      </Card>

      {/* Video List */}
      <Card className={`flex-1 overflow-hidden ${isCollapsed ? "lg:block hidden" : ""}`}>
        <div className="p-4 border-b border-gray-100">
          <h4 className="font-medium text-secondary-800 flex items-center gap-2">
            <ApperIcon name="PlayCircle" className="w-4 h-4 text-primary-500" />
            Course Videos
          </h4>
        </div>
        
        <div className="custom-scrollbar overflow-y-auto max-h-[calc(100vh-300px)]">
          {videos.map((video, index) => {
            const isActive = currentVideo?.Id === video.Id;
            const isCompleted = progress[video.Id]?.completed || false;
            const videoProgress = getVideoProgress(video);
            
            return (
              <button
                key={video.Id}
                onClick={() => onVideoSelect(video)}
                className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-50 transition-colors duration-200 ${
                  isActive ? "bg-primary-50 border-primary-100" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Video Number/Status */}
                  <div className="flex-shrink-0 mt-0.5">
                    {isCompleted ? (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <ApperIcon name="Check" className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium ${
                        isActive 
                          ? "border-primary-500 bg-primary-500 text-white" 
                          : "border-gray-300 text-gray-500"
                      }`}>
                        {index + 1}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h5 className={`font-medium text-sm line-clamp-2 ${
                      isActive ? "text-primary-700" : "text-secondary-800"
                    }`}>
                      {video.title}
                    </h5>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <ApperIcon name="Clock" className="w-3 h-3" />
                        {formatDuration(video.duration)}
                      </span>
                      
                      {videoProgress > 0 && !isCompleted && (
                        <Badge variant="primary" className="text-xs">
                          {Math.round(videoProgress)}%
                        </Badge>
                      )}
                      
                      {isCompleted && (
                        <Badge variant="success" className="text-xs">
                          Done
                        </Badge>
                      )}
                    </div>
                    
                    {/* Progress Bar */}
                    {videoProgress > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                        <div 
                          className="bg-primary-500 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(videoProgress, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default CourseSidebar;