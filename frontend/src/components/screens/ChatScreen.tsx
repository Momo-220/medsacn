'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, User, Loader2, MessageCircle, Clock, CheckCircle2, Heart, Sparkles, Shield } from 'lucide-react';
import { useNavigation } from '@/lib/navigation/NavigationContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiClient } from '@/lib/api/client';
import { CreditsModal } from '@/components/ui/CreditsModal';
import { useCredits } from '@/contexts/CreditsContext';
import { getChatCache, setChatCache } from '@/lib/chatCache';
import { formatRelativeDate } from '@/lib/i18n/utils';
import type { Language } from '@/lib/i18n/translations';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatScreen() {
  const { goBack } = useNavigation();
  const { user, getIdToken } = useAuth();
  const { refreshCredits } = useCredits();
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Persister l'historique à chaque changement (pour retrouver les conversations au retour)
  useEffect(() => {
    if (user?.uid && messages.length > 0) {
      setChatCache(user.uid, messages);
    }
  }, [user?.uid, messages]);

  // Charger le cache d'abord (conversations récentes visibles tout de suite), puis l'API
  useEffect(() => {
    if (!user?.uid) return;
    const cached = getChatCache(user.uid);
    if (cached?.length) {
      setMessages(
        cached.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.timestamp),
        }))
      );
    }
    const load = async () => {
      try {
        const token = await getIdToken();
        if (token) apiClient.setAuthToken(token);
        const history = await apiClient.getChatHistory(50);
        if (history?.messages && Array.isArray(history.messages)) {
          const formatted: ChatMessage[] = history.messages.map((msg: any) => ({
            id: msg.id || Date.now().toString(),
            role: msg.role || 'assistant',
            content: msg.content || '',
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
          }));
          setMessages(formatted);
          setChatCache(user.uid, formatted);
        }
      } catch (error) {
        console.warn('Chat history unavailable:', error);
      }
    };
    load();
  }, [user?.uid]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = '56px';
    }

    // ID pour le message de réponse (sera créé lors du premier chunk)
    const assistantMessageId = (Date.now() + 1).toString();

    try {
      const token = await getIdToken();
      if (token) {
        apiClient.setAuthToken(token);
      }

      // Use streaming for real-time response with language
      await apiClient.chatStream(
        messageToSend,
        true,
        (chunk: string) => {
          // Update message in real-time as chunks arrive
          setMessages((prev) => {
            const existingMessage = prev.find(msg => msg.id === assistantMessageId);
            if (existingMessage) {
              return prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: msg.content + chunk }
                  : msg
              );
            } else {
              // Créer le message au premier chunk
              return [...prev, {
                id: assistantMessageId,
                role: 'assistant' as const,
                content: chunk,
                timestamp: new Date(),
              }];
            }
          });
        },
        async (fullMessage: string) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: fullMessage }
                : msg
            )
          );
          setIsLoading(false);
          await refreshCredits();
          const { analytics } = await import('@/lib/analytics');
          analytics.chat();
        },
        (error: Error) => {
          console.error('Chat streaming error:', error);
          
          // Gérer l'erreur 402 (crédits insuffisants)
          if (error.message === 'INSUFFICIENT_CREDITS' || (error as any).status === 402) {
            setMessages((prev) => prev.filter(msg => msg.id !== assistantMessageId));
            setShowCreditsModal(true);
            setIsLoading(false);
            return;
          }

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    content: t('chatError'),
                  }
                : msg
            )
          );
          setIsLoading(false);
        },
        language
      );
    } catch (error: any) {
      console.error('Chat error:', error);
      
      // Gérer l'erreur 402 (crédits insuffisants)
      if (error.message === 'INSUFFICIENT_CREDITS' || error.status === 402) {
        setMessages((prev) => prev.filter(msg => msg.id !== assistantMessageId));
        setShowCreditsModal(true);
        setIsLoading(false);
        return;
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: 'Désolé, une erreur est survenue. Veuillez réessayer.',
              }
            : msg
        )
      );
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Grouper les messages en "conversations" (chaque user message = début d'une conversation)
  const recentConversations = React.useMemo(() => {
    const filtered = messages.filter((m) => m.content.trim() !== '');
    const groups: { id: string; title: string; date: Date }[] = [];
    for (let i = 0; i < filtered.length; i++) {
      if (filtered[i].role === 'user') {
        const title = filtered[i].content.trim().slice(0, 40);
        groups.push({
          id: filtered[i].id,
          title: title + (filtered[i].content.length > 40 ? '…' : ''),
          date: filtered[i].timestamp,
        });
      }
    }
    return groups.slice(-8).reverse();
  }, [messages]);

  const scrollToMessage = (messageId: string) => {
    const el = document.querySelector(`[data-message-id="${messageId}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-background dark:bg-gray-900 flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      {/* Header - Design professionnel et structuré - Responsive */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-b border-primary/10 dark:border-gray-700 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-4">
          <div className="flex items-center gap-4">
            {/* Bouton retour */}
            <button
              onClick={goBack}
              className="p-2.5 hover:bg-background-secondary rounded-xl transition-all duration-200 active:scale-95"
              aria-label="Retour"
            >
              <ArrowLeft className="w-5 h-5 text-text-primary dark:text-gray-100" />
            </button>
            
            {/* Profil du docteur */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Avatar médecin */}
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#A8D5FF] via-[#8FC5FF] to-[#7BB5FF] flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-gray-800 overflow-hidden">
                  <img
                    src="/doctor-png.jpg"
                    alt="Dr. Sarah Martin"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      if (target.parentElement) {
                        target.parentElement.innerHTML = `
                          <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        `;
                      }
                    }}
                  />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 dark:bg-green-500 rounded-full border-2 border-white dark:border-gray-800 shadow-md flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              
              {/* Informations */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-lg font-bold text-text-primary dark:text-gray-100 truncate">
                    {t('doctorName')}
                  </h1>
                  <CheckCircle2 className="w-4 h-4 text-primary dark:text-blue-400 flex-shrink-0" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-400 dark:bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-text-secondary dark:text-gray-300 font-medium">{t('online')}</span>
                  </div>
                  <span className="text-xs text-text-muted dark:text-gray-500">•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-text-muted dark:text-gray-400" />
                    <span className="text-xs text-text-muted dark:text-gray-400">{t('respondsQuickly')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conversations récentes (quand il y a des messages) */}
      {messages.length > 0 && recentConversations.length > 0 && (
        <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-2 border-b border-primary/5 dark:border-gray-700">
          <p className="text-xs font-semibold text-text-secondary dark:text-gray-400 mb-2 px-1">
            {t('recentChatsTitle')}
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {recentConversations.map((conv) => (
              <button
                key={conv.id}
                type="button"
                onClick={() => scrollToMessage(conv.id)}
                className="flex-shrink-0 text-left px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-primary/10 dark:border-gray-700 hover:bg-primary/5 dark:hover:bg-gray-700/80 transition-colors max-w-[200px]"
              >
                <p className="text-sm font-medium text-text-primary dark:text-gray-100 truncate">
                  {conv.title}
                </p>
                <p className="text-xs text-text-muted dark:text-gray-500 mt-0.5">
                  {formatRelativeDate(conv.date, language)}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Container - Design spécial avec cartes */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 custom-scrollbar"
      >
        {messages.length === 0 ? (
          <EmptyState onSelectSuggestion={setInputValue} />
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {messages
              .filter((message) => message.content.trim() !== '') // Filtrer les messages vides
              .map((message, index) => (
                <div key={message.id} data-message-id={message.id}>
                  <ChatMessageCard message={message} index={index} />
                </div>
              ))}
          </div>
        )}
        
        {/* Typing Indicator - Simple curseur clignotant */}
        {isLoading && (
          <div className="max-w-4xl mx-auto">
            <TypingIndicator />
          </div>
        )}
        
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Area - Responsive */}
      <div className="sticky bottom-0 bg-gradient-to-t from-background dark:from-gray-900 via-background/98 dark:via-gray-900/98 to-transparent backdrop-blur-xl pt-4 pb-6 px-4 sm:px-6 lg:px-8 border-t border-primary/5 dark:border-gray-700">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-primary/10 dark:border-gray-700 overflow-hidden">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('chatPlaceholder')}
              rows={1}
              className="w-full bg-transparent px-5 py-4 pr-14 text-text-primary dark:text-gray-100 placeholder:text-text-muted dark:placeholder:text-gray-500 resize-none focus:outline-none transition-all text-sm leading-relaxed"
              style={{
                minHeight: '56px',
                maxHeight: '120px',
              }}
            />
            
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-2 bottom-2 w-11 h-11 rounded-xl bg-gradient-to-r from-primary to-[#3B7FD4] flex items-center justify-center text-white shadow-lg hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 disabled:transform-none"
              aria-label={t('send')}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          
          <div className="mt-3 flex items-center justify-center gap-2">
            <Shield className="w-3.5 h-3.5 text-text-muted dark:text-gray-400" />
            <p className="text-xs text-text-muted dark:text-gray-400 text-center">
              ⚕️ {t('disclaimerMedical')}
            </p>
          </div>
        </div>
      </div>

      {/* Credits Modal */}
      <CreditsModal
        isOpen={showCreditsModal}
        onClose={() => {
          setShowCreditsModal(false);
          refreshCredits();
        }}
        action="chat"
        cost={1}
      />
    </div>
  );
}

// Design spécial : Messages utilisateur en format compact
function UserMessageCard({ message }: { message: ChatMessage }) {
  const { language } = useLanguage();
  return (
    <div className="flex justify-end">
      <div className="max-w-[75%]">
        <div className="bg-gradient-to-r from-primary to-[#3B7FD4] dark:from-blue-600 dark:to-blue-700 text-white rounded-2xl rounded-tr-sm px-5 py-4 shadow-lg transition-colors">
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
          <div className="flex items-center gap-1.5 mt-3 text-white/70">
            <Clock className="w-3 h-3" />
            <span className="text-xs">{formatTime(message.timestamp, language)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Design spécial : Réponses du docteur en format carte élégante avec animations
function AssistantMessageCard({ message, index }: { message: ChatMessage; index: number }) {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Animation d'apparition en douceur
    const timer = setTimeout(() => setIsVisible(true), index * 50);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div 
      ref={cardRef}
      className={`flex gap-4 transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Avatar flottant avec animation */}
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#A8D5FF] to-[#8FC5FF] flex items-center justify-center shadow-lg overflow-hidden ring-2 ring-white animate-pulse-slow">
          <img
            src="/doctor-png.jpg"
            alt="Dr. Sarah Martin"
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              if (target.parentElement) {
                target.parentElement.innerHTML = `
                  <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                `;
              }
            }}
          />
        </div>
      </div>

      {/* Carte de réponse élégante avec effets visuels */}
      <div className="flex-1 min-w-0">
        <div className="card-main-gradient p-6 relative overflow-hidden transform transition-all duration-300 hover:scale-[1.01] shadow-xl">
          {/* Effet de brillance animé */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer-slow pointer-events-none"></div>
          
          {/* Nom du docteur */}
          <div className="flex items-center gap-2 mb-3 relative z-10">
            <h3 className="text-sm font-bold text-white">Dr. Sarah Martin</h3>
            <CheckCircle2 className="w-3.5 h-3.5 text-white animate-pulse" />
          </div>

          {/* Contenu de la réponse */}
          <div className="relative z-10">
            <div className="text-sm leading-relaxed text-white/95 prose prose-invert prose-sm max-w-none mb-4 
            prose-headings:text-white prose-headings:font-bold prose-headings:mt-3 prose-headings:mb-2
            prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1
            prose-strong:text-white prose-strong:font-bold
            prose-code:bg-white/20 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-white
            prose-a:text-blue-300 prose-a:underline">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
            
            {/* Footer avec timestamp */}
            <div className="flex items-center gap-2 pt-3 border-t border-white/20">
              <Clock className="w-3 h-3 text-white/70" />
              <span className="text-xs text-white/70">{formatTime(message.timestamp, language)}</span>
            </div>
          </div>

          {/* Icônes décoratives animées */}
          <div className="absolute top-4 right-4 opacity-20 animate-float">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div className="absolute bottom-4 left-4 opacity-10 animate-float-delayed">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant principal pour les messages
function ChatMessageCard({ message, index }: { message: ChatMessage; index: number }) {
  if (message.role === 'user') {
    return <UserMessageCard message={message} />;
  }
  return <AssistantMessageCard message={message} index={index} />;
}

function EmptyState({ onSelectSuggestion }: { onSelectSuggestion: (text: string) => void }) {
  const { t } = useLanguage();
  
  const suggestions = [
    t('faqQuestion1'),
    t('faqQuestion2'),
    t('faqQuestion3'),
  ];
  
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center px-4 max-w-2xl mx-auto">
      {/* Illustration avec médecin */}
      <div className="relative mb-10">
        <div className="relative w-40 h-40 rounded-3xl bg-gradient-to-br from-[#A8D5FF]/30 via-[#8FC5FF]/20 to-[#7BB5FF]/10 flex items-center justify-center mb-6 shadow-2xl overflow-hidden">
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#A8D5FF] to-[#8FC5FF] flex items-center justify-center shadow-xl overflow-hidden">
            <img
              src="/doctor-png.jpg"
              alt="Dr. Sarah Martin"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                if (target.parentElement) {
                  target.parentElement.innerHTML = `
                    <svg class="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  `;
                }
              }}
            />
          </div>
          
          {/* Particules décoratives animées */}
          <div className="absolute -top-4 -right-4 w-5 h-5 bg-primary/40 dark:bg-primary/20 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-3 -left-3 w-4 h-4 bg-primary/30 dark:bg-primary/15 rounded-full animate-pulse delay-300"></div>
          <div className="absolute top-1/2 -left-5 w-3 h-3 bg-primary/25 dark:bg-primary/10 rounded-full animate-pulse delay-150"></div>
          <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-white/60 dark:bg-white/20 rounded-full animate-pulse delay-200"></div>
        </div>
      </div>
      
      {/* Texte d'accueil */}
      <h2 className="text-3xl font-bold text-text-primary dark:text-gray-100 mb-3">
        {t('doctorGreeting')}
      </h2>
      <p className="text-text-secondary dark:text-gray-300 text-base leading-relaxed mb-10 max-w-lg">
        {t('doctorDescription')}
      </p>
      
      {/* Suggestions de questions - Design organisé */}
      <div className="w-full max-w-lg space-y-3">
        <p className="text-xs font-semibold text-text-muted dark:text-gray-400 uppercase tracking-wide mb-5">
          {t('frequentlyAskedQuestions')}
        </p>
        {suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => onSelectSuggestion(suggestion)}
            className="w-full text-left p-5 bg-white dark:bg-gray-800 rounded-2xl border border-primary/10 dark:border-gray-700 hover:bg-background-secondary dark:hover:bg-gray-700 hover:border-primary/20 dark:hover:border-gray-600 transition-all duration-200 text-sm text-text-primary dark:text-gray-100 shadow-sm hover:shadow-lg group transform hover:scale-[1.02]"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-blue-900/30 dark:to-blue-800/20 flex items-center justify-center flex-shrink-0 group-hover:from-primary/20 group-hover:to-primary/10 dark:group-hover:from-blue-900/40 dark:group-hover:to-blue-800/30 transition-colors">
                <MessageCircle className="w-5 h-5 text-primary dark:text-blue-400" />
              </div>
              <span className="flex-1 leading-relaxed pt-1.5">{suggestion}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#A8D5FF] to-[#8FC5FF] flex items-center justify-center shadow-lg overflow-hidden ring-2 ring-white">
          <img
            src="/doctor-png.jpg"
            alt="Dr. Sarah Martin"
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              if (target.parentElement) {
                target.parentElement.innerHTML = `
                  <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                `;
              }
            }}
          />
        </div>
      </div>
      <div className="flex-1">
        <div className="card-main-gradient p-6 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3 relative z-10">
            <h3 className="text-sm font-bold text-white">Dr. Sarah Martin</h3>
            <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
          </div>
          {/* Simple curseur clignotant comme Cursor */}
          <div className="relative z-10">
            <span className="text-white/90 text-sm">Dr. Sarah Martin écrit</span>
            <span className="inline-block w-0.5 h-4 bg-white ml-1 align-middle animate-blink"></span>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(date: Date, language: Language): string {
  return formatRelativeDate(date, language);
}
