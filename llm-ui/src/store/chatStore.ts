import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Message, ChatSession, CreateMessageRequest, ChatSettings } from '../types/chat';
import { apiService, createStreamingChatService } from '../services/api';

/**
 * 生成唯一ID
 */
function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

interface ChatState {
    // 状态
    sessions: ChatSession[];
    activeSessionId: string | null;
    loading: boolean;
    useStreaming: boolean;
    streamingMessageId: string | null;
    streamingContent: string;
    sidebarVisible: boolean;
    settings: ChatSettings;
    error: string | null;

    // 计算属性
    activeSession: ChatSession | null;

    // 方法
    initializeStore: () => Promise<void>;
    createSession: (title?: string) => Promise<ChatSession>;
    setActiveSession: (sessionId: string | null) => Promise<void>;
    deleteSession: (sessionId: string) => Promise<void>;
    addMessage: (request: CreateMessageRequest) => Message;
    updateSessionTitle: (sessionId: string, title: string) => Promise<void>;
    handleStreamingResponse: (content: string) => void;
    completeStreamingResponse: () => void;
    toggleSidebar: () => void;
    toggleStreamingMode: () => void;
    sendMessage: (content: string) => Promise<void>;
    updateSettings: (newSettings: Partial<ChatSettings>) => Promise<void>;
    clearMessages: (sessionId: string) => Promise<void>;
}

