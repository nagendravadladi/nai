import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface MemoryMatchProps {
  onComplete: (score: number, stars: number) => void;
  onClose: () => void;
}

interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const cardValues = ['🎯', '🎨', '🎭', '🎪', '🎨', '🎯', '🎭', '🎪'];

export default function MemoryMatch({ onComplete, onClose }: MemoryMatchProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    if (isPlaying && !gameComplete) {
      const timer = setInterval(() => {
        setTimeElapsed(t => t + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isPlaying, gameComplete]);

  const initializeGame = () => {
    const shuffled = [...cardValues, ...cardValues]
      .sort(() => Math.random() - 0.5)
      .map((value, index) => ({
        id: index,
        value,
        isFlipped: false,
        isMatched: false,
      }));
    
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setTimeElapsed(0);
    setGameComplete(false);
    setIsPlaying(true);
  };

  const flipCard = (id: number) => {
    if (!isPlaying || gameComplete) return;
    if (flippedCards.length >= 2) return;
    if (cards[id].isFlipped || cards[id].isMatched) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      
      setTimeout(() => {
        const [first, second] = newFlippedCards;
        const updatedCards = [...newCards];
        
        if (updatedCards[first].value === updatedCards[second].value) {
          updatedCards[first].isMatched = true;
          updatedCards[second].isMatched = true;
          setMatches(matches + 1);
          
          if (matches + 1 === cardValues.length) {
            setGameComplete(true);
            setIsPlaying(false);
          }
        } else {
          updatedCards[first].isFlipped = false;
          updatedCards[second].isFlipped = false;
        }
        
        setCards(updatedCards);
        setFlippedCards([]);
      }, 1000);
    }
  };

  const finishGame = () => {
    const efficiency = moves > 0 ? (matches * 100) / moves : 0;
    const timeBonus = Math.max(0, 120 - timeElapsed);
    const score = Math.round(efficiency + timeBonus);
    
    let stars = 1;
    if (score >= 150) stars = 5;
    else if (score >= 120) stars = 4;
    else if (score >= 90) stars = 3;
    else if (score >= 60) stars = 2;
    
    onComplete(score, stars);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-bold">Memory Match</h3>
        <div className="flex justify-center gap-4 text-sm">
          <span>Moves: {moves}</span>
          <span>Matches: {matches}/{cardValues.length}</span>
          <span>Time: {formatTime(timeElapsed)}</span>
        </div>
      </div>

      {!isPlaying && !gameComplete && (
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Find all matching pairs of cards
          </p>
          <Button onClick={initializeGame}>Start Game</Button>
        </div>
      )}

      {(isPlaying || gameComplete) && (
        <div className="grid grid-cols-4 gap-2 max-w-80 mx-auto">
          {cards.map((card) => (
            <Button
              key={card.id}
              variant="outline"
              className={`h-16 w-16 text-2xl ${
                card.isFlipped || card.isMatched
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
              onClick={() => flipCard(card.id)}
              disabled={card.isFlipped || card.isMatched || flippedCards.length >= 2}
            >
              {card.isFlipped || card.isMatched ? card.value : '?'}
            </Button>
          ))}
        </div>
      )}

      {gameComplete && (
        <div className="text-center space-y-2">
          <p className="text-lg font-bold">🎉 Congratulations!</p>
          <p className="text-sm">
            Completed in {moves} moves and {formatTime(timeElapsed)}
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={initializeGame}>Play Again</Button>
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
