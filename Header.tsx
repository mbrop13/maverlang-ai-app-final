import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
interface HeaderProps { activeView: string; appState: AppState; sidebarVisible: boolean; setSidebarVisible: (v: boolean) => void; }
export const Header = ({ activeView, appState, sidebarVisible, setSidebarVisible }: HeaderProps) => (
  <header className="flex-shrink-0 flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm border-b">
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="icon" onClick={() => setSidebarVisible(!sidebarVisible)}>
        {sidebarVisible ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
      </Button>
      <h2 className="text-xl font-semibold capitalize">{activeView.replace('-', ' ')}</h2>
    </div>
    <div><span className="text-sm font-medium">Hola, {appState.user.name}</span></div>
  </header>
);
