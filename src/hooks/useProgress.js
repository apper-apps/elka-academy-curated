import { useState, useEffect } from "react";
import progressService from "@/services/api/progressService";

export const useProgress = () => {
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProgress = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await progressService.getProgress();
      setProgress(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateVideoProgress = async (videoId, watchedSeconds, completed = false) => {
    try {
      const updatedProgress = await progressService.updateVideoProgress(
        videoId, 
        watchedSeconds, 
        completed
      );
      setProgress(prev => ({
        ...prev,
        [videoId]: updatedProgress
      }));
      return updatedProgress;
    } catch (err) {
      console.error("Failed to update progress:", err);
    }
  };

  const addBookmark = async (videoId, timestamp) => {
    try {
      const updatedProgress = await progressService.addBookmark(videoId, timestamp);
      setProgress(prev => ({
        ...prev,
        [videoId]: updatedProgress
      }));
      return updatedProgress;
    } catch (err) {
      console.error("Failed to add bookmark:", err);
    }
  };

  const removeBookmark = async (videoId, timestamp) => {
    try {
      const updatedProgress = await progressService.removeBookmark(videoId, timestamp);
      setProgress(prev => ({
        ...prev,
        [videoId]: updatedProgress
      }));
      return updatedProgress;
    } catch (err) {
      console.error("Failed to remove bookmark:", err);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  return {
    progress,
    loading,
    error,
    updateVideoProgress,
    addBookmark,
    removeBookmark,
    refetch: loadProgress
  };
};