'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/shared/app-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useChatStore } from '@/stores/chat-store';
import { useDocuments } from '@/hooks/use-documents';
import { api } from '@/lib/api/client';
import { config } from '@/lib/config';
import { Send, Loader2, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ChatPage() {
  const [input, setInput] = useState('');
  const { messages, addMessage, updateMessage, currentDocId, isLoading, setLoading } =
    useChatStore();
  const { data: documentsData } = useDocuments();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    addMessage({
      role: 'user',
      content: userMessage,
    });

    // Add loading assistant message
    addMessage({
      role: 'assistant',
      content: '',
      isLoading: true,
    });

    setLoading(true);

    // Get the ID of the assistant message we just added
    const assistantMsgId = useChatStore.getState().messages[
      useChatStore.getState().messages.length - 1
    ].id;

    try {
      const response = await api.query({
        query: userMessage,
        doc_id: currentDocId || undefined,
      });

      updateMessage(assistantMsgId, {
        content: response.answer,
        sources: response.sources,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to get response';
      updateMessage(assistantMsgId, {
        content: `Error: ${errorMessage}`,
        isLoading: false,
      });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b p-4">
          <h1 className="text-2xl font-bold">Chat</h1>
          <p className="text-sm text-muted-foreground">
            Ask questions about your documents
          </p>
          {documentsData && documentsData.documents.length > 0 && (
            <div className="flex gap-2 mt-2">
              <Badge variant="outline">
                {documentsData.documents.length} document(s) available
              </Badge>
            </div>
          )}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="text-4xl mb-4">💬</div>
                <h2 className="text-xl font-semibold mb-2">Start a conversation</h2>
                <p className="text-muted-foreground mb-4">
                  Ask questions about your uploaded documents
                </p>
                {documentsData?.documents.length === 0 && (
                  <Badge variant="secondary">Upload a document to get started</Badge>
                )}
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <Card
                    className={`max-w-[80%] p-4 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex flex-col gap-2">
                      {message.isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      ) : (
                        <>
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          {message.sources && message.sources.length > 0 && (
                            <div className="mt-2 pt-2 border-t">
                              <p className="text-xs font-semibold mb-1">Sources:</p>
                              {message.sources.slice(0, config.query.maxSourcesDisplay).map((source, idx) => (
                                <div
                                  key={idx}
                                  className="text-xs bg-background/50 p-2 rounded mb-1"
                                >
                                  <div className="flex items-center gap-1 mb-1">
                                    <FileText className="h-3 w-3" />
                                    {source.page && (
                                      <span className="font-medium">Page {source.page}</span>
                                    )}
                                  </div>
                                  <p className="line-clamp-2">{source.content}</p>
                                </div>
                              ))}
                              {message.sources.length > config.query.maxSourcesDisplay && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  +{message.sources.length - config.query.maxSourcesDisplay} more source(s)
                                </p>
                              )}
                            </div>
                          )}
                          {message.content.startsWith('Error:') && (
                            <div className="flex items-center gap-2 mt-2 text-destructive">
                              <AlertCircle className="h-4 w-4" />
                              <span className="text-xs">An error occurred processing your request</span>
                            </div>
                          )}
                        </>
                      )}
                      <span className="text-xs opacity-70">
                        {format(message.timestamp, 'HH:mm')}
                      </span>
                    </div>
                  </Card>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                className="min-h-[60px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
