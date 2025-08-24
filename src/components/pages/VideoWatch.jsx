import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useVideos } from "@/hooks/useVideos";
import { useProgress } from "@/hooks/useProgress";
import VideoPlayer from "@/components/organisms/VideoPlayer";
import CourseSidebar from "@/components/organisms/CourseSidebar";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import moduleService from "@/services/api/moduleService";
import { formatDuration } from "@/utils/formatters";
import { toast } from "react-toastify";

const VideoWatch = () => {
  const { videoId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getVideoById, getVideosByModule } = useVideos();
  const { progress, updateVideoProgress } = useProgress();

  const [currentVideo, setCurrentVideo] = useState(null);
  const [module, setModule] = useState(null);
  const [moduleVideos, setModuleVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const moduleId = searchParams.get("module");

  // Load video and module data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        // Get current video
        const video = await getVideoById(parseInt(videoId));
        if (!video) {
          setError("Video not found");
          return;
        }
        setCurrentVideo(video);

        // Get module info and videos
        const targetModuleId = moduleId || video.moduleId;
        if (targetModuleId) {
          const [moduleData, videos] = await Promise.all([
            moduleService.getAll().then(modules => 
              modules.find(m => m.id === targetModuleId)
            ),
            getVideosByModule(targetModuleId)
          ]);

          if (moduleData) {
            setModule(moduleData);
            setModuleVideos(videos.sort((a, b) => a.order - b.order));
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      loadData();
    }
  }, [videoId, moduleId, getVideoById, getVideosByModule]);

  const handleProgressUpdate = async (watchedSeconds, completed = false) => {
    if (!currentVideo) return;

    try {
      // Auto-complete if watched 90% or more
      const watchPercentage = (watchedSeconds / currentVideo.duration) * 100;
      const shouldComplete = completed || watchPercentage >= 90;

      await updateVideoProgress(currentVideo.Id, watchedSeconds, shouldComplete);

      if (shouldComplete && !progress[currentVideo.Id]?.completed) {
        toast.success("Video completed! 🎉");
        
        // Auto-advance to next video after a delay
        setTimeout(() => {
          const currentIndex = moduleVideos.findIndex(v => v.Id === currentVideo.Id);
          if (currentIndex < moduleVideos.length - 1) {
            const nextVideo = moduleVideos[currentIndex + 1];
            if (!progress[nextVideo.Id]?.completed) {
              toast.info(`Starting next video: ${nextVideo.title}`);
              navigate(`/watch/${nextVideo.Id}${moduleId ? `?module=${moduleId}` : ""}`);
            }
          }
        }, 2000);
      }
    } catch (err) {
      console.error("Failed to update progress:", err);
    }
  };

  const handleVideoSelect = (video) => {
    navigate(`/watch/${video.Id}${moduleId ? `?module=${moduleId}` : ""}`);
  };

  const handleBackToModule = () => {
    if (moduleId) {
      navigate(`/courses/${moduleId}`);
    } else {
      navigate("/courses");
    }
  };

  const getNextVideo = () => {
    if (!moduleVideos.length || !currentVideo) return null;
    
    const currentIndex = moduleVideos.findIndex(v => v.Id === currentVideo.Id);
    return currentIndex < moduleVideos.length - 1 
      ? moduleVideos[currentIndex + 1] 
      : null;
  };

  const getPreviousVideo = () => {
    if (!moduleVideos.length || !currentVideo) return null;
    
    const currentIndex = moduleVideos.findIndex(v => v.Id === currentVideo.Id);
    return currentIndex > 0 
      ? moduleVideos[currentIndex - 1] 
      : null;
  };

  const nextVideo = getNextVideo();
  const previousVideo = getPreviousVideo();

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Error
        title="Failed to load video"
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!currentVideo) {
    return (
      <Error
        title="Video not found"
        message="The video you're looking for doesn't exist or has been removed."
        onRetry={handleBackToModule}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <button
            onClick={() => navigate("/courses")}
            className="hover:text-primary-600 transition-colors"
          >
            Courses
          </button>
          <ApperIcon name="ChevronRight" className="w-4 h-4" />
          {module && (
            <>
              <button
                onClick={handleBackToModule}
                className="hover:text-primary-600 transition-colors"
              >
                {module.name}
              </button>
              <ApperIcon name="ChevronRight" className="w-4 h-4" />
            </>
          )}
          <span className="text-secondary-800 truncate">{currentVideo.title}</span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-6">
            {/* Video Player */}
            <div className="aspect-video">
              <VideoPlayer
                video={currentVideo}
                onProgressUpdate={handleProgressUpdate}
                initialProgress={progress[currentVideo.Id]?.watchedSeconds || 0}
              />
            </div>

            {/* Video Info */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-display font-bold text-secondary-800">
                      {currentVideo.title}
                    </h1>
                    {progress[currentVideo.Id]?.completed && (
                      <Badge variant="success" className="flex items-center gap-1">
                        <ApperIcon name="Check" className="w-3 h-3" />
                        Completed
                      </Badge>
                    )}
                  </div>
                  
                  {currentVideo.description && (
                    <p className="text-gray-600 mb-4">
                      {currentVideo.description}
                    </p>
                  )}

                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <ApperIcon name="Clock" className="w-4 h-4" />
                      <span>{formatDuration(currentVideo.duration)}</span>
                    </div>
                    
                    {progress[currentVideo.Id] && (
                      <div className="flex items-center gap-1">
                        <ApperIcon name="Eye" className="w-4 h-4" />
                        <span>
                          {Math.round((progress[currentVideo.Id].watchedSeconds / currentVideo.duration) * 100)}% watched
                        </span>
                      </div>
                    )}

                    {currentVideo.tags && (
                      <div className="flex items-center gap-2">
                        {currentVideo.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="default" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <Button
                  variant={previousVideo ? "secondary" : "ghost"}
                  onClick={() => previousVideo && handleVideoSelect(previousVideo)}
                  disabled={!previousVideo}
                  className="flex items-center gap-2"
                >
                  <ApperIcon name="ChevronLeft" className="w-4 h-4" />
                  {previousVideo ? `Previous: ${previousVideo.title.substring(0, 30)}...` : "No previous video"}
                </Button>

                <Button
                  variant={nextVideo ? "primary" : "ghost"}
                  onClick={() => nextVideo && handleVideoSelect(nextVideo)}
                  disabled={!nextVideo}
                  className="flex items-center gap-2"
                >
                  {nextVideo ? `Next: ${nextVideo.title.substring(0, 30)}...` : "Course complete!"}
                  <ApperIcon name="ChevronRight" className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1">
            {module && moduleVideos.length > 0 ? (
              <CourseSidebar
                module={module}
                videos={moduleVideos}
                currentVideo={currentVideo}
                progress={progress}
                onVideoSelect={handleVideoSelect}
                className="sticky top-6"
              />
            ) : (
              <Card className="p-6 text-center">
                <ApperIcon name="Video" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-semibold text-secondary-800 mb-2">Standalone Video</h3>
                <p className="text-gray-600 text-sm mb-4">
                  This video is not part of a structured course module.
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate("/courses")}
                  className="flex items-center gap-2"
                >
                  <ApperIcon name="BookOpen" className="w-4 h-4" />
                  Browse Courses
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoWatch;