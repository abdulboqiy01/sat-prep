import React, { useState, useEffect, useRef } from 'react';
import { TutorService, type TutorSession, type TutorMessage } from '../services/tutor.service';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { MathRenderer } from '../utils/math';
import {
  Sparkles,
  Send,
  Plus,
  MessageSquare,
  Bot,
  User,
  AlertCircle,
  Lightbulb,
  Clock,
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  'Explain this concept in simple terms',
  'Give me a step-by-step hint',
  'Generate an SAT-style practice problem for this topic',
  'What are common traps students fall for in this question type?',
  'Help me understand the underlying formula',
];

export const TutorPage: React.FC = () => {
  const [sessions, setSessions] = useState<TutorSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (activeSessionId) {
      loadMessages(activeSessionId);
    } else {
      setMessages([]);
    }
  }, [activeSessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const loadSessions = async () => {
    try {
      setLoadingSessions(true);
      setError(null);
      const list = await TutorService.getSessions();
      setSessions(list);
      if (list.length > 0 && !activeSessionId) {
        setActiveSessionId(list[0].id);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load tutor sessions.');
    } finally {
      setLoadingSessions(false);
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      setLoadingMessages(true);
      const history = await TutorService.getSessionMessages(sessionId);
      setMessages(history);
    } catch (err: any) {
      setError(err?.message || 'Failed to load conversation history.');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleCreateNewSession = () => {
    setActiveSessionId(null);
    setMessages([]);
    setError(null);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || sending) return;

    try {
      setSending(true);
      setError(null);
      setInputText('');

      // Optimistic user message preview
      const tempUserMsg: any = {
        id: 'temp-' + Date.now(),
        session_id: activeSessionId || 'pending',
        sender_role: 'user',
        content: text,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMsg]);

      // Call protected ai-tutor Edge Function
      const response = await TutorService.sendMessage({
        session_id: activeSessionId || undefined,
        message: text,
        context_type: 'general',
      });

      // Update active session ID if this was a new session
      if (!activeSessionId && response.session_id) {
        setActiveSessionId(response.session_id);
        await loadSessions();
      }

      // Append assistant response
      const assistantMsg: any = {
        id: 'resp-' + Date.now(),
        session_id: response.session_id,
        sender_role: 'assistant',
        content: response.content,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev.filter((m) => m.id !== tempUserMsg.id), tempUserMsg, assistantMsg]);
    } catch (err: any) {
      setError(err?.message || 'Failed to send message to AI Tutor.');
    } finally {
      setSending(false);
    }
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
      {/* Left Sidebar: Tutoring Sessions List */}
      <div className="w-full md:w-80 flex-shrink-0 flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">AI Tutor</h2>
              <p className="text-[11px] text-slate-500">Socratic SAT Coaching</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCreateNewSession}
            className="text-xs h-8 px-2.5"
            title="Start New Session"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            New
          </Button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 divide-y divide-transparent">
          {loadingSessions ? (
            <div className="py-8 text-center">
              <LoadingSpinner size="sm" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 px-4 text-slate-400">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No active tutoring sessions.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Ask a question to start your first session.
              </p>
            </div>
          ) : (
            sessions.map((sess) => {
              const isSelected = sess.id === activeSessionId;
              const dateStr = new Date(sess.updated_at || sess.created_at).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
              });

              return (
                <button
                  key={sess.id}
                  onClick={() => setActiveSessionId(sess.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-brand-50 text-brand-900 border border-brand-200 font-medium'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold truncate flex-1">
                      {sess.title || 'SAT Study Session'}
                    </span>
                    <span className="text-[10px] text-slate-400 flex-shrink-0">{dateStr}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{sess.subject ? sess.subject.replace('_', ' ') : 'General SAT'}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Guardrail Quota Notice */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 mb-1 font-medium text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Gemini Socratic Engine</span>
          </div>
          <span>Guiding you with step-by-step reasoning rather than giving away direct answers.</span>
        </div>
      </div>

      {/* Right Area: Conversation View */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Chat Top Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {activeSession ? activeSession.title : 'New Tutoring Session'}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-mint-500 animate-pulse" />
                <span className="text-xs text-slate-500">Active • Ready for questions</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="mint" className="text-[11px]">
              Socratic Mode
            </Badge>
          </div>
        </div>

        {/* Chat Message Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {loadingMessages ? (
            <div className="h-full flex items-center justify-center">
              <LoadingSpinner size="md" />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <Lightbulb className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">How can I guide your SAT prep today?</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Ask me about math equations, reading passages, grammar rules, or ask for a hint on a
                  difficult problem.
                </p>
              </div>

              {/* Prompt Suggestions */}
              <div className="w-full space-y-2 pt-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Suggested Prompts
                </span>
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-brand-50/50 hover:border-brand-200 text-xs text-slate-700 font-medium transition-all flex items-center justify-between"
                  >
                    <span>{prompt}</span>
                    <Sparkles className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isAssistant = msg.sender_role === 'assistant';

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                      isAssistant
                        ? 'bg-white border border-slate-200 text-slate-800 shadow-sm'
                        : 'bg-brand-600 text-white shadow-sm'
                    }`}
                  >
                    {isAssistant ? (
                      <div className="space-y-2">
                        <MathRenderer content={msg.content} />
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}

                    <div
                      className={`text-[10px] mt-2 flex items-center justify-end gap-1 ${
                        isAssistant ? 'text-slate-400' : 'text-brand-200'
                      }`}
                    >
                      <span>
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {!isAssistant && (
                    <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {sending && (
            <div className="flex items-start gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-2 text-xs text-slate-500">
                <LoadingSpinner size="sm" />
                <span>AI Tutor is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-100 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask a question or request a hint... (LaTeX supported: $x^2 + 5x + 6 = 0$)"
              disabled={sending}
              className="flex-1 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-900 text-sm rounded-xl px-4 py-2.5 outline-none transition-all placeholder:text-slate-400"
            />
            <Button
              type="submit"
              disabled={!inputText.trim() || sending}
              loading={sending}
              className="px-4 py-2.5 h-10 rounded-xl"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default TutorPage;
