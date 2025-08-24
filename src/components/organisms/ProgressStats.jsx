import Card from "@/components/atoms/Card";
import ProgressRing from "@/components/molecules/ProgressRing";
import ApperIcon from "@/components/ApperIcon";
import { formatDuration } from "@/utils/formatters";

const ProgressStats = ({ stats }) => {
  const {
    totalVideos,
    completedVideos,
    totalWatchTime,
    averageProgress,
    streak,
    completionRate
  } = stats;

  const statCards = [
    {
      title: "Videos Completed",
      value: completedVideos,
      total: totalVideos,
      icon: "CheckCircle",
      color: "success",
      showProgress: true,
      progress: (completedVideos / totalVideos) * 100
    },
    {
      title: "Watch Time",
      value: formatDuration(totalWatchTime),
      icon: "Clock",
      color: "primary",
      subtitle: "Total learning time"
    },
    {
      title: "Learning Streak",
      value: `${streak} days`,
      icon: "Flame",
      color: "warning",
      subtitle: "Keep it up!"
    },
    {
      title: "Average Progress",
      value: `${Math.round(averageProgress)}%`,
      icon: "TrendingUp",
      color: "info",
      showProgress: true,
      progress: averageProgress
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${
              stat.color === "success" ? "from-green-100 to-green-200" :
              stat.color === "warning" ? "from-yellow-100 to-yellow-200" :
              stat.color === "info" ? "from-blue-100 to-blue-200" :
              "from-primary-100 to-primary-200"
            }`}>
              <ApperIcon 
                name={stat.icon} 
                className={`w-6 h-6 ${
                  stat.color === "success" ? "text-green-600" :
                  stat.color === "warning" ? "text-yellow-600" :
                  stat.color === "info" ? "text-blue-600" :
                  "text-primary-600"
                }`}
              />
            </div>
            
            {stat.showProgress && (
              <ProgressRing
                progress={stat.progress}
                size={50}
                strokeWidth={3}
                color={stat.color}
                showPercentage={false}
              />
            )}
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              {stat.title}
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-secondary-800">
                {stat.value}
              </span>
              {stat.total && (
                <span className="text-sm text-gray-500">/ {stat.total}</span>
              )}
            </div>
            {stat.subtitle && (
              <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ProgressStats;