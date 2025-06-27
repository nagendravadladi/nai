import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Home, Plus, Star } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Shortcut } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface FloatingDockProps {
  userId: number;
}

const defaultApps = [
  { name: 'Gmail', url: 'https://gmail.com', icon: '📧', color: 'bg-red-500' },
  { name: 'YouTube', url: 'https://youtube.com', icon: '📺', color: 'bg-red-600' },
  { name: 'Spotify', url: 'https://spotify.com', icon: '🎵', color: 'bg-green-500' },
  { name: 'GitHub', url: 'https://github.com', icon: '🐙', color: 'bg-gray-900' },
  { name: 'LinkedIn', url: 'https://linkedin.com', icon: '💼', color: 'bg-blue-600' },
  { name: 'Twitter', url: 'https://twitter.com', icon: '🐦', color: 'bg-blue-400' },
  { name: 'Instagram', url: 'https://instagram.com', icon: '📷', color: 'bg-pink-500' },
  { name: 'ChatGPT', url: 'https://chat.openai.com', icon: '🤖', color: 'bg-green-600' },
  { name: 'Discord', url: 'https://discord.com', icon: '💬', color: 'bg-indigo-600' },
  { name: 'Netflix', url: 'https://netflix.com', icon: '🎬', color: 'bg-red-700' },
];

