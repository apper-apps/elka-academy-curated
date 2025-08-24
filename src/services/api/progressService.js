import progressData from "@/services/mockData/progress.json";

class ProgressService {
  constructor() {
    this.progress = { ...progressData };
  }

  async getProgress() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...this.progress });
      }, 200);
    });
  }

  async updateVideoProgress(videoId, watchedSeconds, completed = false) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.progress[videoId] = {
          ...this.progress[videoId],
          videoId: videoId.toString(),
          watchedSeconds: watchedSeconds,
          completed: completed,
          lastWatched: new Date().toISOString()
        };
        resolve({ ...this.progress[videoId] });
      }, 200);
    });
  }

  async addBookmark(videoId, timestamp) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!this.progress[videoId]) {
          this.progress[videoId] = {
            videoId: videoId.toString(),
            watchedSeconds: 0,
            completed: false,
            lastWatched: new Date().toISOString(),
            bookmarks: []
          };
        }
        
        if (!this.progress[videoId].bookmarks) {
          this.progress[videoId].bookmarks = [];
        }
        
        this.progress[videoId].bookmarks.push(timestamp);
        resolve({ ...this.progress[videoId] });
      }, 200);
    });
  }

  async removeBookmark(videoId, timestamp) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (this.progress[videoId] && this.progress[videoId].bookmarks) {
          this.progress[videoId].bookmarks = this.progress[videoId].bookmarks.filter(
            t => t !== timestamp
          );
        }
        resolve({ ...this.progress[videoId] });
      }, 200);
    });
  }
}

export default new ProgressService();