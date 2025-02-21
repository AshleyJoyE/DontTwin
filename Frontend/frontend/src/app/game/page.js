'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

// Add these constants at the top of the file, outside of any component
const HEART_COUNT = 200;
const heartPositions = [...Array(HEART_COUNT)].map(() => ({
  left: Math.random() * 100,
  top: Math.random() * 100,
  translateX: Math.random() * 100 - 50,
  translateY: Math.random() * 100 - 50,
  duration: Math.random() * 10 + 15,
}));

export default function GamePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GameContent />
    </Suspense>
  );
}

function GameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const curr_model_2 = "openai/gpt-4o-mini";
  const curr_model = "google/gemini-2.0-flash-001"
  
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
  const [pastQuestions, setPastQuestions] = useState([]);
  const apiKey = process.env.NEXT_PUBLIC_MODEL_API;
  
  // Add this function to clean the question text
  const cleanQuestionText = (text) => {
    return text.replace(/[^\w\s.,!?'-]/g, '').trim();
  };

  const loadQuestion = async (categoryValue) => {
    setTimerStarted(false);
    setIsLoading(true);
    try {
      // Create the prompt for generating a question
      const createCategoryPrompt = `
       The category is ${categoryValue}. Ask a question about this category.
       
       Here are the questions that have already been asked, do not ask these questions again under any circumstance:
       ${pastQuestions.join('\n')}

       Example responses: 
        - Name one united states president. 
        - Name one Taylor Swift album.
   
       Please give easy to medium level questions. Make sure the question has more than 1 correct answer. And make sure the question has a correct answer!!!
       The question should be unique and not similar to any previously asked questions.
       DON'T EXPLAIN WHY THE QUESTION IS GOOD! JUST STATE THE QUESTION!
      `;

      // Generate question
      const result = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: curr_model,
          messages: [
            {
              role: 'user',
              content: createCategoryPrompt,
            },
          ],
        }),
      });
      const response = await result.json()
      const question = cleanQuestionText(response.choices[0].message.content);

      // Save question to past questions
      setPastQuestions(prev => [...prev, question]);

      // Generate AI's answer
      const answerPrompt = `${question} Only write your answer, no other words`;
      const answerResult = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: curr_model,
          messages: [
            {
              role: 'user',
              content: answerPrompt,
            },
          ],
        }),
      });
      const answerResponse = await answerResult.json();
      const aiAnswer = answerResponse.choices[0].message.content;

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
        Given the question: ${question}, please determine if the user's response: ${userAnswer}, accurately answers the question or is it very similar to a correct answer?
        Consider answers correct if they:
          - Contain minor typos (e.g., 'Aplpe' for 'Apple').
          - Include only part of a name (e.g., 'Shakespeare' for 'William Shakespeare').
          - Use abbreviations or shorthand (e.g., 'LA' for 'Los Angeles').
          - Use alternate spellings (e.g., 'Color' for 'Colour').

        Examples of Question and Answers that result in a 'Yes':
          Question: 'Name a fruit that is red.'
          User answer: 'Aplpe.'
          Response: 'Yes.'

          Question: 'Name a U.S. state.'
          User answer: 'CA.'
          Response: 'Yes.'


        Examples of Question and Answers that result in a 'No':
          Question: 'Name a fruit that is red.'
          User answer: 'Carrot.'
          Response: 'No.'

          Question: 'Name an animal that flies.'
          User answer: 'Chicken.'
          Response: 'No.'
          
          (Explanation: While chickens can briefly flutter, they are not typically considered flying animals, so the response is No.)


        Respond with 'Yes' or 'No' only please!! Thank you! Take your time when responding and double check your work atleast twice! If you are not sure, then respond with 'No'.
      `;
      
      const validityResult = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: curr_model_2,
          messages: [
            {
              role: 'user',
              content: checkAnswerPrompt,
            },
          ],
        }),
      });
      var validityResponse = await validityResult.json();
      validityResponse = validityResponse.choices[0].message.content.toLowerCase().match(/^(yes|no)\b/)?.[0] || "invalid response";
      const isValid = validityResponse === 'yes';

      if (!isValid) {
        setGameStatus('invalid');
        updateHighScore();
        return;
      }

      // Check if answers match
      const checkIdenticalPrompt = `
        Are these two answers: "${userAnswer}" AND "${aiAnswer}", the same response to this question: ${question}?  

        - If the answers are identical except for typos, capitalization, punctuation, or spacing, respond with "Yes."  
        - If the answers differ in meaning, intent, or reference, respond with "No."  
        - Do **not** mistakenly consider different answers (e.g., "brutal" vs. "Good 4 U") as the same.  
        - If unsure, respond with "No."  

        **Examples:**  
        1. Q: "Name a fruit." | User: "Apple." | AI: "apple" → **"Yes."**  
        2. Q: "Name a U.S. state." | User: "CA" | AI: "California" → **"Yes."**  
        3. Q: "Name a Taylor Swift song." | User: "New Romantics" | AI: "Blank Space" → **"No."**  
        4. Q: "Name a Taylor Swift song." | User: "august" | AI: "August." → **"Yes."**  

        Respond **only** with "Yes" or "No." Double-check your work.

         `;

      const matchResult = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: curr_model_2,
          messages: [
            {
              role: 'user',
              content: checkIdenticalPrompt,
            },
          ],
        }),
      });
      const matchResponse = await matchResult.json();
      const answerMatch = matchResponse.choices[0].message.content.toLowerCase().match(/^(yes|no)\b/)?.[0] || "invalid response"; 
      console.log(answerMatch)
      const isMatching = answerMatch === 'yes';

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

  // Add this handler for the Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !showAnswers && !isLoading && userAnswer.trim()) {
      submitAnswer();
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

  const handleOverride = () => {
    setScore(prevScore => prevScore + 1);
    setGameStatus('survived');
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-500 to-orange-400 p-4 md:p-10 relative overflow-hidden">
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4565553802835245"
     crossorigin="anonymous"></script>
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

      {/* Game Content */}
      <div className="relative z-20 flex flex-col lg:flex-row w-full h-full gap-8 max-w-6xl">

        {/* Left Column - Added Overlay for Better Contrast */}
        <div className="w-full lg:w-[35%] relative flex flex-col justify-center items-center text-white text-center p-6 md:p-10">
          <div className="absolute inset-0 bg-pink-900/40 rounded-lg"></div> 
          <div className="relative z-10">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6">DON'T TWIN!</h1>
            <h2 className="text-lg md:text-2xl font-semibold">High Score: {highScore}</h2>
            <p className="text-xl md:text-2xl font-light mb-8">Current Score: {score}</p>
            <button 
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-orange-200 text-pink-900 font-bold text-xl rounded-md hover:bg-orange-300 transition border border-orange-400 w-full md:w-auto"
            >
              NEW GAME
            </button>
          </div>
        </div>

        {/* Right Column - Game Interaction */}
        <div className="w-full lg:w-[65%] bg-white/90 rounded-lg p-6 md:p-10 flex flex-col items-center shadow-lg border border-pink-200">

          {/* Question Box */}
          <h2 className="text-xl md:text-3xl mb-6 text-gray-900 font-semibold text-center">
            {isLoading ? (
              <span>Loading{'.'.repeat(dotCount)}</span>
            ) : (
              `Question: ${question}`
            )}
          </h2>

          {/* Timer Bar */}
          {maxTime !== -1 && time >= 0 && (
            <div className="w-full md:w-3/4 h-4 bg-gray-300 rounded-full mb-4">
              <div 
                className="h-full bg-pink-700 rounded-full transition-all duration-1000"
                style={{ width: `${(time / maxTime) * 100}%` }}
              />
            </div>
          )}
          <div className="mb-6 text-lg md:text-xl text-gray-900 font-bold">
            {maxTime === -1 ? 'UNLIMITED TIME' : time >= 0 ? `${time} seconds left` : '0 seconds left'}
          </div>

          {/* Answer Input & AI Display */}
          <div className="flex flex-col md:flex-row w-full max-w-2xl justify-center gap-8 md:gap-12">

            {/* Player Section */}
            <div className="flex-1 flex flex-col items-center bg-white rounded-lg p-6 shadow-md border border-pink-200">
              <div className="mb-4 text-xl font-semibold text-gray-900">You</div>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full border-2 border-pink-300 rounded-md p-3 text-gray-900 text-lg"
                placeholder="Enter your answer"
                disabled={showAnswers || isLoading}
              />
              <button
                onClick={submitAnswer}
                className="mt-4 px-6 py-3 bg-pink-600 text-white font-bold rounded-md hover:bg-pink-700 transition w-full"
                disabled={showAnswers || isLoading}
              >
                Submit
              </button>
            </div>

            {/* AI Section */}
            <div className="flex-1 flex flex-col items-center bg-white rounded-lg p-6 shadow-md border border-pink-200">
              <div className="mb-4 text-xl font-semibold text-gray-900">AI</div>
              {showAnswers && aiAnswer && <div className="text-gray-900 font-bold">AI's Answer: {aiAnswer}</div>}
            </div>
          </div>

          {/* GAME FEEDBACK MESSAGE (Muted Colors) */}
          {gameStatus && (
            <div className={`mt-6 px-6 py-4 rounded-md text-center text-lg font-bold transition-all duration-500 ${
              gameStatus === 'matched' ? "bg-pink-900 text-white" :
              gameStatus === 'survived' ? "bg-orange-500 text-white" :
              "bg-pink-700 text-white"
            }`}>
              {gameStatus === 'matched' && "You matched the AI! Game Over!"}
              {gameStatus === 'survived' && "You survived! +1 Point!"}
              {gameStatus === 'invalid' && "Invalid answer! Try Again!"}
              {gameStatus === 'timeout' && "Time's up! Game Over!"}
            </div>
          )}

          {/* Next Round / Restart / Override Buttons (Different Shades of Pink) */}
          <div className="flex gap-4 mt-6">
            {gameStatus === 'survived' && (
              <button 
                onClick={handleNextRound}
                className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
              >
                Next Round
              </button>
            )}
            {(gameStatus === 'matched' || gameStatus === 'invalid' || gameStatus === 'timeout') && (
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition"
              >
                Play Again
              </button>
            )}
            {(gameStatus === 'invalid' || gameStatus === 'matched') && (
              <button
                onClick={handleOverride}
                className="px-6 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition"
              >
                Override
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}