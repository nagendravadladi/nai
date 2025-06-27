import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp } from "lucide-react";
import { PerformanceData } from "@shared/schema";

interface PerformanceDashboardProps {
  userId: number;
}

export default function PerformanceDashboard({ userId }: PerformanceDashboardProps) {
  const { data: performanceData = [] } = useQuery<PerformanceData[]>({
    queryKey: [`/api/performance/${userId}`],
  });

  // Calculate metrics
  const studyTime = performanceData
    .filter(d => d.section === 'study' && d.metric === 'time_spent')
    .reduce((sum, d) => sum + d.value, 0);

  const gymSessions = performanceData
    .filter(d => d.section === 'gym' && d.metric === 'sessions_completed')
    .reduce((sum, d) => sum + d.value, 0);

  const focusStreak = performanceData
    .filter(d => d.section === 'focus' && d.metric === 'streak_days')
    .reduce((max, d) => Math.max(max, d.value), 0);

  // Calculate overall score (0-100)
  const calculateOverallScore = () => {
    let score = 50; // Base score
    
    // Study contribution (max 25 points)
    score += Math.min(25, studyTime / 60 * 2); // 2 points per hour
    
    // Gym contribution (max 15 points)
    score += Math.min(15, gymSessions * 2); // 2 points per session
    
    // Focus streak contribution (max 10 points)
    score += Math.min(10, focusStreak); // 1 point per day
    
    return Math.round(Math.min(100, score));
  };

  const overallScore = calculateOverallScore();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-400 to-green-600';
    if (score >= 60) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  const getProgressColor = (section: string) => {
    switch (section) {
      case 'study': return 'bg-blue-500';
      case 'gym': return 'bg-green-500';
      case 'focus': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="dashboard-card">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="text-primary" />
          Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Overall Score */}
        <div className="text-center mb-4">
          <div className={`w-20 h-20 bg-gradient-to-br ${getScoreColor(overallScore)} rounded-full flex items-center justify-center mx-auto mb-2`}>
            <span className="text-2xl font-bold text-white">{overallScore}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Overall Score</p>
        </div>
        
        {/* Metrics */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Study Time</span>
            <div className="flex items-center gap-2">
              <Progress 
                value={Math.min(100, (studyTime / 480) * 100)} // 8 hours max
                className="w-24 h-2"
              />
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200 min-w-[3rem]">
                {Math.floor(studyTime / 60)}h {studyTime % 60}m
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Gym Sessions</span>
            <div className="flex items-center gap-2">
              <Progress 
                value={Math.min(100, (gymSessions / 6) * 100)} // 6 sessions max per week
                className="w-24 h-2"
              />
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200 min-w-[3rem]">
                {gymSessions}/6
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Focus Streak</span>
            <div className="flex items-center gap-2">
              <Progress 
                value={Math.min(100, (focusStreak / 30) * 100)} // 30 days max
                className="w-24 h-2"
              />
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200 min-w-[3rem]">
                {focusStreak}d
              </span>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Today's Insight</p>
          <p className="text-sm text-gray-800 dark:text-gray-200">
            {overallScore >= 80 
              ? "Excellent performance! Keep up the great work! 🚀"
              : overallScore >= 60
              ? "Good progress! Try to maintain consistency. 💪"
              : "Room for improvement. Focus on building daily habits. 📈"
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
