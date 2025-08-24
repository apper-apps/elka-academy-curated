import { useState, useEffect } from "react";
import videoService from "@/services/api/videoService";

export const useVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadVideos = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await videoService.getAll();
      setVideos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getVideoById = async (id) => {
    try {
      return await videoService.getById(id);
    } catch (err) {
      console.error("Failed to get video:", err);
      return null;
    }
  };

  const getVideosByModule = async (moduleId) => {
    try {
      return await videoService.getByModule(moduleId);
    } catch (err) {
      console.error("Failed to get module videos:", err);
      return [];
    }
  };

  const searchVideos = async (query) => {
    try {
      return await videoService.search(query);
    } catch (err) {
      console.error("Failed to search videos:", err);
      return [];
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  return {
    videos,
    loading,
    error,
    getVideoById,
    getVideosByModule,
    searchVideos,
    refetch: loadVideos
  };
};