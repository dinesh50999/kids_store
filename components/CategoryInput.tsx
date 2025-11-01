
import React from 'react';

interface CategoryInputProps {
  category: string;
  setCategory: (category: string) => void;
  handleSubmit: (event: React.FormEvent) => void;
  isLoading: boolean;
}

const CategoryInput: React.FC<CategoryInputProps> = ({ category, setCategory, handleSubmit, isLoading }) => {
  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto">
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-full shadow-lg border border-purple-200">
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g., Animals, Magic, Space..."
          className="w-full flex-grow px-5 py-3 text-gray-700 bg-transparent focus:outline-none text-lg"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !category}
          className="w-full sm:w-auto bg-purple-600 text-white font-bold py-3 px-8 rounded-full hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-300 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating Story...' : 'Tell Me a Story'}
        </button>
      </div>
    </form>
  );
};

export default CategoryInput;
