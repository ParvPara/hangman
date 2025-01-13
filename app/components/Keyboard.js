const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
]

const Keyboard = ({ guessedLetters, word, onGuess, disabled }) => {
  const getButtonStyle = (letter) => {
    if (!guessedLetters.has(letter)) {
      return 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
    }
    return word.includes(letter)
      ? 'bg-green-500 text-white cursor-not-allowed'
      : 'bg-red-500 text-white cursor-not-allowed'
  }

  return (
    <div className="w-full max-w-3xl flex flex-col items-center gap-2">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1">
          {row.map((letter) => (
            <button
              key={letter}
              onClick={() => onGuess(letter)}
              disabled={disabled || guessedLetters.has(letter)}
              className={`
                w-10 h-12 rounded font-bold transition-colors
                ${getButtonStyle(letter)}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {letter}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

export default Keyboard 