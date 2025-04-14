import { ref } from 'vue'
import { WebSocketService } from './websocket'

export interface Message {
    id?: string
    content: string
    role: 'user' | 'assistant'
    conversationId?: string
    createdAt?: string
}

export class ChatService {
    private ws: WebSocketService
    public messages = ref<Message[]>([])
    public currentMessage = ref('')
    public isLoading = ref(false)

    constructor() {
        const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws/chat'
        this.ws = new WebSocketService(wsUrl)
        this.setupWebSocket()
    }

    private setupWebSocket() {
        this.ws.connect()

        this.ws.onMessage((data) => {
            if (data.type === 'chunk') {
                // 处理流式响应的文本块
                if (this.messages.value.length > 0) {
                    const lastMessage = this.messages.value[this.messages.value.length - 1]
                    if (lastMessage.role === 'assistant' && !data.id) {
                        // 追加到现有的助手消息
                        lastMessage.content += data.content
                    } else {
                        // 创建新的助手消息
                        this.messages.value.push({
                            id: data.id,
                            content: data.content,
                            role: 'assistant',
                            conversationId: data.conversationId,
                            createdAt: new Date().toISOString()
                        })
                    }
                }
            } else if (data.type === 'done') {
                this.isLoading.value = false
            }
        })

        this.ws.onError((error) => {
            console.error('Chat error:', error)
            this.isLoading.value = false
        })
    }

    async sendMessage(content: string, conversationId?: string) {
        if (!content.trim()) return

        // 添加用户消息
        this.messages.value.push({
            content,
            role: 'user',
            conversationId,
            createdAt: new Date().toISOString()
        })

        this.isLoading.value = true

        // 发送消息到 WebSocket
        this.ws.sendMessage({
            message: content,
            conversationId,
            model: 'gpt-3.5-turbo',
            temperature: 0.7,
            stream: true
        })

        // 清空输入
        this.currentMessage.value = ''
    }

    disconnect() {
        this.ws.disconnect()
    }
}

// 创建单例
export const chatService = new ChatService() 