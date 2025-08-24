import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useVideos } from "@/hooks/useVideos";
import { useProgress } from "@/hooks/useProgress";
import VideoGrid from "@/components/organisms/VideoGrid";
import ModuleCard from "@/components/molecules/ModuleCard";
import CategoryFilter from "@/components/molecules/CategoryFilter";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import moduleService from "@/services/api/moduleService";
import categoryService from "@/services/api/categoryService";

const Courses = () => {
  const navigate = useNavigate();
  const { videos, loading: videosLoading, error: videosError } = useVideos();
  const { progress } = useProgress();
  
  const [modules, setModules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("modules"); // "modules" or "videos"
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");
        
        const [modulesData, categoriesData] = await Promise.all([
          moduleService.getAll(),
          categoryService.getAll()
        ]);
        
        setModules(modulesData);
        setCategories(categoriesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate module progress
  const getModuleProgress = (module) => {
    if (!videos.length) return { completedVideos: 0, totalVideos: 0 };
    
    const moduleVideos = videos.filter(v => v.moduleId === module.id);
    const completedCount = moduleVideos.filter(v => progress[v.Id]?.completed).length;
    
    return {
      completedVideos: completedCount,
      totalVideos: moduleVideos.length
    };
  };

  // Filter videos based on category and search
  const filteredVideos = videos.filter(video => {
    const matchesCategory = selectedCategory === "all" || video.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const handleVideoClick = (video) => {
    navigate(`/watch/${video.Id}`);
  };

  const handleModuleClick = (module) => {
    navigate(`/courses/${module.id}`);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query && viewMode === "modules") {
      setViewMode("videos");
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (viewMode === "modules") {
      setViewMode("videos");
    }
  };

  if (loading || videosLoading) {
    return (
      <div className="space-y-8">
        <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse w-48" />
        <Loading type="module-cards" />
      </div>
    );
  }

  if (error || videosError) {
    return (
      <Error
title="Failed to load courses"
        message={error || videosError}
        onRetry={() => navigate(0)}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-secondary-800 mb-2">
            Course Library
          </h1>
          <p className="text-gray-600">
            {viewMode === "modules" 
              ? `${modules.length} training modules available`
              : `${filteredVideos.length} videos found`}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <div className="bg-white rounded-lg p-1 shadow-md border">
            <Button
              variant={viewMode === "modules" ? "primary" : "ghost"}
              size="small"
              onClick={() => setViewMode("modules")}
              className="flex items-center gap-2"
            >
              <ApperIcon name="Grid3X3" className="w-4 h-4" />
              Modules
            </Button>
            <Button
              variant={viewMode === "videos" ? "primary" : "ghost"}
              size="small"
              onClick={() => setViewMode("videos")}
              className="flex items-center gap-2"
            >
              <ApperIcon name="Play" className="w-4 h-4" />
              Videos
            </Button>
          </div>
        </div>
      </div>

      {/* Category Filter - Only show in video mode */}
      {viewMode === "videos" && (
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-secondary-800 mb-3">Filter by Category</h3>
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>
        </Card>
      )}

      {/* Content */}
      {viewMode === "modules" ? (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => (
              <ModuleCard
                key={module.Id}
                module={module}
                progress={getModuleProgress(module)}
                onClick={handleModuleClick}
              />
            ))}
          </div>
        </div>
      ) : (
        <VideoGrid
          videos={filteredVideos}
          categories={categories}
          progress={progress}
          onVideoClick={handleVideoClick}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
        />
      )}

      {/* Empty State */}
      {viewMode === "videos" && filteredVideos.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <ApperIcon name="Search" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No videos found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search query or category filter.
            </p>
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
              >
                Clear Filters
              </Button>
              <Button onClick={() => setViewMode("modules")}>
                Browse Modules
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Stats */}
      <Card className="p-6 bg-gradient-to-r from-gray-50 to-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 mb-1">
              {modules.length}
            </div>
            <div className="text-sm text-gray-600">Training Modules</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-accent-600 mb-1">
              {videos.length}
            </div>
            <div className="text-sm text-gray-600">Video Lessons</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {Object.values(progress).filter(p => p.completed).length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {categories.length}
            </div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Courses;