import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login'
import Home from '@/components/Home'
import template from '@/components/template'
import users from '@/components/user/users'
import rights from '@/components/power/rights'
import roles from '@/components/power/roles'
import cate from '@/components/goods/cate'
import params from '@/components/goods/params'
import goods from '@/components/goods/goods'
import goodsAdd from '@/components/goods/add'
import order from '@/components/order/order'
import report from '@/components/report/report'

Vue.use(Router)

const router = new Router({
    routes: [
        { path: "/", redirect: '/login' },
        { path: '/login', component: Login },
        {
            path: '/home',
            component: Home,
            children: [
                { path: "/template", component: template },
                { path: "/users", component: users },
                { path: "/rights", component: rights },
                { path: "/roles", component: roles },
                { path: "/categories", component: cate },
                { path: "/params", component: params },
                { path: "/goods", component: goods },
                { path: "/goods/add", component: goodsAdd },
                { path: "/orders", component: order },
                { path: "/reports", component: report }
            ]
        }
    ]
})

//挂载路由导航守卫
router.beforeEach((to, from, next) => {
    //to 将要访问的路径
    //from 代表从哪个路径跳转而来
    //next 是一个函数，表示放行
    // next()放行 next('/login')强制跳转
    if (to.path === '/login') {
        return next()
    }

    //获取token
    const tokenStr = window.sessionStorage.getItem('userInfo')
    if (!tokenStr) {
        return next('/login');
    }

    next();
})

export default router