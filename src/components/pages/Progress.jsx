import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useVideos } from "@/hooks/useVideos";
import { useProgress } from "@/hooks/useProgress";
import ProgressStats from "@/components/organisms/ProgressStats";
import VideoCard from "@/components/molecules/VideoCard";
import ModuleCard from "@/components/molecules/ModuleCard";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import moduleService from "@/services/api/moduleService";
import { formatDuration, formatDate } from "@/utils/formatters";

const Progress = () => {
  const navigate = useNavigate();
  const { videos, loading: videosLoading, error: videosError } = useVideos();
  const { progress, loading: progressLoading } = useProgress();
  
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // overview, videos, modules

  // Load modules
  useEffect(() => {
    const loadModules = async () => {
      try {
        const data = await moduleService.getAll();
        setModules(data);
      } catch (error) {
        console.error("Failed to load modules:", error);
      } finally {
        setLoading(false);
      }
    };

    loadModules();
  }, []);

  // Calculate comprehensive stats
  const stats = useMemo(() => {
    if (!videos.length) return null;

    const completedVideos = Object.values(progress).filter(p => p.completed).length;
    const totalWatchTime = Object.values(progress).reduce((acc, p) => acc + (p.watchedSeconds || 0), 0);
    const totalVideos = videos.length;

    // Calculate average progress
    const videoProgresses = videos.map(video => {
      const videoProgress = progress[video.Id];
      if (!videoProgress) return 0;
      return Math.min(100, (videoProgress.watchedSeconds / video.duration) * 100);
    });
    const averageProgress = videoProgresses.reduce((acc, p) => acc + p, 0) / videos.length;

    // Calculate completion rate (videos with >90% watched)
    const nearlyCompleted = videos.filter(video => {
      const videoProgress = progress[video.Id];
      if (!videoProgress) return false;
      const percentage = (videoProgress.watchedSeconds / video.duration) * 100;
      return percentage >= 90;
    }).length;
    const completionRate = (nearlyCompleted / totalVideos) * 100;

    // Mock streak calculation (would be based on daily activity)
    const streak = 7;

    return {
      totalVideos,
      completedVideos,
      totalWatchTime,
      averageProgress,
      streak,
      completionRate
    };
  }, [videos, progress]);

  // Get recently watched videos
  const recentlyWatched = useMemo(() => {
    return videos
      .filter(video => progress[video.Id]?.lastWatched)
      .sort((a, b) => {
        const aDate = new Date(progress[a.Id].lastWatched);
        const bDate = new Date(progress[b.Id].lastWatched);
        return bDate - aDate;
      })
      .slice(0, 6);
  }, [videos, progress]);

  // Get in-progress videos
  const inProgressVideos = useMemo(() => {
    return videos
      .filter(video => {
        const videoProgress = progress[video.Id];
        return videoProgress && videoProgress.watchedSeconds > 0 && !videoProgress.completed;
      })
      .sort((a, b) => {
        const aProgress = (progress[a.Id].watchedSeconds / a.duration) * 100;
        const bProgress = (progress[b.Id].watchedSeconds / b.duration) * 100;
        return bProgress - aProgress;
      })
      .slice(0, 6);
  }, [videos, progress]);

  // Get completed videos
  const completedVideos = useMemo(() => {
    return videos
      .filter(video => progress[video.Id]?.completed)
      .sort((a, b) => {
        const aDate = new Date(progress[a.Id].lastWatched);
        const bDate = new Date(progress[b.Id].lastWatched);
        return bDate - aDate;
      });
  }, [videos, progress]);

  // Calculate module progress
  const moduleProgress = useMemo(() => {
    return modules.map(module => {
      const moduleVideos = videos.filter(v => v.moduleId === module.id);
      const completedCount = moduleVideos.filter(v => progress[v.Id]?.completed).length;
      
      return {
        ...module,
        completedVideos: completedCount,
        totalVideos: moduleVideos.length,
        progress: moduleVideos.length > 0 ? (completedCount / moduleVideos.length) * 100 : 0
      };
    }).sort((a, b) => b.progress - a.progress);
  }, [modules, videos, progress]);

  const handleVideoClick = (video) => {
    navigate(`/watch/${video.Id}`);
  };

  const handleModuleClick = (module) => {
    navigate(`/courses/${module.id}`);
  };

  const tabs = [
    { id: "overview", name: "Overview", icon: "BarChart3" },
    { id: "videos", name: "Video Progress", icon: "PlayCircle" },
    { id: "modules", name: "Course Progress", icon: "BookOpen" }
  ];

  if (loading || videosLoading || progressLoading) {
    return (
      <div className="space-y-8">
        <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse w-48" />
        <Loading type="stats" />
        <Loading type="video-grid" />
      </div>
    );
  }

  if (videosError) {
    return (
      <Error
        title="Failed to load progress"
        message={videosError}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-secondary-800 mb-2">
          Learning Progress
        </h1>
        <p className="text-gray-600">
          Track your learning journey and achievements
        </p>
      </div>

      {/* Stats Overview */}
      {stats && <ProgressStats stats={stats} />}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <ApperIcon name={tab.icon} className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Continue Learning */}
            {inProgressVideos.length > 0 && (
              <section>
                <h2 className="text-xl font-display font-semibold text-secondary-800 mb-4">
                  Continue Learning
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inProgressVideos.map((video) => (
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

            {/* Recently Watched */}
            {recentlyWatched.length > 0 && (
              <section>
                <h2 className="text-xl font-display font-semibold text-secondary-800 mb-4">
                  Recently Watched
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentlyWatched.slice(0, 3).map((video) => (
                    <Card key={video.Id} className="p-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-20 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-secondary-800 truncate">
                            {video.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <span>Watched {formatDate(progress[video.Id].lastWatched)}</span>
                            {progress[video.Id].completed && (
                              <span className="text-green-600 flex items-center gap-1">
                                <ApperIcon name="Check" className="w-3 h-3" />
                                Completed
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => handleVideoClick(video)}
                        >
                          <ApperIcon name="Play" className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Achievement Summary */}
            <Card className="p-6 bg-gradient-to-r from-primary-50 to-accent-50">
              <h3 className="text-lg font-semibold text-secondary-800 mb-4">
                Your Achievements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ApperIcon name="Trophy" className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-secondary-800 mb-1">
                    {stats?.completedVideos || 0}
                  </div>
                  <div className="text-sm text-gray-600">Videos Completed</div>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ApperIcon name="Target" className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-secondary-800 mb-1">
                    {Math.round(stats?.averageProgress || 0)}%
                  </div>
                  <div className="text-sm text-gray-600">Average Progress</div>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ApperIcon name="Flame" className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-secondary-800 mb-1">
                    {stats?.streak || 0}
                  </div>
                  <div className="text-sm text-gray-600">Day Streak</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "videos" && (
          <div className="space-y-8">
            {/* In Progress */}
            {inProgressVideos.length > 0 && (
              <section>
                <h2 className="text-xl font-display font-semibold text-secondary-800 mb-4">
                  In Progress ({inProgressVideos.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {inProgressVideos.map((video) => (
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

            {/* Completed */}
            {completedVideos.length > 0 && (
              <section>
                <h2 className="text-xl font-display font-semibold text-secondary-800 mb-4">
                  Completed ({completedVideos.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {completedVideos.slice(0, 8).map((video) => (
                    <VideoCard
                      key={video.Id}
                      video={video}
                      progress={progress[video.Id]}
                      onClick={handleVideoClick}
                    />
                  ))}
                </div>
                {completedVideos.length > 8 && (
                  <div className="text-center mt-6">
                    <Button variant="ghost">
                      Show All Completed Videos ({completedVideos.length})
                    </Button>
                  </div>
                )}
              </section>
            )}
          </div>
        )}

        {activeTab === "modules" && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {moduleProgress.map((module) => (
                <ModuleCard
                  key={module.Id}
                  module={module}
                  progress={{
                    completedVideos: module.completedVideos,
                    totalVideos: module.totalVideos
                  }}
                  onClick={handleModuleClick}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Progress;