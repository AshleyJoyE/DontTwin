export default function GamePage() {
    return (
<div className="flex flex-col items-center justify-center min-h-screen bg-pink-200 p-8">

<div className="absolute top-4 left-4 text-lg font-serif font-bold text-black">
    High Score: 
  </div>
  
  <h1 className="text-5xl font-bold mb-4 font-serif text-black">DON’T TWIN!</h1>

  
  <div className="text-4xl font-semibold font-serif mb-6">Challenge: </div>

  
  <div className="text-xl font-serif text-2xl font-semibold mb-6">Round Number: </div>

  <button className="px-6 py-2 font-serif bg-black text-white rounded-md hover:bg-gray-800 transition mb-8 text-xl">
    NEW GAME
  </button>

  <div className="text-black-600 text-3xl mb-4">15s</div>

  <div className="w-36 h-36">
  <img
    src="https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcShgiQisqDz_9PiED3acGnZJNvYHJJxZ3zdTPKVLtz3OyicJ3E2"
    alt="Clock"
    className="rounded-full border-4 border-black w-full h-full object-contain"
  />
</div>


  <div className="flex space-x-8 mt-6">
    <div className="flex flex-col items-start">
      <label className="text-lg font-semibold font-serif mb-2" htmlFor="your-answer">
        YOUR ANSWER:
      </label>
      <input
        id="your-answer"
        type="text"
        className="border border-gray-400 rounded-md px-4 py-2 text-black w-48"
      />
    </div>

    <div className="flex flex-col items-start">
      <label className="text-lg font-serif font-semibold mb-2" htmlFor="ai-answer">
        AI ANSWER:
      </label>
      <input
        id="ai-answer"
        type="text"
        className="border border-gray-400 rounded-md px-4 py-2 text-black w-48"
        value="YOU MATCHED!"
        readOnly
      />
      <div className="text-red-600 text-xl mt-2 font-bold">GAME OVER!</div>
    </div>
  </div>

  <button className="mt-6 px-6 py-2 bg-black font-serif text-white rounded-md hover:bg-gray-800 transition text-xl">
    SUBMIT
  </button>
</div>

    );
  }