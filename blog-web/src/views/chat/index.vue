<template>
  <div class="chat-container">
    <div class="chat-sidebar">
      <div class="chat-header">
        <h3>群聊列表</h3>
      </div>
      <div class="chat-list">
        <div 
          class="chat-item active"
        >
          <div class="avatar">
            <img :src="currentChat.avatar" alt="avatar">
          </div>
          <div class="chat-info">
            <div class="name">{{ currentChat.name }}</div>
            <div class="last-message">{{ currentChat.lastMessage }}</div>
          </div>
          <div class="meta">
            <div class="time">{{ currentChat.lastTime }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="chat-main">
      <div class="chat-header">
        <div class="user-info">
          <h3>{{ currentChat.name }}</h3>
          <span class="status-text">在线</span>
        </div>
      </div>
      
      <div class="messages" ref="messageContainer">
        <div v-if="loading" class="loading-messages">
          <i class="fas fa-spinner fa-spin"></i>
          加载中...
        </div>
        
        <div 
          v-for="msg in currentChat.messages" 
          :key="msg.id"
          :class="['message', { 'message-self': msg.userId === $store.state.userInfo.id }]"
        >
          <div class="avatar" @contextmenu.prevent="handleAvatarContextMenu(msg, $event)">
            <img :src="msg.avatar" alt="avatar">
          </div>
          <div class="message-content">
            <div class="message-header">
              <div v-if="currentChat.isGroup && msg.userId !== $store.state.userInfo.id" class="sender-name">
                {{ msg.name }}
                <span v-if="msg.userId === 1"" class="author-tag">作者</span>
                <span class="location">({{ splitIpAddress(msg.location) }})</span>

              </div>
            </div>
            <div v-if="msg.isRecalled" class="message-recalled">
              <span>消息已撤回</span>
            </div>
            <template v-else>
              <div 
                v-if="msg.type === 'text'" 
                class="message-text" 
                v-html="formatMessageContent(msg.content)"
                @contextmenu.prevent="showMessageActions(msg, $event)"
              ></div>
              <img 
                v-else-if="msg.type === 'image'" 
                v-lazy="msg.content" 
                :key="msg.content"
                class="message-image"
                @click="previewImage(msg.content)"
                @load="handleImageLoad"
                @contextmenu.prevent="showMessageActions(msg, $event)"
              >
            </template>
            <div class="message-time">{{ msg.time }}</div>
          </div>
        </div>
      </div>
      
      <div class="chat-input">
        <div class="input-toolbar">

          <mj-emoji
            size="1.1rem"
            class="emoji-picker"
            @select="insertEmoji"
          />


          <label class="toolbar-btn" for="image-upload">
            <i class="fas fa-image"></i>
          </label>
          <input 
            id="image-upload"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleImageUpload"
          >
        </div>
        
        <textarea 
          ref="messageTextarea"
          v-model="messageText" 
          @keyup.enter.prevent="sendMessage"
          @input="handleInput"
          @keydown="handleMentionKeydown"
          placeholder="输入消息..."
        ></textarea>
        
        <button 
          @click="sendMessage" 
          :disabled="!messageText.trim() || countdown > 0"
        >
          <template v-if="countdown > 0">
            {{ countdown }}s
          </template>
          <i v-else class="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>

    <!-- 图片预览 -->
    <mj-image-preview ref="imagePreview" />

    <div v-if="showActionsMenu" class="message-actions-menu" :style="actionMenuPosition">
      <template v-if="selectedMessage">
        <div 
          v-if="selectedMessage.userId !== $store.state.userInfo.id" 
          class="action-item" 
          @click="mentionUser"
        >
          <i class="fas fa-at"></i>
          TA
        </div>
        <div 
          v-if="!selectedMessage.isRecalled && selectedMessage.userId === $store.state.userInfo.id" 
          class="action-item" 
          @click="recallMessage"
        >
          <i class="fas fa-undo"></i>
          撤回
        </div>
        <div class="action-item" @click="handleSearch">
          <i class="fas fa-search"></i>
          搜索
        </div>
      </template>
    </div>

  </div>
</template>

<script>
import { sendMsg,getChatMsgListApi,recallMsgApi } from '@/api/chat'
import { formatTime } from '@/utils/time'
import { uploadFileApi } from '@/api/file'
import { disableScroll,enableScroll } from '@/utils/scroll'
export default {
  name: 'Chat',
  data() {
    return {
      messageText: '',
      ws: null, // WebSocket实例
      currentChat: {
        id: 1,
        name: '博客交流群',
        avatar: this.$store.state.webSiteInfo.logo,
        lastMessage: '',
        lastTime: '12:30',
        isGroup: true,
        members: [],
        messages: []
      },
      showActionsMenu: false,
      selectedMessage: null,
      actionMenuPosition: {
        top: '0px',
        left: '0px'
      },
      params: {
        pageNum: 1,
        pageSize: 10
      },
      loading: false,  // 是否正在加载更多消息
      hasMore: true,   // 是否还有更多消息
      countdown: 0,    // 倒计时秒数
      countdownTimer: null, // 计时器实例
      heartbeatTimer: null,    // 心跳定时器
      heartbeatInterval: 30000, // 心跳间隔，30秒
      reconnectAttempts: 0,    // 重连次数
      maxReconnectAttempts: 5, // 最大重连次数
      shouldReconnect: true, // 是否需要重连的标志
      shouldScrollToBottom: true, // 添加新标志来控制是否滚动到底部
    }
  },
  //监听this.$store.state.userInfo的变化
  watch: {
    '$store.state.userInfo': {
        handler(newVal, oldVal) {
            // 有值就连接ws, 没有就移除
            if (newVal) {
                this.init()
            } else {
                this.$store.commit('SET_LOGIN_VISIBLE', true);
                if (this.ws) {
                    this.ws.close();
                }
            }
        },
        deep: true
    }
  },
  created() {
    // 如果用户信息存在，则连接WebSocket
    if (!this.$store.state.userInfo) {
      this.$store.commit('SET_LOGIN_VISIBLE', true)
      return
    }
    this.init()
    //禁止滚动
    disableScroll()
  },
  beforeDestroy() {
    this.shouldReconnect = false // 设置不再重连
    this.stopHeartbeat() // 清理心跳定时器
    if (this.ws) {
      this.ws.close()
    }
    // 移除滚动事件监听
    const container = this.$refs.messageContainer
    if (container) {
      container.removeEventListener('scroll', this.handleScroll)
    }
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer)
    }
    //开启滚动
    enableScroll()
  },
  methods: {
    /**
     * 初始化
     */
    async init(){
      this.connectWebSocket()
      await this.getChatList()

      // 添加滚动事件监听
      this.$nextTick(() => {

        const container = this.$refs.messageContainer
        if (container) {
          container.addEventListener('scroll', this.handleScroll)
        }

        setTimeout(() => {
          this.scrollToBottom()
        }, 300)
      })
    },
    /**
     * 获取聊天列表
     */
    async getChatList() {
      const res = await getChatMsgListApi(this.params)
      this.currentChat.messages = res.data.records
      if(this.params.pageNum === 1 && this.currentChat.messages.length > 0){
        this.currentChat.lastTime = formatTime(this.currentChat.messages[0].time)
        this.currentChat.lastMessage = this.currentChat.messages[0].type === 'text' ? this.currentChat.messages[0].content : '[图片]'
      }
      //获取到的数据是最新时间的，应该要把这个顺序反过来
      this.currentChat.messages.reverse()
      this.currentChat.messages.forEach(msg => {
        msg.time = formatTime(msg.time)
      })
    },
    /**
     * 连接WebSocket
     */
    connectWebSocket() {
      try {
        const wsUrl = import.meta.env.VITE_APP_WEBSOCKET_API;
        this.ws = new WebSocket(wsUrl + this.$store.state.userInfo.id);

        this.ws.onopen = () => {
          console.log('WebSocket连接已建立')
          this.reconnectAttempts = 0
          this.startHeartbeat()
        }

        this.ws.onmessage = (event) => {
          console.log('收到原始消息:', event.data)
          try {
            const message = JSON.parse(event.data)
            // 如果是心跳响应，则不处理
            if (message.type === 'ping') {
              return
            }
            this.handleIncomingMessage(message)
          } catch (error) {
            console.error('解析消息失败:', error)
          }
        }

        this.ws.onclose = () => {
          console.log('WebSocket连接已关闭')
          this.stopHeartbeat() // 停止心跳
          this.reconnect() // 尝试重连
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket错误:', error)
          this.stopHeartbeat() // 停止心跳
        }
      } catch (error) {
        console.error('建立WebSocket连接失败:', error)
      }
    },

    /**
     * 处理接收到的消息
     */
    handleIncomingMessage(message) {
      console.log('收到消息:', message)
      
      if (typeof message === 'string') {
        try {
          message = JSON.parse(message)
        } catch (e) {
          console.error('消息格式错误:', e)
          return
        }
      }
      if(message.isRecalled){
        const index = this.currentChat.messages.findIndex(msg => msg.id === message.id)
        if(index !== -1){
          this.currentChat.messages[index].content = message.content
          this.currentChat.messages[index].isRecalled = message.isRecalled
        }
        return
      }
      if (message.type === 'text') {
        message.content = message.content.replace(/@(\S+)\s/g, '<mention>@$1</mention> ')
      }
      
      const newMessage = {
        id: message.id || Date.now(),
        type: message.type || 'text',
        content: message.content,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        userId: message.userId, 
        name: message.name,
        avatar: message.avatar,
        location: message.location
      }
      this.currentChat.messages.push(newMessage)
      this.currentChat.lastMessage = message.type === 'text' ? message.content : '[图片]'
      this.currentChat.lastTime = '刚刚'
      this.shouldScrollToBottom = true // 收到新消息时设置为true

      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },

    /**
     * 发送文本消息
     */
    async sendMessage() {
      if (!this.messageText.trim() || !this.$store.state.userInfo || this.countdown > 0) return
      
      const mentionedContent = this.messageText.replace(/@(\S+)\s/g, '<mention>@$1</mention> ')
      
      const message = {
        type: 'text',
        content: mentionedContent,
        name: this.$store.state.userInfo.nickname,
        userId: this.$store.state.userInfo.id,
        avatar: this.$store.state.userInfo.avatar,
      }

      try {
        const response = await sendMsg(message)
        this.startCountdown()
        this.shouldScrollToBottom = true // 发送消息时设置为true
      } catch (error) {
        console.error('发送消息失败:', error)
        this.$message.error('发送失败，请重试')
      }
      this.messageText = ''
    },

    /**
     * 发送图片消息
     */
    async sendImage(imageData) {
      if (!this.$store.state.userInfo) return
      
      const message = {
        type: 'image',
        content: imageData,
        self: true,
        name: this.$store.state.userInfo.nickname,
        userId: this.$store.state.userInfo.id,
        avatar: this.$store.state.userInfo.avatar,
      }

      try {
        const response = await sendMsg(message)
        this.shouldScrollToBottom = true // 发送图片时设置为true
      } catch (error) {
        console.error('发送图片失败:', error)
        this.$message.error('发送失败，请重试')
      }
    },

    /**
     * 滚动到底部
     */
    scrollToBottom() {
      const container = this.$refs.messageContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },

    /**
     * 插入表情
     */
     insertEmoji(emoji) {
      const match = emoji.match(/\((.*?)\)/);
      if (match && match.length > 1) {
          const imgUrl = match[1];
          this.sendImage(imgUrl)
          return
      }
      const textarea = this.$refs.messageTextarea
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      this.messageText = 
        this.messageText.substring(0, start) + 
        emoji + 
        this.messageText.substring(end)
      
      // 将光标移动到插入的表情符号后面
      this.$nextTick(() => {
        textarea.focus()
        textarea.setSelectionRange(start + emoji.length, start + emoji.length)
      })
    },
    /**
     * 上传图片
     * @param event 
     */
    async handleImageUpload(event) {
      const file = event.target.files[0]
      if (!file) return
      
      if (!file.type.startsWith('image/')) {
        this.$message.error('请选择图片文件')
        return
      }
      
      if (file.size > 5 * 1024 * 1024) {
        this.$message.error('图片大小不能超过5MB')
        return
      }
      
      try {
        // 创建 FormData 对象
        const formData = new FormData()
        formData.append('file', file)
        
        // 调用上传接口
        const response = await uploadFileApi(formData)
        
        // 发送图片消息
        if (response.data) {
          await this.sendImage(response.data)
        }
      } catch (error) {
        console.error('图片上传失败:', error)
        this.$message.error('图片上传失败')
      }
      
      // 清空 input 的值，允许重复选择同一文件
      event.target.value = ''
    },
    /**
     * 预览图片
     * @param src 
     */
    previewImage(src) {
      this.$refs.imagePreview.show(src)
    },
    /**
     * 显示消息操作菜单
     * @param {Object} message 消息对象
     * @param {Event} event 鼠标事件
     */
    showMessageActions(message, event) {
      this.selectedMessage = message;
      this.showActionsMenu = true;
      
      // 计算菜单位置
      this.actionMenuPosition = {
        top: `${event.clientY}px`,
        left: `${event.clientX}px`
      };

      // 添加点击事件监听
      setTimeout(() => {
        document.addEventListener('click', this.closeActionsMenu);
      }, 0);
    },

    /**
     * 关闭消息操作菜单
     */
    closeActionsMenu() {
      this.showActionsMenu = false;
      this.selectedMessage = null;
      document.removeEventListener('click', this.closeActionsMenu);
    },

    /**
     * 撤回消息
     */
    async recallMessage() {
      if (!this.selectedMessage) return
      
      try {
        const data = {id: this.selectedMessage.id}
        // 调用撤回消息接口
        const response = await recallMsgApi(data)
      } catch (error) {
        this.$message.error(error.message || '撤回失败，请重试')
      }
      this.closeActionsMenu()
    },

    /**
     * 处理搜索
     */
    handleSearch() {
      this.$message.info('搜索功能暂未实现')
    },

    /**
     * 处理图片加载
     */
    handleImageLoad() {
      // 只有在需要滚动到底部时才执行
      if (this.shouldScrollToBottom) {
        this.scrollToBottom()
      }
    },

    /**
     * 监听消息容器的滚动
     */
    handleScroll() {
      const container = this.$refs.messageContainer
      // 当滚动到接近顶部时加载更多消息
      if (container.scrollTop <= 100 && !this.loading && this.hasMore) {
        this.loadMoreMessages()
      }
    },

    /**
     * 加载更多历史消息
     */
    async loadMoreMessages() {
      if (this.loading || !this.hasMore) return

      this.loading = true
      this.shouldScrollToBottom = false // 加载历史消息时设置为false
      try {
        const container = this.$refs.messageContainer
        const oldScrollHeight = container.scrollHeight

        this.params.pageNum++
        
        const response = await getChatMsgListApi(this.params)
        
        if (response.data && response.data.records && response.data.records.length > 0) {
          const formattedMessages = response.data.records.map(msg => ({
            ...msg,
            time: formatTime(msg.time)
          }))
          
          this.currentChat.messages.unshift(...formattedMessages.reverse())
          
          if (response.data.records.length < this.params.pageSize) {
            this.hasMore = false
          }

          this.$nextTick(() => {
            const newScrollHeight = container.scrollHeight
            container.scrollTop = newScrollHeight - oldScrollHeight
          })
        } else {
          this.hasMore = false
        }
      } catch (error) {
        console.error('加载历史消息失败:', error)
        this.$message.error('加载历史消息失败')
      } finally {
        this.loading = false
      }
    },

    /**
     * 开始倒计时
     */
    startCountdown() {
      this.countdown = 3
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer)
      }
      this.countdownTimer = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--
        } else {
          clearInterval(this.countdownTimer)
        }
      }, 1000)
    },

    /**
     * 开始心跳
     */
    startHeartbeat() {
      this.stopHeartbeat() // 确保之前的心跳已停止
      this.heartbeatTimer = setInterval(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          // 发送心跳消息
          this.ws.send(JSON.stringify({
            type: 'ping',
            timestamp: new Date().getTime()
          }))
        } else {
          this.stopHeartbeat()
          this.reconnect()
        }
      }, this.heartbeatInterval)
    },

    /**
     * 停止心跳
     */
    stopHeartbeat() {
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer)
        this.heartbeatTimer = null
      }
    },

    /**
     * 重连WebSocket
     */
    reconnect() {
      // 如果不需要重连，直接返回
      if (!this.shouldReconnect) {
        return
      }

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.log('达到最大重连次数，停止重连')
        this.$message.error('网络连接异常，请刷新页面重试')
        return
      }

      this.reconnectAttempts++
      console.log(`第 ${this.reconnectAttempts} 次尝试重连...`)
      
      // 使用指数退避算法计算重连延迟
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
      
      setTimeout(() => {
        // 再次检查是否需要重连
        if (this.shouldReconnect && this.$store.state.userInfo) {
          this.connectWebSocket()
        }
      }, delay)
    },

    //截取地址
    splitIpAddress(address) {
      return address ? address.split("|")[1] : '' ;
    },

    /**
     * 处理@输入
     * @param {Event} event 
     */
    handleInput(event) {
      const textarea = this.$refs.messageTextarea
      const text = textarea.value
      const position = textarea.selectionStart

      // 检查是否刚输入了@符号
      if (text[position - 1] === '@') {
        this.showMentionList = true
        this.mentionFilter = ''
        this.selectedMentionIndex = -1
        
        // 计算@列表的位置
        const coords = this.getCaretCoordinates(textarea, position)
        this.mentionListPosition = {
          top: `${coords.top + 20}px`,
          left: `${coords.left}px`
        }
      } else if (this.showMentionList) {
        // 更新过滤文本
        const lastAtIndex = text.lastIndexOf('@', position - 1)
        if (lastAtIndex !== -1) {
          this.mentionFilter = text.substring(lastAtIndex + 1, position)
        }
      }
    },

    /**
     * 处理@列表键盘事件
     * @param {KeyboardEvent} event 
     */
    handleMentionKeydown(event) {
      if (!this.showMentionList) return

      const filteredUsers = this.getFilteredUsers()

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          this.selectedMentionIndex = Math.min(
            this.selectedMentionIndex + 1,
            filteredUsers.length - 1
          )
          break
        case 'ArrowUp':
          event.preventDefault()
          this.selectedMentionIndex = Math.max(this.selectedMentionIndex - 1, 0)
          break
        case 'Enter':
          event.preventDefault()
          if (this.selectedMentionIndex >= 0) {
            this.selectMentionUser(filteredUsers[this.selectedMentionIndex])
          }
          break
        case 'Escape':
          event.preventDefault()
          this.showMentionList = false
          break
      }
    },

    /**
     * 选择要@的用户
     * @param {Object} user 
     */
    selectMentionUser(user) {
      const textarea = this.$refs.messageTextarea
      const text = textarea.value
      const position = textarea.selectionStart
      const lastAtIndex = text.lastIndexOf('@', position - 1)

      if (lastAtIndex !== -1) {
        this.messageText = 
          text.substring(0, lastAtIndex) +
          `@${user.name} ` +
          text.substring(position)
        
        // 将光标移动到插入的@用户名后面
        this.$nextTick(() => {
          const newPosition = lastAtIndex + user.nickname.length + 2
          textarea.focus()
          textarea.setSelectionRange(newPosition, newPosition)
        })
      }

      this.showMentionList = false
    },

    /**
     * 获取过滤后的用户列表
     */
    getFilteredUsers() {
      return this.mentionUsers.filter(user => 
        user.nickname.toLowerCase().includes(this.mentionFilter.toLowerCase())
      )
    },

    /**
     * 获取光标在textarea中的坐标
     */
    getCaretCoordinates(element, position) {
      const div = document.createElement('div')
      const styles = window.getComputedStyle(element)
      const properties = [
        'direction', 'boxSizing', 'width', 'height', 'overflowX', 'overflowY',
        'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
        'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
        'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize',
        'fontSizeAdjust', 'lineHeight', 'fontFamily', 'textAlign', 'textTransform',
        'textIndent', 'textDecoration', 'letterSpacing', 'wordSpacing'
      ]

      div.style.position = 'absolute'
      div.style.visibility = 'hidden'
      properties.forEach(prop => {
        div.style[prop] = styles[prop]
      })

      div.textContent = element.value.substring(0, position)
      const span = document.createElement('span')
      span.textContent = element.value.substring(position) || '.'
      div.appendChild(span)
      document.body.appendChild(div)

      const coordinates = {
        top: span.offsetTop + parseInt(styles.borderTopWidth) + parseInt(styles.paddingTop),
        left: span.offsetLeft + parseInt(styles.borderLeftWidth) + parseInt(styles.paddingLeft)
      }

      document.body.removeChild(div)
      return coordinates
    },

    /**
     * 在头像上右键时显示@选项
     */
    handleAvatarContextMenu(message, event) {
      event.preventDefault();
      // 不能@自己
      if (message.userId === this.$store.state.userInfo.id) {
        return;
      }
      
      this.selectedMessage = message;
      this.showActionsMenu = true;
      
      // 计算菜单位置
      this.actionMenuPosition = {
        top: `${event.clientY}px`,
        left: `${event.clientX}px`
      };

      // 添加点击事件监听
      setTimeout(() => {
        document.addEventListener('click', this.closeActionsMenu);
      }, 0);
    },

    /**
     * @用户
     */
    mentionUser() {
      if (!this.selectedMessage) return;
      const user = {
        nickname: this.selectedMessage.name
      };
      
      // 在输入框末尾添加@用户
      this.messageText += `@${user.nickname} `;
      
      // 关闭菜单
      this.closeActionsMenu();
      
      // 聚焦输入框
      this.$nextTick(() => {
        const textarea = this.$refs.messageTextarea;
        textarea.focus();
        textarea.setSelectionRange(this.messageText.length, this.messageText.length);
      });
    },

    // 添加格式化消息内容的方法
    formatMessageContent(content) {
      // 如果内容已经包含<mention>标签，说明是发送时已经处理过的
      if (content.includes('<mention>')) {
        return content;
      }
      // 否则处理普通文本中的@格式
      return content.replace(/@(\S+)\s/g, '<mention>@$1</mention> ');
    },
  }
}
</script>

