import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ChatView } from '../components/Chat/ChatView';
import { Dashboard, Portfolio, MarketOverview } from '../components/placeholders';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface AppState { uid: string; email: string | null; plan: string; currentConversation: string | null; dailyUsage: number; maxDailyUsage: number; user: { name: string; plan: string; }; }

const Index = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('chat');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [appState, setAppState] = useState<AppState | null>(null);

  useEffect(() => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setAppState(docSnap.data() as AppState);
      } else {
        const newUserState: AppState = { uid: user.uid, email: user.email, plan: 'free', currentConversation: null, dailyUsage: 0, maxDailyUsage: 20, user: { name: user.email?.split('@')[0] || 'Usuario', plan: 'free' } };
        setDoc(userDocRef, newUserState).then(() => setAppState(newUserState));
      }
    });
    return () => unsubscribe();
  }, [user]);

  const updateAppState = (updates: Partial<AppState>) => {
    if (!user) return;
    setDoc(doc(db, 'users', user.uid), updates, { merge: true });
  };
  
  const renderActiveView = () => {
    if (!appState) return null;
    switch (activeView) {
      case 'dashboard': return <Dashboard />;
      case 'portfolio': return <Portfolio />;
      case 'market': return <MarketOverview />;
      case 'chat': return <ChatView appState={appState} updateAppState={updateAppState} />;
      default: return <Dashboard />;
    }
  };

  if (!appState) return <div className="flex h-screen items-center justify-center">Cargando datos del usuario...</div>;

  return (
    <div className="h-screen bg-slate-50 overflow-hidden flex">
      {sidebarVisible && <Sidebar activeView={activeView} setActiveView={setActiveView} appState={appState} />}
      <div className="flex-1 flex flex-col min-w-0">
        <Header activeView={activeView} appState={appState} setSidebarVisible={setSidebarVisible} sidebarVisible={sidebarVisible} />
        <div className="flex-1 min-h-0"><ScrollArea className="h-full w-full">{renderActiveView()}</ScrollArea></div>
      </div>
    </div>
  );
};
export default Index;