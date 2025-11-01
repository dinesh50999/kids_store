import React from 'react';
import type { IllustratedStory } from '../types';
import AudioPlayer from './AudioPlayer';

interface StoryDisplayProps {
  story: IllustratedStory;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ story }) => {
  const parts = story.body.split(/(\[IMAGE_\d+\])/g).filter(part => part.trim() !== '');

  // Prepare text for TTS by removing image placeholders and combining all parts.
  const textToRead = `${story.title}. ${story.body.replace(/(\[IMAGE_\d+\])/g, ' ')} The moral of the story is: ${story.moral}`;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100 animate-fade-in">
      <h2 className="text-3xl sm:text-4xl font-bold text-purple-700 mb-4 text-center">{story.title}</h2>
      
      <AudioPlayer textToRead={textToRead} />

      <div className="text-gray-700 leading-relaxed text-lg space-y-4">
        {parts.map((part, index) => {
          const match = part.match(/\[IMAGE_(\d+)\]/);
          if (match) {
            const imageIndex = parseInt(match[1], 10) - 1;
            if (story.imageUrls[imageIndex]) {
              return (
                <div key={`image-${imageIndex}`} className="my-6">
                  <img
                    src={story.imageUrls[imageIndex]}
                    alt={`Illustration ${imageIndex + 1} for ${story.title}`}
                    className="w-full h-auto object-cover rounded-lg border-4 border-purple-200 shadow-md"
                    style={{ aspectRatio: '3 / 4' }}
                    loading="lazy"
                  />
                </div>
              );
            }
            return null; // Don't render anything if the image URL is missing for a placeholder
          } else {
            // Render text part, splitting by newlines to create paragraphs
            return part.split('\n').filter(line => line.trim() !== '').map((line, lineIndex) => (
              <p key={`${index}-${lineIndex}`} className="mb-4 whitespace-pre-line">{line}</p>
            ));
          }
        })}
      </div>

      <div className="mt-8 pt-6 border-t-2 border-dashed border-purple-200 text-center">
        <p className="font-semibold italic text-purple-600 text-lg">
          "{story.moral}"
        </p>
      </div>
    </div>
  );
};

export default StoryDisplay;