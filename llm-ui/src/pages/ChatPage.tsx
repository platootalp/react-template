import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/chatStore';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatSettings from '../components/chat/ChatSettings';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const ChatPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 状态管理
    const {
        sessions,
        activeSession,
        activeSessionId,
        sidebarVisible,
        toggleSidebar,
        loading,
        setActiveSession,
        createSession,
        sendMessage,
        clearMessages,
        deleteSession,
        streamingMessageId,
        streamingContent
    } = useStore();

    // 本地状态
    const [showSettings, setShowSettings] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        title: '',
        message: '',
        onConfirm: () => { }
    });

    // 监听URL参数变化来切换会话
    useEffect(() => {
        if (id) {
            setActiveSession(id);
        } else if (sessions.length > 0) {
            navigate(`/chat/${sessions[0].id}`);
        }
    }, [id, sessions, setActiveSession, navigate]);

    // 滚动到底部
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [activeSession?.messages, streamingContent]);

    // 创建新会话
    const handleNewSession = async () => {
        const newSession = await createSession('新的对话');
        navigate(`/chat/${newSession.id}`);
    };

    // 处理消息发送
    const handleSendMessage = async (content: string) => {
        if (content.trim() === '') return;

        // 如果没有活动会话，先创建一个
        if (!activeSessionId) {
            const newSession = await createSession();
            await setActiveSession(newSession.id);
            navigate(`/chat/${newSession.id}`);
        }

        await sendMessage(content);
    };

    // 清空当前会话
    const handleClearSession = () => {
        if (!activeSessionId) return;

        setConfirmAction({
            title: '清空会话',
            message: '确定要清空这个会话中的所有消息吗？这个操作无法撤销。',
            onConfirm: () => {
                clearMessages(activeSessionId);
                setShowConfirmDialog(false);
            }
        });

        setShowConfirmDialog(true);
    };

    // 删除当前会话
    const handleDeleteSession = () => {
        if (!activeSessionId) return;

        setConfirmAction({
            title: '删除会话',
            message: '确定要删除这个会话吗？这个操作无法撤销。',
            onConfirm: () => {
                deleteSession(activeSessionId);
                if (sessions.length > 1) {
                    // 查找当前会话的索引
                    const currentIndex = sessions.findIndex(s => s.id === activeSessionId);
                    // 导航到下一个会话，如果当前是最后一个，则导航到前一个
                    const nextIndex = currentIndex < sessions.length - 1 ? currentIndex + 1 : currentIndex - 1;
                    navigate(`/chat/${sessions[nextIndex].id}`);
                } else {
                    navigate('/chat');
                }
                setShowConfirmDialog(false);
            }
        });

        setShowConfirmDialog(true);
    };

    return (
        <div className="flex h-screen overflow-hidden">
            {/* 侧边栏 */}
            <ChatSidebar
                visible={sidebarVisible}
                onNewSession={handleNewSession}
            />

            {/* 主要内容区域 */}
            <main className={`main-view-chatgpt flex-1 ${sidebarVisible ? 'ml-64' : 'ml-0'}`}>
                {/* 顶部导航栏 */}
                <div className="h-14 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 justify-between bg-white dark:bg-[#343541]">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                    </button>

                    <div className="flex">
                        <button
                            onClick={handleClearSession}
                            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 mr-2"
                            disabled={!activeSession || activeSession.messages.length === 0}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </button>

                        <button
                            onClick={() => setShowSettings(true)}
                            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* 消息区域 */}
                <div className="h-[calc(100vh-8rem)] overflow-y-auto p-4 bg-white dark:bg-[#343541]">
                    {activeSession && activeSession.messages.length > 0 ? (
                        <div>
                            {activeSession.messages.map((message) => (
                                <ChatMessage
                                    key={message.id}
                                    message={message}
                                    isStreaming={message.id === streamingMessageId}
                                    streamingContent={message.id === streamingMessageId ? streamingContent : undefined}
                                />
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    开始一个新对话
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    发送消息开始与AI助手对话
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* 输入区域 */}
                <div className="h-16 border-t border-gray-200 dark:border-gray-700 p-2 bg-white dark:bg-[#343541]">
                    <ChatInput onSend={handleSendMessage} disabled={loading} />
                </div>
            </main>

            {/* 设置弹窗 */}
            {showSettings && (
                <ChatSettings
                    onClose={() => setShowSettings(false)}
                />
            )}

            {/* 确认对话框 */}
            {showConfirmDialog && (
                <ConfirmDialog
                    title={confirmAction.title}
                    message={confirmAction.message}
                    onConfirm={confirmAction.onConfirm}
                    onCancel={() => setShowConfirmDialog(false)}
                />
            )}
        </div>
    );
};

export default ChatPage; 