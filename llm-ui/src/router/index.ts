import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Welcome',
        component: () => import('../views/WelcomeView.vue'),
        meta: {
            title: '欢迎使用 - ChatGPT风格界面'
        }
    },
    {
        path: '/chat',
        name: 'Chat',
        component: () => import('../views/ChatView.vue'),
        meta: {
            title: '会话列表 - ChatGPT风格界面'
        }
    },
    {
        path: '/chat/:id',
        name: 'ChatSession',
        component: () => import('../views/ChatView.vue'),
        props: true,
        meta: {
            title: '对话 - ChatGPT风格界面'
        }
    },
    // 重定向所有其他路径到主界面
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
]

const router = createRouter({
    history: createWebHistory('/'),
    routes
})

// 设置页面标题
router.beforeEach((to, from, next) => {
    if (to.meta && to.meta.title) {
        document.title = to.meta.title as string
    } else {
        document.title = 'ChatGPT风格界面'
    }
    next()
})

export default router 