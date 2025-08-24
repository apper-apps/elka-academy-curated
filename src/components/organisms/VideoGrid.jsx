import { useState, useMemo } from "react";
import VideoCard from "@/components/molecules/VideoCard";
import CategoryFilter from "@/components/molecules/CategoryFilter";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const VideoGrid = ({ 
  videos, 
  categories, 
  progress, 
  onVideoClick,
  searchQuery = "",
  selectedCategory = "all"
}) => {
  const [sortBy, setSortBy] = useState("order");
  
  // Filter and sort videos
  const filteredAndSortedVideos = useMemo(() => {
    let filtered = videos;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(video => video.category === selectedCategory);
    }

    // Sort videos
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "duration":
          return a.duration - b.duration;
        case "newest":
          return b.Id - a.Id;
        case "progress":
          const aProgress = progress[a.Id];
          const bProgress = progress[b.Id];
          const aWatched = aProgress ? (aProgress.watchedSeconds / a.duration) * 100 : 0;
          const bWatched = bProgress ? (bProgress.watchedSeconds / b.duration) * 100 : 0;
          return bWatched - aWatched;
        default:
          return a.order - b.order;
      }
    });
  }, [videos, searchQuery, selectedCategory, sortBy, progress]);

  const sortOptions = [
    { value: "order", label: "Default Order", icon: "ArrowUpDown" },
    { value: "title", label: "Title A-Z", icon: "SortAsc" },
    { value: "duration", label: "Duration", icon: "Clock" },
    { value: "newest", label: "Newest First", icon: "Calendar" },
    { value: "progress", label: "Progress", icon: "BarChart3" }
  ];

  if (!videos?.length) {
    return (
      <div className="text-center py-12">
        <ApperIcon name="Video" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No videos found</h3>
        <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">
            {filteredAndSortedVideos.length} video{filteredAndSortedVideos.length !== 1 ? "s" : ""}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAndSortedVideos.map((video) => (
          <VideoCard
            key={video.Id}
            video={video}
            progress={progress[video.Id]}
            onClick={onVideoClick}
          />
        ))}
      </div>
    </div>
  );
};

export default VideoGrid;