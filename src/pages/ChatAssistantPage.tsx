import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Loader2, Sparkles, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { sendChatMessageSync, type ChatMessage } from '@/services/api';
import { Streamdown } from 'streamdown';

interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

const ChatAssistantPage: React.FC = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const promptTemplates = [
    { 
      label: 'Write Video Script', 
      prompt: 'Write a viral video script about [topic] for social media',
      description: 'Write a viral video script about [topic] for social media'
    },
    { 
      label: 'Generate Image Prompt', 
      prompt: 'Create a detailed image generation prompt for [description]',
      description: 'Create a detailed image generation prompt for [description]'
    },
    { 
      label: 'Improve Prompt', 
      prompt: 'Improve this prompt for better AI generation: [your prompt]',
      description: 'Improve this prompt for better AI generation: [your prompt]'
    },
    { 
      label: 'Content Ideas', 
      prompt: 'Give me 5 viral content ideas for [niche/platform]',
      description: 'Give me 5 viral content ideas for [niche/platform]'
    },
  ];

  const tips = [
    'Be specific in your requests',
    'Ask for improvements on prompts',
    'Request multiple variations',
    'Copy responses to use in generators'
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatMessages: ChatMessage[] = messages.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      }));

      chatMessages.push({
        role: 'user',
        parts: [{ text: userMessage.content }],
      });

      const response = await sendChatMessageSync(chatMessages);

      if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
        const assistantMessage: Message = {
          role: 'model',
          content: response.candidates[0].content.parts[0].text,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error('Invalid response from AI');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTemplateClick = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  const handleCopy = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({
      title: 'Copied to Clipboard',
      description: 'Message content copied successfully',
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 xl:py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl xl:text-4xl font-bold mb-2 flex items-center gap-3">
          <MessageSquare className="w-8 h-8 xl:w-10 xl:h-10 text-primary" />
          AI Chat Assistant
        </h1>
        <p className="text-muted-foreground text-base xl:text-lg">
          Get help with scripts, prompts, and viral content ideas
        </p>
      </div>

      <div className="grid gap-4 xl:gap-6 xl:grid-cols-[1fr_320px]">
        {/* Chat Area */}
        <Card className="flex flex-col h-[calc(100vh-220px)] xl:h-[calc(100vh-200px)]">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-lg xl:text-xl">Chat</CardTitle>
            <CardDescription>Ask anything about content creation</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {messages.length === 0 && (
                <div className="h-full flex items-center justify-center text-center text-muted-foreground px-4">
                  <div>
                    <Sparkles className="w-12 h-12 xl:w-16 xl:h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-base xl:text-lg font-medium mb-2">Start a Conversation</p>
                    <p className="text-sm">Ask me to help you create viral content, write scripts, or improve prompts</p>
                  </div>
                </div>
              )}
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] xl:max-w-[80%] rounded-lg p-3 xl:p-4 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {message.role === 'model' ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <Streamdown>{message.content}</Streamdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap text-sm xl:text-base">{message.content}</p>
                      )}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                        {message.role === 'model' && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => handleCopy(message.content, index)}
                          >
                            {copiedIndex === index ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-4">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t p-3 xl:p-4">
              <div className="flex gap-2">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message... (Shift+Enter for new line)"
                  className="resize-none text-sm xl:text-base"
                  rows={3}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="shrink-0 h-auto gradient-primary text-white"
                >
                  <Send className="w-4 h-4 xl:w-5 xl:h-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar with Templates */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base xl:text-lg">Quick Templates</CardTitle>
              <CardDescription className="text-xs">Click to use a template</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {promptTemplates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => handleTemplateClick(template.prompt)}
                  className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent hover:border-primary/50 transition-all"
                >
                  <p className="font-medium text-sm mb-1">{template.label}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base xl:text-lg">Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tips.map((tip, index) => (
                <p key={index} className="text-sm text-muted-foreground">• {tip}</p>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistantPage;
