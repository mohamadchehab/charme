'use client';

import { Plus, Trash2 } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,

  SidebarMenu,

  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import useChatsStore from "@/app/lib/state";

export function AppSidebar() {
  const { chats, currentChatId, createChat, setCurrentChat, getChatById } = useChatsStore();
  const router = useRouter();

  // Handle creating a new thread
  const handleNewThread = () => {
    const newChatId = createChat();
    setCurrentChat(newChatId);
    router.push('/');
  };

  // Handle selecting a thread
  const handleSelectThread = (chatId: string) => {
    if (chatId === currentChatId) return;
    
    setCurrentChat(chatId);
    router.push('/');
  };

  // Handle deleting a thread
  const handleDeleteThread = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Filter out the chat to be deleted
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    
    // Update the store (we need to add a deleteChat method to the store)
    // For now, we'll just update the chats array directly
    useChatsStore.setState({ chats: updatedChats });
    
    // If the deleted chat was the current one, select another chat
    if (currentChatId === chatId) {
      const newActiveId = updatedChats.length > 0 ? updatedChats[0].id : null;
      setCurrentChat(newActiveId || '');
    }
  };

  // Get chat title with message preview
  const getChatTitle = (chatId: string) => {
    const chat = getChatById(chatId);
    if (!chat || chat.messages.length === 0) return "New Chat";
    
    const lastMessage = chat.messages[chat.messages.length - 1];
    
    // Get text from the message content or parts
    let messageText = lastMessage.content || '';
    if (lastMessage.parts && lastMessage.parts.length > 0) {
      const textPart = lastMessage.parts.find(part => part.type === 'text');
      if (textPart && 'text' in textPart) {
        messageText = textPart.text;
      }
    }
    
    // Truncate message text for preview
    const preview = messageText.length > 25 
      ? messageText.substring(0, 25) + '...' 
      : messageText;
      
    return preview || "New Chat";
  };

  return (
    <Sidebar>
      <SidebarContent>
        <div className="flex justify-between items-center px-4 py-2">
          <h2 className="text-lg font-semibold">Chats</h2>
          <Button variant="ghost" size="icon" onClick={handleNewThread}>
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {chats.map(chat => {
    
                return (
                  <SidebarMenuItem 
                    key={chat.id}
                    className={cn(
                      "flex justify-between items-center group",
                      "hover:bg-accent/50 transition-colors duration-200",
                      "rounded-lg px-2 py-1.5 my-0.5",
                      chat.id === currentChatId && "bg-accent"
                    )}
                    onClick={() => handleSelectThread(chat.id)}
                  >
                    <div className="flex items-center gap-3 truncate">
            
                      <div className="flex flex-col gap-0.5">
                        <span className="truncate font-medium text-sm">Chat</span>
                        <span className="truncate text-xs text-muted-foreground/80">
                          {getChatTitle(chat.id)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
              
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-6 w-6 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 hover:bg-destructive/10 "
                        onClick={(e) => handleDeleteThread(chat.id, e)}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  </SidebarMenuItem>
                );
              })}
              
              {chats.length === 0 && (
                <div className="px-4 py-2 text-sm text-muted-foreground">
                  No chats yet. Create a new one!
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
