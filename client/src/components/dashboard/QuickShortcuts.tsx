import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Shortcut } from "@shared/schema";

interface QuickShortcutsProps {
  userId: number;
  focusModeEnabled: boolean;
}

const defaultShortcuts = [
  { name: 'Gmail', url: 'https://gmail.com', icon: '📧', isSocial: false },
  { name: 'GitHub', url: 'https://github.com', icon: '🐙', isSocial: false },
  { name: 'YouTube', url: 'https://youtube.com', icon: '📺', isSocial: false },
  { name: 'Spotify', url: 'https://spotify.com', icon: '🎵', isSocial: false },
  { name: 'Twitter', url: 'https://twitter.com', icon: '🐦', isSocial: true },
  { name: 'Instagram', url: 'https://instagram.com', icon: '📷', isSocial: true },
  { name: 'LinkedIn', url: 'https://linkedin.com', icon: '💼', isSocial: false },
];

export default function QuickShortcuts({ userId, focusModeEnabled }: QuickShortcutsProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newShortcut, setNewShortcut] = useState({ name: '', url: '', icon: '' });
  const queryClient = useQueryClient();

  const { data: shortcuts = [] } = useQuery<Shortcut[]>({
    queryKey: [`/api/shortcuts/${userId}`],
  });

  const addShortcutMutation = useMutation({
    mutationFn: async (shortcut: { name: string; url: string; icon: string }) => {
      await apiRequest("POST", "/api/shortcuts", { ...shortcut, userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/shortcuts/${userId}`] });
      setShowAddModal(false);
      setNewShortcut({ name: '', url: '', icon: '' });
    },
  });

  const deleteShortcutMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/shortcuts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/shortcuts/${userId}`] });
    },
  });

  const handleAddShortcut = (e: React.FormEvent) => {
    e.preventDefault();
    if (newShortcut.name && newShortcut.url) {
      addShortcutMutation.mutate(newShortcut);
    }
  };

  const allShortcuts = [...defaultShortcuts, ...shortcuts.map(s => ({ 
    ...s, 
    isSocial: s.name.toLowerCase().includes('twitter') || s.name.toLowerCase().includes('instagram') || s.name.toLowerCase().includes('facebook')
  }))];

  return (
    <>
      <Card className="dashboard-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Rocket className="text-primary" />
              Quick Shortcuts
            </CardTitle>
            <Button
              variant="ghost"
              onClick={() => setShowAddModal(true)}
              className="text-primary hover:text-primary-600"
            >
              Manage →
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {allShortcuts.map((shortcut, index) => {
              const isDisabled = focusModeEnabled && shortcut.isSocial;
              return (
                <div
                  key={index}
                  className={`shortcut-item ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => !isDisabled && window.open(shortcut.url, '_blank')}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl flex items-center justify-center mb-2">
                    <span className="text-xl">{shortcut.icon || '🔗'}</span>
                  </div>
                  <span className="text-xs text-center">{shortcut.name}</span>
                  {shortcuts.find(s => s.name === shortcut.name) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 h-4 w-4 p-0 text-red-500 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        const customShortcut = shortcuts.find(s => s.name === shortcut.name);
                        if (customShortcut?.id) {
                          deleteShortcutMutation.mutate(customShortcut.id);
                        }
                      }}
                    >
                      ×
                    </Button>
                  )}
                </div>
              );
            })}
            
            <div
              className="shortcut-item border-2 border-dashed border-gray-400"
              onClick={() => setShowAddModal(true)}
            >
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-xl flex items-center justify-center mb-2">
                <Plus className="text-gray-600 dark:text-gray-400" />
              </div>
              <span className="text-xs text-center">Add More</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Shortcut</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddShortcut} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newShortcut.name}
                onChange={(e) => setNewShortcut({ ...newShortcut, name: e.target.value })}
                placeholder="Shortcut name"
                required
              />
            </div>
            <div>
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                value={newShortcut.url}
                onChange={(e) => setNewShortcut({ ...newShortcut, url: e.target.value })}
                placeholder="https://example.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="icon">Icon (emoji)</Label>
              <Input
                id="icon"
                value={newShortcut.icon}
                onChange={(e) => setNewShortcut({ ...newShortcut, icon: e.target.value })}
                placeholder="🔗"
                maxLength={2}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={addShortcutMutation.isPending}>
                {addShortcutMutation.isPending ? 'Adding...' : 'Add Shortcut'}
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
