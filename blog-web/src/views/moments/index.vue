<template>
  <div class="moments-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i>
      加载中...
    </div>

    <!-- 空状态 -->
    <div v-else-if="!moments.length" class="empty-state">
      <i class="fas fa-comment-dots"></i>
      <p>还没有说说，来发布第一条吧~</p>
    </div>

    <!-- 说说列表 -->
    <div v-else class="moments-list">
      <div v-for="moment in moments" :key="moment.id" class="moment-item">
        <div class="moment-header">
          <img :src="moment.author.avatar" class="avatar" />
          <div class="info">
            <div class="name">{{ moment.author.nickname }}</div>
            <div class="time">{{ formatTime(moment.createTime) }}</div>
          </div>
        </div>
        <div class="moment-content" v-html="parseContent(moment.content)"></div>
        <div class="moment-images" v-if="moment.images?.length">
          <img 
            v-for="(img, index) in moment.images" 
            :key="index"
            :src="img"
            @click="previewImage(moment.images, index)"
          />
        </div>
        <div class="moment-footer">
          <div class="actions">
            <span @click="handleLike(moment.id)">
              <i class="fas fa-heart" :class="{ active: moment.isLiked }"></i>
              {{ moment.likes || 0 }}
            </span>
            <span @click="showCommentInput(moment.id)">
              <i class="fas fa-comment"></i>
              {{ moment.comments || 0 }}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 发布说说按钮 -->
    <div class="publish-btn" @click="showPublishDialog">
      <i class="fas fa-plus"></i>
    </div>

    <!-- 发布说说对话框 -->
    <mj-dialog :visible.sync="showDialog" title="发布说说"  width="40%" height="400px">
      <div class="publish-form">
        <textarea 
          ref="newMoment"
          v-model="newMoment.content" 
          placeholder="分享你的想法..."
        ></textarea>


        <div class="image-upload">
            <!-- 添加表情选择器 -->
            <mj-emoji
            size="1.1rem"
            class="emoji-picker"
            @select="insertEmoji"
            @clickOutside="showEmoji = false"
            />
            <mj-color-picker size="1.1rem" @select="insertMarkdown" />
          <div class="upload-btn">
            <i class="fas fa-image"></i>
            添加图片
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              @change="handleImageUpload"
            />
          </div>
        </div>
        <div class="preview-images" v-if="newMoment.images.length">
            <div v-for="(img, index) in newMoment.images" :key="index" class="preview-item">
              <img :src="img" />
              <i class="fas fa-times" @click="removeImage(index)"></i>
            </div>
          </div>
        <div class="dialog-footer">
          <button @click="publishMoment" :disabled="!newMoment.content.trim()">
            发布
          </button>
        </div>
      </div>
    </mj-dialog>

    <!-- 添加图片预览组件 -->
    <mj-image-preview ref="imagePreview" />
  </div>
</template>

<script>
import { formatTime } from '@/utils/time'
import { getMoments, publishMoment, likeMoment, uploadImage } from '@/api/moments'
import { mapState } from 'vuex'
import { marked } from 'marked'

