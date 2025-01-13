'use client'

import { useState, useEffect } from 'react'
import HangmanDrawing from './components/HangmanDrawing'
import WordDisplay from './components/WordDisplay'
import Keyboard from './components/Keyboard'

const DIFFICULTY_SETTINGS = {
  easy: { maxMistakes: 8, timeLimit: null, hintsAllowed: 3 },
  normal: { maxMistakes: 6, timeLimit: null, hintsAllowed: 1 },
  hard: { maxMistakes: 4, timeLimit: 120, hintsAllowed: 0 }
}

const POWER_UPS = {
  extraLife: {
    name: 'Extra Life',
    description: 'Adds one extra life',
    icon: '❤️',
    effect: (state) => {
      const settings = DIFFICULTY_SETTINGS[state.difficulty]
      return { ...state, maxMistakes: settings.maxMistakes + 1 }
    }
  },
  revealVowels: {
    name: 'Reveal Vowels',
    description: 'Reveals all vowels (correct or not)',
    icon: '👁️',
    effect: (state) => {
      const vowels = new Set(['A', 'E', 'I', 'O', 'U'])
      const newGuessedLetters = new Set(state.guessedLetters)
      vowels.forEach(vowel => newGuessedLetters.add(vowel))
      return { 
        ...state, 
        guessedLetters: newGuessedLetters,
        revealedVowels: true
      }
    }
  },
  timeBonus: {
    name: 'Time Bonus',
    description: 'Adds 30 seconds (Hard mode only)',
    icon: '⏰',
    effect: (state) => {
      if (state.timeLeft === null) return state
      return { ...state, timeLeft: state.timeLeft + 30 }
    }
  },
  fiftyFifty: {
    name: '50/50 Chance',
    description: '50% chance: Reveal half word OR Fill half hangman and reduce lives',
    icon: '🎲',
    effect: (state) => {
      // Randomly decide which effect to apply (50% chance)
      const isRevealWord = Math.random() < 0.5
      
      if (isRevealWord) {
        // Reveal 50% of unrevealed letters (Good outcome)
        const unrevealedLetters = [...state.word].filter(letter => !state.guessedLetters.has(letter))
        const numToReveal = Math.floor(unrevealedLetters.length / 2)
        const shuffled = unrevealedLetters.sort(() => Math.random() - 0.5)
        const lettersToReveal = shuffled.slice(0, numToReveal)
        
        const newGuessedLetters = new Set(state.guessedLetters)
        lettersToReveal.forEach(letter => newGuessedLetters.add(letter))
        
        return {
          ...state,
          guessedLetters: newGuessedLetters,
          fiftyFiftyResult: 'revealed'
        }
      } else {
        // Fill in half of the hangman parts AND reduce max mistakes (Bad outcome)
        const settings = DIFFICULTY_SETTINGS[state.difficulty]
        const filledParts = Math.floor(settings.maxMistakes / 2)
        const newMaxMistakes = settings.maxMistakes - filledParts
        
        return {
          ...state,
          filledHangmanParts: filledParts,
          maxMistakes: newMaxMistakes,
          fiftyFiftyResult: 'hangman'
        }
      }
    }
  }
}

const MIN_WORD_LENGTH = 4
const MAX_WORD_LENGTH = 8

