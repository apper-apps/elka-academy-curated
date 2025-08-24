import categoriesData from "@/services/mockData/categories.json";

class CategoryService {
  constructor() {
    this.categories = [...categoriesData];
  }

  async getAll() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.categories]);
      }, 300);
    });
  }

  async getById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const category = this.categories.find(c => c.Id === parseInt(id));
        if (category) {
          resolve({ ...category });
        } else {
          reject(new Error(`Category with ID ${id} not found`));
        }
      }, 200);
    });
  }
}

export default new CategoryService();