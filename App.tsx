import React, { useState, useCallback } from 'react';
import { generateStory } from './services/geminiService';
import type { IllustratedStory } from './types';
import CategoryInput from './components/CategoryInput';
import StoryDisplay from './components/StoryDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import { BookIcon } from './components/icons';

const App: React.FC = () => {
  const [category, setCategory] = useState<string>('');
  const [story, setStory] = useState<IllustratedStory | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setStory(null);

    try {
      const result = await generateStory(category);
      setStory(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [category, isLoading]);

  const handleAnotherStory = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen bg-purple-50 text-gray-800 font-sans p-4 sm:p-6 lg:p-8">
      <main className="max-w-4xl mx-auto">
        <header className="text-center mb-8 sm:mb-12">
          <div className="flex justify-center items-center gap-4 mb-2">
            <BookIcon className="w-12 h-12 text-purple-600" />
            <h1 className="text-4xl sm:text-5xl font-extrabold text-purple-800 tracking-tight">
              Story Time AI
            </h1>
          </div>
          <p className="text-lg text-purple-700">
            Tell me a category, and I'll write a magical story just for you!
          </p>
        </header>

        <section className="mb-8">
          <CategoryInput 
            category={category}
            setCategory={setCategory}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </section>

        <section className="mt-8">
          {isLoading && <LoadingSpinner />}
          {error && <ErrorMessage message={error} />}
          {story && !isLoading && <StoryDisplay story={story} />}
          {!isLoading && !error && !story && (
            <div className="text-center p-8 bg-white/60 rounded-2xl border-2 border-dashed border-purple-300">
              <p className="text-xl text-purple-700">Your wonderful story will appear here!</p>
            </div>
          )}
        </section>

        {story && !isLoading && (
          <section className="text-center mt-12">
            <button
              onClick={handleAnotherStory}
              className="bg-green-500 text-white font-bold py-4 px-10 rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all duration-300 ease-in-out shadow-lg transform hover:scale-105"
            >
              Let's hear another story, Tap me
            </button>
          </section>
        )}
      </main>
    </div>
  );
};

export default App;