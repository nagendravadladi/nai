import { useAuth } from "@/hooks/useAuth";
import { useFocusMode } from "@/hooks/useFocusMode";
import Header from "@/components/dashboard/Header";
import StudyZone from "@/components/dashboard/StudyZone";
import GamesSection from "@/components/dashboard/GamesSection";
import QuickShortcuts from "@/components/dashboard/QuickShortcuts";
import MusicSection from "@/components/dashboard/MusicSection";
import AIAssistant from "@/components/dashboard/AIAssistant";
import PerformanceDashboard from "@/components/dashboard/PerformanceDashboard";
import GymZone from "@/components/dashboard/GymZone";
import HealthTracker from "@/components/dashboard/HealthTracker";
import EntertainmentZone from "@/components/dashboard/EntertainmentZone";
import EcommerceWishlist from "@/components/dashboard/EcommerceWishlist";
import FinanceHub from "@/components/dashboard/FinanceHub";
import DocumentVault from "@/components/dashboard/DocumentVault";
import AIToolsLibrary from "@/components/dashboard/AIToolsLibrary";
import SettingsPanel from "@/components/dashboard/SettingsPanel";
import FloatingDock from "@/components/dashboard/FloatingDock";

export default function Dashboard() {
  const { user } = useAuth();
  const { focusModeEnabled } = useFocusMode();

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <Header user={user} />
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <StudyZone userId={user.id} />
          {!focusModeEnabled && <GamesSection userId={user.id} />}
          <QuickShortcuts userId={user.id} focusModeEnabled={focusModeEnabled} />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          <MusicSection userId={user.id} />
          <AIAssistant />
          <PerformanceDashboard userId={user.id} />
        </div>
      </div>

      {/* Additional Sections Grid */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <GymZone userId={user.id} />
        <HealthTracker userId={user.id} />
        <EntertainmentZone userId={user.id} />
      </div>

      {/* Bottom Row Sections */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <EcommerceWishlist userId={user.id} />
        <FinanceHub userId={user.id} />
      </div>

      {/* Additional Tools Row */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <DocumentVault userId={user.id} />
        <AIToolsLibrary userId={user.id} />
        <SettingsPanel userId={user.id} />
      </div>

      <FloatingDock userId={user.id} />
    </div>
  );
}
