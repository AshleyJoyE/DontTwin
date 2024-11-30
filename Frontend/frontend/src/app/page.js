'use client';

import Image from "next/image";
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  
  return (
<div className="flex flex-row items-center  min-h-screen bg-white">
  <div className="flex flex-row space-x-8">
    <div className="bg-gradient-to-r from-[hsla(320,69%,75%,1)] to-[hsla(349,100%,74%,1)] p-12 w-[60vw] h-[100vh] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        {[...Array(200)].map((_, i) => (
          <div
            key={i}
            className="absolute w-[30vw] h-[30vh] bg-[#f0f4ef]/30"
            style={{
              clipPath: "path('M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z')",
              animation: `float ${Math.random() * 10 + 15}s linear infinite`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
      <style jsx>{`
        @keyframes float {
          0% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(180deg); }
          100% { transform: translate(0, 0) rotate(360deg); }
        }
      `}</style>
      <div className="relative z-20 rounded-lg p-4 bg-gradient-to-r from-[hsla(323,72%,75%,1)] to-[hsla(347,97%,74%,1)]/90"
      >
        <h1 className="text-5xl font-semibold text-white mb-6 text-center">DON'T TWIN</h1>
        <h2 className="text-3xl font-semibold text-white mb-6 text-center">Don't match the AI! If you do, then GAME OVER! </h2>
      </div>
    </div>
    <div className="flex flex-col items-center space-y-16 justify-center items-center w-[40vw]">
      {/* Category Field */}
      <div className="flex flex-col items-start w-96 items-center">
        <label
          className="text-2xl font-semibold text-[#211103] mb-2"
          htmlFor="category"
        >
          Enter A Category
        </label>
        <input
          id="category"
          type="text"
          className="border-2 border-gray-400 rounded-md px-6 py-4 text-xl text-black w-full focus:outline-none focus:border-[#FF7B93]"
        />
        {errorMessage && (
          <p className="text-xl font-bold text-red-700">{errorMessage}</p>
        )}
      </div>

      {/* Time Field */}
      <div className="flex flex-col items-start w-96 items-center">
        <label
          className="text-3xl font-semibold text-[#211103] mb-2"
          htmlFor="time"
        >
          Time
        </label>
        <div className="flex items-center w-full gap-4">
          <input
            id="time"
            type="range"
            min="0"
            max="60"
            defaultValue={15}
            onChange={(e) => {
              const timeDisplay = document.getElementById('timeDisplay');
              const unlimitedBtn = document.getElementById('unlimitedBtn');
              unlimitedBtn.classList.remove('animate-pulse', 'bg-[#FF7B93]');
              unlimitedBtn.classList.add('bg-[#FF7B93]');
              timeDisplay.textContent = `${e.target.value} seconds`;
            }}
            className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF7B93]"
          />
          <button
            id="unlimitedBtn"
            onClick={(e) => {
              const timeSlider = document.getElementById('time');
              const timeDisplay = document.getElementById('timeDisplay');
              if (e.target.classList.contains('bg-[#FF7B93]')) {
                e.target.classList.remove('bg-[#FF7B93]');
                e.target.classList.add('bg-[#FF7B93]', 'animate-pulse');
                timeSlider.value = 60;
                timeDisplay.textContent = 'Unlimited time';
              } else {
                e.target.classList.remove('bg-[#FF7B93]', 'animate-pulse');
                e.target.classList.add('bg-[#FF7B93]');
                timeSlider.value = 15;
                timeDisplay.textContent = '15 seconds';
              }
            }}
            className="px-6 py-3 text-lg bg-[#FF7B93] text-white rounded-md hover:bg-[#FF7B93] transition whitespace-nowrap"
          >
            Unlimited
          </button>
        </div>
        <div className="text-lg text-gray-600 mt-2">
          <span id="timeDisplay">15 seconds</span>
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={() => {
          const category = document.getElementById('category').value.trim();
          const timeSlider = document.getElementById('time');
          
          if (!category) {
            setErrorMessage('Please enter a category');
            return;
          }
          
          const time = timeSlider.value === '60' && 
            document.getElementById('timeDisplay').textContent === 'Unlimited time' 
            ? -1 
            : parseInt(timeSlider.value);
            
          router.push(`/game?category=${encodeURIComponent(category)}&time=${time}`);
        }}
        className="mt-8 px-12 py-4 bg-[#FF7B93] text-white rounded-md hover:bg-[#FF7B93]/80 transition text-3xl"
      >
        START
      </button>
    </div>
  </div>
</div>

  );
}
