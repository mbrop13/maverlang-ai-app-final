import React from 'react';
import { Card } from '@/components/ui/card';
import { Bot, User } from 'lucide-react';
import { TradingViewWidget } from './TradingViewWidget';

interface Message { id: string; content: string; isUser: boolean; timestamp: Date; financialData?: any[]; symbols?: string[]; isDataMessage?: boolean; }
interface ChatMessageProps { message: Message; }

const formatFinancialDataForDisplay = (data: any[]) => {
    if (!data || data.length === 0) return "No se encontraron datos para los símbolos solicitados.";
    let content = "## 📊 **Datos Financieros Clave**\n\n";
    data.forEach(item => {
        if (!item) return;
        const changeIcon = item.change > 0 ? '📈' : '📉';
        content += `### **${item.symbol} - ${item.name}**\n`;
        content += `💰 **Precio:** $${item.price?.toFixed(2) || 'N/A'}  `;
        content += `${changeIcon} **Cambio:** ${item.change > 0 ? '+' : ''}${item.change?.toFixed(2) || 'N/A'} (${item.changesPercentage?.toFixed(2) || 'N/A'}%)\n\n`;
    });
    return content;
};

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const formatContent = (content: string) => content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/\n/g, '<br>').replace(/###\s(.*?)(?=<br>|$)/g, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>').replace(/##\s(.*?)(?=<br>|$)/g, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>');
  
  const contentToRender = message.isDataMessage ? formatFinancialDataForDisplay(message.financialData || []) : message.content;

  return (
    <div className={`flex gap-4 ${message.isUser ? 'justify-end' : ''}`}>
      {!message.isUser && (<div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex-shrink-0 flex items-center justify-center shadow-md"><Bot className="w-5 h-5 text-white" /></div>)}
      <div className={`max-w-4xl ${message.isUser ? 'flex justify-end' : ''}`}>
        <Card className={`p-5 shadow-md rounded-xl ${message.isUser ? 'bg-blue-600 text-white' : 'bg-white'}`}>
          <div className="prose prose-sm max-w-none prose-strong:font-semibold prose-h2:text-indigo-900 prose-h3:text-indigo-800" dangerouslySetInnerHTML={{ __html: formatContent(contentToRender) }}/>
          {message.symbols && message.symbols.length > 0 && <TradingViewWidget symbols={message.symbols} />}
          <div className={`text-right text-xs mt-3 pt-2 border-t ${message.isUser ? 'text-blue-200 border-blue-400/50' : 'text-gray-400'}`}>
            {message.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </Card>
      </div>
      {message.isUser && (<div className="w-10 h-10 bg-gray-600 rounded-full flex-shrink-0 flex items-center justify-center shadow-md"><User className="w-5 h-5 text-white" /></div>)}
    </div>
  );
};

