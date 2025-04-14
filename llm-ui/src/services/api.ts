import axios from 'axios';
import type { ChatSession, Message, CreateMessageRequest, ChatSettings } from '../types/chat';

// API基础URL从环境变量获取
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';

// 创建axios实例
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 添加请求拦截器 - 在请求头中添加API密钥
apiClient.interceptors.request.use(config => {
    const apiKey = localStorage.getItem('chat-storage')
        ? JSON.parse(localStorage.getItem('chat-storage') || '{}')?.state?.settings?.apiKey
        : null;

    if (apiKey) {
        config.headers['Authorization'] = `Bearer ${apiKey}`;
    }

    return config;
});

// API服务对象
export const apiService = {
    // 获取会话列表
    async getConversations(): Promise<ChatSession[]> {
        try {
            const response = await apiClient.get('/conversations');
            return response.data;
        } catch (error) {
            console.error('获取会话列表失败:', error);
            throw error;
        }
    },

    // 创建新会话
    async createConversation(title: string): Promise<ChatSession> {
        try {
            const response = await apiClient.post('/conversations', { title });
            return response.data;
        } catch (error) {
            console.error('创建会话失败:', error);
            throw error;
        }
    },

    // 更新会话
    async updateConversation(conversationId: string, data: { title?: string }): Promise<ChatSession> {
        try {
            const response = await apiClient.patch(`/conversations/${conversationId}`, data);
            return response.data;
        } catch (error) {
            console.error('更新会话失败:', error);
            throw error;
        }
    },

    // 删除会话
    async deleteConversation(conversationId: string): Promise<void> {
        try {
            await apiClient.delete(`/conversations/${conversationId}`);
        } catch (error) {
            console.error('删除会话失败:', error);
            throw error;
        }
    },

    // 获取会话消息
    async getMessages(conversationId: string): Promise<Message[]> {
        try {
            const response = await apiClient.get(`/conversations/${conversationId}/messages`);
            return response.data;
        } catch (error) {
            console.error('获取消息失败:', error);
            throw error;
        }
    },

    // 创建消息
    async createMessage(
        conversationId: string,
        data: { role: string; content: string; settings?: ChatSettings }
    ): Promise<Message> {
        try {
            const response = await apiClient.post(`/conversations/${conversationId}/messages`, data);
            return response.data;
        } catch (error) {
            console.error('创建消息失败:', error);
            throw error;
        }
    },

    // 清空会话消息
    async clearMessages(conversationId: string): Promise<void> {
        try {
            await apiClient.delete(`/conversations/${conversationId}/messages`);
        } catch (error) {
            console.error('清空消息失败:', error);
            throw error;
        }
    },

    // 更新设置
    async updateSettings(settings: Partial<ChatSettings>): Promise<void> {
        try {
            await apiClient.post('/settings', settings);
        } catch (error) {
            console.error('更新设置失败:', error);
            throw error;
        }
    }
};

// 创建流式响应服务
interface StreamingChatOptions {
    onContent: (content: string) => void;
    onComplete: () => void;
    onError: (error: any) => void;
}

// 创建流式聊天服务
export function createStreamingChatService(options: StreamingChatOptions) {
    return {
        streamChatResponse: async (
            conversationId: string,
            content: string,
            settings: ChatSettings
        ): Promise<void> => {
            let ws: WebSocket | null = null;

            try {
                // 构建WebSocket URL
                const wsUrl = `${WS_URL}/chat/${conversationId}?content=${encodeURIComponent(content)}`;

                // 如果有API密钥，添加到URL
                const finalUrl = settings.apiKey
                    ? `${wsUrl}&api_key=${encodeURIComponent(settings.apiKey)}`
                    : wsUrl;

                // 创建WebSocket连接
                ws = new WebSocket(finalUrl);

                let fullContent = '';

                // 设置WebSocket事件处理
                ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        if (data.content) {
                            fullContent += data.content;
                            options.onContent(fullContent);
                        }
                    } catch (err) {
                        console.error('解析WebSocket消息失败:', err);
                    }
                };

                ws.onclose = () => {
                    options.onComplete();
                };

                ws.onerror = (error) => {
                    options.onError(error);
                    if (ws) {
                        ws.close();
                    }
                };

                // 返回Promise，等待连接关闭
                return new Promise((resolve, reject) => {
                    ws!.onclose = () => {
                        options.onComplete();
                        resolve();
                    };

                    ws!.onerror = (error) => {
                        options.onError(error);
                        reject(error);
                    };
                });
            } catch (error) {
                options.onError(error);
                if (ws) {
                    ws.close();
                }
                throw error;
            }
        }
    };
}
