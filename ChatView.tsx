import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChatMessage } from './ChatMessage';
// import { useFinancialData } from '../../hooks/useFinancialData';
// import { useGemini } from '../../hooks/useGemini';
import { useToast } from '@/components/ui/use-toast';
import { Send, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';
// import { AppState } from '@/pages/Index';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

interface ChatViewProps { appState: AppState; updateAppState: (updates: Partial<AppState>) => void; }
const INITIAL_MESSAGE = { id: '1', content: `¡Hola! Soy **Maverlang-AI**, tu asesor financiero personal. ¿En qué puedo ayudarte hoy?`, isUser: false, timestamp: new Date() };

export const ChatView = ({ appState, updateAppState }: ChatViewProps) => {
  const [messages, setMessages] = useState<any[]>([INITIAL_MESSAGE]);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(appState.currentConversation);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { fetchFinancialData } = useFinancialData();
  const { analyzeFinancialData, extractSymbolsWithAI, isGenerating } = useGemini();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const convQuery = query(collection(db, 'conversations'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(convQuery, (querySnapshot) => {
        if(!querySnapshot.empty) {
            const latestConvId = querySnapshot.docs[0].id;
            if (latestConvId !== conversationId) {
                setConversationId(latestConvId);
            }
        } else {
          startNewConversation(); // Crea la primera conversación si no existe ninguna
        }
    });
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!user || !conversationId) {
      setMessages([INITIAL_MESSAGE]);
      return;
    };
    const messagesQuery = query(collection(db, 'conversations', conversationId, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
      const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), timestamp: doc.data().timestamp?.toDate() }));
      setMessages(msgs.length > 0 ? msgs : [INITIAL_MESSAGE]);
    });
    return unsubscribe;
  }, [user, conversationId]);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  useEffect(scrollToBottom, [messages]);

  const startNewConversation = async () => {
    if (!user) return;
    const newConvRef = await addDoc(collection(db, 'conversations'), { userId: user.uid, title: 'Nueva Conversación', createdAt: serverTimestamp() });
    setConversationId(newConvRef.id);
    updateAppState({ currentConversation: newConvRef.id });
    toast({ title: "Nueva conversación iniciada" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isGenerating || !user) return;
    if (appState.dailyUsage >= appState.maxDailyUsage) {
      toast({ title: "Límite de consultas alcanzado", variant: "destructive" });
      return;
    }
    
    let currentConvId = conversationId;
    if (!currentConvId) {
      const newConvRef = await addDoc(collection(db, 'conversations'), { userId: user.uid, title: inputMessage.substring(0, 30), createdAt: serverTimestamp() });
      currentConvId = newConvRef.id;
      setConversationId(currentConvId);
      updateAppState({ currentConversation: currentConvId });
    }

    const userMessageContent = inputMessage.trim();
    setInputMessage('');
    const userMessage = { content: userMessageContent, isUser: true, timestamp: serverTimestamp(), userId: user.uid };
    await addDoc(collection(db, 'conversations', currentConvId, 'messages'), userMessage);
    
    try {
      const symbols = await extractSymbolsWithAI(userMessageContent);
      let financialData: any[] = [];
      if (symbols.length > 0) {
        financialData = await fetchFinancialData(symbols);
        const dataMessage = { content: '...', isUser: false, timestamp: serverTimestamp(), financialData, symbols, isDataMessage: true };
        await addDoc(collection(db, 'conversations', currentConvId, 'messages'), dataMessage);
      }
      
      const analysis = await analyzeFinancialData(userMessageContent, financialData);
      const analysisMessage = { content: analysis, isUser: false, timestamp: serverTimestamp() };
      await addDoc(collection(db, 'conversations', currentConvId, 'messages'), analysisMessage);

      updateAppState({ dailyUsage: appState.dailyUsage + 1 });
    } catch (error) {
        toast({ title: "Error", description: "No se pudo procesar la consulta.", variant: "destructive" });
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="border-b bg-white px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Asistente de Inversiones</h2>
          <Button onClick={startNewConversation} variant="outline" size="sm" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Nueva Conversación
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6"><div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => <ChatMessage key={message.id} message={message} />)}
          <div ref={messagesEndRef} />
      </div></div>
      <div className="border-t bg-white shadow-inner"><div className="max-w-4xl mx-auto p-4">
        {appState.dailyUsage >= appState.maxDailyUsage * 0.8 && (
            <Alert className="mb-4 border-amber-300 bg-amber-50 text-amber-800"><AlertTriangle className="h-4 w-4 text-amber-600" /><AlertDescription>Has usado {appState.dailyUsage} de {appState.maxDailyUsage} consultas hoy.</AlertDescription></Alert>
        )}
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <div className="flex-1 relative">
            <Input value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} placeholder="Compara Apple vs Microsoft..." className="pr-20 h-12 text-base" disabled={isGenerating || appState.dailyUsage >= appState.maxDailyUsage} maxLength={500}/>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">{inputMessage.length}/500</div>
          </div>
          <Button type="submit" disabled={isGenerating || !inputMessage.trim() || appState.dailyUsage >= appState.maxDailyUsage} className="px-6 h-12 bg-blue-600 hover:bg-blue-700 text-white">
            {isGenerating ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </form>
        {isGenerating && (
            <div className="mt-2 flex items-center gap-2 text-sm text-blue-600"><Sparkles className="w-4 h-4 animate-pulse" /><p>Maverlang-AI está analizando...</p></div>
        )}
      </div></div>
    </div>
  );
};
