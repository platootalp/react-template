/**
 * 消息角色类型
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * 消息类型定义
 */
export interface Message {
    id: string;
    role: MessageRole;
    content: string;
    timestamp: number;
}

/**
 * 聊天会话类型定义
 */
export interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    createdAt: number;
    updatedAt: number;
}

/**
 * 创建消息的请求类型
 */
export interface CreateMessageRequest {
    role: MessageRole;
    content: string;
}

/**
 * 聊天设置类型
 */
export interface ChatSettings {
    apiKey?: string;
    modelName: string;
    temperature: number;
    maxTokens: number;
} 