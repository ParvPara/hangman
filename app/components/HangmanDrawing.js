const HangmanDrawing = ({ mistakes, filledParts = 0 }) => {
  // Helper function to determine part style
  const getPartStyle = (partNumber) => {
    if (partNumber <= filledParts) {
      return 'stroke-black dark:stroke-white' // Filled parts (black/white in dark mode)
    }
    if (partNumber <= mistakes + filledParts) {
      return 'stroke-red-500' // Mistake parts (red)
    }
    return 'stroke-gray-800 dark:stroke-white' // Default color
  }
  
  return (
    <svg width="200" height="250" className="stroke-gray-800 dark:stroke-white">
      {/* Base */}
      <line x1="40" y1="230" x2="160" y2="230" strokeWidth="4" />
      
      {/* Vertical pole */}
      <line x1="100" y1="230" x2="100" y2="30" strokeWidth="4" />
      
      {/* Top */}
      <line x1="100" y1="30" x2="140" y2="30" strokeWidth="4" />
      
      {/* Rope */}
      <line x1="140" y1="30" x2="140" y2="50" strokeWidth="4" />
      
      {/* Head */}
      <circle 
        cx="140" 
        cy="70" 
        r="20" 
        fill="none" 
        strokeWidth="4"
        className={getPartStyle(1)}
        style={{ display: mistakes + filledParts >= 1 ? 'block' : 'none' }}
      />
      
      {/* Body */}
      <line 
        x1="140" y1="90" x2="140" y2="150" 
        strokeWidth="4"
        className={getPartStyle(2)}
        style={{ display: mistakes + filledParts >= 2 ? 'block' : 'none' }}
      />
      
      {/* Left arm */}
      <line 
        x1="140" y1="110" x2="110" y2="130" 
        strokeWidth="4"
        className={getPartStyle(3)}
        style={{ display: mistakes + filledParts >= 3 ? 'block' : 'none' }}
      />
      
      {/* Right arm */}
      <line 
        x1="140" y1="110" x2="170" y2="130" 
        strokeWidth="4"
        className={getPartStyle(4)}
        style={{ display: mistakes + filledParts >= 4 ? 'block' : 'none' }}
      />
      
      {/* Left leg */}
      <line 
        x1="140" y1="150" x2="110" y2="180" 
        strokeWidth="4"
        className={getPartStyle(5)}
        style={{ display: mistakes + filledParts >= 5 ? 'block' : 'none' }}
      />
      
      {/* Right leg */}
      <line 
        x1="140" y1="150" x2="170" y2="180" 
        strokeWidth="4"
        className={getPartStyle(6)}
        style={{ display: mistakes + filledParts >= 6 ? 'block' : 'none' }}
      />
    </svg>
  )
}

export default HangmanDrawing 