<style lang="scss" scoped>
.chat-container {
  max-width: 1200px;
  margin: 0 auto;
  height: calc(100vh - 140px);
  display: grid;
  grid-template-columns: 300px 1fr;
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: $shadow-lg;
  margin-top: $spacing-lg;
  
  @include responsive(md) {
    grid-template-columns: 1fr;
    margin: $spacing-md;
    height: calc(100vh - 100px);
  }
}

.chat-sidebar {
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  
  @include responsive(md) {
    display: none;
  }
}

.chat-header {
  padding: $spacing-lg;
  border-bottom: 1px solid var(--border-color);
  
  h3 {
    color: var(--text-primary);
    margin: 0;
  }
}

.chat-list {
  flex: 1;
  overflow-y: auto;
}

.chat-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: $spacing-md;
  padding: $spacing-md;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--hover-bg);
  }
  
  &.active {
    background: var(--hover-bg);
  }
  
  .avatar {
    width: 48px;
    height: 48px;
    
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }
  }
  
  .chat-info {
    max-width: 160px;
    overflow: hidden;
    
    .name {
      color: var(--text-primary);
      font-weight: 500;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .last-message {
      color: var(--text-secondary);
      font-size: 0.9em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
      display: block;
    }
  }
  
  .meta {
    text-align: right;
    
    .time {
      color: var(--text-secondary);
      font-size: 0.8em;
      margin-bottom: 4px;
    }
  }
}