export default function Home() {
  const [word, setWord] = useState('')
  const [guessedLetters, setGuessedLetters] = useState(new Set())
  const [mistakes, setMistakes] = useState(0)
  const [gameStatus, setGameStatus] = useState('setup') // 'setup', 'playing', 'won', 'lost'
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [wordLength, setWordLength] = useState(null)
  const [difficulty, setDifficulty] = useState('normal')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(null)
  const [hintsLeft, setHintsLeft] = useState(1)
  const [streak, setStreak] = useState(0)
  const [selectedPowerUp, setSelectedPowerUp] = useState(null)
  const [powerUpLetter, setPowerUpLetter] = useState(null)
  const [powerUpActivated, setPowerUpActivated] = useState(false)
  const [revealedVowels, setRevealedVowels] = useState(false)
  const [fiftyFiftyResult, setFiftyFiftyResult] = useState(null)
  const [filledHangmanParts, setFilledHangmanParts] = useState(0)
  const [currentMaxMistakes, setCurrentMaxMistakes] = useState(null)

  useEffect(() => {
    if (timeLeft === 0) {
      setGameStatus('lost')
    }
    if (timeLeft !== null && timeLeft > 0 && gameStatus === 'playing') {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft, gameStatus])

  const getRandomWordLength = () => {
    return Math.floor(Math.random() * (MAX_WORD_LENGTH - MIN_WORD_LENGTH + 1)) + MIN_WORD_LENGTH
  }

  const fetchRandomWord = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const length = getRandomWordLength()
      setWordLength(length)
      
      const response = await fetch(`https://random-word-api.herokuapp.com/word?length=${length}`)
      if (!response.ok) throw new Error('Failed to fetch word')
      const [word] = await response.json()
      return word.toUpperCase()
    } catch (err) {
      setError('Failed to fetch a new word. Using fallback word.')
      return 'REACT'
    } finally {
      setIsLoading(false)
    }
  }

  const startNewGame = async (newDifficulty = difficulty) => {
    if (!selectedPowerUp || !powerUpLetter) {
      setError('Please select a power-up and power-up letter first!')
      return
    }

    const settings = DIFFICULTY_SETTINGS[newDifficulty]
    const newWord = await fetchRandomWord()
    setWord(newWord)
    setGuessedLetters(new Set())
    setMistakes(0)
    setGameStatus('playing')
    setDifficulty(newDifficulty)
    setTimeLeft(settings.timeLimit)
    setHintsLeft(settings.hintsAllowed)
    setPowerUpActivated(false)
    setRevealedVowels(false)
    setFiftyFiftyResult(null)
    setFilledHangmanParts(0)
    setCurrentMaxMistakes(settings.maxMistakes)
  }

  const calculateScore = (wordLength, mistakesMade, timeBonus) => {
    const baseScore = wordLength * 100
    const mistakesPenalty = mistakesMade * 50
    return baseScore - mistakesPenalty + timeBonus
  }

  const activatePowerUp = () => {
    if (!selectedPowerUp || powerUpActivated) return

    const powerUp = POWER_UPS[selectedPowerUp]
    const newState = powerUp.effect({
      difficulty,
      word,
      guessedLetters: new Set([...guessedLetters, powerUpLetter]),
      timeLeft,
      revealedVowels
    })

    const updatedGuessedLetters = new Set(newState.guessedLetters || guessedLetters)
    updatedGuessedLetters.add(powerUpLetter)
    setGuessedLetters(updatedGuessedLetters)

    setTimeLeft(newState.timeLeft || timeLeft)
    setRevealedVowels(newState.revealedVowels || revealedVowels)
    
    if (newState.fiftyFiftyResult) {
      setFiftyFiftyResult(newState.fiftyFiftyResult)
      if (newState.filledHangmanParts) {
        setFilledHangmanParts(newState.filledHangmanParts)
        setCurrentMaxMistakes(newState.maxMistakes)
      }
    }
    
    setPowerUpActivated(true)
  }

  const handleGuess = (letter) => {
    if (gameStatus !== 'playing') return

    const newGuessedLetters = new Set(guessedLetters)
    newGuessedLetters.add(letter)
    setGuessedLetters(newGuessedLetters)

    // Check if power-up letter was guessed correctly
    if (letter === powerUpLetter && word.includes(letter) && !powerUpActivated) {
      activatePowerUp()
    }

    // Don't count mistakes for revealed vowels if using the vowel power-up
    const isVowel = ['A', 'E', 'I', 'O', 'U'].includes(letter)
    if (!word.includes(letter) && !(revealedVowels && isVowel)) {
      const newMistakes = mistakes + 1
      setMistakes(newMistakes)
      // Check if we've exceeded the allowed mistakes
      if (newMistakes >= currentMaxMistakes) {
        setGameStatus('lost')
        setStreak(0)
      }
    } else {
      const isWon = [...word].every(letter => newGuessedLetters.has(letter))
      if (isWon) {
        const timeBonus = timeLeft ? timeLeft * 10 : 0
        const newScore = calculateScore(word.length, mistakes, timeBonus)
        setScore(score + newScore)
        setStreak(streak + 1)
        setGameStatus('won')
      }
    }
  }

  const setupGame = () => {
    if (!selectedPowerUp || !powerUpLetter) {
      setError('Please select both a power-up and a power-up letter!')
      return
    }
    startNewGame(difficulty)
  }

  const useHint = () => {
    if (hintsLeft <= 0 || gameStatus !== 'playing') return

    const unrevealedLetters = [...word].filter(letter => !guessedLetters.has(letter))
    if (unrevealedLetters.length === 0) return

    const randomLetter = unrevealedLetters[Math.floor(Math.random() * unrevealedLetters.length)]
    const newGuessedLetters = new Set(guessedLetters)
    newGuessedLetters.add(randomLetter)
    setGuessedLetters(newGuessedLetters)
    setHintsLeft(hintsLeft - 1)
  }

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8 flex flex-col items-center min-h-screen">
        <h1 className="text-4xl font-bold mb-8 text-gray-800 dark:text-white">Hangman</h1>
        <div className="text-xl">Loading...</div>
      </main>
    )
  }

  if (gameStatus === 'setup') {
    return (
      <main className="container mx-auto px-4 py-8 flex flex-col items-center min-h-screen">
        <h1 className="text-4xl font-bold mb-8 text-gray-800 dark:text-white">Hangman</h1>
        
        {error && (
          <div className="mb-4 text-red-500">{error}</div>
        )}

        <div className="w-full max-w-md space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200">Select Your Power-Up</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(POWER_UPS).map(([key, powerUp]) => (
                <button
                  key={key}
                  onClick={() => setSelectedPowerUp(key)}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    selectedPowerUp === key
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                      : 'border-gray-200 hover:border-blue-300 dark:border-gray-700'
                  }`}
                >
                  <div className="text-2xl mb-2">{powerUp.icon}</div>
                  <div className="font-bold">{powerUp.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{powerUp.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200">Choose Power-Up Letter</h2>
            <select
              value={powerUpLetter || ''}
              onChange={(e) => setPowerUpLetter(e.target.value)}
              className="w-full p-2 rounded border dark:bg-gray-800"
            >
              <option value="">Select a letter...</option>
              {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map(letter => (
                <option key={letter} value={letter}>{letter}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200">Select Difficulty</h2>
            <select 
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full p-2 rounded border dark:bg-gray-800"
            >
              <option value="easy">Easy</option>
              <option value="normal">Normal</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <button
            onClick={setupGame}
            className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Start Game
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8 flex flex-col items-center min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-gray-800 dark:text-white">Hangman</h1>
      
      <div className="flex gap-4 mb-4">
        <div className="text-gray-600 dark:text-gray-300">Score: {score}</div>
        <div className="text-gray-600 dark:text-gray-300">Streak: {streak}🔥</div>
        {timeLeft !== null && (
          <div className="text-gray-600 dark:text-gray-300">Time: {timeLeft}s</div>
        )}
      </div>

      {error && (
        <div className="mb-4 text-red-500">{error}</div>
      )}

      <div className="flex gap-4 mb-4 items-center">
        <div className="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded">
          {currentMaxMistakes} lives
        </div>

        {selectedPowerUp && (
          <div className={`flex items-center gap-2 px-3 py-1 rounded ${
            powerUpActivated 
              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
              : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
          }`}>
            {POWER_UPS[selectedPowerUp].icon}
            {powerUpActivated 
              ? selectedPowerUp === 'fiftyFifty'
                ? `${fiftyFiftyResult === 'revealed' 
                    ? '👍 Half Word Revealed!' 
                    : '💀 Half Hangman Filled & Lives Reduced!'}`
                : 'Active!'
              : `Unlock with letter "${powerUpLetter}"`}
          </div>
        )}

        {hintsLeft > 0 && (
          <button
            onClick={useHint}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
          >
            Use Hint ({hintsLeft})
          </button>
        )}
      </div>

      <div className="mb-4 text-gray-600 dark:text-gray-300">
        Word Length: {wordLength} letters | Mistakes: {mistakes}/{currentMaxMistakes}
      </div>

      <button
        onClick={() => setGameStatus('setup')}
        className="mb-8 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        {gameStatus === 'playing' ? 'Restart Game' : 'Play Again'}
      </button>

      <div className="w-full max-w-md flex flex-col items-center gap-8">
        <HangmanDrawing mistakes={mistakes} filledParts={filledHangmanParts} />
        
        <WordDisplay 
          word={word} 
          guessedLetters={guessedLetters} 
          gameOver={gameStatus !== 'playing'} 
        />

        {gameStatus !== 'playing' && (
          <div className="text-xl font-bold text-center">
            {gameStatus === 'won' ? (
              <div>
                <p className="text-green-600">🎉 Congratulations! You won!</p>
                <p className="text-sm mt-2">+{calculateScore(word.length, mistakes, timeLeft ? timeLeft * 10 : 0)} points</p>
              </div>
            ) : (
              <p className="text-red-600">💀 Game Over! The word was: {word}</p>
            )}
          </div>
        )}

        <Keyboard 
          guessedLetters={guessedLetters} 
          word={word}
          onGuess={handleGuess}
          disabled={gameStatus !== 'playing'}
        />
      </div>
    </main>
  )
}
