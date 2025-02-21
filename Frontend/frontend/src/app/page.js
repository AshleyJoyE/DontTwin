'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Add heart animation constants
const HEART_COUNT = 200;
const heartPositions = [...Array(HEART_COUNT)].map(() => ({
  left: Math.random() * 100,
  top: Math.random() * 100,
  translateX: Math.random() * 100 - 50,
  translateY: Math.random() * 100 - 50,
  duration: Math.random() * 10 + 15,
}));

export default function Home() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4565553802835245"
     crossorigin="anonymous"></script>
      {/* Left section - Pink-Orange gradient background with animated hearts */}
      <div className="w-full lg:w-[60vw] bg-gradient-to-br from-pink-500 to-orange-400 p-4 md:p-12 min-h-[50vh] lg:h-screen flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Heart Background */}
        <div className="absolute inset-0">
          {heartPositions.map((heart, i) => (
            <div
              key={i}
              className="absolute w-[30vw] h-[30vh] bg-[#f0f4ef]/30"
              style={{
                clipPath: "path('M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z')",
                animation: `float${i} ${heart.duration}s linear infinite`,
                left: `${heart.left}%`,
                top: `${heart.top}%`,
              }}
            />
          ))}
        </div>
        
        <style jsx>{`
          ${heartPositions.map((heart, i) => `
            @keyframes float${i} {
              0% { transform: translate(0, 0) rotate(0deg); }
              50% { transform: translate(${heart.translateX}px, ${heart.translateY}px) rotate(180deg); }
              100% { transform: translate(0, 0) rotate(360deg); }
            }
          `).join('\n')}
        `}</style>
    
        <div className="relative z-20 rounded-lg p-6 bg-pink-600/60 w-full max-w-2xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">DON'T TWIN!</h1>
          <h2 className="text-lg md:text-2xl text-white font-light">Avoid matching the AI! Stay unique to win.</h2>
        </div>
      </div>
    
      {/* Right section - Game Controls */}
      <div className="w-full lg:w-[40vw] p-6 md:p-10 flex flex-col items-center justify-center space-y-10">
        
        {/* Category Input */}
        <div className="flex flex-col items-center w-full max-w-md">
          <label className="text-xl md:text-2xl font-semibold text-gray-800 mb-3" htmlFor="category">
            Enter A Category
          </label>
          <input
            id="category"
            type="text"
            className="border-2 border-pink-300 rounded-md px-5 py-3 text-lg text-black w-full focus:outline-none focus:border-pink-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const category = e.target.value.trim();
                const time = document.getElementById('time').value;
                
                if (!category) {
                  setErrorMessage("Please enter a category");
                  return;
                }
                
                const timeValue = time === '60' ? -1 : parseInt(time);
                router.push(`/game?category=${encodeURIComponent(category)}&time=${timeValue}`);
              }
            }}
          />
          {errorMessage && (
            <p className="text-red-500 mt-2">{errorMessage}</p>
          )}
        </div>
    
        {/* Timer Control */}
        <div className="flex flex-col items-center w-full max-w-md">
          <label className="text-xl md:text-2xl font-semibold text-gray-800 mb-3" htmlFor="time">
            Set Time Limit
          </label>
          <div className="flex items-center w-full gap-4">
            <input
              id="time"
              type="range"
              min="10"
              max="60"
              defaultValue={15}
              onChange={(e) => {
                document.getElementById('timeDisplay').textContent = `${e.target.value} seconds`;
              }}
              className="w-full h-4 bg-pink-100 rounded-full appearance-none cursor-pointer focus:outline-none
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pink-600
              [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-pink-600
              [&::-ms-thumb]:appearance-none [&::-ms-thumb]:h-4 [&::-ms-thumb]:w-4 [&::-ms-thumb]:rounded-full [&::-ms-thumb]:bg-pink-600"
            />
            <button
              id="unlimitedBtn"
              onClick={() => {
                const timeSlider = document.getElementById('time');
                timeSlider.value = 60;
                document.getElementById('timeDisplay').textContent = "Unlimited";
              }}
              className="px-5 py-2 bg-pink-600 text-white font-semibold rounded-md hover:bg-pink-700 transition"
            >
              Unlimited
            </button>
          </div>
          <div className="text-lg text-gray-700 mt-2">
            <span id="timeDisplay">15 seconds</span>
          </div>
        </div>
    
        {/* Start Button */}
        <button
          onClick={() => {
            const category = document.getElementById('category').value.trim();
            const time = document.getElementById('time').value;
    
            if (!category) {
              setErrorMessage("Please enter a category");
              return;
            }
    
            const timeValue = time === '60' ? -1 : parseInt(time);
            router.push(`/game?category=${encodeURIComponent(category)}&time=${timeValue}`);
          }}
          className="px-10 py-4 bg-pink-600 text-white text-2xl font-bold rounded-md hover:bg-pink-700 transition"
        >
          START
        </button>
      </div>
    </div>
  );
}
