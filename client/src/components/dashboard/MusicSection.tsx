import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Music, Play, Pause, SkipBack, SkipForward, Plus, Volume2, ExternalLink } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { MusicPlaylist } from "@shared/schema";

interface MusicSectionProps {
  userId: number;
}

export default function MusicSection({ userId }: MusicSectionProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({
    name: '',
    url: '',
    platform: 'spotify',
  });
  const [currentlyPlaying, setCurrentlyPlaying] = useState<MusicPlaylist | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const queryClient = useQueryClient();

  const { data: playlists = [] } = useQuery<MusicPlaylist[]>({
    queryKey: [`/api/playlists/${userId}`],
  });

  const addPlaylistMutation = useMutation({
    mutationFn: async (playlist: typeof newPlaylist) => {
      await apiRequest("POST", "/api/playlists", { ...playlist, userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/playlists/${userId}`] });
      setShowAddModal(false);
      setNewPlaylist({ name: '', url: '', platform: 'spotify' });
    },
  });

  const deletePlaylistMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/playlists/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/playlists/${userId}`] });
    },
  });

  const handleAddPlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylist.name && newPlaylist.url) {
      addPlaylistMutation.mutate(newPlaylist);
    }
  };

  const handlePlayPlaylist = (playlist: MusicPlaylist) => {
    if (playlist.url) {
      window.open(playlist.url, '_blank');
    }
    setCurrentlyPlaying(playlist);
    setIsPlaying(true);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'spotify':
        return '🎵';
      case 'youtube':
        return '📺';
      case 'apple':
        return '🍎';
      default:
        return '🎵';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'spotify':
        return 'bg-green-500';
      case 'youtube':
        return 'bg-red-600';
      case 'apple':
        return 'bg-gray-800';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <>
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Music className="text-primary" />
            Music Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Music Player */}
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-xl p-6 mb-4 shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Music className="text-white w-8 h-8" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 dark:text-gray-200 text-lg">
                  {currentlyPlaying ? currentlyPlaying.name : 'No music playing'}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm capitalize">
                  {currentlyPlaying ? `${currentlyPlaying.platform} Playlist` : 'Select a playlist to start'}
                </p>
              </div>
              {currentlyPlaying?.url && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(currentlyPlaying.url, '_blank')}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-center gap-6 mb-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-10 h-10 rounded-full hover:bg-white/20 dark:hover:bg-black/20 transition-all"
                disabled={!currentlyPlaying}
              >
                <SkipBack className="w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                className="w-14 h-14 rounded-full bg-white text-purple-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={!currentlyPlaying}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-10 h-10 rounded-full hover:bg-white/20 dark:hover:bg-black/20 transition-all"
                disabled={!currentlyPlaying}
              >
                <SkipForward className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="w-full bg-white/30 dark:bg-black/30 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-white dark:bg-gray-200 h-2 rounded-full transition-all duration-300 shadow-sm"
                  style={{ width: currentlyPlaying ? '45%' : '0%' }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>0:00</span>
                <span>3:24</span>
              </div>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/20 dark:border-black/20">
              <Volume2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <div className="flex-1 bg-white/30 dark:bg-black/30 rounded-full h-1">
                <div className="bg-white dark:bg-gray-200 h-1 rounded-full w-2/3"></div>
              </div>
            </div>
          </div>

          {/* Playlists */}
          <div className="space-y-2 mb-4">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                onClick={() => handlePlayPlaylist(playlist)}
              >
                <div className={`w-8 h-8 ${getPlatformColor(playlist.platform)} rounded flex items-center justify-center`}>
                  <span className="text-white text-sm">{getPlatformIcon(playlist.platform)}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{playlist.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{playlist.platform}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (playlist.id) deletePlaylistMutation.mutate(playlist.id);
                  }}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            className="w-full border-dashed hover:border-primary hover:text-primary"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Playlist
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Music Playlist</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddPlaylist} className="space-y-4">
            <div>
              <Label htmlFor="name">Playlist Name</Label>
              <Input
                id="name"
                value={newPlaylist.name}
                onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                placeholder="My Favorite Songs"
                required
              />
            </div>
            <div>
              <Label htmlFor="url">Playlist URL</Label>
              <Input
                id="url"
                type="url"
                value={newPlaylist.url}
                onChange={(e) => setNewPlaylist({ ...newPlaylist, url: e.target.value })}
                placeholder="https://open.spotify.com/playlist/..."
                required
              />
            </div>
            <div>
              <Label htmlFor="platform">Platform</Label>
              <Select value={newPlaylist.platform} onValueChange={(value) => setNewPlaylist({ ...newPlaylist, platform: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spotify">Spotify</SelectItem>
                  <SelectItem value="youtube">YouTube Music</SelectItem>
                  <SelectItem value="apple">Apple Music</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={addPlaylistMutation.isPending}>
                {addPlaylistMutation.isPending ? 'Adding...' : 'Add Playlist'}
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
