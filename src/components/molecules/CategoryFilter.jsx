import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selectedCategory === "all" ? "primary" : "ghost"}
        size="small"
        onClick={() => onCategoryChange("all")}
        className="flex items-center gap-2"
      >
        <ApperIcon name="Grid3X3" className="w-4 h-4" />
        All
      </Button>
      
      {categories.map((category) => (
        <Button
          key={category.Id}
          variant={selectedCategory === category.id ? "primary" : "ghost"}
          size="small"
          onClick={() => onCategoryChange(category.id)}
          className="flex items-center gap-2"
          style={selectedCategory === category.id ? {} : { color: category.color }}
        >
          <ApperIcon name={category.icon} className="w-4 h-4" />
          {category.name}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;