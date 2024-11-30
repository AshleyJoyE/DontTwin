import Image from "next/image";

export default function Home() {
  
  return (
<div className="flex flex-col items-center justify-center min-h-screen bg-pink-200 p-8">
  <h1 className="text-6xl font-bold mb-8 text-black font-serif">DON’T TWIN!</h1>
  <div className="text-3xl font-semibold text-black mb-6 font-serif">
    <p>RULES:</p>
    <ul className="list-disc list-inside">
      <li>Don't match the AI!</li>
      <li>GAME OVER if you do!</li>
    </ul>
  </div>
  <div className="flex flex-col items-center space-y-6">
    {/* Category Field */}
    <div className="flex flex-col items-start w-64">
      <label
        className="text-lg font-semibold text-black font-serif mb-1"
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
        className="text-lg font-semibold text-black font-serif mb-1"
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
      className="mt-4 px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition font-serif text-2xl"
    >
      START
    </button>
  </div>
</div>

  );
}
