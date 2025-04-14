import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message } from '../../types/chat';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
    message: Message;
    isStreaming?: boolean;
    streamingContent?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
    message,
    isStreaming = false,
    streamingContent
}) => {
    // 决定显示的内容：如果是流式传输中，则显示streamingContent
    const content = isStreaming ? streamingContent : message.content;

    // 根据角色设置不同的样式
    const isUser = message.role === 'user';

    return (
        <div className={`py-4 ${isUser ? '' : 'bg-gray-50 dark:bg-gray-800'}`}>
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex items-start space-x-4">
                    {/* 头像 */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-500' : 'bg-green-500'}`}>
                        {isUser ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                            </svg>
                        )}
                    </div>

                    {/* 消息内容 */}
                    <div className="flex-1 overflow-hidden">
                        <div className="font-medium text-gray-800 dark:text-gray-200 mb-1">
                            {isUser ? '您' : 'AI助手'}
                        </div>

                        <div className="prose dark:prose-invert max-w-none">
                            {isUser ? (
                                <p>{content}</p>
                            ) : (
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        code({ node, inline, className, children, ...props }) {
                                            const match = /language-(\w+)/.exec(className || '');
                                            return !inline && match ? (
                                                <SyntaxHighlighter
                                                    style={oneDark}
                                                    language={match[1]}
                                                    PreTag="div"
                                                    {...props}
                                                >
                                                    {String(children).replace(/\n$/, '')}
                                                </SyntaxHighlighter>
                                            ) : (
                                                <code className={className} {...props}>
                                                    {children}
                                                </code>
                                            );
                                        }
                                    }}
                                >
                                    {content || ''}
                                </ReactMarkdown>
                            )}
                        </div>

                        {/* 时间戳 */}
                        <div className="text-xs text-gray-500 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatMessage; 