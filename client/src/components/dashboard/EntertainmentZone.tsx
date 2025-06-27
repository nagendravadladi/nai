import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Film, Play, Trash2, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { EntertainmentItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface EntertainmentZoneProps {
  userId: number;
}

export default function EntertainmentZone({ userId }: EntertainmentZoneProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    platform: 'netflix',
    url: '',
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: entertainmentItems = [] } = useQuery<EntertainmentItem[]>({
    queryKey: [`/api/entertainment/${userId}`],
  });

  const addItemMutation = useMutation({
    mutationFn: async (item: typeof newItem) => {
      await apiRequest("POST", "/api/entertainment", { 
        ...item, 
        userId,
        status: 'watch_later'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/entertainment/${userId}`] });
      setShowAddModal(false);
      setNewItem({ title: '', platform: 'netflix', url: '' });
      toast({
        title: "Added to watchlist!",
        description: "Item has been added to your entertainment list.",
      });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/entertainment/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/entertainment/${userId}`] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/entertainment/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/entertainment/${userId}`] });
      toast({
        title: "Item removed",
        description: "Entertainment item has been deleted.",
      });
    },
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.title && newItem.platform) {
      addItemMutation.mutate(newItem);
    }
  };

  const markAsWatched = (id: number) => {
    updateItemMutation.mutate({ id, status: 'watched' });
    toast({
      title: "Marked as watched!",
      description: "Item moved to watched list.",
    });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'netflix':
        return '🎬';
      case 'prime':
      case 'amazon':
        return '📺';
      case 'disney':
        return '🏰';
      case 'hulu':
        return '📱';
      case 'youtube':
        return '📺';
      default:
        return '🎭';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'netflix':
        return 'from-red-400 to-red-600';
      case 'prime':
      case 'amazon':
        return 'from-blue-400 to-blue-600';
      case 'disney':
        return 'from-purple-400 to-purple-600';
      case 'hulu':
        return 'from-green-400 to-green-600';
      case 'youtube':
        return 'from-red-500 to-red-700';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const watchLaterItems = entertainmentItems.filter(item => item.status === 'watch_later');
  const watchedItems = entertainmentItems.filter(item => item.status === 'watched');

  return (
    <>
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Film className="text-primary" />
            Entertainment
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Watch Later List */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm text-gray-800 dark:text-white">Watch Later</h4>
              <Badge variant="outline">{watchLaterItems.length}</Badge>
            </div>
            
            {watchLaterItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {/* Poster placeholder */}
                <div className={`w-12 h-16 bg-gradient-to-br ${getPlatformColor(item.platform)} rounded flex items-center justify-center flex-shrink-0`}>
                  <span className="text-xl">{getPlatformIcon(item.platform)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 dark:text-gray-200 text-sm truncate">{item.title}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs capitalize">{item.platform}</p>
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 hover:bg-green-200"
                      onClick={() => {
                        if (item.url) window.open(item.url, '_blank');
                        if (item.id) markAsWatched(item.id);
                      }}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Watch
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-xs"
                      onClick={() => item.id && deleteItemMutation.mutate(item.id)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {watchLaterItems.length === 0 && (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                <Film className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No items in watchlist</p>
              </div>
            )}
          </div>

          {/* Recently Watched */}
          {watchedItems.length > 0 && (
            <div className="space-y-2 mb-4">
              <h4 className="font-medium text-sm text-gray-800 dark:text-white">Recently Watched</h4>
              {watchedItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2 bg-green-50 dark:bg-green-900 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-800 dark:text-green-200 flex-1">{item.title}</span>
                  <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                    Watched
                  </Badge>
                </div>
              ))}
            </div>
          )}
          
          <Button
            variant="outline"
            className="w-full border-dashed hover:border-primary hover:text-primary"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add to Watchlist
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Watchlist</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                placeholder="Movie or TV show title"
                required
              />
            </div>
            <div>
              <Label htmlFor="platform">Platform</Label>
              <Select value={newItem.platform} onValueChange={(value) => setNewItem({ ...newItem, platform: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="netflix">Netflix</SelectItem>
                  <SelectItem value="prime">Prime Video</SelectItem>
                  <SelectItem value="disney">Disney+</SelectItem>
                  <SelectItem value="hulu">Hulu</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="url">URL (Optional)</Label>
              <Input
                id="url"
                type="url"
                value={newItem.url}
                onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={addItemMutation.isPending}>
                {addItemMutation.isPending ? 'Adding...' : 'Add to Watchlist'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
