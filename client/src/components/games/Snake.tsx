import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface SnakeProps {
  onComplete: (score: number, stars: number) => void;
  onClose: () => void;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

const GRID_SIZE = 15;
const INITIAL_SNAKE = [{ x: 7, y: 7 }];
const INITIAL_FOOD = { x: 10, y: 10 };

export default function Snake({ onComplete, onClose }: SnakeProps) {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>(INITIAL_FOOD);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const generateFood = useCallback((): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, [snake]);

  const moveSnake = useCallback(() => {
    if (!isPlaying || gameOver) return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };

      switch (direction) {
        case 'UP':
          head.y -= 1;
          break;
        case 'DOWN':
          head.y += 1;
          break;
        case 'LEFT':
          head.x -= 1;
          break;
        case 'RIGHT':
          head.x += 1;
          break;
      }

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameOver(true);
        setIsPlaying(false);
        return currentSnake;
      }

      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        setIsPlaying(false);
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(s => s + 10);
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, isPlaying, gameOver, food, generateFood]);

  useEffect(() => {
    if (isPlaying && !gameOver) {
      const gameInterval = setInterval(moveSnake, 150);
      return () => clearInterval(gameInterval);
    }
  }, [moveSnake, isPlaying, gameOver]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying) return;

      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, isPlaying]);

  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection('RIGHT');
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  const stopGame = () => {
    setIsPlaying(false);
    if (score > highScore) {
      setHighScore(score);
    }
  };

  const finishGame = () => {
    stopGame();
    const finalScore = Math.max(score, highScore);
    const stars = finalScore >= 100 ? 5 : finalScore >= 80 ? 4 : finalScore >= 60 ? 3 : finalScore >= 40 ? 2 : 1;
    onComplete(finalScore, stars);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-bold">Snake Game</h3>
        <div className="flex justify-center gap-4 text-sm">
          <span>Score: {score}</span>
          <span>High Score: {highScore}</span>
        </div>
      </div>

      <div className="max-w-96 mx-auto">
        <div 
          className="grid gap-0 border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
            const x = index % GRID_SIZE;
            const y = Math.floor(index / GRID_SIZE);
            
            const isSnake = snake.some(segment => segment.x === x && segment.y === y);
            const isHead = snake.length > 0 && snake[0].x === x && snake[0].y === y;
            const isFood = food.x === x && food.y === y;

            return (
              <div
                key={index}
                className={`w-6 h-6 border border-gray-200 dark:border-gray-700 ${
                  isFood
                    ? 'bg-red-500'
                    : isHead
                    ? 'bg-green-600'
                    : isSnake
                    ? 'bg-green-400'
                    : 'bg-gray-50 dark:bg-gray-900'
                }`}
              />
            );
          })}
        </div>
      </div>

      {!isPlaying && !gameOver && (
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Use arrow keys to control the snake
          </p>
          <Button onClick={startGame}>Start Game</Button>
        </div>
      )}

      {isPlaying && !gameOver && (
        <div className="text-center space-y-2">
          <p className="text-sm">Use arrow keys to move</p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={stopGame}>Pause</Button>
            <Button variant="outline" onClick={finishGame}>Save & Exit</Button>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="text-center space-y-2">
          <p className="text-lg font-bold">
            {score > highScore ? '🎉 New High Score!' : '💀 Game Over!'}
          </p>
          <p className="text-sm">Final Score: {score}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={startGame}>Play Again</Button>
            <Button variant="outline" onClick={finishGame}>Finish</Button>
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-center">
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}
