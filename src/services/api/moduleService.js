import modulesData from "@/services/mockData/modules.json";

class ModuleService {
  constructor() {
    this.modules = [...modulesData];
  }

  async getAll() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.modules]);
      }, 300);
    });
  }

  async getById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const module = this.modules.find(m => m.Id === parseInt(id));
        if (module) {
          resolve({ ...module });
        } else {
          reject(new Error(`Module with ID ${id} not found`));
        }
      }, 200);
    });
  }
}

export default new ModuleService();