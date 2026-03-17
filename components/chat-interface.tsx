'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

interface ChatInterfaceProps {
  userId: string;
  userProfile: any;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatInterface({ userId, userProfile }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi ${userProfile?.name}! I'm your AI career advisor. I'm here to help you achieve your goal of becoming a ${userProfile?.careerGoal}. What would you like to discuss?`,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          messages: [...messages, userMessage],
          userProfile,
        }),
      });

      const data = await response.json();

      if (data.content) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.content,
          },
        ]);
      } else if (data.error) {
        console.error('[v0] Chat error:', data.error);
      }
    } catch (error) {
      console.error('[v0] Chat send error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-xl border border-border/40 overflow-hidden shadow-sm">
      <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gradient-to-b from-background to-background/95">
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md xl:max-w-lg px-5 py-3 rounded-lg font-medium leading-relaxed ${
                message.role === 'user'
                  ? 'bg-foreground text-background shadow-sm'
                  : 'bg-muted text-foreground border border-border/30'
              }`}
            >
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted px-4 py-2 rounded-lg">
              <Spinner className="w-4 h-4" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border/40 bg-background/50 p-5 space-y-3">
        <div className="flex gap-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me anything about your career path..."
            disabled={loading}
            className="bg-background border-border/40 rounded-lg"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={loading} 
            className="px-6 bg-foreground text-background hover:bg-foreground/90 font-medium"
          >
            {loading ? <Spinner /> : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  );
}
