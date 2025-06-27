import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface PuzzleProps {
  onComplete: (score: number, stars: number) => void;
  onClose: () => void;
}

type Tile = number | null;

export default function Puzzle({ onComplete, onClose }: PuzzleProps) {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [moves, setMoves] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const GRID_SIZE = 3;
  const TOTAL_TILES = GRID_SIZE * GRID_SIZE;
  const WINNING_POSITION = [1, 2, 3, 4, 5, 6, 7, 8, null];

  useEffect(() => {
    if (isPlaying && !gameComplete) {
      const timer = setInterval(() => {
        setTimeElapsed(t => t + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isPlaying, gameComplete]);

  const shuffleTiles = (): Tile[] => {
    let shuffled = [...WINNING_POSITION];
    
    // Perform 1000 random valid moves to ensure solvability
    for (let i = 0; i < 1000; i++) {
      const emptyIndex = shuffled.indexOf(null);
      const possibleMoves = getValidMoves(emptyIndex);
      const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      
      // Swap empty tile with random valid move
      [shuffled[emptyIndex], shuffled[randomMove]] = [shuffled[randomMove], shuffled[emptyIndex]];
    }
    
    return shuffled;
  };

  const getValidMoves = (emptyIndex: number): number[] => {
    const moves: number[] = [];
    const row = Math.floor(emptyIndex / GRID_SIZE);
    const col = emptyIndex % GRID_SIZE;

    // Up
    if (row > 0) moves.push((row - 1) * GRID_SIZE + col);
    // Down
    if (row < GRID_SIZE - 1) moves.push((row + 1) * GRID_SIZE + col);
    // Left
    if (col > 0) moves.push(row * GRID_SIZE + (col - 1));
    // Right
    if (col < GRID_SIZE - 1) moves.push(row * GRID_SIZE + (col + 1));

    return moves;
  };

  const initializeGame = () => {
    setTiles(shuffleTiles());
    setMoves(0);
    setTimeElapsed(0);
    setGameComplete(false);
    setIsPlaying(true);
  };

  const moveTile = (index: number) => {
    if (!isPlaying || gameComplete) return;

    const emptyIndex = tiles.indexOf(null);
    const validMoves = getValidMoves(emptyIndex);

    if (validMoves.includes(index)) {
      const newTiles = [...tiles];
      [newTiles[emptyIndex], newTiles[index]] = [newTiles[index], newTiles[emptyIndex]];
      
      setTiles(newTiles);
      setMoves(moves + 1);

      // Check if puzzle is solved
      if (JSON.stringify(newTiles) === JSON.stringify(WINNING_POSITION)) {
        setGameComplete(true);
        setIsPlaying(false);
      }
    }
  };

  const finishGame = () => {
    const timeBonus = Math.max(0, 300 - timeElapsed); // 5 minutes max
    const moveEfficiency = Math.max(0, 50 - moves);
    const score = timeBonus + moveEfficiency;
    
    let stars = 1;
    if (gameComplete) {
      if (moves <= 25 && timeElapsed <= 60) stars = 5;
      else if (moves <= 35 && timeElapsed <= 120) stars = 4;
      else if (moves <= 50 && timeElapsed <= 180) stars = 3;
      else if (moves <= 75) stars = 2;
    }
    
    onComplete(score, stars);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTilePosition = (value: Tile) => {
    if (value === null) return null;
    const correctIndex = WINNING_POSITION.indexOf(value);
    const currentIndex = tiles.indexOf(value);
    
    if (correctIndex === currentIndex) {
      return 'correct';
    }
    return 'incorrect';
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-bold">Sliding Puzzle</h3>
        <div className="flex justify-center gap-4 text-sm">
          <span>Moves: {moves}</span>
          <span>Time: {formatTime(timeElapsed)}</span>
        </div>
      </div>

      {!isPlaying && !gameComplete && (
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Arrange the numbers in order from 1 to 8
          </p>
          <Button onClick={initializeGame}>Start Puzzle</Button>
        </div>
      )}

      {(isPlaying || gameComplete) && (
        <div className="grid grid-cols-3 gap-2 max-w-60 mx-auto">
          {tiles.map((tile, index) => (
            <Button
              key={index}
              variant={tile === null ? "ghost" : "outline"}
              className={`h-16 w-16 text-xl font-bold ${
                tile === null 
                  ? 'bg-gray-100 dark:bg-gray-800 cursor-default border-dashed' 
                  : getTilePosition(tile) === 'correct'
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => moveTile(index)}
              disabled={tile === null}
            >
              {tile}
            </Button>
          ))}
        </div>
      )}

      {gameComplete && (
        <div className="text-center space-y-2">
          <p className="text-lg font-bold">🎉 Puzzle Solved!</p>
          <p className="text-sm">
            Completed in {moves} moves and {formatTime(timeElapsed)}
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={initializeGame}>New Puzzle</Button>
            <Button variant="outline" onClick={finishGame}>Finish</Button>
          </div>
        </div>
      )}

      {isPlaying && !gameComplete && (
        <div className="text-center">
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={finishGame}>Save & Exit</Button>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
      )}

      {!isPlaying && !gameComplete && (
        <div className="text-center">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      )}
    </div>
  );
}