export default function FloatingDock({ userId }: FloatingDockProps) {
  const [showPinModal, setShowPinModal] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: shortcuts = [] } = useQuery<Shortcut[]>({
    queryKey: [`/api/shortcuts/${userId}`],
  });

  const updateShortcutMutation = useMutation({
    mutationFn: async ({ id, isPinned }: { id: number; isPinned: boolean }) => {
      await apiRequest("PATCH", `/api/shortcuts/${id}`, { isPinned });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/shortcuts/${userId}`] });
    },
  });

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Combine user shortcuts with default apps
  const allAvailableShortcuts = [
    ...shortcuts,
    ...defaultApps
      .filter(app => !shortcuts.some(s => s.name.toLowerCase() === app.name.toLowerCase()))
      .map((app, index) => ({
        id: -(index + 1), // Negative IDs for default apps to avoid conflicts
        name: app.name,
        url: app.url,
        icon: app.icon,
        category: 'default',
        userId,
        orderIndex: 0,
        isPinned: index < 6, // Pin first 6 default apps by default
        createdAt: new Date()
      }))
  ];

  const pinnedShortcuts = allAvailableShortcuts.filter(s => s.isPinned).slice(0, 14);
  const unpinnedShortcuts = allAvailableShortcuts.filter(s => !s.isPinned);

  const togglePin = (id: number, currentPinned: boolean) => {
    if (!currentPinned && pinnedShortcuts.length >= 14) {
      toast({
        title: "Dock Full",
        description: "You can only pin up to 14 shortcuts. Unpin some first.",
        variant: "destructive",
      });
      return;
    }
    
    // Only call mutation for real shortcuts (positive IDs)
    if (id > 0) {
      updateShortcutMutation.mutate({ id, isPinned: !currentPinned });
    } else {
      // For default apps, we'd need to create a shortcut first
      const defaultApp = defaultApps.find((_, index) => -(index + 1) === id);
      if (defaultApp) {
        // Create shortcut for default app (this would be handled in QuickShortcuts component)
        toast({
          title: "Default App",
          description: "Default apps are managed automatically. Create a custom shortcut in Quick Shortcuts to modify.",
        });
        return;
      }
    }
    
    toast({
      title: currentPinned ? "Unpinned" : "Pinned to dock",
      description: currentPinned ? "Shortcut removed from dock" : "Shortcut added to dock",
    });
  };

  const getShortcutIcon = (name: string, icon: string) => {
    if (icon) return icon;
    
    const lowerName = name.toLowerCase();
    if (lowerName.includes('youtube')) return '📺';
    if (lowerName.includes('spotify')) return '🎵';
    if (lowerName.includes('github')) return '🐙';
    if (lowerName.includes('linkedin')) return '💼';
    if (lowerName.includes('twitter')) return '🐦';
    if (lowerName.includes('instagram')) return '📷';
    if (lowerName.includes('gmail')) return '📧';
    if (lowerName.includes('calendar')) return '📅';
    return '🔗';
  };

  const getShortcutColor = (shortcut: any, index: number) => {
    // Use default app color if available
    const defaultApp = defaultApps.find(app => 
      shortcut.name && app.name.toLowerCase() === shortcut.name.toLowerCase()
    );
    if (defaultApp) {
      return defaultApp.color;
    }
    
    // Fallback gradient colors for user shortcuts
    const colors = [
      'bg-gradient-to-br from-red-500 to-red-600',
      'bg-gradient-to-br from-green-500 to-green-600', 
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-yellow-500 to-yellow-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-pink-500 to-pink-600',
      'bg-gradient-to-br from-indigo-500 to-indigo-600',
      'bg-gradient-to-br from-teal-500 to-teal-600',
      'bg-gradient-to-br from-orange-500 to-orange-600',
      'bg-gradient-to-br from-cyan-500 to-cyan-600',
    ];
    return colors[index % colors.length];
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-3">
          <div className="flex items-center gap-3">
            {/* Home Button */}
            <Button
              variant="ghost"
              size="sm"
              className="w-12 h-12 bg-primary rounded-xl hover:scale-110 transition-transform p-0"
              onClick={scrollToTop}
              title="Scroll to top"
            >
              <Home className="text-white w-5 h-5" />
            </Button>
            
            {/* Pinned Shortcuts */}
            {pinnedShortcuts.map((shortcut, index) => (
              <Button
                key={shortcut.id}
                variant="ghost"
                size="sm"
                className={`w-12 h-12 ${getShortcutColor(shortcut, index)} rounded-xl hover:scale-110 transition-all duration-200 p-0 shadow-lg hover:shadow-xl border-0`}
                onClick={() => window.open(shortcut.url, '_blank')}
                title={shortcut.name}
              >
                <span className="text-white text-xl drop-shadow-sm">
                  {getShortcutIcon(shortcut.name, shortcut.icon || '')}
                </span>
              </Button>
            ))}

            {/* Fill empty slots with placeholders */}
            {Array.from({ length: Math.max(0, 3 - pinnedShortcuts.length) }, (_, index) => (
              <div
                key={`placeholder-${index}`}
                className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-xl flex items-center justify-center opacity-50"
              >
                <Star className="w-4 h-4 text-gray-400" />
              </div>
            ))}
            
            {/* Add to Dock Button */}
            {pinnedShortcuts.length < 14 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-xl hover:scale-110 transition-transform border-2 border-dashed border-gray-400 p-0"
                onClick={() => setShowPinModal(true)}
                title="Pin shortcuts to dock"
              >
                <Plus className="text-gray-600 dark:text-gray-400 w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showPinModal} onOpenChange={setShowPinModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Dock Shortcuts</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>Pin your favorite shortcuts to the floating dock for quick access.</p>
              <p className="mt-1">
                <strong>{pinnedShortcuts.length}/14</strong> slots used
              </p>
            </div>

            {/* Currently Pinned */}
            {pinnedShortcuts.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Currently Pinned</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {pinnedShortcuts.map((shortcut) => (
                    <div key={shortcut.id} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getShortcutIcon(shortcut.name, shortcut.icon || '')}</span>
                        <span className="text-sm font-medium">{shortcut.name}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => shortcut.id && togglePin(shortcut.id, true)}
                        className="text-xs"
                      >
                        Unpin
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available to Pin */}
            {unpinnedShortcuts.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Available Shortcuts</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {unpinnedShortcuts.map((shortcut) => (
                    <div key={shortcut.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getShortcutIcon(shortcut.name, shortcut.icon || '')}</span>
                        <span className="text-sm font-medium">{shortcut.name}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => shortcut.id && togglePin(shortcut.id, false)}
                        disabled={pinnedShortcuts.length >= 14}
                        className="text-xs"
                      >
                        Pin
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {unpinnedShortcuts.length === 0 && pinnedShortcuts.length === 0 && (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No shortcuts available</p>
                <p className="text-xs mt-1">Add shortcuts in the Quick Shortcuts section first</p>
              </div>
            )}

            <Button onClick={() => setShowPinModal(false)} className="w-full">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