export default {
  name: 'Moments',
  
  data() {
    return {
      moments: [
        {
          id: 1,
          author: {
            nickname: '拾壹',
            avatar: 'https://q1.qlogo.cn/g?b=qq&nk=1720541567&s=640'
          },
          content: '今天是个好天气，写了一天的代码，感觉很充实！分享一些我的心得：Vue.js确实是一个很棒的框架，特别是它的响应式系统和组件化的设计理念。',
          images: [
            'https://picsum.photos/600/400?random=1',
            'https://picsum.photos/600/400?random=2'
          ],
          createTime: new Date().getTime() - 3600000, // 1小时前
          likes: 12,
          comments: 5,
          isLiked: false
        },
        {
          id: 2,
          author: {
            nickname: '小明',
            avatar: 'https://picsum.photos/200?random=1'
          },
          content: '刚刚完成了一个新功能的开发，感觉很有成就感！代码写得越多，越发现学习的重要性。',
          images: [
            'https://picsum.photos/600/400?random=3'
          ],
          createTime: new Date().getTime() - 86400000, // 1天前
          likes: 8,
          comments: 3,
          isLiked: true
        },
        {
          id: 3,
          author: {
            nickname: '小红',
            avatar: 'https://picsum.photos/200?random=2'
          },
          content: '分享一个有趣的CSS技巧：使用grid布局可以很容易地实现瀑布流效果，而且支持响应式设计。\n\n.grid-container {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));\n  gap: 20px;\n}',
          createTime: new Date().getTime() - 172800000, // 2天前
          likes: 15,
          comments: 7,
          isLiked: false
        },
        {
          id: 4,
          author: {
            nickname: '小李',
            avatar: 'https://picsum.photos/200?random=3'
          },
          content: '推荐一些好用的VS Code插件：\n1. ESLint - 代码检查工具\n2. Prettier - 代码格式化\n3. GitLens - Git增强工具\n4. Auto Close Tag - 自动闭合标签\n5. Color Highlight - 颜色高亮显示',
          images: [
            'https://picsum.photos/600/400?random=4',
            'https://picsum.photos/600/400?random=5',
            'https://picsum.photos/600/400?random=6'
          ],
          createTime: new Date().getTime() - 259200000, // 3天前
          likes: 20,
          comments: 9,
          isLiked: false
        }
      ],
      showDialog: false,
      loading: false,
      newMoment: {
        content: '',
        images: []
      }
    }
  },

  computed: {
    ...mapState(['user'])
  },

  created() {
    // 暂时注释掉API调用
    // await this.fetchMoments()
  },
  
  methods: {
       /**
     * 解析留言内容，支持 markdown 和表情
     */
    parseContent(content) {
      return marked(content)
    },
      /**
     * 插入表情
     */
     insertEmoji(emoji) {
      const textarea = this.$refs.newMoment
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      
      this.newMoment.content = 
        this.newMoment.content.substring(0, start) + 
        emoji + 
        this.newMoment.content.substring(end)
      
      // 将光标移动到插入的表情符号后面
      this.$nextTick(() => {
        textarea.focus()
        textarea.setSelectionRange(start + emoji.length, start + emoji.length)
      })
    },
    /**
     * 插入 markdown
     */
    insertMarkdown(prefix, suffix) {
      const textarea = this.$refs.newMoment
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = this.newMoment.content
      
      const beforeText = text.substring(0, start)
      const selectedText = text.substring(start, end)
      const afterText = text.substring(end)
      
      this.newMoment.content = beforeText + prefix + selectedText + suffix + afterText
      
      this.$nextTick(() => {
        textarea.focus()
        textarea.setSelectionRange(
          start + prefix.length,
          end + prefix.length
        )
      })
    },
    async fetchMoments() {
      try {
        this.loading = true
        const res = await getMoments()
        this.moments = res.data.map(item => ({
          ...item,
          isLiked: item.likedUsers?.includes(this.user?.id)
        }))
      } catch (error) {
        console.error('获取说说列表失败:', error)
      } finally {
        this.loading = false
      }
    },

    showPublishDialog() {
   
      this.showDialog = true
    },

    async handleImageUpload(e) {
      const files = e.target.files
      if (!files.length) return

      // 检查文件数量限制
      if (this.newMoment.images.length + files.length > 9) {
        this.$message.warning('最多只能上传9张图片')
        return
      }

      try {
        for (const file of files) {
          // 检查文件大小限制 (5MB)
          if (file.size > 5 * 1024 * 1024) {
            this.$message.warning(`图片 ${file.name} 超过5MB，已跳过`)
            continue
          }

          // 模拟上传
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // 使用 FileReader 预览图片
          const reader = new FileReader()
          reader.onload = (e) => {
            this.newMoment.images.push(e.target.result)
          }
          reader.readAsDataURL(file)
        }
      } catch (error) {
        console.error('图片上传失败:', error)
        this.$message.error('图片上传失败，请重试')
      }

      // 清空 input 以支持重复上传同一张图片
      e.target.value = ''
    },

    removeImage(index) {
      this.newMoment.images.splice(index, 1)
    },

    async publishMoment() {
      if (!this.newMoment.content.trim()) {
        this.$message.warning('请输入说说内容')
        return
      }

      try {
        // 模拟发布请求
        await new Promise(resolve => setTimeout(resolve, 1000))

        // 构造新的说说对象
        const newMoment = {
          id: Date.now(),
          author: {
            nickname: this.user?.nickname || '未知用户',
            avatar: this.user?.avatar || 'https://picsum.photos/200?random=1'
          },
          content: this.newMoment.content,
          images: [...this.newMoment.images],
          createTime: Date.now(),
          likes: 0,
          comments: 0,
          isLiked: false
        }

        // 添加到列表开头
        this.moments.unshift(newMoment)
        
        // 清空表单
        this.resetForm()
        
        // 关闭对话框
        this.showDialog = false
        
        this.$message.success('发布成功')
      } catch (error) {
        console.error('发布说说失败:', error)
        this.$message.error('发布失败，请重试')
      }
    },

    resetForm() {
      this.newMoment = {
        content: '',
        images: []
      }
    },

    async handleLike(momentId) {
      if (!this.user) {
        this.$store.commit('setShowLogin', true)
        return
      }

      // 移除API调用，直接更新本地数据
      const moment = this.moments.find(m => m.id === momentId)
      if (moment) {
        moment.isLiked = !moment.isLiked
        moment.likes += moment.isLiked ? 1 : -1
      }
    },

    previewImage(images, index) {
      // 使用图片预览组件的 show 方法
      this.$refs.imagePreview.show(images[index])
    },

    formatTime(time) {
      return formatTime(time)
    }
  }
}
</script>

