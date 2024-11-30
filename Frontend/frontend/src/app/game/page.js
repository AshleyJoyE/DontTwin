'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export default function GamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize state
  const [time, setTime] = useState(0);
  const [aiAnswer, setAiAnswer] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [question, setQuestion] = useState('');
  const [maxTime, setMaxTime] = useState(0);
  const [category, setCategory] = useState('');
  const [timerPaused, setTimerPaused] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameStatus, setGameStatus] = useState(null);
  const [dotCount, setDotCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedQuestion, setLoadedQuestion] = useState('');
  
  const loadQuestion = async (categoryValue) => {
    setTimerStarted(false);
    setIsLoading(true);
    try {
      // Create the prompt for generating a question
      const createCategoryPrompt = `
       The category is ${categoryValue}. Ask me to name anything related to the category. This could a name, concept, or something related to it. Below are some examples, which may or not be related to the category. 

      For example: 
      Name one united states president. 

      Another example: 
      Name one Taylor Swift album.
   
    
      Please don't do generic questions. However, don't be too creative. Just don't try to repeat alot. Also, make sure the question has more than 1 correct answer.
      `;

      // Generate question
      const result = await model.generateContent(createCategoryPrompt);
      const response = await result.response;
      const question = response.text();

      // Generate AI's answer
      const answerPrompt = `${question} Only write your answer, no other words`;
      const answerResult = await model.generateContent(answerPrompt);
      const answerResponse = await answerResult.response;
      const aiAnswer = answerResponse.text();

      console.log('Generated Question:', question); // Debug log
      console.log('Generated Answer:', aiAnswer);   // Debug log

      // Update state
      setLoadedQuestion(question);
      setAiAnswer(aiAnswer);
      setQuestion(question);
      setTimerPaused(false);
      setTimerStarted(maxTime !== -1);
      setShowAnswers(false);
      setGameStatus(null);
      setIsLoading(false);

    } catch (error) {
      console.error('Error generating question:', error);
      setIsLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer) return;

    setTimerPaused(true);
    setShowAnswers(true);

    try {
      // Check if user answer is valid
      const checkAnswerPrompt = `
        is ${userAnswer} an answer to this question, or very very close to being the answer to this question: ${question}. 
        Be triple, triple, sure that you check the newest sources to make sure answers are not marked as invalid when they are valid! 
        Only respond with yes or no, no other words please!
      `;
      
      const validityResult = await model.generateContent(checkAnswerPrompt);
      const validityResponse = await validityResult.response;
      const isValid = validityResponse.text().toLowerCase() === 'yes';

      if (!isValid) {
        setGameStatus('invalid');
        updateHighScore();
        return;
      }

      // Check if answers match
      const checkIdenticalPrompt = `
        Are these two answers: "${userAnswer}" AND "${aiAnswer}", the same response to this question: ${question}. 
        If the two answers are identical except for typos, then consider them the same. 
        You keep considering different answers (ex. brutal and Good 4 u) as the same! Please avoid this at all costs!!!!
        If the two answers do not match, then they are not the same!
        Only respond with yes or no please! 
      `;

      const matchResult = await model.generateContent(checkIdenticalPrompt);
      const matchResponse = await matchResult.response;
      const isMatching = matchResponse.text().toLowerCase() === 'yes';

      if (isMatching) {
        setGameStatus('matched');
        updateHighScore();
      } else {
        setScore(prevScore => prevScore + 1);
        setGameStatus('survived');
      }

    } catch (error) {
      console.error('Error checking answer:', error);
    }
  };

  useEffect(() => {
    // Get values from URL parameters
    const categoryParam = searchParams.get('category');
    const timeParam = searchParams.get('time');
    
    if (!categoryParam || !timeParam) {
      // Redirect back to home if parameters are missing
      router.push('/');
      return;
    }
    
    // Set the state with the received values
    setCategory(categoryParam);
    const parsedTime = parseInt(timeParam);
    setMaxTime(parsedTime);
    setTime(parsedTime);

    // Get high score from cache for this category
    const highScores = JSON.parse(localStorage.getItem('highScores') || '{}');
    const categoryKey = categoryParam.toLowerCase();
    setHighScore(highScores[categoryKey] || 0);

    // Load initial question
    loadQuestion(categoryParam);

  }, [searchParams]);

  // Loading dots animation
  useEffect(() => {
    if (showAnswers) return;
    
    const interval = setInterval(() => {
      setDotCount(prev => (prev + 1) % 4);
    }, 500);

    return () => clearInterval(interval);
  }, [showAnswers]);

  // Separate useEffect for timer
  useEffect(() => {
    if (!timerStarted || maxTime === -1) return;

    const timer = setInterval(() => {
      setTime(prevTime => {
        if (timerPaused) {
          return prevTime;
        }
        if (prevTime <= 0) {
          clearInterval(timer);
          setShowAnswers(true);
          setGameStatus('timeout');
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerStarted, timerPaused, maxTime]);

  const updateHighScore = () => {
    const highScores = JSON.parse(localStorage.getItem('highScores') || '{}');
    const categoryKey = category.toLowerCase();
    if (score > (highScores[categoryKey] || 0)) {
      highScores[categoryKey] = score;
      localStorage.setItem('highScores', JSON.stringify(highScores));
      setHighScore(score);
    }
  };

  const handleNextRound = () => {
    loadQuestion(category);
    setUserAnswer('');
    setTime(maxTime);
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-[hsla(320,69%,75%,1)] to-[hsla(349,100%,74%,1)] p-8 relative overflow-hidden">
      {/* Heart Background */}
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

      {/* Game Content */}
      <div className="relative z-20 flex flex-row w-full h-full">
        {/* Left Column */}
        <div className="w-[40vw] flex flex-col justify-center p-8">
          <h1 className="text-5xl font-bold mb-4 text-black">DON'T TWIN!</h1>
          <h2 className="text-lg font-bold">High Score ({category}): {highScore}</h2>
          <div className="text-xl text-2xl font-semibold mb-6">Current Score: {score}</div>
          <div className="text-xl text-2xl text-black font-semibold mb-6">You Get 1 Point For Each Round You Survive! </div>

          <button 
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition mb-8 text-xl border-2 border-black"
          >
            NEW GAME
          </button>
        </div>
        {/* Right Column */}  
        <div className="w-[60vw] h-full p-8">
           {/* Question */}
          <div className="w-full h-full bg-white/90 rounded-lg p-8 flex flex-col items-center justify-center max-w-3xl mx-auto">
            <h2 className="text-3xl mb-8 text-black font-semibold text-center">
              {isLoading ? (
                <span>Loading{'.'.repeat(dotCount)}</span>
              ) : (
                `Question: ${question}`
              )}
            </h2>
            
            {/* Timer */}
            {maxTime !== -1 && time >= 0 && (
              <div className="w-3/4 h-4 bg-gray-200 rounded-full mb-4">
                <div 
                  className="h-full bg-[#FF7B93] rounded-full transition-all duration-1000"
                  style={{width: `${(time/maxTime) * 100}%`}}
                />
              </div>
            )}

            {/* Unlimited time */}
            <div className="mb-8 text-xl text-black font-bold">
              {maxTime === -1 ? 'UNLIMITED TIME' : time >= 0 ? `${time} seconds left` : '0 seconds left'}
            </div>

           
            <div className="flex w-full max-w-2xl justify-center gap-12">
              <div className="flex-1 flex flex-col items-center border-r border-black pr-8">
                <div className="mb-4 text-xl font-semibold text-black">You</div>
                <div className="mb-4">
                  <svg className="w-12 h-12 text-[#FF7B93]" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 4a4 4 0 014 4 4 4 0 01-4 4 4 4 0 01-4-4 4 4 0 014-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4z"/>
                  </svg>
                </div>
                <div className="flex flex-col items-center gap-4 w-full">
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-md p-3 text-black"
                    placeholder="Enter your answer"
                    disabled={showAnswers || isLoading}
                  />
                  <button
                    onClick={submitAnswer}
                    className="px-6 py-3 bg-[#FF7B93] text-white rounded-md hover:bg-gray-800 transition w-full"
                    disabled={showAnswers || isLoading}
                  >
                    Submit
                  </button>
                </div>
                {showAnswers && userAnswer && <div className="mt-4 text-black font-bold">Your answer: {userAnswer}</div>}
              </div>

              {/* Right Column */}
              <div className="flex-1 flex flex-col items-center pl-8">
                <div className="mb-4 text-xl font-semibold text-black">AI</div>
                <div className="mb-4">
                  <svg className="w-12 h-12 text-[#FF7B93]" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>
                  </svg>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  {!showAnswers && (
                    <span className="text-5xl text-black">
                      {'.'.repeat(dotCount)}
                    </span>
                  )}
                </div>
                {showAnswers && aiAnswer && <div className="text-black font-bold">AI's Answer: {aiAnswer}</div>}
              </div>
            </div>

            {/* Game Status Messages */}
            {gameStatus === 'invalid' && (
              <div className="mt-8 text-center">
                <p className="text-red-600 text-xl font-bold mb-4">You entered an invalid answer! Game over!</p>
                <div className="flex gap-4 justify-center">
                  <button 
                    onClick={() => router.push('/')}
                    className="px-6 py-2 bg-black text-white rounded-md hover:bg-[#FF7B94] transition"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={submitAnswer}
                    className="px-6 py-2 bg-[#FF7B93] text-white rounded-md hover:bg-[#FF7B94] transition"
                  >
                    Override
                  </button>
                </div>
              </div>
            )}
            {gameStatus === 'matched' && (
              <div className="mt-8 text-center">
                <p className="text-red-600 text-xl font-bold mb-4">You matched the AI! Game over!</p>
                <div className="flex gap-4 justify-center">
                  <button 
                    onClick={() => router.push('/')}
                    className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={submitAnswer}
                    className="px-6 py-2 bg-[#FF7B93] text-white rounded-md hover:bg-[#FF7B94] transition"
                  >
                    Override
                  </button>
                </div>
              </div>
            )}
            {gameStatus === 'survived' && (
              <div className="mt-8 text-center">
                <p className="text-green-600 text-xl font-bold mb-4">You survived! Plus one point!</p>
                <button 
                  onClick={handleNextRound}
                  className="px-6 py-2 bg-[#FF7B93] text-white rounded-md hover:bg-[#FF7B94] transition"
                >
                  Next Round
                </button>
              </div>
            )}
            {gameStatus === 'timeout' && (
              <div className="mt-8 text-center">
                <p className="text-red-600 text-xl font-bold mb-4">Time's up! Game Over!</p>
                <button 
                  onClick={() => router.push('/')}
                  className="px-6 py-2 bg-[#FF7B93] text-white rounded-md hover:bg-[#FF7B94] transition"
                >
                  Play Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}