.chat-main {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  overflow: hidden;
  
  .chat-header {
    height: 70px;
    flex: none;
    background: var(--card-bg);
    z-index: 10;
    .user-info {
      display: flex;
      align-items: center;
      gap: $spacing-md;
      
      .status-text {
        color: var(--text-secondary);
        font-size: 0.9em;
      }
    }
  }
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-lg;
  padding-bottom: 120px;
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.message {
  display: flex;
  gap: $spacing-md;
  
  &.message-self {
    flex-direction: row-reverse;
    
    .message-content {
      align-items: flex-end;
      
      .message-text {
        background: $primary;
        color: white;
        border-radius: 16px 16px 4px 16px;
        max-width: 700px;
      }

      .sender-name {
        text-align: right;
      }
    }
  }
  
  .avatar {
    width: 40px;
    height: 40px;
    
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }
  }
  
  .message-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    .sender-name {
      font-size: 0.9em;
      color: var(--text-secondary);
      margin-bottom: 2px;
    }
  }
}

.chat-input {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: $spacing-lg;
  border-top: 1px solid var(--border-color);
  background: var(--card-bg);
  display: flex;
  gap: $spacing-md;
  z-index: 10;
  
  .input-toolbar {
    display: flex;
    gap: $spacing-sm;
    align-items: center;
    
    .toolbar-btn {
      padding: $spacing-sm;
      border: none;
      background: none;
      color: var(--text-secondary);
      cursor: pointer;
      border-radius: 4px;
      
      &:hover {
        background: var(--hover-bg);
        color: $primary;
      }
    }
  }

  textarea {
    flex: 1;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: $spacing-md;
    resize: none;
    height: 60px;
    background: var(--input-bg);
    color: var(--text-primary);
    
    &:focus {
      outline: none;
      border-color: $primary;
    }
  }
  
  button {
    width: 60px;
    border: none;
    border-radius: 8px;
    background: $primary;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1em;
    
    &:hover:not(:disabled) {
      background: darken($primary, 10%);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.message-text {
  background: var(--hover-bg);
  padding: $spacing-md $spacing-lg;
  border-radius: 16px 16px 16px 4px;
  color: var(--text-primary);
  max-width: 700px;
  
  // 添加深度选择器来处理v-html内容的样式
  :deep(mention) {
    color: rgb(84, 214, 231) !important;
    font-weight: 500;
    cursor: pointer;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

.no-chat-selected {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  
  i {
    font-size: 4em;
    margin-bottom: $spacing-md;
  }
}

.message-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.message-actions {
  opacity: 0;
  transition: opacity 0.2s;
  padding: 4px;
  cursor: pointer;
  color: var(--text-secondary);
  
  &:hover {
    color: var(--text-primary);
  }
}

.message:hover .message-actions {
  opacity: 1;
}

.message-recalled {
  text-align: center;
  padding: $spacing-md;
  margin: 0 auto;
  
  span {
    background: var(--hover-bg);
    color: var(--text-secondary);
    font-size: 0.9em;
    padding: $spacing-sm $spacing-md;
    border-radius: 16px;
    display: inline-block;
  }
}

.message-time {
  font-size: 0.8em;
  color: var(--text-secondary);
}

.message-actions-menu {
  position: fixed;
  background: var(--card-bg);
  border-radius: 8px;
  box-shadow: $shadow-lg;
  z-index: 1000;
  padding: $spacing-sm;
  min-width: 120px;
  
  .action-item {
    padding: $spacing-sm $spacing-md;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    color: var(--text-primary);
    
    &:hover {
      background: var(--hover-bg);
    }
    
    i {
      color: var(--text-secondary);
    }
  }
}

.loading-messages {
  text-align: center;
  padding: $spacing-md;
  color: var(--text-secondary);
  font-size: 0.9em;
  
  i {
    margin-right: $spacing-sm;
  }
}

.location {
  font-size: 12px;
  color: var(--text-secondary);
  margin-left: 4px;
}

.author-tag {
  background: $primary;
  color: white;
  font-size: 12px;
  padding: 1px 6px;
  border-radius: 4px;
  margin-left: 4px;
}

// 对于自己发送的消息，修改@样式的颜色
.message-self {
  .message-text {
    :deep(mention) {
      color: white;
      font-weight: 600;
    }
  }
}
</style> 