import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Gamepad, Star } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { GameScore } from "@shared/schema";
import TicTacToe from "@/components/games/TicTacToe";
import Snake from "@/components/games/Snake";
import MemoryMatch from "@/components/games/MemoryMatch";
import Puzzle from "@/components/games/Puzzle";
import Quiz from "@/components/games/Quiz";

interface GamesSectionProps {
  userId: number;
}

type GameType = 'tic-tac-toe' | 'snake' | 'memory' | 'puzzle' | 'quiz';

const games = [
  { id: 'tic-tac-toe', name: 'Tic Tac Toe', icon: '×', gradient: 'gradient-pink' },
  { id: 'snake', name: 'Snake', icon: '🐍', gradient: 'gradient-green' },
  { id: 'memory', name: 'Memory', icon: '🧠', gradient: 'gradient-purple' },
  { id: 'puzzle', name: 'Puzzle', icon: '🧩', gradient: 'gradient-orange' },
  { id: 'quiz', name: 'Quiz', icon: '❓', gradient: 'gradient-blue' },
];

export default function GamesSection({ userId }: GamesSectionProps) {
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const queryClient = useQueryClient();

  const { data: gameScores = [] } = useQuery<GameScore[]>({
    queryKey: [`/api/game-scores/${userId}`],
  });

  const saveScoreMutation = useMutation({
    mutationFn: async (data: { gameName: string; score: number; stars: number }) => {
      await apiRequest("POST", "/api/game-scores", { ...data, userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/game-scores/${userId}`] });
    },
  });

  const getGameStars = (gameName: string) => {
    const scores = gameScores.filter(s => s.gameName === gameName);
    if (scores.length === 0) return 0;
    const avgStars = scores.reduce((sum, s) => sum + s.stars, 0) / scores.length;
    return Math.round(avgStars);
  };

  const handleGameComplete = (gameName: string, score: number, stars: number) => {
    saveScoreMutation.mutate({ gameName, score, stars });
    setSelectedGame(null);
  };

  const renderGame = () => {
    if (!selectedGame) return null;

    const props = {
      onComplete: (score: number, stars: number) => handleGameComplete(selectedGame, score, stars),
      onClose: () => setSelectedGame(null),
    };

    switch (selectedGame) {
      case 'tic-tac-toe':
        return <TicTacToe {...props} />;
      case 'snake':
        return <Snake {...props} />;
      case 'memory':
        return <MemoryMatch {...props} />;
      case 'puzzle':
        return <Puzzle {...props} />;
      case 'quiz':
        return <Quiz {...props} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Gamepad className="text-primary" />
            Games Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {games.map(game => {
              const stars = getGameStars(game.id);
              return (
                <div
                  key={game.id}
                  className={`game-card ${game.gradient}`}
                  onClick={() => setSelectedGame(game.id as GameType)}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{game.icon}</div>
                    <h3 className="font-semibold text-sm mb-2">{game.name}</h3>
                    <div className="flex justify-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedGame} onOpenChange={() => setSelectedGame(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {games.find(g => g.id === selectedGame)?.name}
            </DialogTitle>
          </DialogHeader>
          {renderGame()}
        </DialogContent>
      </Dialog>
    </>
  );
}
