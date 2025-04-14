/// <reference types="vite/client" />

interface ImportMeta {
    readonly env: {
        readonly VITE_API_BASE_URL?: string;
        readonly VITE_WS_URL?: string;
        readonly VITE_APP_TITLE?: string;
        readonly VITE_APP_VERSION?: string;
        readonly BASE_URL: string;
        readonly MODE: string;
        readonly DEV: boolean;
        readonly PROD: boolean;
        readonly SSR: boolean;
        [key: string]: any;
    }
} 