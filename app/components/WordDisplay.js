const WordDisplay = ({ word, guessedLetters, gameOver }) => {
  return (
    <div className="flex gap-2 text-4xl font-mono mb-8">
      {word.split('').map((letter, index) => (
        <div
          key={index}
          className="w-10 h-12 border-b-4 border-gray-800 dark:border-white flex items-center justify-center"
        >
          <span className={gameOver || guessedLetters.has(letter) ? 'visible' : 'invisible'}>
            {letter}
          </span>
        </div>
      ))}
    </div>
  )
}

export default WordDisplay 