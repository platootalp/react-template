import React, { useState } from 'react';
import { useStore } from '../../store/chatStore';

interface ChatSettingsProps {
    onClose: () => void;
}

const ChatSettings: React.FC<ChatSettingsProps> = ({ onClose }) => {
    const { settings, updateSettings, toggleStreamingMode, useStreaming } = useStore();

    // 本地状态
    const [apiKey, setApiKey] = useState(settings.apiKey || '');
    const [modelName, setModelName] = useState(settings.modelName);
    const [temperature, setTemperature] = useState(settings.temperature);
    const [maxTokens, setMaxTokens] = useState(settings.maxTokens);

    // 保存设置
    const handleSave = async () => {
        await updateSettings({
            apiKey,
            modelName,
            temperature,
            maxTokens
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">设置</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-6">
                    {/* API密钥 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            API密钥
                        </label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                            placeholder="输入你的API密钥"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            API密钥用于访问AI服务。请保管好你的密钥，不要泄露给他人。
                        </p>
                    </div>

                    {/* 模型选择 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            AI模型
                        </label>
                        <select
                            value={modelName}
                            onChange={(e) => setModelName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                        >
                            <option value="GPT-3.5">GPT-3.5-Turbo</option>
                            <option value="GPT-4">GPT-4</option>
                            <option value="Claude">Claude</option>
                            <option value="Llama">Llama 2</option>
                        </select>
                    </div>

                    {/* 温度滑块 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            温度: {temperature.toFixed(1)}
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={temperature}
                            onChange={(e) => setTemperature(parseFloat(e.target.value))}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>精确</span>
                            <span>平衡</span>
                            <span>创意</span>
                        </div>
                    </div>

                    {/* 最大令牌数 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            最大令牌数: {maxTokens}
                        </label>
                        <input
                            type="range"
                            min="256"
                            max="4096"
                            step="256"
                            value={maxTokens}
                            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>较短</span>
                            <span>适中</span>
                            <span>较长</span>
                        </div>
                    </div>

                    {/* 流式传输开关 */}
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            流式响应
                        </label>
                        <button
                            onClick={toggleStreamingMode}
                            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${useStreaming ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                        >
                            <span
                                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${useStreaming ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        保存
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatSettings; 