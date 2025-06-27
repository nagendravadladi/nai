import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Youtube, StickyNote, Book, Plus, Star } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { StudyResource } from "@shared/schema";
import AddResource from "@/components/modals/AddResource";

interface StudyZoneProps {
  userId: number;
}

export default function StudyZone({ userId }: StudyZoneProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [resourceType, setResourceType] = useState<'youtube' | 'note' | 'resource'>('youtube');
  const queryClient = useQueryClient();

  const { data: resources = [] } = useQuery<StudyResource[]>({
    queryKey: [`/api/study-resources/${userId}`],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/study-resources/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/study-resources/${userId}`] });
    },
  });

  const youtubeResources = resources.filter(r => r.type === 'youtube');
  const notes = resources.filter(r => r.type === 'note');
  const educationalResources = resources.filter(r => r.type === 'resource');

  const getStars = (count: number) => {
    return Array.from({ length: Math.min(5, Math.max(1, Math.ceil(count / 3))) }, (_, i) => (
      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
    ));
  };

  return (
    <>
      <Card className="dashboard-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <GraduationCap className="text-primary" />
              StudyZone
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Focus Analytics</span>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Study Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* YouTube Playlists */}
            <div className="game-card gradient-purple">
              <div className="flex items-center justify-between mb-3">
                <Youtube className="text-2xl" />
                <div className="flex gap-1">
                  {getStars(youtubeResources.length)}
                </div>
              </div>
              <h3 className="font-semibold mb-1">YouTube Playlists</h3>
              <p className="text-sm opacity-90">{youtubeResources.length} playlists saved</p>
            </div>

            {/* Study Notes */}
            <div className="game-card gradient-indigo">
              <div className="flex items-center justify-between mb-3">
                <StickyNote className="text-2xl" />
                <div className="flex gap-1">
                  {getStars(notes.length)}
                </div>
              </div>
              <h3 className="font-semibold mb-1">Study Notes</h3>
              <p className="text-sm opacity-90">{notes.length} notes created</p>
            </div>

            {/* Educational Resources */}
            <div className="game-card gradient-teal">
              <div className="flex items-center justify-between mb-3">
                <Book className="text-2xl" />
                <div className="flex gap-1">
                  {getStars(educationalResources.length)}
                </div>
              </div>
              <h3 className="font-semibold mb-1">Resources</h3>
              <p className="text-sm opacity-90">{educationalResources.length} resources saved</p>
            </div>
          </div>

          {/* Quick Add Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="border-dashed hover:border-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-all duration-200"
              onClick={() => {
                setResourceType('youtube');
                setShowAddModal(true);
              }}
            >
              <Youtube className="mr-2 h-4 w-4" />
              Add YouTube
            </Button>
            <Button
              variant="outline"
              className="border-dashed hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all duration-200"
              onClick={() => {
                setResourceType('note');
                setShowAddModal(true);
              }}
            >
              <StickyNote className="mr-2 h-4 w-4" />
              Add Note
            </Button>
            <Button
              variant="outline"
              className="border-dashed hover:border-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950 transition-all duration-200"
              onClick={() => {
                setResourceType('resource');
                setShowAddModal(true);
              }}
            >
              <Book className="mr-2 h-4 w-4" />
              Add Resource
            </Button>
          </div>

          {/* Resources List */}
          {resources.length > 0 && (
            <div className="mt-6 space-y-2">
              <h4 className="font-semibold text-gray-800 dark:text-white">Recent Resources</h4>
              {resources.slice(0, 5).map((resource) => (
                <div key={resource.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    {resource.type === 'youtube' && <Youtube className="w-4 h-4 text-red-500" />}
                    {resource.type === 'note' && <StickyNote className="w-4 h-4 text-blue-500" />}
                    {resource.type === 'resource' && <Book className="w-4 h-4 text-green-500" />}
                    <div>
                      <p className="text-sm font-medium">{resource.title}</p>
                      {resource.folder && <p className="text-xs text-gray-500">{resource.folder}</p>}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resource.id && deleteMutation.mutate(resource.id)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddResource
        userId={userId}
        type={resourceType}
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </>
  );
}
