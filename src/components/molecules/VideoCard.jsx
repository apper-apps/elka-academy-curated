import { formatDuration } from "@/utils/formatters";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";

const VideoCard = ({ video, progress, onClick }) => {
  const isCompleted = progress?.completed || false;
  const watchedPercentage = progress ? (progress.watchedSeconds / video.duration) * 100 : 0;

  return (
    <div 
      className="video-card group cursor-pointer"
      onClick={() => onClick(video)}
    >
      <div className="relative">
        <img 
          src={video.thumbnail} 
          alt={video.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-200" />
        
        {/* Duration Badge */}
        <div className="absolute bottom-3 right-3">
          <Badge className="bg-black/80 text-white text-xs px-2 py-1">
            {formatDuration(video.duration)}
          </Badge>
        </div>

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
            <ApperIcon name="Play" className="w-8 h-8 text-white fill-current" />
          </div>
        </div>

        {/* Completion Indicator */}
        {isCompleted && (
          <div className="absolute top-3 left-3">
            <div className="bg-green-500 rounded-full p-1">
              <ApperIcon name="Check" className="w-4 h-4 text-white" />
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {watchedPercentage > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/20 p-2">
            <div className="w-full bg-gray-200/30 rounded-full h-1">
              <div 
                className="bg-primary-500 h-1 rounded-full transition-all duration-300 progress-fill"
                style={{ width: `${Math.min(watchedPercentage, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-secondary-800 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2">
          {video.title}
        </h3>
        
        {video.description && (
          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
            {video.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ApperIcon name="Clock" className="w-4 h-4" />
            <span>{formatDuration(video.duration)}</span>
          </div>
          
          {progress && (
            <div className="text-sm text-primary-600 font-medium">
              {isCompleted ? "Completed" : `${Math.round(watchedPercentage)}%`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;