<template>
  <div class="about-page">
    <!-- 头部 -->
    <div class="hero-section">
      <div class="hero-background">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
        <div class="circle circle-4"></div>
      </div>
      <div class="hero-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
      </div>
      <div class="hero-content">
        <div class="profile-card">
          <div class="profile-image">
            <div class="image-wrapper">
              <img :src="$store.state.webSiteInfo.authorAvatar" alt="作者头像">
            </div>
            <div class="status-dot pulse"></div>
          </div>
          <h1>{{ $store.state.webSiteInfo.author }}</h1>
          <p class="tagline">
            <span class="typed-text"></span>
            <span class="cursor">&nbsp;</span>
          </p>
        </div>
      </div>
      <div class="scroll-indicator">
        <div class="mouse">
          <div class="wheel"></div>
        </div>
        <div class="arrow"></div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- About Me Section -->
      <section class="content-section about-me" 
        :enter="{ opacity: 1, y: 0 }">
        <div class="section-header">
          <h2>个人简介</h2>
        </div>
        <div class="section-content">
          <p class="bio">{{ $store.state.webSiteInfo.authorInfo ||
            '热爱技术，热爱生活。专注于Web开发和用户体验设计，致力于创造优秀的数字产品。同时，我也是一个终身学习者，不断探索新的技术和可能性。' }}</p>
          <div class="stats-grid">
            <div class="stat-card" v-for="(stat, index) in stats" :key="index">
              <div class="stat-icon">
                <i :class="stat.icon"></i>
              </div>
              <div class="stat-info">
                <h3 class="counter">{{ stat.value }}</h3>
                <p>{{ stat.label }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Skills Section -->
      <section class="content-section skills" >
        <div class="section-header">
          <h2>技术栈</h2>
        </div>
        <div class="skills-grid">
          <div v-for="(skill, index) in skills" :key="skill.name" class="skill-card">
            <div class="skill-icon" :class="skill.color">
              <i :class="skill.icon"></i>
            </div>
            <div class="skill-info">
              <h3>{{ skill.name }}</h3>
            </div>
          </div>
        </div>
      </section>

      <!-- 站点信息 -->
      <section class="content-section site-info" 
        :enter="{ opacity: 1, y: 0 }">
        <div class="section-header">
          <h2>站点信息</h2>
        </div>
        <div class="info-cards">
          <div class="info-card" v-for="(info, index) in siteInfo" :key="index">
            <div class="info-icon" :class="info.color">
              <i :class="info.icon"></i>
              <h3>{{ info.label }}</h3>
            </div>
            <div class="info-content" :class="info.color">
              <p class="counter">{{ info.value }}</p>
            </div>
            <div class="card-background"></div>
          </div>
        </div>

        <div class="tech-stack-info">
          <h3>技术支持</h3>
          <div class="tech-cards">
            <div class="tech-card" v-for="(tech, index) in techStack" :key="index">
              <div class="tech-icon" :class="tech.color">
                <i :class="tech.icon"></i>
              </div>
              <span :class="tech.color">{{ tech.name }} {{ tech.version }}</span>
              <div class="tech-tooltip">{{ tech.description }}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: 'About',
  data() {
    return {
      version: '2.7.14',
      typedTexts: ['Full Stack Developer', 'Tech Enthusiast', 'Problem Solver'],
      currentTypedIndex: 0,
      skills: [
        { name: 'Vue.js', icon: 'fab fa-vuejs', color: 'vue' },
        { name: 'JavaScript', icon: 'fab fa-js', color: 'js' },
        { name: 'HTML', icon: 'fab fa-html5', color: 'html' },
        { name: 'CSS', icon: 'fab fa-css3-alt', color: 'css' },
        { name: 'Java', icon: 'fab fa-java', color: 'java' },
        { name: 'Docker', icon: 'fab fa-docker', color: 'docker' }
      ],
      stats: [
        { icon: 'fas fa-code', value: '6+', label: '年编程经验' },
        { icon: 'fas fa-project-diagram', value: '20+', label: '完成项目' },
        { icon: 'fas fa-coffee', value: '999+', label: '杯咖啡' }
      ],
      techStack: [
        {
          name: 'Vue.js',
          version: 'v2.7.14',
          icon: 'fab fa-vuejs',
          color: 'vue',
          description: '渐进式 JavaScript 框架'
        },
        {
          name: 'Spring Boot',
          version: 'v2.7.0',
          icon: 'fas fa-leaf',
          color: 'spring',
          description: '简化 Spring 应用开发的框架'
        },
        {
          name: 'MySQL',
          version: 'v8.0',
          icon: 'fas fa-database',
          color: 'mysql',
          description: '最流行的关系型数据库'
        },
        {
          name: 'Redis',
          version: 'v6.0',
          icon: 'fas fa-bolt',
          color: 'redis',
          description: '高性能的 NoSQL 数据库'
        },
        {
          name: 'Nginx',
          version: 'v1.20',
          icon: 'fas fa-server',
          color: 'nginx',
          description: '高性能的 Web 服务器'
        },
        {
          name: 'Element',
          version: 'v2.0.11',
          icon: 'el-icon-platform-eleme',
          color: 'element',
          description: '最受开发者欢迎的 UI 库'
        }
      ]
    }
  },
  computed: {
    runningTime() {
      const startDate = new Date('2024-01-01')
      const now = new Date()
      const diff = now - startDate
      
      // 计算天数
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      
      // 计算年和剩余天数
      const years = Math.floor(days / 365)
      const remainingDays = days % 365
      
      // 格式化输出
      if (years > 0) {
        return `${years}年${remainingDays}天`
      } else {
        return `${days}天`
      }
    },
    siteInfo() {
      return [
        {
          icon: 'fas fa-clock',
          label: '运行时间',
          value: this.runningTime,
          color: 'time'
        },
        {
          icon: 'fas fa-users',
          label: '访问人数',
          value: this.$store.state.visitorAccess,
          color: 'users'
        },
        {
          icon: 'fas fa-eye',
          label: '总访问量',
          value: this.$store.state.siteAccess,
          color: 'views'
        }
      ]
    }
  },
  mounted() {
    this.initTypeWriter()
    this.initParticles()
    this.initCounters()
  },
  methods: {
    initTypeWriter() {
      let currentText = ''
      let letterIndex = 0
      let isDeleting = false
      let typingSpeed = 100

      const type = () => {
        const fullText = this.typedTexts[this.currentTypedIndex]

        if (isDeleting) {
          currentText = fullText.substring(0, letterIndex - 1)
          typingSpeed = 50
        } else {
          currentText = fullText.substring(0, letterIndex + 1)
          typingSpeed = 100
        }

        const typedElement = document.querySelector('.typed-text')
        if (typedElement) typedElement.textContent = currentText

        if (!isDeleting && letterIndex === fullText.length) {
          typingSpeed = 2000
          isDeleting = true
        } else if (isDeleting && letterIndex === 0) {
          isDeleting = false
          this.currentTypedIndex = (this.currentTypedIndex + 1) % this.typedTexts.length
        }

        if (isDeleting) {
          letterIndex--
        } else {
          letterIndex++
        }

        setTimeout(type, typingSpeed)
      }

      type()
    },
    initParticles() {
      // 使用 particles.js 或自定义粒子效果
    },
    initCounters() {
      const counters = document.querySelectorAll('.counter')
      counters.forEach(counter => {
        const content = counter.textContent
        // 如果包含"天"，说明是运行时间，不需要动画
        if (content.includes('天')) {
          return
        }
        
        const target = parseInt(content)
        if (isNaN(target)) return
        
        let count = 0
        const speed = 50

        const updateCount = () => {
          if (count < target) {
            count++
            counter.textContent = count + (content.includes('+') ? '+' : '')
            setTimeout(updateCount, speed)
          }
        }

        updateCount()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
$transition: all 0.3s ease;

// Mixins
@mixin card-hover {
  transition: $transition;

}

// Hero Section
.hero-section {
  position: relative;
  min-height: 100vh;
  background: var(--about-me);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center,
        rgba(255, 255, 255, 0.1) 0%,
        transparent 70%);
  }
}

.hero-background {
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow: hidden;

  .circle {
    position: absolute;
    border-radius: 50%;
    background: linear-gradient(45deg,
        rgba(255, 255, 255, 0.1),
        rgba(255, 255, 255, 0.05));

    &-1 {
      width: 400px;
      height: 400px;
      top: -100px;
      left: -100px;
      animation: float 8s ease-in-out infinite;
    }

    &-2 {
      width: 300px;
      height: 300px;
      top: 20%;
      right: -50px;
      animation: float 12s ease-in-out infinite reverse;
    }

    &-3 {
      width: 250px;
      height: 250px;
      bottom: 10%;
      left: 5%;
      animation: float 10s ease-in-out infinite;
    }

    &-4 {
      width: 200px;
      height: 200px;
      bottom: 20%;
      right: 10%;
      animation: float 6s ease-in-out infinite reverse;
    }
  }
}

.hero-shapes {
  position: absolute;
  inset: 0;
  z-index: 2;
  overflow: hidden;

  .shape {
    position: absolute;
    background: linear-gradient(135deg,
        rgba(255, 255, 255, 0.1),
        rgba(255, 255, 255, 0.05));
    backdrop-filter: blur(5px);

    &-1 {
      width: 300px;
      height: 300px;
      top: 10%;
      left: 5%;
      border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
      animation: morphing 15s ease-in-out infinite;
    }

    &-2 {
      width: 250px;
      height: 250px;
      top: 20%;
      right: 10%;
      border-radius: 50% 50% 30% 70% / 50% 50% 70% 30%;
      animation: morphing 18s ease-in-out infinite reverse;
    }

    &-3 {
      width: 200px;
      height: 200px;
      bottom: 15%;
      left: 15%;
      border-radius: 70% 30% 50% 50% / 30% 70% 50% 50%;
      animation: morphing 20s ease-in-out infinite;
    }

    &-4 {
      width: 180px;
      height: 180px;
      bottom: 20%;
      right: 15%;
      border-radius: 30% 70% 50% 50% / 50% 30% 70% 50%;
      animation: morphing 12s ease-in-out infinite reverse;
    }
  }
}

.hero-content {
  position: relative;
  z-index: 3;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: center;
  margin-top: -80px;
}

.profile-card {
  background: var(--card-bg);
  padding: 3rem;
  border-radius: $border-radius-md;
  backdrop-filter: blur(10px);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  text-align: center;
  max-width: 450px;
  width: 100%;
  animation: fadeIn 1s ease-out forwards;

  .profile-image {
    .image-wrapper {
      position: relative;
      width: 160px;
      height: 160px;
      margin: 0 auto 2rem;
      border-radius: 50%;
      padding: 5px;
      background: linear-gradient(45deg,
          var(--primary, $primary),
          var(--secondary, $secondary));

      &::after {
        content: '';
        position: absolute;
        inset: -3px;
        border-radius: 50%;
        background: inherit;
        filter: blur(8px);
        opacity: 0.5;
        z-index: -1;
      }

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
        border: 4px solid white;
        transition: transform 0.5s ease;

        &:hover {
          transform: scale(1.05);
        }
      }
    }

    .status-dot {
      position: absolute;
      bottom: 5px;
      right: 5px;
      width: 20px;
      height: 20px;
      background: #2ecc71;
      border: 3px solid white;
      border-radius: 50%;

      &.pulse {
        animation: pulse 2s infinite;
      }
    }
  }

  h1 {
    font-size: 1.5rem;
    color: $primary;
    margin-bottom: 1rem;
  }

  .tagline {
    font-size: 1.2rem;
    color: var(--text-secondary, $text-secondary);
    margin-bottom: 2rem;
    min-height: 1.5em;
  }
}

// Main Content
.main-content {
  max-width: 1200px;
  margin: 100px auto 0;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
}

.content-section {
  background: var(--card-bg, $surface);
  border-radius: $border-radius-md;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  @include card-hover;

  .section-header {
    margin-bottom: 2rem;

    h2 {
      font-size: 1.2rem;
      color: $primary;
      margin: 0;
    }
  }
}

// Stats Grid
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.stat-card {
  background: rgba($primary, 0.05);
  padding: 1.5rem;
  border-radius: $border-radius-md;
  display: flex;
  align-items: center;
  gap: 1rem;
  @include card-hover;

  .stat-icon {
    width: 50px;
    height: 50px;
    background: $primary;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
  }

  .stat-info {
    h3 {
      font-size: 1.8rem;
      color: $primary;
      margin: 0;
    }

    p {
      color: $text-secondary, $text-secondary;
      margin: 0;
    }
  }
}

// Skills Grid
.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}

.skill-card {
  position: relative;
  display: flex;
  align-items: center;
  padding: 1.5rem;
  background: var(--card-bg);
  border: 1px solid rgba($primary, 0.1);
  border-radius: $border-radius-md;
  backdrop-filter: blur(10px);
  transition: $transition;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg,
        rgba($primary, 0.05),
        rgba($primary, 0.1));
    z-index: 0;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg,
        transparent,
        rgba(255, 255, 255, 0.1),
        transparent);
    transform: translateX(-100%);
    transition: transform 0.5s ease;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow:
      0 10px 20px rgba(0, 0, 0, 0.1),
      0 0 0 1px rgba($primary, 0.1);

    &::after {
      transform: translateX(100%);
    }

    .skill-icon {
      transform: scale(1.1) rotate(10deg);

      i {
        animation: bounce 0.5s ease infinite;
      }
    }

    h3 {
      color: $primary;
    }
  }

  .skill-icon {
    position: relative;
    z-index: 1;
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
    color: white;
    margin-right: 1.2rem;
    transition: all 0.3s ease;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);

    &::after {
      content: '';
      position: absolute;
      inset: -3px;
      border-radius: inherit;
      background: inherit;
      filter: blur(8px);
      opacity: 0.4;
      z-index: -1;
    }

    &.vue {
      background: linear-gradient(135deg, #41b883, #34495e);

      i {
        color: white;
      }
    }

    &.js {
      background: linear-gradient(135deg, #f7df1e, #f4c60c);

      i {
        color: #000000;
      }
    }

    &.html {
      background: linear-gradient(135deg, #e34f26, #c13d1a);

      i {
        color: white;
      }
    }

    &.css {
      background: linear-gradient(135deg, #1572b6, #0c4a6e);

      i {
        color: white;
      }
    }

    &.java {
      background: linear-gradient(135deg, #007396, #004a6f);

      i {
        color: white;
      }
    }

    &.docker {
      background: linear-gradient(135deg, #2496ed, #1068a9);

      i {
        color: white;
      }
    }
  }

  .skill-info {
    position: relative;
    z-index: 1;
    flex: 1;

    h3 {
      margin: 0;
      font-size: 1.1rem;
      color: var(--text-primary, $text-primary);
      font-weight: 500;
      transition: color 0.3s ease;
    }
  }
}

// Info Cards
.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.info-card {
  position: relative;
  overflow: hidden;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  padding: $spacing-md;
  border-radius: $border-radius-md;

  &:hover {
    .info-icon {
      i {
        animation: bounce 0.5s ease infinite;
      }
    }

    .info-content p {
      background-position: 100% 0;
    }
  }

  .info-icon {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    transition: all 0.3s ease;

    i {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
      transition: all 0.3s ease;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 500;
      transition: color 0.3s ease;
    }

    &.time {
      i {
        background: linear-gradient(135deg, #00c6fb, #005bea);
      }

      h3 {
        background: linear-gradient(135deg, #00c6fb, #005bea);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }

    &.users {
      i {
        background: linear-gradient(135deg, #f6d365, #fda085);
      }

      h3 {
        background: linear-gradient(135deg, #f6d365, #fda085);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }

    &.views {
      i {
        background: linear-gradient(135deg, #667eea, #764ba2);
      }

      h3 {
        background: linear-gradient(135deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }
  }

  .info-content {
    position: relative;
    z-index: 1;

    p {
      margin: 0;
      font-size: 2rem;
      font-weight: 600;
      transition: all 0.3s ease;
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    &.time p {
      background-image: linear-gradient(to right, #00c6fb, #005bea, #00c6fb);
    }

    &.users p {
      background-image: linear-gradient(to right, #f6d365, #fda085, #f6d365);
    }

    &.views p {
      background-image: linear-gradient(to right, #667eea, #764ba2, #667eea);
    }
  }

  .card-background {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg,
        rgba($surface, 0.95),
        rgba($surface, 0.98));
    z-index: -1;
    transition: $transition;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(45deg,
          transparent,
          rgba($primary, 0.03),
          transparent);
      z-index: -1;
    }
  }
}

// Tech Stack
.tech-stack-info {
  margin-top: 2rem;

  h3 {
    color: var(--text-primary, $text-primary);
    margin-bottom: 1.5rem;
  }
}

.tech-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}

.tech-card {
  position: relative;
  overflow: visible;
  background: rgba($surface, 0.5);
  padding: 1.5rem;
  border-radius: $border-radius-md;
  text-align: center;
  border: 1px solid rgba($primary, 0.1);
  backdrop-filter: blur(5px);
  transition: $transition;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);

    .tech-icon {
      transform: scale(1.1) rotate(10deg);
    }

    .tech-tooltip {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .tech-icon {
    width: 60px;
    height: 60px;
    margin: 0 auto 1.5rem;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    transition: all 0.3s ease;
    position: relative;
    color: white;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);

    i {
      padding: 0.8rem;
    }

    &.vue {
      background: linear-gradient(135deg, #41b883, #34495e);
    }

    &.spring {
      background: linear-gradient(135deg, #6db33f, #1b8f3e);
    }

    &.mysql {
      background: linear-gradient(135deg, #00758f, #f29111);
    }

    &.redis {
      background: linear-gradient(135deg, #dc382d, #a41e11);
    }

    &.nginx {
      background: linear-gradient(135deg, #269539, #1e7230);
    }

    &.element {
      background: linear-gradient(135deg, #2496ed, #1068a9);
    }
  }

  span {
    display: block;
    font-size: 1rem;
    font-weight: 500;
    margin-top: 0.5rem;
    transition: all 0.3s ease;
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;

    &.vue {
      background-image: linear-gradient(to right, #41b883, #34495e, #41b883);
    }

    &.spring {
      background-image: linear-gradient(to right, #6db33f, #1b8f3e, #6db33f);
    }

    &.mysql {
      background-image: linear-gradient(to right, #00758f, #f29111, #00758f);
    }

    &.redis {
      background-image: linear-gradient(to right, #dc382d, #a41e11, #dc382d);
    }

    &.nginx {
      background-image: linear-gradient(to right, #269539, #1e7230, #269539);
    }

    &.element {
      background-image: linear-gradient(to right, #2496ed, #1068a9, #2496ed);
    }
  }

  .tech-tooltip {
    position: absolute;
    bottom: 110%;
    left: 0;
    transform: translateX(-50%) translateY(10px);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 0.75rem 1rem;
    border-radius: 6px;
    font-size: 0.9rem;
    opacity: 0;
    transition: all 0.3s ease;
    pointer-events: none;
    white-space: nowrap;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    z-index: 10;

    &::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 8px solid transparent;
      border-top-color: rgba(0, 0, 0, 0.8);
    }
  }
}

// Animations
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(#2ecc71, 0.4);
  }

  70% {
    box-shadow: 0 0 0 10px rgba(#2ecc71, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(#2ecc71, 0);
  }
}

@keyframes blink {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}

@keyframes scroll {
  0% {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }

  100% {
    transform: translateX(-50%) translateY(15px);
    opacity: 0;
  }
}

@keyframes arrow {
  0% {
    transform: rotate(45deg) translate(0, 0);
    opacity: 0;
  }

  50% {
    opacity: 1;
  }

  100% {
    transform: rotate(45deg) translate(10px, 10px);
    opacity: 0;
  }
}



@keyframes float {

  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }

  50% {
    transform: translate(20px, -20px) rotate(5deg);
  }
}

@keyframes morphing {
  0% {
    border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
    transform: rotate(0deg);
  }

  25% {
    border-radius: 58% 42% 75% 25% / 76% 46% 54% 24%;
    transform: rotate(5deg);
  }

  50% {
    border-radius: 50% 50% 33% 67% / 55% 27% 73% 45%;
    transform: rotate(0deg);
  }

  75% {
    border-radius: 33% 67% 58% 42% / 63% 68% 32% 37%;
    transform: rotate(-5deg);
  }

  100% {
    border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
    transform: rotate(0deg);
  }
}

@keyframes bounce {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

// Scroll Indicator
.scroll-indicator {
  position: absolute;
  bottom: 7rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  opacity: 0.7;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }

  .mouse {
    width: 26px;
    height: 40px;
    border: 2px solid white;
    border-radius: 13px;
    margin: 0 auto;
    position: relative;

    .wheel {
      width: 4px;
      height: 8px;
      background: white;
      border-radius: 2px;
      position: absolute;
      top: 6px;
      left: 50%;
      transform: translateX(-50%);
      animation: scroll 2s infinite;
    }
  }

  .arrow {
    width: 10px;
    height: 10px;
    border-right: 2px solid white;
    border-bottom: 2px solid white;
    transform: rotate(45deg);
    margin: 10px auto 0;
    animation: arrow 2s infinite;
  }
}

// Responsive Design
@media (max-width: 768px) {
  .main-content {
    margin-top: -50px;
    padding: 0 1rem;
  }

  .hero-section {
    min-height: 50vh;
  }

  .profile-card {
    padding: 1.5rem;

    .profile-image {
      width: 120px;
      height: 120px;
    }
  }

  .content-section {
    padding: 1.5rem;
  }

  .stats-grid,
  .skills-grid,
  .info-cards {
    grid-template-columns: 1fr;
  }

  .hero-content {
    margin-top: -40px;
  }

  .scroll-indicator {
    bottom: 2rem;
  }
}

@media (max-width: 480px) {
  .hero-section {
    min-height: 40vh;
  }
}

</style>
