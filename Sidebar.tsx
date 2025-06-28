import { Home, MessageSquare, Briefcase, BarChart2, LogOut } from 'lucide-react';
import { AppState } from '../pages/Index';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

interface SidebarProps { activeView: string; setActiveView: (view: string) => void; appState: AppState; }
export const Sidebar = ({ activeView, setActiveView, appState }: SidebarProps) => {
  const handleLogout = () => signOut(auth);
  const navItems = [ { id: 'dashboard', label: 'Dashboard', icon: Home }, { id: 'chat', label: 'Maverlang AI', icon: MessageSquare }, { id: 'portfolio', label: 'Portafolio', icon: Briefcase }, { id: 'market', label: 'Mercado', icon: BarChart2 } ];
  return (
    <div className="w-64 h-full bg-white border-r flex flex-col">
      <div className="p-4 border-b"><h1 className="text-2xl font-bold text-blue-600">Maverlang</h1></div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(item => (
          <button key={item.id} onClick={() => setActiveView(item.id)} className={`w-full flex items-center gap-3 p-3 rounded-lg text-left text-sm font-medium transition-colors ${activeView === item.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
            <item.icon className="w-5 h-5" />{item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t space-y-4">
        <div>
          <div className="text-sm font-medium">{appState.user.name} ({appState.plan})</div>
          <div className="text-xs text-gray-500">Consultas: {appState.dailyUsage}/{appState.maxDailyUsage}</div>
          <progress value={appState.dailyUsage} max={appState.maxDailyUsage} className="w-full h-2 mt-1 [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-bar]:bg-slate-300 [&::-webkit-progress-value]:bg-blue-600" />
        </div>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-lg text-left text-sm font-medium text-red-600 hover:bg-red-50">
          <LogOut className="w-5 h-5" />Cerrar Sesión
        </button>
      </div>
    </div>
  );
};