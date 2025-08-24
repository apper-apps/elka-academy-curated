import videosData from "@/services/mockData/videos.json";

class VideoService {
  constructor() {
    this.videos = [...videosData];
  }

  async getAll() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.videos]);
      }, 300);
    });
  }

  async getById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const video = this.videos.find(v => v.Id === parseInt(id));
        if (video) {
          resolve({ ...video });
        } else {
          reject(new Error(`Video with ID ${id} not found`));
        }
      }, 200);
    });
  }

  async getByModule(moduleId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const moduleVideos = this.videos.filter(v => v.moduleId === moduleId);
        resolve([...moduleVideos]);
      }, 300);
    });
  }

  async getByCategory(categoryId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const categoryVideos = this.videos.filter(v => v.category === categoryId);
        resolve([...categoryVideos]);
      }, 300);
    });
  }

  async search(query) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = this.videos.filter(video =>
          video.title.toLowerCase().includes(query.toLowerCase()) ||
          video.description.toLowerCase().includes(query.toLowerCase()) ||
          video.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
        resolve([...results]);
      }, 250);
    });
  }
}

export default new VideoService();