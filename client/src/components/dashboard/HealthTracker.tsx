import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, Camera, Lightbulb, Scan } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { HealthData } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface HealthTrackerProps {
  userId: number;
}

const healthTips = [
  "Drink 8 glasses of water daily to maintain optimal hydration levels.",
  "Include colorful fruits and vegetables in every meal for better nutrition.",
  "Limit processed foods and opt for whole grains instead.",
  "Practice portion control by using smaller plates and bowls.",
  "Take a 10-minute walk after meals to aid digestion.",
  "Choose healthy snacks like nuts, fruits, or yogurt between meals.",
  "Read nutrition labels to make informed food choices.",
  "Cook at home more often to control ingredients and portions."
];

export default function HealthTracker({ userId }: HealthTrackerProps) {
  const [showScanModal, setShowScanModal] = useState(false);
  const [foodInput, setFoodInput] = useState("");
  const [currentTip] = useState(healthTips[Math.floor(Math.random() * healthTips.length)]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: healthData = [] } = useQuery<HealthData[]>({
    queryKey: [`/api/health-data/${userId}`],
  });

  const scanFoodMutation = useMutation({
    mutationFn: async (foodName: string) => {
      // Simple food health analysis
      const healthyKeywords = ['apple', 'banana', 'vegetable', 'salad', 'water', 'fruit', 'grain', 'fish', 'chicken', 'yogurt'];
      const unhealthyKeywords = ['chips', 'candy', 'soda', 'burger', 'pizza', 'fries', 'chocolate', 'cake', 'ice cream'];
      
      const lowerFood = foodName.toLowerCase();
      let rating = 'neutral';
      
      if (healthyKeywords.some(keyword => lowerFood.includes(keyword))) {
        rating = 'healthy';
      } else if (unhealthyKeywords.some(keyword => lowerFood.includes(keyword))) {
        rating = 'not_recommended';
      }

      await apiRequest("POST", "/api/health-data", {
        userId,
        type: 'food_scan',
        content: foodName,
        rating
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/health-data/${userId}`] });
      setShowScanModal(false);
      setFoodInput("");
      toast({
        title: "Food scanned successfully!",
        description: "Health rating has been recorded.",
      });
    },
  });

  const saveTipMutation = useMutation({
    mutationFn: async (tip: string) => {
      await apiRequest("POST", "/api/health-data", {
        userId,
        type: 'tip',
        content: tip,
        rating: 'healthy'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/health-data/${userId}`] });
      toast({
        title: "Health tip saved!",
        description: "Added to your saved tips collection.",
      });
    },
  });

  const handleScanFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (foodInput.trim()) {
      scanFoodMutation.mutate(foodInput.trim());
    }
  };

  const foodScans = healthData.filter(d => d.type === 'food_scan').slice(0, 5);
  const savedTips = healthData.filter(d => d.type === 'tip').slice(0, 3);

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'healthy':
        return 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800';
      case 'not_recommended':
        return 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600';
    }
  };

  const getRatingDot = (rating: string) => {
    switch (rating) {
      case 'healthy':
        return 'bg-green-500';
      case 'not_recommended':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRatingText = (rating: string) => {
    switch (rating) {
      case 'healthy':
        return 'Healthy';
      case 'not_recommended':
        return 'Not Recommended';
      default:
        return 'Neutral';
    }
  };

  return (
    <>
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Heart className="text-primary" />
            Health Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Daily Tip */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-xl p-4 mb-4 border border-green-200 dark:border-green-800">
            <div className="flex items-start gap-3">
              <Lightbulb className="text-yellow-500 text-xl mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-green-800 dark:text-green-200 text-sm mb-1">Today's Tip</p>
                <p className="text-green-700 dark:text-green-300 text-xs">{currentTip}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-6 text-xs text-green-600 hover:text-green-800"
                  onClick={() => saveTipMutation.mutate(currentTip)}
                  disabled={saveTipMutation.isPending}
                >
                  Save Tip
                </Button>
              </div>
            </div>
          </div>
          
          {/* Scanner Button */}
          <Button
            className="w-full mb-3 bg-primary hover:bg-primary/90"
            onClick={() => setShowScanModal(true)}
          >
            <Camera className="mr-2 h-4 w-4" />
            Scan Food
          </Button>
          
          {/* Recent Scans */}
          {foodScans.length > 0 && (
            <div className="space-y-2 mb-4">
              <h4 className="font-medium text-sm text-gray-800 dark:text-white">Recent Scans</h4>
              {foodScans.map((scan) => (
                <div key={scan.id} className={`flex items-center gap-3 p-2 rounded-lg border ${getRatingColor(scan.rating || 'neutral')}`}>
                  <div className={`w-2 h-2 rounded-full ${getRatingDot(scan.rating || 'neutral')}`}></div>
                  <span className="text-sm font-medium flex-1">{scan.content}</span>
                  <Badge variant={scan.rating === 'healthy' ? 'default' : 'secondary'} className="text-xs">
                    {getRatingText(scan.rating || 'neutral')}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {/* Saved Tips */}
          {savedTips.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-800 dark:text-white">Saved Tips</h4>
              {savedTips.map((tip) => (
                <div key={tip.id} className="p-2 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-800 dark:text-blue-200">{tip.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showScanModal} onOpenChange={setShowScanModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scan className="text-primary" />
              Scan Food Item
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleScanFood} className="space-y-4">
            <div>
              <Input
                placeholder="Enter food name (e.g., apple, chips, salad)"
                value={foodInput}
                onChange={(e) => setFoodInput(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Type the name of the food item to get a health rating
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={scanFoodMutation.isPending}>
                {scanFoodMutation.isPending ? 'Scanning...' : 'Scan Food'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowScanModal(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
