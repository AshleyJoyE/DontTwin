import Image from "next/image";

export default function Home() {
  
  return (
<div className="flex flex-row items-center  min-h-screen bg-white">
  <div className="flex flex-row space-x-8">
    <div className="bg-gradient-to-r from-[hsla(320,69%,75%,1)] to-[hsla(349,100%,74%,1)] p-12 w-[45vw] h-[100vh] flex flex-col items-center justify-center">
      <div className="text-3xl font-semibold text-black mb-6 font-['Tahoma'] text-center">
        <p>RULES:</p>
        <ul className="list-disc list-inside">
          <li>Don't match the AI!</li>
          <li>GAME OVER if you do!</li>
        </ul>
      </div>
    </div>
    <div className="flex flex-col items-center space-y-6">
      {/* Category Field */}
      <div className="flex flex-col items-start w-64">
        <label
          className="text-lg font-semibold text-black font-['Tahoma'] mb-1"
          htmlFor="category"
        >
          Enter A Category:
        </label>
        <input
          id="category"
          type="text"
          className="border border-gray-400 rounded-md px-4 py-2 text-black w-full font-['Tahoma']"
        />
      </div>

      {/* Time Field */}
      <div className="flex flex-col items-start w-64">
        <label
          className="text-lg font-semibold text-black font-['Tahoma'] mb-1"
          htmlFor="time"
        >
          Time:
        </label>
        <input
          id="time"
          type="text"
          className="border border-gray-400 rounded-md px-4 py-2 text-black w-full font-['Tahoma']"
        />
      </div>

      {/* Start Button */}
      <button
        className="mt-4 px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition font-['Tahoma'] text-2xl"
      >
        START
      </button>
    </div>
  </div>
</div>

  );
}
