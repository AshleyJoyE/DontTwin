'use client';

import Image from "next/image";

export default function Home() {
  
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
    <div className="flex flex-col items-center space-y-6 justify-center items-center">
      {/* Category Field */}
      <div className="flex flex-col items-start w-64">
        <label
          className="text-lg font-semibold text-black mb-1"
          htmlFor="category"
        >
          Enter A Category:
        </label>
        <input
          id="category"
          type="text"
          className="border border-gray-400 rounded-md px-4 py-2 text-black w-full"
        />
      </div>

      {/* Time Field */}
      <div className="flex flex-col items-start w-64">
        <label
          className="text-lg font-semibold text-black mb-1"
          htmlFor="time"
        >
          Time:
        </label>
        <input
          id="time"
          type="text"
          className="border border-gray-400 rounded-md px-4 py-2 text-black w-full"
        />
      </div>

      {/* Start Button */}
      <button
        className="mt-4 px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition text-2xl"
      >
        START
      </button>
    </div>
  </div>
</div>

  );
}
