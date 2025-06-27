import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Plus, Timer, Weight, RotateCcw, Target, TrendingUp, Calendar, User, CheckCircle, XCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { GymExercise } from "@shared/schema";

interface GymZoneProps {
  userId: number;
}

const muscleGroups = [
  { name: 'Chest', exercises: ['Push-ups', 'Bench Press', 'Chest Fly', 'Dips', 'Incline Press'] },
  { name: 'Back', exercises: ['Pull-ups', 'Lat Pulldown', 'Rows', 'Deadlift', 'Back Fly'] },
  { name: 'Legs', exercises: ['Squats', 'Lunges', 'Leg Press', 'Calf Raises', 'Leg Curls'] },
  { name: 'Arms', exercises: ['Bicep Curls', 'Tricep Dips', 'Hammer Curls', 'Overhead Press', 'Close-grip Push-ups'] },
  { name: 'Core', exercises: ['Planks', 'Crunches', 'Russian Twists', 'Mountain Climbers', 'Leg Raises'] },
  { name: 'Shoulders', exercises: ['Shoulder Press', 'Lateral Raises', 'Front Raises', 'Shrugs', 'Reverse Fly'] },
];

export default function GymZone({ userId }: GymZoneProps) {
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [newWorkout, setNewWorkout] = useState({
    name: '',
    muscleGroup: '',
    sets: 3,
    reps: 10,
    weight: 0,
    duration: 0
  });
  const queryClient = useQueryClient();

  const { data: exercises = [] } = useQuery<GymExercise[]>({
    queryKey: [`/api/gym-exercises/${userId}`],
  });

  const updateExerciseMutation = useMutation({
    mutationFn: async ({ exerciseId, status }: { exerciseId?: number; status: string; muscleGroup?: string; exerciseName?: string }) => {
      if (exerciseId) {
        await apiRequest("PATCH", `/api/gym-exercises/${exerciseId}`, { status });
      } else {
        await apiRequest("POST", "/api/gym-exercises", { 
          userId, 
          muscleGroup: selectedMuscleGroup, 
          exerciseName: status, 
          status: 'pending' 
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/gym-exercises/${userId}`] });
    },
  });

  const markExerciseStatus = async (exerciseName: string, status: 'completed' | 'skipped') => {
    const existingExercise = exercises.find(
      e => e.exerciseName === exerciseName && e.muscleGroup === selectedMuscleGroup
    );

    if (existingExercise?.id) {
      updateExerciseMutation.mutate({ exerciseId: existingExercise.id, status });
    } else {
      // Create new exercise record
      await apiRequest("POST", "/api/gym-exercises", {
        userId,
        muscleGroup: selectedMuscleGroup,
        exerciseName,
        status,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/gym-exercises/${userId}`] });
    }
  };

  const getExerciseStatus = (muscleGroup: string, exerciseName: string) => {
    const exercise = exercises.find(
      e => e.muscleGroup === muscleGroup && e.exerciseName === exerciseName
    );
    return exercise?.status || 'pending';
  };

  const getTodayStats = () => {
    const today = new Date().toDateString();
    const todayExercises = exercises.filter(
      e => new Date(e.date!).toDateString() === today
    );
    
    const completed = todayExercises.filter(e => e.status === 'completed').length;
    const skipped = todayExercises.filter(e => e.status === 'skipped').length;
    
    return { completed, skipped };
  };

  const { completed, skipped } = getTodayStats();

  return (
    <>
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Dumbbell className="text-primary" />
            Gym Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Interactive Body Diagram */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-xl p-6 mb-6 relative overflow-hidden">
            <div className="text-center mb-4">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Select Muscle Group</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Click on a muscle group to start your workout</p>
            </div>
            
            {/* Body Diagram Grid */}
            <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
              {/* Row 1: Shoulders */}
              <div className="col-span-3 flex justify-center">
                <button
                  onClick={() => setSelectedMuscleGroup('Shoulders')}
                  className="bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800 hover:from-purple-300 hover:to-pink-300 dark:hover:from-purple-700 dark:hover:to-pink-700 rounded-lg p-3 transition-all duration-200 transform hover:scale-105 shadow-sm"
                >
                  <div className="text-center">
                    <Target className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-xs font-medium">Shoulders</span>
                  </div>
                </button>
              </div>
              
              {/* Row 2: Chest, Arms */}
              <button
                onClick={() => setSelectedMuscleGroup('Arms')}
                className="bg-gradient-to-r from-blue-200 to-cyan-200 dark:from-blue-800 dark:to-cyan-800 hover:from-blue-300 hover:to-cyan-300 dark:hover:from-blue-700 dark:hover:to-cyan-700 rounded-lg p-3 transition-all duration-200 transform hover:scale-105 shadow-sm"
              >
                <div className="text-center">
                  <Weight className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs font-medium">Arms</span>
                </div>
              </button>
              
              <button
                onClick={() => setSelectedMuscleGroup('Chest')}
                className="bg-gradient-to-r from-red-200 to-orange-200 dark:from-red-800 dark:to-orange-800 hover:from-red-300 hover:to-orange-300 dark:hover:from-red-700 dark:hover:to-orange-700 rounded-lg p-3 transition-all duration-200 transform hover:scale-105 shadow-sm"
              >
                <div className="text-center">
                  <Dumbbell className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs font-medium">Chest</span>
                </div>
              </button>
              
              <button
                onClick={() => setSelectedMuscleGroup('Back')}
                className="bg-gradient-to-r from-green-200 to-emerald-200 dark:from-green-800 dark:to-emerald-800 hover:from-green-300 hover:to-emerald-300 dark:hover:from-green-700 dark:hover:to-emerald-700 rounded-lg p-3 transition-all duration-200 transform hover:scale-105 shadow-sm"
              >
                <div className="text-center">
                  <TrendingUp className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs font-medium">Back</span>
                </div>
              </button>
              
              {/* Row 3: Core */}
              <div className="col-span-3 flex justify-center">
                <button
                  onClick={() => setSelectedMuscleGroup('Core')}
                  className="bg-gradient-to-r from-yellow-200 to-amber-200 dark:from-yellow-800 dark:to-amber-800 hover:from-yellow-300 hover:to-amber-300 dark:hover:from-yellow-700 dark:hover:to-amber-700 rounded-lg p-3 transition-all duration-200 transform hover:scale-105 shadow-sm"
                >
                  <div className="text-center">
                    <RotateCcw className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-xs font-medium">Core</span>
                  </div>
                </button>
              </div>
              
              {/* Row 4: Legs */}
              <div className="col-span-3 flex justify-center">
                <button
                  onClick={() => setSelectedMuscleGroup('Legs')}
                  className="bg-gradient-to-r from-indigo-200 to-purple-200 dark:from-indigo-800 dark:to-purple-800 hover:from-indigo-300 hover:to-purple-300 dark:hover:from-indigo-700 dark:hover:to-purple-700 rounded-lg p-3 transition-all duration-200 transform hover:scale-105 shadow-sm"
                >
                  <div className="text-center">
                    <Timer className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-xs font-medium">Legs</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Workout Stats Dashboard */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-xl p-4 text-center shadow-sm">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-2xl font-bold text-green-800 dark:text-green-200">{completed}</span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">Completed Today</p>
            </div>
            
            <div className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-xl p-4 text-center shadow-sm">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-2xl font-bold text-blue-800 dark:text-blue-200">{exercises.length}</span>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Exercises</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <Button
              onClick={() => setShowAddWorkout(true)}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add New Exercise
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Muscle Group Exercises Modal */}
      <Dialog open={!!selectedMuscleGroup} onOpenChange={() => setSelectedMuscleGroup(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              {selectedMuscleGroup} Workout
            </DialogTitle>
            <DialogDescription>
              Track your {selectedMuscleGroup?.toLowerCase()} exercises and mark them as completed or skipped
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-blue-800 dark:text-blue-200">
                  {selectedMuscleGroup && exercises.filter(e => e.muscleGroup === selectedMuscleGroup && e.status === 'completed').length}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Completed</p>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-orange-800 dark:text-orange-200">
                  {selectedMuscleGroup && muscleGroups.find(g => g.name === selectedMuscleGroup)?.exercises.length || 0}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400">Available</p>
              </div>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {selectedMuscleGroup && muscleGroups.find(g => g.name === selectedMuscleGroup)?.exercises.map((exercise) => {
                const status = getExerciseStatus(selectedMuscleGroup, exercise);
                return (
                  <div key={exercise} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="flex items-center gap-3">
                      <Dumbbell className="w-4 h-4 text-gray-500" />
                      <div>
                        <span className="font-medium text-sm">{exercise}</span>
                        {status !== 'pending' && (
                          <Badge variant={status === 'completed' ? 'default' : 'secondary'} className="ml-2">
                            {status}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={status === 'completed' ? 'default' : 'outline'}
                        onClick={() => markExerciseStatus(exercise, 'completed')}
                        className="h-8 w-8 p-0"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={status === 'skipped' ? 'secondary' : 'outline'}
                        onClick={() => markExerciseStatus(exercise, 'skipped')}
                        className="h-8 w-8 p-0"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Custom Workout Modal */}
      <Dialog open={showAddWorkout} onOpenChange={setShowAddWorkout}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Add Custom Exercise
            </DialogTitle>
            <DialogDescription>
              Create a custom exercise with sets, reps, weight, and duration tracking
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            // Handle form submission
            setShowAddWorkout(false);
            setNewWorkout({ name: '', muscleGroup: '', sets: 3, reps: 10, weight: 0, duration: 0 });
          }} className="space-y-4">
            <div>
              <Label htmlFor="exercise-name">Exercise Name</Label>
              <Input
                id="exercise-name"
                value={newWorkout.name}
                onChange={(e) => setNewWorkout({ ...newWorkout, name: e.target.value })}
                placeholder="Enter exercise name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="muscle-group">Muscle Group</Label>
              <select
                id="muscle-group"
                value={newWorkout.muscleGroup}
                onChange={(e) => setNewWorkout({ ...newWorkout, muscleGroup: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                required
              >
                <option value="">Select muscle group</option>
                {muscleGroups.map(group => (
                  <option key={group.name} value={group.name}>{group.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="sets">Sets</Label>
                <Input
                  id="sets"
                  type="number"
                  value={newWorkout.sets}
                  onChange={(e) => setNewWorkout({ ...newWorkout, sets: parseInt(e.target.value) || 0 })}
                  min="1"
                  max="20"
                />
              </div>
              <div>
                <Label htmlFor="reps">Reps</Label>
                <Input
                  id="reps"
                  type="number"
                  value={newWorkout.reps}
                  onChange={(e) => setNewWorkout({ ...newWorkout, reps: parseInt(e.target.value) || 0 })}
                  min="1"
                  max="100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.5"
                  value={newWorkout.weight}
                  onChange={(e) => setNewWorkout({ ...newWorkout, weight: parseFloat(e.target.value) || 0 })}
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={newWorkout.duration}
                  onChange={(e) => setNewWorkout({ ...newWorkout, duration: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                Add Exercise
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddWorkout(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
