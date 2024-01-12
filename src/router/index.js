import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../views/home.vue';
import { useUserInfo } from '../store/userInfo';


const routes = [
    {
        path: '/',
        redirect: '/login',
    },
    {
        path: '/',
        name: 'Home',
        component: Home,
        children: [
            {
                path: '/notification',
                name: 'notification',
                meta: {
                    title: '通知',
                    permiss: [],
                },
                component: () => import('../views/announcement.vue'),
            },
            {
                path: '/file_management',
                name: 'file_management',
                meta: {
                    title: '文件管理',
                    permiss: [],
                },
                component: () => import('../views/announcement.vue'),
            },
            {
                path: '/finance_management',
                name: 'finance_management',
                meta: {
                    title: '财务信息管理',
                    permiss: [],
                },
                component: () => import('../views/finance_management.vue'),
            },
            {
                path: '/my_reimbursement_apply',
                name: 'my_reimbursement_apply',
                meta: {
                    title: '财务信息管理',
                    permiss: [],
                },
                component: () => import('../views/my_reimbursement_apply.vue'),
            },
            {
                path: '/reimbursement_management',
                name: 'reimbursement_management',
                meta: {
                    title: '报销处理',
                    permiss: [],
                },
                component: () => import('../views/reimbursement_management.vue'),
            },
            {
                path: '/reimbursement_apply',
                name: 'reimbursement_apply',
                meta: {
                    title: '报销申请',
                    permiss: [],
                },
                component: () => import('../views/reimbursement_apply.vue'),
            },
            {
                path: '/my_reimbursement_apply',
                name: 'my_reimbursement_apply',
                meta: {
                    title: '我的报销申请',
                    permiss: [],
                },
                component: () => import('../views/my_reimbursement_apply.vue'),
            },

            {
                path: '/dashboard',
                name: 'dashboard',
                meta: {
                    title: '系统首页',
                    permiss: []
                },
                component: () => import('../views/dashboard.vue'),
            },
            {
                path: '/activity_add',
                name: 'activity_add',
                meta: {
                    title: '新增活动',
                    permiss: [],
                },
                component: () => import('../views/activity_add.vue'),
            },
            {
                path: '/activity_management',
                name: 'activity_management',
                meta: {
                    title: '活动管理',
                    permiss: [],
                },
                component: () => import('../views/activity_management.vue'),
            },
            {
                path: '/activity_reflextion',
                name: 'activity_reflextion',
                meta: {
                    title: '活动推送管理',
                    permiss: [],
                },
                component: () => import('../views/activity_reflextion.vue'),
            },
            {
                path: '/activity_reimbursement',
                name: 'activity_reimbursement',
                meta: {
                    title: '活动审核',
                    permiss: [],
                },
                component: () => import('../views/activity_reimbursement.vue'),
            },
            {
                path: '/collection_repair',
                name: 'collection_repair',
                meta: {
                    title: '修缮藏品',
                    permiss: [],
                },
                component: () => import('../views/collection_repair.vue'),
            },
            {
                path: '/collection_add',
                name: 'collection_add',
                meta: {
                    title: '新增藏品',
                    permiss: [],
                },
                component: () => import('../views/collection_add.vue'),
            },
            {
                path: '/Human_Management',
                name: 'Human_Management',
                meta: {
                    title: '人事管理',
                    permiss: [],
                },
                component: () => import('../views/Human_Management.vue'),
            },
            {
                path: '/statistics',
                name: 'statistics',
                meta: {
                    title: '统计信息',
                    permiss: [],
                },
                component: () => import('../views/statistics.vue'),
            },
            {
                path: '/table',
                name: 'table',
                meta: {
                    title: '展厅',
                    permiss: [],
                },
                component: () => import('../views/table.vue'),
            },
            {
                path: '/collections',
                name: 'collections',
                meta: {
                    title: '展品详情',
                    permiss: [],
                },
                component: () => import('../views/collections.vue'),
            },
            {
                path: '/activity',
                name: 'activity',
                meta: {
                    title: '活动',
                    permiss: [],
                },
                component: () => import('../views/activity.vue'),
            },

            {
                path: '/feedbacks',
                name: 'feedback',
                meta: {
                    title: '反馈列表',
                    permiss: [],
                },
                component: () => import('../views/feedbacks.vue'),
            },
            {
                path: '/products',
                name: 'product',
                meta: {
                    title: '文创产品',
                    permiss: [],
                },
                component: () => import('../views/products.vue'),
            },
            {
                path: '/cooperations',
                name: 'cooperation',
                meta: {
                    title: '合作联名项目',
                    permiss: [],
                },
                component: () => import('../views/cooperations.vue'),

            },
            {
                path: '/ccard',
                name: 'ccard',
                meta: {
                    title: '个人中心',
                    permiss: ['User'],
                },
                component: () => import('../views/ccard.vue'),
            },
            {
                path:'/storage',
                name:'storage',
                meta:{
                    title:'库存管理',
                    permiss:['WarehouseAdmin'],
                },
                component:()=>import('../views/storage.vue'),
            }
        ],
    },
    {
        path: '/login',
        name: 'Login',
        meta: {
            title: '登录',
        },
        component: () => import('../views/login.vue'),
    },
    {
        path: '/403',
        name: '403',
        meta: {
            title: '没有权限',
        },
        component: () => import('../views/403.vue'),
    },
    {
        path:'/404',
        name:'404',
        meta:{
            title:'您要找的页面不存在',
        },
        component: ()=>import('../views/404.vue')
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});
router.beforeEach((to, from, next) => {
    // 直接允许所有路由，不进行任何检查
    next();
})
// router.beforeEach((to, from, next) => {
//     const userInfo = useUserInfo()
//     if (
//         (!userInfo.expireTime ||
//             userInfo.expireTime < new Date()) &&
//         to.path !== '/login'
//     ) {
//         next('/login');
//     }
//     else {
//         next()
//         let flag = false;
//         if (!Array.isArray(to.meta.permiss) || to.meta.permiss.length === 0)
//             flag = true;
//         if (Array.isArray(role)) {
//             role.forEach(element => {
//                 if (to.meta.permiss.includes(element)) {
//                     flag = true;
//                 }
//             });
//         }
//         if (flag === false) {
//             next('/403');
//         }
//         else {
//             next();
//         }
//     }
// })
export default router;