<style lang="scss" scoped>
.moments-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.moment-item {
  background: var(--card-bg);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.moment-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 10px;
  }

  .info {
    .name {
      font-weight: 500;
      margin-bottom: 2px;
    }
    .time {
      font-size: 0.8em;
      color: var(--text-secondary);
    }
  }
}

.moment-content {
  margin-bottom: 10px;
  line-height: 1.6;
}

.moment-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
  margin-bottom: 10px;

  img {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-radius: 4px;
    cursor: pointer;
  }
}

.moment-footer {
  .actions {
    display: flex;
    gap: 20px;

    span {
      cursor: pointer;
      color: var(--text-secondary);
      
      i {
        margin-right: 5px;
        &.active {
          color: #ff4757;
        }
      }
    }
  }
}

.publish-btn {
  position: fixed;
  right: 150px;
  bottom: 30px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: $primary;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba($primary, 0.3);
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
}

.publish-form {
  padding: 20px;

  textarea {
    width: 100%;
    min-height: 150px;
    padding: 10px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background: var(--input-bg);
    color: var(--text-primary);
    resize: vertical;
    margin-bottom: 15px;
  }

  .image-upload {
    margin-bottom: 15px;
    display: flex;
    gap: $spacing-md;
    .preview-images {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 8px;
      margin-top: 10px;

      .preview-item {
        position: relative;

        img {
          width: 100%;
          height: 100px;
          object-fit: cover;
          border-radius: 4px;
        }

        .fa-times {
          position: absolute;
          top: 5px;
          right: 5px;
          background: rgba(0, 0, 0, 0.5);
          color: white;
          padding: 5px;
          border-radius: 50%;
          cursor: pointer;
        }
      }
    }
  }

  .dialog-footer {
    text-align: right;
    margin-top: 20px;

    button {
      padding: 8px 20px;
      border-radius: 4px;
      background: $primary;
      color: white;
      border: none;
      cursor: pointer;
      transition: opacity 0.3s;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      &:not(:disabled):hover {
        opacity: 0.9;
      }
    }
  }
}

.loading,
.empty-state {
  text-align: center;
  padding: 40px 0;
  color: var(--text-secondary);
  
  i {
    font-size: 2em;
    margin-bottom: 10px;
  }
}

.image-upload {
  .upload-btn {
    position: relative;
    display: inline-block;
    padding: 8px 15px;
    border-radius: 4px;
    background: var(--hover-bg);
    color: var(--text-primary);
    cursor: pointer;
    
    i {
      margin-right: 5px;
    }
    
    input {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
    }
  }
}

.preview-images {
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
  
  .preview-item {
    position: relative;
    aspect-ratio: 1;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 4px;
    }
    
    .fa-times {
      position: absolute;
      top: 5px;
      right: 5px;
      background: rgba(0, 0, 0, 0.5);
      color: white;
      padding: 5px;
      border-radius: 50%;
      cursor: pointer;
    }
  }
}
</style> 