import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, Send } from "lucide-react";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm here to help you navigate MyVerse. What would you like to know?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const getResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('study') || lowerMessage.includes('note')) {
      return "To add a study note, go to the StudyZone section and click on the 'Study Notes' card. Then use the 'Add Resource' button to create new notes with our rich text editor!";
    }
    
    if (lowerMessage.includes('game') || lowerMessage.includes('play')) {
      return "You can access games in the Games Zone section. Choose from Tic Tac Toe, Snake, Memory Match, Puzzle, or Quiz. Your scores and star ratings are automatically saved!";
    }
    
    if (lowerMessage.includes('focus') || lowerMessage.includes('mode')) {
      return "Focus Mode disables games and social media shortcuts to help you concentrate. Toggle it on/off using the switch in the header section.";
    }
    
    if (lowerMessage.includes('music') || lowerMessage.includes('playlist')) {
      return "In the Music Zone, you can add playlists from Spotify, YouTube Music, or other platforms. Click 'Add Playlist' and paste your playlist URL!";
    }
    
    if (lowerMessage.includes('health') || lowerMessage.includes('food')) {
      return "The Health Tracker provides daily nutrition tips and lets you scan food items to check if they're healthy. Use the 'Scan Food' button to analyze your meals!";
    }
    
    if (lowerMessage.includes('finance') || lowerMessage.includes('budget')) {
      return "The Finance Hub helps you track income, expenses, and savings. You can set up bill reminders and view detailed analytics of your spending patterns.";
    }
    
    if (lowerMessage.includes('customize') || lowerMessage.includes('profile')) {
      return "Click the 'Customize' button in the header or your profile picture to edit your name, profile photo, and daily quote.";
    }
    
    if (lowerMessage.includes('shortcut') || lowerMessage.includes('app')) {
      return "Quick Shortcuts let you access your favorite websites quickly. Click 'Manage' to add custom shortcuts, and use the floating dock to pin your most-used ones!";
    }
    
    if (lowerMessage.includes('document') || lowerMessage.includes('file')) {
      return "The Document Vault lets you upload and organize important files. You can add tags for easy searching and even use OCR to scan documents with your camera!";
    }
    
    if (lowerMessage.includes('performance') || lowerMessage.includes('analytics')) {
      return "Your Performance Dashboard tracks activity across all sections. It shows study time, gym sessions, focus streaks, and provides an overall performance score!";
    }
    
    return "I can help you with StudyZone, Games, Music, Health tracking, Finance management, Profile customization, Shortcuts, Document storage, and Performance analytics. What specific feature would you like to know about?";
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date(),
    };

    const botResponse: Message = {
      id: (Date.now() + 1).toString(),
      text: getResponse(inputMessage),
      isBot: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage, botResponse]);
    setInputMessage("");
  };

  return (
    <Card className="dashboard-card">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Bot className="text-primary" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Chat Interface */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 h-48 overflow-y-auto mb-4 space-y-3">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-2 ${message.isBot ? '' : 'justify-end'}`}>
              {message.isBot && (
                <Avatar className="w-6 h-6 flex-shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    <Bot className="w-3 h-3" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`rounded-lg p-2 max-w-xs ${
                  message.isBot
                    ? 'bg-white dark:bg-gray-600'
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                <p className="text-sm">{message.text}</p>
              </div>
              {!message.isBot && (
                <Avatar className="w-6 h-6 flex-shrink-0">
                  <AvatarFallback className="bg-gray-400 text-xs">U</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </div>
        
        {/* Input */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            placeholder="Ask about MyVerse features..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="sm">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
