import { UIMessage } from 'ai'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'

interface Chat {
  id: string
  messages: UIMessage[]
}

interface ChatsState {
  chats: Chat[]
  currentChatId: string | null
  createChat: () => string
  addMessage: (chatId: string, message: UIMessage) => void
  setCurrentChat: (chatId: string) => void
  getChatById: (chatId: string) => Chat | undefined
}

const useChatsStore = create<ChatsState>()(
  devtools(
    persist(
      (set, get) => ({
        chats: [],
        currentChatId: null,
        createChat: () => {
          const newChatId = uuidv4()
          set((state) => ({
            chats: [...state.chats, { id: newChatId, messages: [] }],
            currentChatId: newChatId
          }))
          return newChatId
        },
        addMessage: (chatId, message) => {
          set((state) => ({
            chats: state.chats.map((chat) => 
              chat.id === chatId 
                ? { ...chat, messages: [...chat.messages, message] }
                : chat
            )
          }))
        },
        setCurrentChat: (chatId) => {
          set({ currentChatId: chatId })
        },
        getChatById: (chatId) => {
          return get().chats.find(chat => chat.id === chatId)
        }
      }),
      {
        name: 'chat-storage',
      },
    ),
  ),
)

export default useChatsStore