import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useVideos } from "@/hooks/useVideos";
import { useProgress } from "@/hooks/useProgress";
import VideoCard from "@/components/molecules/VideoCard";
import ProgressRing from "@/components/molecules/ProgressRing";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import moduleService from "@/services/api/moduleService";
import { formatDuration } from "@/utils/formatters";

const CourseDetail = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { videos: allVideos, loading: videosLoading, error: videosError } = useVideos();
  const { progress } = useProgress();
  
  const [module, setModule] = useState(null);
  const [moduleVideos, setModuleVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load module and filter videos
  useEffect(() => {
    const loadModule = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Find module by the string ID (not numeric Id)
        const allModules = await moduleService.getAll();
        const foundModule = allModules.find(m => m.id === moduleId);
        
        if (!foundModule) {
          setError("Module not found");
          return;
        }
        
        setModule(foundModule);
        
        // Filter videos for this module
        const videos = allVideos.filter(video => video.moduleId === moduleId);
        setModuleVideos(videos.sort((a, b) => a.order - b.order));
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (allVideos.length > 0) {
      loadModule();
    }
  }, [moduleId, allVideos]);

  // Calculate progress stats
  const stats = {
    totalVideos: moduleVideos.length,
    completedVideos: moduleVideos.filter(video => progress[video.Id]?.completed).length,
    totalDuration: moduleVideos.reduce((acc, video) => acc + video.duration, 0),
    watchedTime: moduleVideos.reduce((acc, video) => {
      const videoProgress = progress[video.Id];
      return acc + (videoProgress?.watchedSeconds || 0);
    }, 0)
  };

  const progressPercentage = stats.totalVideos > 0 
    ? (stats.completedVideos / stats.totalVideos) * 100 
    : 0;

  const handleVideoClick = (video) => {
    navigate(`/watch/${video.Id}?module=${moduleId}`);
  };

  const handleStartNextVideo = () => {
    // Find first incomplete video
    const nextVideo = moduleVideos.find(video => !progress[video.Id]?.completed);
    if (nextVideo) {
      handleVideoClick(nextVideo);
    }
  };

  const handleBackToCourses = () => {
    navigate("/courses");
  };

  if (loading || videosLoading) {
    return <Loading />;
  }

  if (error || videosError) {
    return (
      <Error
        title="Failed to load course"
message={error || videosError}
        onRetry={() => navigate(0)}
      />
    );
  }

  if (!module) {
    return (
      <Empty
        title="Course not found"
        message="The course you're looking for doesn't exist or has been removed."
        actionText="Browse Courses"
        onAction={handleBackToCourses}
        icon="BookX"
      />
    );
  }

  if (moduleVideos.length === 0) {
    return (
      <Empty
        title="No videos available"
        message="This course doesn't have any videos yet. Check back later for updates."
        actionText="Browse Other Courses"
        onAction={handleBackToCourses}
        icon="Video"
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <button
          onClick={handleBackToCourses}
          className="hover:text-primary-600 transition-colors"
        >
          Courses
        </button>
        <ApperIcon name="ChevronRight" className="w-4 h-4" />
        <span className="text-secondary-800">{module.name}</span>
      </div>

      {/* Course Header */}
      <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        
        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-1">
              <Badge className="bg-white/20 text-white border-white/30 mb-4">
                Module {module.order}
              </Badge>
              
              <h1 className="text-3xl font-display font-bold mb-4">
                {module.name}
              </h1>
              
              {module.description && (
                <p className="text-white/90 text-lg mb-6 max-w-2xl">
                  {module.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <ApperIcon name="PlayCircle" className="w-4 h-4" />
                  <span>{stats.totalVideos} videos</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <ApperIcon name="Clock" className="w-4 h-4" />
                  <span>{formatDuration(stats.totalDuration)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <ApperIcon name="CheckCircle" className="w-4 h-4" />
                  <span>{stats.completedVideos} completed</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center lg:items-end gap-4">
              <ProgressRing
                progress={progressPercentage}
                size={100}
                strokeWidth={6}
                showPercentage={true}
                className="text-white"
              />
              
              <Button
                variant="secondary"
                onClick={handleStartNextVideo}
                disabled={progressPercentage === 100}
                className="flex items-center gap-2"
              >
                <ApperIcon name={progressPercentage === 100 ? "CheckCircle" : "Play"} className="w-4 h-4" />
                {progressPercentage === 100 ? "Course Complete!" : "Continue Learning"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-primary-600 mb-2">
            {stats.totalVideos}
          </div>
          <div className="text-sm text-gray-600">Total Videos</div>
        </Card>

        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">
            {stats.completedVideos}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </Card>

        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-accent-600 mb-2">
            {formatDuration(stats.watchedTime)}
          </div>
          <div className="text-sm text-gray-600">Time Watched</div>
        </Card>

        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-orange-600 mb-2">
            {Math.round(progressPercentage)}%
          </div>
          <div className="text-sm text-gray-600">Progress</div>
        </Card>
      </div>

      {/* Video List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold text-secondary-800">
            Course Videos
          </h2>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {stats.completedVideos} of {stats.totalVideos} completed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {moduleVideos.map((video, index) => (
            <div key={video.Id} className="relative">
              {/* Video Number Badge */}
              <div className="absolute -top-2 -left-2 z-10">
                {progress[video.Id]?.completed ? (
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <ApperIcon name="Check" className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center shadow-lg text-white text-sm font-bold">
                    {index + 1}
                  </div>
                )}
              </div>
              
              <VideoCard
                video={video}
                progress={progress[video.Id]}
                onClick={handleVideoClick}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Course Actions */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-secondary-800 mb-1">
              {progressPercentage === 100 ? "Congratulations!" : "Keep Learning"}
            </h3>
            <p className="text-gray-600 text-sm">
              {progressPercentage === 100 
                ? "You've completed all videos in this course."
                : `${stats.totalVideos - stats.completedVideos} videos remaining`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={handleBackToCourses}
              className="flex items-center gap-2"
            >
              <ApperIcon name="ArrowLeft" className="w-4 h-4" />
              Back to Courses
            </Button>

            {progressPercentage < 100 && (
              <Button
                onClick={handleStartNextVideo}
                className="flex items-center gap-2"
              >
                <ApperIcon name="Play" className="w-4 h-4" />
                Continue Learning
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CourseDetail;