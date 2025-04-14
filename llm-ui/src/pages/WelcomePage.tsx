import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/chatStore';

const WelcomePage: React.FC = () => {
    const navigate = useNavigate();
    const { createSession } = useStore();

    const handleStartChat = async () => {
        const session = await createSession('新的对话');
        navigate(`/chat/${session.id}`);
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-[#343541] text-center p-6">
            <div className="max-w-2xl w-full">
                <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">欢迎使用 AI 聊天界面</h1>

                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                    基于最先进的大型语言模型，随时随地获取智能对话支持
                </p>

                <div className="flex flex-col space-y-4 mb-12">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h3 className="font-medium text-lg text-gray-900 dark:text-white mb-2">智能对话</h3>
                        <p className="text-gray-600 dark:text-gray-400">体验流畅的人机交互，获取详细解答和创意灵感</p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h3 className="font-medium text-lg text-gray-900 dark:text-white mb-2">多会话管理</h3>
                        <p className="text-gray-600 dark:text-gray-400">创建和管理多个独立会话，轻松切换不同主题</p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h3 className="font-medium text-lg text-gray-900 dark:text-white mb-2">Markdown 支持</h3>
                        <p className="text-gray-600 dark:text-gray-400">支持富文本格式，包括代码高亮、表格和列表等</p>
                    </div>
                </div>

                <button
                    onClick={handleStartChat}
                    className="btn btn-primary text-lg py-3 px-8 mx-auto block"
                >
                    开始聊天
                </button>
            </div>
        </div>
    );
};

export default WelcomePage; 