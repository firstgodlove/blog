import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/views/home/index.vue'
import layout from '@/layout/index.vue'
import NotFound from '@/views/404/404.vue'
import store from '@/store';

Vue.use(VueRouter)

const routes = [
    {
        path: "/",
        component: layout,
        meta: {
            title: "墨笺博客-一个专注于技术分享的博客平台",
            loading: true
        },
        children: [
            {
                path: '/',
                name: 'Home',
                component: Home,
                meta: {
                    title: '首页',
                    transition: 'fade',
                    icon: 'fas fa-home',
                    loading: true
                 }
              },
              {
                path: '/archive',
                name: 'Archive',
                component: () => import('@/views/archives/index.vue'),
                meta: { 
                  transition: 'fade',
                  title: '归档 - 墨笺博客',
                  icon: 'fas fa-archive'
                }
              },
              {
                path: '/categories',
                name: 'Categories',
                component: () => import('@/views/categories/index.vue'),
                meta: {
                    transition: 'fade',
                    title: "分类 - 墨笺博客",
                    icon: 'fas fa-folder'
                 }
              },
              {
                path: '/tags',
                name: 'Tags',
                component: () => import('@/views/tags/index.vue'),
                meta: {
                    transition: 'fade',
                    title: '标签 - 墨笺博客',
                    icon: 'fas fa-tags'
                }
              },
              {
                path: '/hotSearch',
                name: 'HotSearch',
                component: () => import('@/views/hotSearch/index.vue'),
                meta: { 
                  transition: 'fade',
                  title: '热搜 - 墨笺博客',
                  icon: 'fas fa-fire'
                }
              },
              {
                path: '/messages',
                name: 'Messages',
                component: () => import('@/views/messages/index.vue'),
                meta: { 
                  transition: 'fade',
                  title: '留言板 - 墨笺博客',
                  icon: 'fas fa-comments'
                }
              },
              {
                path: '/friends',
                name: 'Friends',
                component: () => import('@/views/friends/index.vue'),
                meta: { 
                  transition: 'fade',
                  title: '友情链接 - 墨笺博客',
                  icon: 'fas fa-user-friends'
                }
              },
              {
                path: '/about',
                name: 'About',
                component: () => import('@/views/about/index.vue'),
                meta: { 
                  transition: 'fade',
                  title: '关于本站 - 墨笺博客',
                  icon: 'fas fa-info-circle'
                }
              },
              {
                path: '/post/:id',
                name: 'Post',
                component: () => import('@/views/article/index.vue'),
                props: true
              },
              // {
              //   path: '/moments',
              //   name: 'Moments',
              //   component: () => import('@/views/moments/index.vue'),
              //   meta: {
              //     title: '说说 - 墨笺博客',
              //     icon: 'fas fa-comment-dots'
              //   }
              // },
              {
                path: '/user/profile',
                name: 'Profile',
                component: () => import('@/views/profile/index.vue'),
                meta: {
                  title: '个人主页 - 墨笺博客',
                  icon: 'fas fa-user'
                }
              },
              {
                path: '/editor',
                name: 'Editor',
                component: () => import('@/views/editor/index.vue'),
                meta: {
                  title: '写文章 - 墨笺博客',
                  icon: 'fas fa-edit',
                  requireAuth: true
                }
              },
              {
                path: '/chat',
                name: 'Chat',
                component: () => import('@/views/chat/index.vue'),
                meta: {
                  title: '聊天 - 墨笺博客',
                  icon: 'fas fa-comments'
                }
              },
              {
                path: '/:pathMatch(.*)*',
                name: 'NotFound',
                component: NotFound
              }
        ]
    }
]

const router = new VueRouter({
  mode: 'history',
  base: '/',
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { x: 0, y: 0 }
  }
})


// 解决重复点击导航时，控制台出现报错
const VueRouterPush = VueRouter.prototype.push
VueRouter.prototype.push = function push (to) {
  return VueRouterPush.call(this, to).catch(err => err)
}


router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }
  //关闭搜索框
  store.commit('SET_SEARCH_VISIBLE', false)
  next()
})

export default router 