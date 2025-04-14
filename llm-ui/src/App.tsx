import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useStore } from './store/chatStore';
import WelcomePage from './pages/WelcomePage';
import ChatPage from './pages/ChatPage';

const App: React.FC = () => {
    const { initializeStore } = useStore();

    // 检测系统颜色模式并应用
    useEffect(() => {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
        }

        // 初始化聊天 store
        initializeStore();
    }, [initializeStore]);

    return (
        <div className="welcome-container">
            <Routes>
                <Route path="/" element={<WelcomePage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/chat/:id" element={<ChatPage />} />
                <Route path="*" element={<WelcomePage />} />
            </Routes>
        </div>
    );
};

export default App; 