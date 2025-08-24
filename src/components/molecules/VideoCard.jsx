import React, { useState } from "react";
import { formatDuration } from "@/utils/formatters";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";

const VideoCard = ({ video, progress, onClick }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  // Defensive programming - ensure video exists
  if (!video) {
    return null;
  }

  const isCompleted = progress?.completed || false;
  const watchedPercentage = progress ? (progress.watchedSeconds / (video.duration || 1)) * 100 : 0;

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const handleClick = () => {
    if (onClick && video) {
      onClick(video);
    }
  };

  // Fallback image for when original fails to load
  const fallbackImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTI1SDE4NVYxMzVIMTc1VjEyNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHA+CjxwYXRoIGQ9Ik0yMDAgMTAwVjIwMEwyNTAgMTUwTDIwMCAxMDBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=";

  return (
    <div 
      className="video-card group cursor-pointer"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="relative">
        {/* Loading placeholder */}
        {imageLoading && (
          <div className="w-full h-48 bg-gray-200 animate-pulse flex items-center justify-center">
            <ApperIcon name="Image" className="w-8 h-8 text-gray-400" />
          </div>
        )}
        
        {/* Main image */}
        <img 
          src={imageError ? fallbackImage : (video.thumbnail || fallbackImage)}
          alt={video.title || 'Video thumbnail'}
          className={`w-full h-48 object-cover transition-opacity duration-200 ${
            imageLoading ? 'opacity-0 absolute' : 'opacity-100'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />
        
        {/* Error state overlay */}
        {imageError && !imageLoading && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <ApperIcon name="ImageOff" className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Image unavailable</p>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-200" />
        
        {/* Duration Badge */}
        {video.duration && (
<div className="absolute bottom-3 right-3">
            <Badge className="bg-black/80 text-white text-xs px-2 py-1">
              {formatDuration(video.duration)}
            </Badge>
          </div>
        )}
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