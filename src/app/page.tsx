'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PaperclipIcon, SendIcon } from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import { Weather } from '@/components/weather';
import useChatsStore from '@/app/lib/state';
import { UIMessage } from 'ai';
import { Calc } from '@/components/calculator';
import { WordDefinition } from '@/components/word-definition';
import { WebSearchResult } from '@/components/web-search-result';
import { ImageDisplay } from '@/components/image-display';
import { EmailSummarizer } from '@/components/email-summarizer';
import MondayBoards from '@/components/monday-boards';
import CreateBoard from '@/components/create-board';

export default function Home() {
  const [loading] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const { chats, currentChatId, addMessage } = useChatsStore();

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    id: currentChatId || undefined,
    initialMessages: currentChatId ? chats.find(chat => chat.id === currentChatId)?.messages || [] : [],
    body: {
      // Include web search in the request body when enabled
      webSearchEnabled: webSearchEnabled ? true : false
    },
    onFinish: (message) => {
      if (currentChatId && message) {
        addMessage(currentChatId, (message as UIMessage));
      }
    }
  });
  
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto focus the input field when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);


  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Create a wrapped handleSubmit that includes the web search state
  const handleSubmitWithTools = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentChatId) {
      // Add user message to the store
      const userMessage: UIMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: input,
        parts: [{ type: 'text', text: input }]
      };
      addMessage(currentChatId, userMessage);
    }
    // Call the original handleSubmit
    await handleSubmit(e, {body: {
      webSearchEnabled: webSearchEnabled
    }
     
    });
  };

  return (
    <div className="flex flex-col h-screen">
      
      {/* Messages section with its own scrollable area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto" style={{ maxHeight: 'calc(100vh - 25px)' }}>
          <div className="flex flex-col overflow-scroll">
            {messages.map(message => (
              <div key={message.id} className="flex flex-col gap-1 border-b p-2">
                <div className="flex flex-row justify-between">
                  <div className="text-sm text-zinc-500">{message.role}</div>
                </div>
             
              {/* Only show text parts if there are no tool invocations with results */}
              {(!message.toolInvocations || !message.toolInvocations.some(tool => tool.state === 'result')) && 
                message.parts?.map((part, i) => {
                  if (part.type === 'text') {
                    // Filter out any base64 image data from the text
                    const formattedText = part.text
                      .split('\n')
                      .map(line => line.trim())
                      .filter(line => line)
                      .map(line => {
                        // Remove any markdown image syntax with base64 data
                        const cleanedLine = line.replace(/!\[.*?\]\(data:image\/[^;]+;base64,[^)]+\)/g, '');
                        
                        return cleanedLine
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/###\s*(.*?)(?:\n|$)/g, '<em>$1</em>')
                          .replace(
                            /\[(.*?)\]\((.*?)\)/g, 
                            '<a href="$2" class="text-blue-500 hover:underline" target="_blank">$1</a>'
                          );
                      })
                      .join('<br /><br />'); // Added extra <br /> for paragraph spacing

                    return (
                      <div 
                        key={i} 
                        className="font-sans text-base leading-relaxed space-y-4" // Added space-y-4 for vertical gaps
                        dangerouslySetInnerHTML={{ __html: formattedText }} 
                      />
                    );
                  }

                  return null;
                })}
                <div>
                  {message.toolInvocations?.map(toolInvocation => {
                    const { toolName, toolCallId, state } = toolInvocation;

                    if (state === 'result') {
                      if (toolName === 'displayWeather') {
                        const { result } = toolInvocation;
                        return (
                          <div key={toolCallId}>
                            <Weather {...result} />
                          </div>
                        );
                      } else if(toolName === "calculate") {
                        const { result } = toolInvocation;
                        return (
                          <div key={toolCallId}>
                            <Calc {...result} />
                          </div>
                        );
                      } else if(toolName === "define") {
                        const { result } = toolInvocation;
                        return (
                          <div key={toolCallId}>
                            <WordDefinition {...result} />
                          </div>
                        );
                      } else if(toolName === "web_search_preview") {
                        const { result } = toolInvocation;
                        console.log('Web search result:', result);
                        return (
                          <div key={toolCallId} className="mt-2">
                            <WebSearchResult 
                              content={result.content || result.text || ''} 
                              sources={result.sources} 
                            />
                          </div>
                        );
                      } else if(toolName === "generateImage") {
                        const { result } = toolInvocation;
                        console.log(result)
                        return (
                          <div key={toolCallId}>
                            <ImageDisplay image={result.image} />
                          </div>
                        );
                      } else if(toolName === "summarizeMail") {
                        const { result } = toolInvocation;
                  
                        return <EmailSummarizer key={toolCallId} emails={result.emails}/>
                      } else if (toolName === "showMondayActions") {
                        const {result } = toolInvocation

                        return (
                          <div key={Math.random()} className="flex flex-wrap gap-2">
                            {result.tools.map((tool: string) => (
                              <Button
                                key={tool}
                               variant={'outline'}
                               className='cursor-pointer'
                                onClick={() => {
                                  handleInputChange({ target: { value: tool } } as React.ChangeEvent<HTMLInputElement>);
                                
                                }}
                              >
                                {tool}
                              </Button>
                            ))}
                          </div>
                        )
                      } else if (toolName === "showMondayBoards") {
                        const {result } = toolInvocation
  
                        return <MondayBoards key={Math.random()} boards={result.boards} />
                      } else if(toolName === "createMondayBoard") {
                        const {result} = toolInvocation
                        console.log(result.board)
                        return <CreateBoard board={result.board} />
                      }
                    } 
                    
                    else {
                      return (
                        <div key={toolCallId}>
                          {toolName === 'displayWeather' ? (
                            <div>Loading weather...</div>
                          ) : null}
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
      
      {/* Input section with fixed position at bottom */}
      <div className="sticky bottom-0 right-0 bg-background border-t shadow-lg">
        <div className="p-4">
          <form onSubmit={handleSubmitWithTools} className="flex items-center relative rounded-lg border overflow-hidden shadow-md">
            <div className="pl-3 flex items-center gap-2">
              <button 
                type="button"
                className="cursor-pointer text-gray-500 hover:text-gray-700 transition-colors p-2"
                aria-label="Attach file"
              >
                <PaperclipIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                className={`inline-flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  webSearchEnabled 
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/90'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <span className="hidden md:inline">Web Search</span>
              </button>
            </div>
            <Input
              ref={inputRef}
              className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 py-6 px-3 flex-1"
              value={input}
              onChange={handleInputChange}
              placeholder={webSearchEnabled ? "Ask anything (with web search)" : "Ask a question"}
            />
            <Button 
              type="submit"
              disabled={loading || !input.trim()}
              size="sm"
              className="cursor-pointer h-9 w-9 rounded-full p-0 flex items-center justify-center mr-3"
            >
              <SendIcon className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}