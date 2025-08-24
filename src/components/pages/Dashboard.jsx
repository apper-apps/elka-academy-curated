import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useVideos } from "@/hooks/useVideos";
import { useProgress } from "@/hooks/useProgress";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import VideoCard from "@/components/molecules/VideoCard";
import ProgressRing from "@/components/molecules/ProgressRing";
import ModuleCard from "@/components/molecules/ModuleCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import moduleService from "@/services/api/moduleService";
import { formatDuration } from "@/utils/formatters";
import { toast } from "react-toastify";

const Dashboard = () => {
  const navigate = useNavigate();
  const { videos, loading: videosLoading, error: videosError } = useVideos();
  const { progress, loading: progressLoading } = useProgress();
  const [modules, setModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(true);

  // Load modules
  useEffect(() => {
    const loadModules = async () => {
      try {
        const data = await moduleService.getAll();
        setModules(data);
      } catch (error) {
        console.error("Failed to load modules:", error);
      } finally {
        setModulesLoading(false);
      }
    };

    loadModules();
  }, []);

  // Calculate overall stats
  const stats = useMemo(() => {
    if (!videos.length) return null;

    const completedVideos = Object.values(progress).filter(p => p.completed).length;
    const totalWatchTime = Object.values(progress).reduce((acc, p) => acc + (p.watchedSeconds || 0), 0);
    const totalVideos = videos.length;
    const overallProgress = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;

    return {
      completedVideos,
      totalVideos,
      totalWatchTime,
      overallProgress,
      streak: 7, // Mock streak data
    };
  }, [videos, progress]);

  // Get continue watching videos (recently watched but not completed)
  const continueWatching = useMemo(() => {
    if (!videos.length) return [];

    return videos
      .filter(video => {
        const videoProgress = progress[video.Id];
        return videoProgress && videoProgress.watchedSeconds > 0 && !videoProgress.completed;
      })
      .sort((a, b) => {
        const aDate = new Date(progress[a.Id].lastWatched);
        const bDate = new Date(progress[b.Id].lastWatched);
        return bDate - aDate;
      })
      .slice(0, 4);
  }, [videos, progress]);

  // Get recommended videos (unwatched videos from modules with progress)
  const recommendedVideos = useMemo(() => {
    if (!videos.length) return [];

    const unwatchedVideos = videos.filter(video => !progress[video.Id]?.completed);
    return unwatchedVideos.slice(0, 4);
  }, [videos, progress]);

  // Calculate module progress
  const moduleProgress = useMemo(() => {
    if (!modules.length || !videos.length) return {};

    return modules.reduce((acc, module) => {
      const moduleVideos = videos.filter(v => v.moduleId === module.id);
      const completedCount = moduleVideos.filter(v => progress[v.Id]?.completed).length;
      
      acc[module.id] = {
        completedVideos: completedCount,
        totalVideos: moduleVideos.length,
        progress: moduleVideos.length > 0 ? (completedCount / moduleVideos.length) * 100 : 0
      };
      
      return acc;
    }, {});
  }, [modules, videos, progress]);

  const handleVideoClick = (video) => {
    navigate(`/watch/${video.Id}`);
  };

  const handleModuleClick = (module) => {
    navigate(`/courses/${module.id}`);
  };

  const handleViewAllCourses = () => {
    navigate("/courses");
  };

  const handleViewProgress = () => {
    navigate("/progress");
  };

  if (videosLoading || progressLoading || modulesLoading) {
    return (
      <div className="space-y-8">
        <Loading type="stats" />
        <Loading type="video-grid" />
        <Loading type="module-cards" />
      </div>
    );
  }

  if (videosError) {
    return (
      <Error
        title="Failed to load dashboard"
        message={videosError}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <ApperIcon name="GraduationCap" className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">Welcome to Elka Academy</h1>
              <p className="text-white/90">Continue your driving education journey</p>
            </div>
          </div>

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Overall Progress</p>
                    <p className="text-3xl font-bold">{Math.round(stats.overallProgress)}%</p>
                  </div>
                  <ProgressRing
                    progress={stats.overallProgress}
                    size={60}
                    strokeWidth={4}
                    color="white"
                    className="text-white"
                  />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <ApperIcon name="CheckCircle" className="w-8 h-8 text-green-300" />
                  <div>
                    <p className="text-white/80 text-sm">Videos Completed</p>
                    <p className="text-3xl font-bold">{stats.completedVideos}/{stats.totalVideos}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <ApperIcon name="Clock" className="w-8 h-8 text-blue-300" />
                  <div>
                    <p className="text-white/80 text-sm">Learning Time</p>
                    <p className="text-3xl font-bold">{formatDuration(stats.totalWatchTime)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Continue Watching */}
      {continueWatching.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold text-secondary-800">Continue Watching</h2>
            <Button variant="ghost" onClick={handleViewAllCourses}>
              View All <ApperIcon name="ArrowRight" className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {continueWatching.map((video) => (
              <VideoCard
                key={video.Id}
                video={video}
                progress={progress[video.Id]}
                onClick={handleVideoClick}
              />
            ))}
          </div>
        </section>
      )}

      {/* Course Modules */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold text-secondary-800">Your Courses</h2>
          <Button variant="ghost" onClick={handleViewAllCourses}>
            View All <ApperIcon name="ArrowRight" className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.slice(0, 6).map((module) => (
            <ModuleCard
              key={module.Id}
              module={module}
              progress={moduleProgress[module.id]}
              onClick={handleModuleClick}
            />
          ))}
        </div>
      </section>

      {/* Recommended Videos */}
      {recommendedVideos.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold text-secondary-800">Recommended for You</h2>
            <Button variant="ghost" onClick={handleViewAllCourses}>
              View All <ApperIcon name="ArrowRight" className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedVideos.map((video) => (
              <VideoCard
                key={video.Id}
                video={video}
                progress={progress[video.Id]}
                onClick={handleVideoClick}
              />
            ))}
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section>
        <Card className="p-8">
          <h3 className="text-xl font-display font-semibold text-secondary-800 mb-6">Quick Actions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              onClick={handleViewAllCourses}
              className="flex items-center gap-3 p-4 h-auto"
            >
              <ApperIcon name="BookOpen" className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Browse Courses</div>
                <div className="text-sm opacity-70">Explore all modules</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              onClick={handleViewProgress}
              className="flex items-center gap-3 p-4 h-auto"
            >
              <ApperIcon name="BarChart3" className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">View Progress</div>
                <div className="text-sm opacity-70">Track your learning</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              onClick={() => toast.info("Practice test feature coming soon!")}
              className="flex items-center gap-3 p-4 h-auto"
            >
              <ApperIcon name="FileCheck" className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Practice Test</div>
                <div className="text-sm opacity-70">Test your knowledge</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              onClick={() => toast.info("Study notes feature coming soon!")}
              className="flex items-center gap-3 p-4 h-auto"
            >
              <ApperIcon name="Bookmark" className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Study Notes</div>
                <div className="text-sm opacity-70">Review bookmarks</div>
              </div>
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default Dashboard;