export const useStore = create<ChatState>()(
    persist(
        (set, get) => ({
            // 初始状态
            sessions: [],
            activeSessionId: null,
            loading: false,
            useStreaming: true,
            streamingMessageId: null,
            streamingContent: '',
            sidebarVisible: true,
            settings: {
                apiKey: '',
                modelName: 'GPT-3.5',
                temperature: 0.7,
                maxTokens: 2048
            },
            error: null,

            // 计算属性 - 在Zustand中我们可以使用getter来实现
            get activeSession() {
                const state = get();
                if (!state.activeSessionId) return null;
                return state.sessions.find(session => session.id === state.activeSessionId) || null;
            },

            // 初始化 - 从后端加载会话
            initializeStore: async () => {
                try {
                    set({ loading: true, error: null });
                    const { settings } = get();

                    // 如果启用了API，从后端获取会话列表
                    if (settings.apiKey) {
                        const conversations = await apiService.getConversations();
                        if (conversations && conversations.length > 0) {
                            set(state => ({
                                sessions: conversations,
                                activeSessionId: state.activeSessionId || conversations[0].id
                            }));
                        }
                    }
                } catch (err) {
                    console.error('初始化会话失败:', err);
                    set({ error: '无法加载会话历史' });
                } finally {
                    set({ loading: false });
                }
            },

            // 创建新的聊天会话
            createSession: async (title = '新的对话') => {
                try {
                    set({ loading: true });
                    const { settings } = get();
                    let newSession: ChatSession;

                    // 如果启用了API，使用后端创建会话
                    if (settings.apiKey) {
                        const result = await apiService.createConversation(title);
                        newSession = {
                            id: result.id,
                            title: result.title,
                            messages: [],
                            createdAt: Date.now(),
                            updatedAt: Date.now()
                        };
                    } else {
                        // 本地创建会话
                        const id = generateId();
                        newSession = {
                            id,
                            title,
                            messages: [],
                            createdAt: Date.now(),
                            updatedAt: Date.now()
                        };
                    }

                    set(state => ({
                        sessions: [newSession, ...state.sessions],
                        activeSessionId: newSession.id
                    }));

                    return newSession;
                } catch (err) {
                    console.error('创建会话失败:', err);
                    set({ error: '创建新会话失败' });
                    throw err;
                } finally {
                    set({ loading: false });
                }
            },

            // 切换活动会话
            setActiveSession: async (sessionId: string | null) => {
                try {
                    set({ activeSessionId: sessionId });

                    if (!sessionId) return;

                    const { sessions, settings } = get();
                    const session = sessions.find(s => s.id === sessionId);

                    // 如果会话存在但没有消息，并且启用了API，从后端获取消息
                    if (session && session.messages.length === 0 && settings.apiKey) {
                        set({ loading: true });
                        const messages = await apiService.getMessages(sessionId);
                        if (messages && messages.length > 0) {
                            set(state => ({
                                sessions: state.sessions.map(s =>
                                    s.id === sessionId ? { ...s, messages } : s
                                )
                            }));
                        }
                    }
                } catch (err) {
                    console.error('切换会话失败:', err);
                    set({ error: '无法加载会话消息' });
                } finally {
                    set({ loading: false });
                }
            },

            // 删除会话
            deleteSession: async (sessionId: string) => {
                try {
                    set({ loading: true });
                    const { settings, activeSessionId, sessions } = get();

                    // 如果启用了API，使用后端删除会话
                    if (settings.apiKey) {
                        await apiService.deleteConversation(sessionId);
                    }

                    const newSessions = sessions.filter(session => session.id !== sessionId);

                    // 如果删除的是当前活动会话，切换到其他会话
                    const newActiveSessionId =
                        activeSessionId === sessionId
                            ? (newSessions.length > 0 ? newSessions[0].id : null)
                            : activeSessionId;

                    set({
                        sessions: newSessions,
                        activeSessionId: newActiveSessionId
                    });
                } catch (err) {
                    console.error('删除会话失败:', err);
                    set({ error: '删除会话失败' });
                } finally {
                    set({ loading: false });
                }
            },

            // 添加消息到当前会话
            addMessage: (request: CreateMessageRequest) => {
                const message: Message = {
                    id: generateId(),
                    role: request.role,
                    content: request.content,
                    timestamp: Date.now()
                };

                set(state => {
                    const { activeSession, activeSessionId } = state;

                    if (!activeSession) {
                        // 如果没有活动会话，应该首先创建一个（这应该在调用之前处理）
                        return state;
                    }

                    return {
                        sessions: state.sessions.map(session =>
                            session.id === activeSessionId
                                ? {
                                    ...session,
                                    messages: [...session.messages, message],
                                    updatedAt: Date.now()
                                }
                                : session
                        )
                    };
                });

                return message;
            },

            // 更新会话标题
            updateSessionTitle: async (sessionId: string, title: string) => {
                try {
                    const { settings } = get();

                    set(state => ({
                        sessions: state.sessions.map(session =>
                            session.id === sessionId
                                ? { ...session, title, updatedAt: Date.now() }
                                : session
                        )
                    }));

                    // 如果启用了API，更新后端会话标题
                    if (settings.apiKey) {
                        await apiService.updateConversation(sessionId, { title });
                    }
                } catch (err) {
                    console.error('更新会话标题失败:', err);
                    set({ error: '无法更新会话标题' });
                }
            },

            // 处理流式响应内容
            handleStreamingResponse: (content: string) => {
                set({ streamingContent: content });
            },

            // 完成流式响应
            completeStreamingResponse: () => {
                const { streamingContent, streamingMessageId } = get();

                if (streamingMessageId) {
                    set(state => ({
                        sessions: state.sessions.map(session => {
                            if (session.id === state.activeSessionId) {
                                return {
                                    ...session,
                                    messages: session.messages.map(msg =>
                                        msg.id === streamingMessageId
                                            ? { ...msg, content: streamingContent }
                                            : msg
                                    )
                                };
                            }
                            return session;
                        }),
                        streamingMessageId: null,
                        streamingContent: ''
                    }));
                }
            },

            // 切换侧边栏可见性
            toggleSidebar: () => {
                set(state => ({ sidebarVisible: !state.sidebarVisible }));
            },

            // 切换流式响应模式
            toggleStreamingMode: () => {
                set(state => ({ useStreaming: !state.useStreaming }));
            },

            // 发送消息
            sendMessage: async (content: string) => {
                if (!content.trim()) return;

                try {
                    set({ loading: true, error: null });
                    const { activeSession, activeSessionId, settings, useStreaming } = get();

                    if (!activeSession) {
                        throw new Error('No active session');
                    }

                    // 添加用户消息
                    const userMessage = get().addMessage({
                        role: 'user',
                        content
                    });

                    // 预先创建AI消息占位符
                    const aiMessage = get().addMessage({
                        role: 'assistant',
                        content: ''
                    });

                    if (useStreaming) {
                        // 使用流式响应
                        set({ streamingMessageId: aiMessage.id });

                        try {
                            const streamingService = createStreamingChatService({
                                onContent: (content) => get().handleStreamingResponse(content),
                                onComplete: () => {
                                    get().completeStreamingResponse();
                                    set({ loading: false });
                                },
                                onError: (err) => {
                                    console.error('流式响应错误:', err);
                                    set({
                                        error: '接收AI响应时出错',
                                        loading: false,
                                        streamingMessageId: null
                                    });
                                }
                            });

                            await streamingService.streamChatResponse(
                                activeSessionId!,
                                content,
                                settings
                            );
                        } catch (err) {
                            console.error('流式响应失败:', err);
                            set({
                                error: '无法连接到AI服务',
                                loading: false,
                                streamingMessageId: null
                            });

                            // 更新错误状态到AI消息
                            set(state => ({
                                sessions: state.sessions.map(session => {
                                    if (session.id === activeSessionId) {
                                        return {
                                            ...session,
                                            messages: session.messages.map(msg =>
                                                msg.id === aiMessage.id
                                                    ? { ...msg, content: '抱歉，我无法连接到AI服务，请稍后再试。' }
                                                    : msg
                                            )
                                        };
                                    }
                                    return session;
                                })
                            }));
                        }
                    } else {
                        // 使用非流式响应
                        try {
                            const response = await apiService.createMessage(activeSessionId!, {
                                role: 'user',
                                content,
                                settings
                            });

                            // 更新AI消息内容
                            set(state => ({
                                sessions: state.sessions.map(session => {
                                    if (session.id === activeSessionId) {
                                        return {
                                            ...session,
                                            messages: session.messages.map(msg =>
                                                msg.id === aiMessage.id
                                                    ? { ...msg, content: response.content }
                                                    : msg
                                            )
                                        };
                                    }
                                    return session;
                                })
                            }));
                        } catch (err) {
                            console.error('发送消息失败:', err);
                            set({ error: '无法获取AI响应' });

                            // 更新错误状态到AI消息
                            set(state => ({
                                sessions: state.sessions.map(session => {
                                    if (session.id === activeSessionId) {
                                        return {
                                            ...session,
                                            messages: session.messages.map(msg =>
                                                msg.id === aiMessage.id
                                                    ? { ...msg, content: '抱歉，我无法获取AI响应，请稍后再试。' }
                                                    : msg
                                            )
                                        };
                                    }
                                    return session;
                                })
                            }));
                        }
                    }
                } catch (err) {
                    console.error('发送消息失败:', err);
                    set({ error: '发送消息失败' });
                } finally {
                    set({ loading: false });
                }
            },

            // 更新设置
            updateSettings: async (newSettings: Partial<ChatSettings>) => {
                try {
                    set(state => ({
                        settings: { ...state.settings, ...newSettings }
                    }));

                    // 如果启用了API，更新后端设置
                    const { settings } = get();
                    if (settings.apiKey) {
                        await apiService.updateSettings(newSettings);
                    }
                } catch (err) {
                    console.error('更新设置失败:', err);
                    set({ error: '无法更新设置' });
                }
            },

            // 清空会话消息
            clearMessages: async (sessionId: string) => {
                try {
                    set({ loading: true });
                    const { settings } = get();

                    // 清空本地会话消息
                    set(state => ({
                        sessions: state.sessions.map(session =>
                            session.id === sessionId
                                ? { ...session, messages: [], updatedAt: Date.now() }
                                : session
                        )
                    }));

                    // 如果启用了API，清空后端会话消息
                    if (settings.apiKey) {
                        await apiService.clearMessages(sessionId);
                    }
                } catch (err) {
                    console.error('清空消息失败:', err);
                    set({ error: '无法清空会话消息' });
                } finally {
                    set({ loading: false });
                }
            }
        }),
        {
            name: 'chat-storage',
            storage: createJSONStorage(() => localStorage)
        }
    )
); 