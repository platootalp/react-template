import React, { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
    onSend,
    disabled = false,
    placeholder = '发送消息...'
}) => {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // 自动调整高度
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
        }
    }, [message]);

    // 处理发送消息
    const handleSend = () => {
        if (message.trim() && !disabled) {
            onSend(message);
            setMessage('');

            // 重置高度
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    // 处理按键事件 (Enter 发送消息，Shift+Enter 换行)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto relative">
            <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full pr-12 pl-4 py-3 rounded-lg border dark:border-gray-600 resize-none min-h-[44px] max-h-[120px] dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={1}
            />
            <button
                className={`absolute right-3 bottom-3 rounded-md p-1 ${message.trim() && !disabled
                        ? 'text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-600'
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                onClick={handleSend}
                disabled={!message.trim() || disabled}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6"
                >
                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
            </button>
        </div>
    );
};

export default ChatInput; 