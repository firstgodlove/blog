<template>
  <footer class="site-footer">
    <div class="footer-content">
      <div class="footer-info">
        <div class="copyright">
          <span class="year">© {{ currentYear }}</span>
          <span class="divider">·</span>
          <span class="site-name">{{$store.state.webSiteInfo.name}}</span>
          <span class="divider">·</span>
          <a href="https://beian.miit.gov.cn/" 
             target="_blank" 
             rel="noopener"
             class="record underline">
            {{$store.state.webSiteInfo.recordNum}}
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'TheFooter',
  computed: {
    currentYear() {
      return new Date().getFullYear()
    }
  }
}
</script>

<style lang="scss" scoped>
.site-footer {
  background: var(--card-bg);
  padding: $spacing-lg 0;
  margin-top: auto;
  border-top: 1px solid rgba(125, 125, 125, 0.1);
}

.footer-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 $spacing-xl;
}

.footer-info {
  text-align: center;
}

.copyright {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  flex-wrap: wrap;
  font-size: 0.875rem;
  color: var(--text-secondary);
  letter-spacing: 0.2px;

  .year {
    font-family: 'Fira Code', monospace;
  }

  .site-name {
    font-weight: 500;
    color: var(--text-secondary);
  }


  .record {
    color: inherit;
    text-decoration: none;
    transition: color 0.2s ease;
    padding: 2px 0;
    color: $primary;
  }
}


a {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s ease;
  
  &:hover {
    color: var(--primary-color);
  }
}

@include responsive(sm) {
  .site-footer {
    padding: $spacing-md 0;
  }

  .footer-content {
    padding: 0 $spacing-md;
  }

  .copyright {
    font-size: 0.8125rem;
    gap: $spacing-xs;
  }
}
</style> </style> 
