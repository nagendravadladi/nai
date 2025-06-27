import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface TicTacToeProps {
  onComplete: (score: number, stars: number) => void;
  onClose: () => void;
}

type Player = 'X' | 'O' | null;

export default function TicTacToe({ onComplete, onClose }: TicTacToeProps) {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<Player | 'tie'>(null);
  const [gameCount, setGameCount] = useState(0);
  const [wins, setWins] = useState(0);

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  const checkWinner = (board: Player[]): Player | 'tie' | null => {
    for (const combo of winningCombinations) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    if (board.every(cell => cell !== null)) {
      return 'tie';
    }
    return null;
  };

  const makeMove = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      if (gameWinner === 'X') {
        setWins(wins + 1);
      }
      setGameCount(gameCount + 1);
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
  };

  const finishGame = () => {
    const winRate = gameCount > 0 ? (wins / gameCount) * 100 : 0;
    const stars = winRate >= 70 ? 5 : winRate >= 50 ? 4 : winRate >= 30 ? 3 : winRate >= 10 ? 2 : 1;
    onComplete(wins, stars);
  };

  // Simple AI for O player
  useEffect(() => {
    if (currentPlayer === 'O' && !winner) {
      const timer = setTimeout(() => {
        const availableMoves = board.map((cell, index) => cell === null ? index : null).filter(val => val !== null);
        if (availableMoves.length > 0) {
          const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
          if (randomMove !== null) {
            makeMove(randomMove);
          }
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, board, winner]);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-bold">Tic Tac Toe</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          You are X, try to get three in a row!
        </p>
        <div className="flex justify-center gap-4 mt-2 text-sm">
          <span>Games: {gameCount}</span>
          <span>Wins: {wins}</span>
          <span>Win Rate: {gameCount > 0 ? Math.round((wins / gameCount) * 100) : 0}%</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 max-w-60 mx-auto">
        {board.map((cell, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-16 w-16 text-2xl font-bold"
            onClick={() => makeMove(index)}
            disabled={!!cell || currentPlayer === 'O' || !!winner}
          >
            {cell}
          </Button>
        ))}
      </div>

      {winner && (
        <div className="text-center space-y-2">
          <p className="text-lg font-bold">
            {winner === 'X' ? '🎉 You Win!' : winner === 'O' ? '😔 AI Wins!' : '🤝 It\'s a Tie!'}
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={resetGame}>Play Again</Button>
            <Button variant="outline" onClick={finishGame}>Finish</Button>
          </div>
        </div>
      )}

      {!winner && (
        <div className="text-center">
          <p className="text-sm">
            {currentPlayer === 'X' ? 'Your turn' : 'AI is thinking...'}
          </p>
          <div className="flex gap-2 justify-center mt-2">
            <Button variant="outline" onClick={finishGame}>
              Save & Exit
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
