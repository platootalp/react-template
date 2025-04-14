import { ref } from 'vue'

export class WebSocketService {
    private ws: WebSocket | null = null
    private messageCallback: ((data: any) => void) | null = null
    private errorCallback: ((error: any) => void) | null = null

    // 连接状态
    public isConnected = ref(false)

    constructor(private url: string) { }

    connect() {
        if (this.ws?.readyState === WebSocket.OPEN) {
            return
        }

        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
            console.log('WebSocket connected')
            this.isConnected.value = true
        }

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                this.messageCallback?.(data)
            } catch (error) {
                console.error('Failed to parse WebSocket message:', error)
                this.errorCallback?.(error)
            }
        }

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error)
            this.errorCallback?.(error)
            this.isConnected.value = false
        }

        this.ws.onclose = () => {
            console.log('WebSocket disconnected')
            this.isConnected.value = false
            // 自动重连
            setTimeout(() => this.connect(), 3000)
        }
    }

    sendMessage(message: any) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message))
        } else {
            console.error('WebSocket is not connected')
        }
    }

    onMessage(callback: (data: any) => void) {
        this.messageCallback = callback
    }

    onError(callback: (error: any) => void) {
        this.errorCallback = callback
    }

    disconnect() {
        this.ws?.close()
        this.ws = null
        this.isConnected.value = false
    }
} 