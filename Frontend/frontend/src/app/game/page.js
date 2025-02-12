'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';


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
      const question = response.choices[0].message.content

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
        Are these two answers: "${userAnswer}" AND "${aiAnswer}", the same response to this question: ${question}. 
        If the two answers are identical except for typos, then consider them the same. 
        You keep considering different answers (ex. brutal and Good 4 u) as the same! Please avoid this at all costs!!!!
        If the two answers do not match, then they are not the same!
        
        Example 1:
          Question: 'Name a fruit.'
          User answer: 'Apple.'
          AI answer: 'apple.'
          Response: 'Yes.'

        Example 2:
          Question: 'Name a U.S. state.'
          User answer: 'CA'
          AI answer: 'California'
          Response: 'Yes.'

        Example 3:
          Question: 'Name a type of transportation.'
          User answer: 'Bicycle'
          AI answer: 'Bike'
          Response: 'Yes.'

        Example 4:
          Question: 'Name a color.'
          User answer: 'Red'
          AI answer: 'Blue'
          Response: 'No.'

        Example 5:
          Question: 'Name a Taylor Swift song.'
          User answer: 'New Romantics'
          AI answer: 'Blank Space'
          Response: 'No.'

        Respond with 'Yes' or 'No' only please! Thank you! Take your time when responding and double check your work atleast twice! If you are not sure, then respond with 'No'.
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !showAnswers && !isLoading) {
                        submitAnswer();
                      }
                    }}
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
                <p className="text-gray-600 text-lg mb-4">If you were right and didn't match the AI, use the override button to keep going, but be honest please!</p>
                <div className="flex gap-4 justify-center">
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-black text-white rounded-md hover:bg-[#FF7B94] transition"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={handleOverride}
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
                <p className="text-gray-600 text-lg mb-4">If you were right and didn't match the AI, use the override button to keep going, but be honest please!</p>
                <div className="flex gap-4 justify-center">
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-black text-white rounded-md hover:bg-[#FF7B94] transition"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={handleOverride}
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
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-black text-white rounded-md hover:bg-[#FF7B94] transition"
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