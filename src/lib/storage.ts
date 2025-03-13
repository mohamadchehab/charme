import { ClientMessage } from "@/app/actions";

export interface Thread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ClientMessage[];
}

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Key for storing threads in localStorage
const THREADS_STORAGE_KEY = 'chat-threads';
const ACTIVE_THREAD_KEY = 'active-thread';

// Get all threads from localStorage
export function getThreads(): Thread[] {
  if (!isBrowser) return [];
  
  try {
    const threadsJson = localStorage.getItem(THREADS_STORAGE_KEY);
    return threadsJson ? JSON.parse(threadsJson) : [];
  } catch (error) {
    console.error('Failed to parse threads from localStorage:', error);
    return [];
  }
}

// Get a specific thread by ID
export function getThread(threadId: string): Thread | undefined {
  return getThreads().find(thread => thread.id === threadId);
}

// Save threads to localStorage
export function saveThreads(threads: Thread[]): void {
  if (!isBrowser) return;
  
  try {
    localStorage.setItem(THREADS_STORAGE_KEY, JSON.stringify(threads));
  } catch (error) {
    console.error('Failed to save threads to localStorage:', error);
  }
}

// Create a new thread
export function createThread(title: string = 'New Chat'): Thread {
  const newThread: Thread = {
    id: generateId(),
    title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: []
  };
  
  const threads = getThreads();
  threads.unshift(newThread); // Add to beginning of array
  saveThreads(threads);
  setActiveThread(newThread.id);
  
  return newThread;
}

// Update a thread
export function updateThread(threadId: string, updates: Partial<Thread>): Thread | undefined {
  const threads = getThreads();
  const threadIndex = threads.findIndex(thread => thread.id === threadId);
  
  if (threadIndex === -1) return undefined;
  
  const updatedThread = {
    ...threads[threadIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  threads[threadIndex] = updatedThread;
  saveThreads(threads);
  
  return updatedThread;
}

// Update thread title
export function updateThreadTitle(threadId: string, title: string): Thread | undefined {
  return updateThread(threadId, { title });
}

// Generate a title based on the first message
export function generateThreadTitle(threadId: string): Thread | undefined {
  const thread = getThread(threadId);
  if (!thread || thread.messages.length === 0) return thread;
  
  // Get the first user message
  const firstUserMessage = thread.messages.find(msg => 
    typeof msg.status === 'string' && msg.status.includes('user')
  );
  
  if (!firstUserMessage) return thread;
  
  // Extract text from the message
  const messageText = typeof firstUserMessage.text === 'string' 
    ? firstUserMessage.text 
    : '';
  
  // Create a title from the first few words (max 5 words)
  const words = messageText.split(' ').slice(0, 5);
  let title = words.join(' ');
  
  // Add ellipsis if truncated
  if (words.length < messageText.split(' ').length) {
    title += '...';
  }
  
  // Use default if title is empty
  if (!title.trim()) {
    title = 'New Chat';
  }
  
  return updateThreadTitle(threadId, title);
}

// Delete a thread
export function deleteThread(threadId: string): boolean {
  const threads = getThreads();
  const filteredThreads = threads.filter(thread => thread.id !== threadId);
  
  if (filteredThreads.length === threads.length) return false;
  
  saveThreads(filteredThreads);
  
  // If we deleted the active thread, set a new active thread
  if (getActiveThread() === threadId && filteredThreads.length > 0) {
    setActiveThread(filteredThreads[0].id);
  } else if (filteredThreads.length === 0) {
    clearActiveThread();
  }
  
  return true;
}

// Add a message to a thread
export function addMessageToThread(threadId: string, message: ClientMessage): Thread | undefined {
  const threads = getThreads();
  const threadIndex = threads.findIndex(thread => thread.id === threadId);
  
  if (threadIndex === -1) return undefined;
  
  const updatedThread = {
    ...threads[threadIndex],
    messages: [...threads[threadIndex].messages, message],
    updatedAt: new Date().toISOString()
  };
  
  threads[threadIndex] = updatedThread;
  saveThreads(threads);
  
  // Generate a title if this is the first user message and thread has default title
  if (
    threads[threadIndex].title === 'New Chat' && 
    updatedThread.messages.length === 1 &&
    typeof message.status === 'string' && 
    message.status.includes('user')
  ) {
    return generateThreadTitle(threadId);
  }
  
  return updatedThread;
}

// Get active thread ID
export function getActiveThread(): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem(ACTIVE_THREAD_KEY);
}

// Set active thread ID
export function setActiveThread(threadId: string): void {
  if (!isBrowser) return;
  localStorage.setItem(ACTIVE_THREAD_KEY, threadId);
}

// Clear active thread
export function clearActiveThread(): void {
  if (!isBrowser) return;
  localStorage.removeItem(ACTIVE_THREAD_KEY);
}

// Generate a unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Initialize with a default thread if none exist
export function initializeStorage(): void {
  if (!isBrowser) return;
  
  const threads = getThreads();
  if (threads.length === 0) {
    createThread('New Chat');
  }
  
  if (!getActiveThread() && threads.length > 0) {
    setActiveThread(threads[0].id);
  }
} 