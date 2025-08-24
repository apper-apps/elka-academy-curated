import { useState, useRef, useEffect } from "react";
import { formatDuration } from "@/utils/formatters";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const VideoPlayer = ({ video, onProgressUpdate, initialProgress = 0 }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialProgress);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      const time = videoElement.currentTime;
      setCurrentTime(time);
      onProgressUpdate(time);
    };

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
      if (initialProgress > 0) {
        videoElement.currentTime = initialProgress;
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onProgressUpdate(duration, true);
    };

    videoElement.addEventListener("timeupdate", handleTimeUpdate);
    videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
    videoElement.addEventListener("ended", handleEnded);

    return () => {
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
      videoElement.removeEventListener("ended", handleEnded);
    };
  }, [video, initialProgress, duration, onProgressUpdate]);

  const togglePlay = () => {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = percent * duration;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      videoRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const changePlaybackRate = (rate) => {
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const skip = (seconds) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative video-player group bg-black rounded-xl overflow-hidden shadow-xl">
      <video
        ref={videoRef}
        src={video.url}
        poster={video.thumbnail}
        className="w-full h-full object-contain"
        onMouseMove={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      />

      {/* Loading Overlay */}
      {!duration && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent"></div>
        </div>
      )}

      {/* Play/Pause Overlay */}
      <div 
        className="absolute inset-0 flex items-center justify-center cursor-pointer"
        onClick={togglePlay}
      >
        {!isPlaying && duration > 0 && (
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 hover:bg-white/30 transition-all duration-200">
            <ApperIcon name="Play" className="w-12 h-12 text-white fill-current" />
          </div>
        )}
      </div>

      {/* Controls */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 transition-opacity duration-200 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Progress Bar */}
        <div 
          className="w-full bg-white/20 rounded-full h-1 mb-4 cursor-pointer hover:h-1.5 transition-all duration-200"
          onClick={handleSeek}
        >
          <div 
            className="bg-primary-500 h-full rounded-full transition-all duration-200"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Play/Pause Button */}
            <Button
              variant="ghost"
              size="small"
              onClick={togglePlay}
              className="text-white hover:bg-white/20 p-2"
            >
              <ApperIcon name={isPlaying ? "Pause" : "Play"} className="w-5 h-5" />
            </Button>

            {/* Skip Buttons */}
            <Button
              variant="ghost"
              size="small"
              onClick={() => skip(-10)}
              className="text-white hover:bg-white/20 p-2"
            >
              <ApperIcon name="SkipBack" className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="small"
              onClick={() => skip(10)}
              className="text-white hover:bg-white/20 p-2"
            >
              <ApperIcon name="SkipForward" className="w-4 h-4" />
            </Button>

            {/* Time Display */}
            <span className="text-white text-sm font-mono">
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Playback Speed */}
            <select
              value={playbackRate}
              onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
              className="bg-white/20 text-white border border-white/30 rounded px-2 py-1 text-sm"
            >
              <option value={0.5}>0.5x</option>
              <option value={0.75}>0.75x</option>
              <option value={1}>1x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>

            {/* Fullscreen Button */}
            <Button
              variant="ghost"
              size="small"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20 p-2"
            >
              <ApperIcon name={isFullscreen ? "Minimize" : "Maximize"} className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;