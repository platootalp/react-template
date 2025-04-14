import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/chatStore';

interface ChatSidebarProps {
    visible: boolean;
    onNewSession: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ visible, onNewSession }) => {
    const navigate = useNavigate();
    const { sessions, activeSessionId, deleteSession, updateSessionTitle } = useStore();

    // 本地状态
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [showDeleteButtons, setShowDeleteButtons] = useState(false);

    // 选择会话
    const handleSelectSession = (sessionId: string) => {
        navigate(`/chat/${sessionId}`);
    };

    // 编辑会话标题
    const handleEditTitle = (sessionId: string, currentTitle: string) => {
        setEditingSessionId(sessionId);
        setEditingTitle(currentTitle);
    };

    // 保存会话标题
    const handleSaveTitle = async (sessionId: string) => {
        if (editingTitle.trim()) {
            await updateSessionTitle(sessionId, editingTitle);
        }
        setEditingSessionId(null);
    };

    // 取消编辑
    const handleCancelEdit = () => {
        setEditingSessionId(null);
    };

    // 删除会话
    const handleDeleteSession = async (sessionId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        await deleteSession(sessionId);

        // 如果删除的是当前活动会话，则导航到第一个会话，如果没有会话则导航到/chat
        if (sessionId === activeSessionId) {
            if (sessions.length > 1) {
                const nextSession = sessions.find(s => s.id !== sessionId);
                if (nextSession) {
                    navigate(`/chat/${nextSession.id}`);
                }
            } else {
                navigate('/chat');
            }
        }
    };

    // 格式化日期
    const formatDate = (timestamp: number): string => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // 今天的消息只显示时间
        if (date.toDateString() === today.toDateString()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        // 昨天的消息显示"昨天"
        if (date.toDateString() === yesterday.toDateString()) {
            return '昨天';
        }

        // 其他日期显示月/日
        return `${date.getMonth() + 1}月${date.getDate()}日`;
    };

    return (
        <aside className={`sidebar-chatgpt ${visible ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300`}>
            {/* 新建会话按钮 */}
            <div className="p-4">
                <button
                    onClick={onNewSession}
                    className="w-full py-2 px-3 rounded-md bg-[#10a37f] text-white hover:bg-[#0e926f] flex items-center justify-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    新对话
                </button>
            </div>

            {/* 会话列表切换按钮 */}
            <div className="px-3 mb-2 flex">
                <button
                    className={`py-1 px-3 rounded-md ${!showDeleteButtons ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                    onClick={() => setShowDeleteButtons(false)}
                >
                    聊天
                </button>
                <button
                    className={`py-1 px-3 rounded-md ml-2 ${showDeleteButtons ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                    onClick={() => setShowDeleteButtons(true)}
                >
                    管理
                </button>
            </div>

            {/* 会话列表 */}
            <div className="flex-1 overflow-y-auto">
                {sessions.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                        还没有对话，开始新对话吧！
                    </div>
                ) : (
                    <ul>
                        {sessions.map((session) => (
                            <li key={session.id}>
                                <div
                                    className={`flex items-center px-3 py-3 ${activeSessionId === session.id
                                            ? 'bg-gray-700 text-white'
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        } cursor-pointer rounded-md my-1 mx-1`}
                                    onClick={() => handleSelectSession(session.id)}
                                >
                                    {/* 会话图标 */}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                    </svg>

                                    {/* 编辑模式显示输入框 */}
                                    {editingSessionId === session.id ? (
                                        <div className="flex-1 flex">
                                            <input
                                                type="text"
                                                value={editingTitle}
                                                onChange={(e) => setEditingTitle(e.target.value)}
                                                className="flex-1 bg-gray-600 text-white rounded px-2 py-1"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleSaveTitle(session.id);
                                                    } else if (e.key === 'Escape') {
                                                        handleCancelEdit();
                                                    }
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSaveTitle(session.id);
                                                }}
                                                className="ml-2 text-green-400"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCancelEdit();
                                                }}
                                                className="ml-1 text-red-400"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium truncate">{session.title}</div>
                                                <div className="text-xs text-gray-400 truncate">
                                                    {session.messages.length > 0
                                                        ? session.messages[session.messages.length - 1].content.substring(0, 30) + (session.messages[session.messages.length - 1].content.length > 30 ? '...' : '')
                                                        : '无消息'}
                                                </div>
                                            </div>

                                            <div className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                                                {formatDate(session.updatedAt)}
                                            </div>

                                            {/* 操作按钮 - 只在管理模式或悬停时显示 */}
                                            {showDeleteButtons && (
                                                <div className="ml-2 flex">
                                                    {/* 编辑按钮 */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditTitle(session.id, session.title);
                                                        }}
                                                        className="text-gray-400 hover:text-white p-1"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                        </svg>
                                                    </button>

                                                    {/* 删除按钮 */}
                                                    <button
                                                        onClick={(e) => handleDeleteSession(session.id, e)}
                                                        className="text-gray-400 hover:text-red-500 p-1"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </aside>
    );
};

export default ChatSidebar; 