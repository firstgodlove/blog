<template>
  <div id="app">
    <TheHeader />
    <MobileMenu />
    <Login />
    <SearchDialog />
    <router-view class="main-container" />
    <TheFooter />
    <FloatingButtons />
    <Lantern />
    <RandomVideo />
    <div class="cursor-container"></div>
    <!-- <Fireworks /> -->
  </div>
</template>

<script>
import TheHeader from '@/layout/Header/index.vue'
import TheFooter from '@/layout/Footer/index.vue'
import FloatingButtons from '@/components/common/FloatingButtons.vue'
import { getWebConfigApi, reportApi } from '@/api/site'
import { mapActions } from 'vuex'
import { initTheme } from '@/utils/theme'
import Login from '@/components/Login/index.vue'
import SearchDialog from '@/components/Search/index.vue'
import MobileMenu from '@/layout/MobileMenu/index.vue'
import Lantern from '@/components/Lanterns/index.vue'
import RandomVideo from '@/components/RandomVideo/index.vue'
//import Fireworks from '@/components/Fireworks/index.vue'

export default {
  name: 'App',
  components: {
    TheHeader,
    TheFooter,
    FloatingButtons,
    Login,
    SearchDialog,
    MobileMenu,
    Lantern,
    RandomVideo,
 //   Fireworks
  },

  async created() {
    await reportApi()
    const res = await getWebConfigApi()
    this.setSiteInfo(res.data)
    this.$store.commit('setVisitorAccess', res.extra.visitorCount)
    this.$store.commit('setSiteAccess', res.extra.blogViewsCount)
    initTheme()
    await this.handleThirdPartyLogin()
    //这里等待第三方登录处理完成在获取用户信息
    this.getUserInfo()
  },
  methods: {
    ...mapActions(['setSiteInfo','getUserInfo']),

    /**
     * 处理第三方登录用回调逻辑
     */
     async handleThirdPartyLogin() {
      this.$store.commit('SET_LOGIN_VISIBLE', false);
      let flag = window.location.href.indexOf("token") != -1;
      if (flag) {
        let token = window.location.href.split("token=")[1];
        this.$store.commit('SET_TOKEN', token);
      }
    },

    /**
     * 初始化鼠标点击效果
     */
    initCursorEffect() {
      const container = document.querySelector('.cursor-container')
      
      document.addEventListener('click', (e) => {
        const cursor = document.createElement('div')
        cursor.className = 'cursor-fx'
        cursor.style.left = `${e.clientX}px`
        cursor.style.top = `${e.clientY}px`
        container.appendChild(cursor)
        
        cursor.addEventListener('animationend', () => {
          cursor.remove()
        })
      })
    }
  },
  mounted() {
    this.initCursorEffect()
  }
}
</script>

<style lang="scss">

@import 'animate.css';
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
* {
  margin: 0;
  padding: 0;
  font-family: "font";
  box-sizing: border-box;
}
</style> 