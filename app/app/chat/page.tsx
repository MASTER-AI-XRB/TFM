import { Suspense } from 'react'
import ChatPageContent from '@/components/chat/ChatPageContent'
import { ChatPageLoading } from '@/components/chat/ChatPageLoading'

export default function ChatPage() {
  return (
    <Suspense fallback={<ChatPageLoading />}>
      <ChatPageContent />
    </Suspense>
  )
}
