<template>
  <div class="chat-container">
    <div class="nav-sidebar">
      <div class="nav-header">
        <div class="user-avatar">
          <img :src="$store.state.userInfo.avatar" >
        </div>
      </div>
      <div class="nav-menu">
        <div 
          class="nav-item chat-icon" 
          :class="{ active: currentNav === 'chat' }"
          @click="switchNav('chat')"
        >
          <i class="fas fa-comment"></i>
          <span class="nav-text">聊天</span>
        </div>
        <div 
          class="nav-item friends-icon"
          :class="{ active: currentNav === 'friends' }"
          @click="switchNav('friends')"
        >
          <i class="fas fa-user-friends"></i>
          <span class="nav-text">好友</span>
        </div>
        <div 
          class="nav-item groups-icon"
          :class="{ active: currentNav === 'groups' }"
          @click="switchNav('groups')"
        >
          <i class="fas fa-users"></i>
          <span class="nav-text">群聊</span>
        </div>
      </div>
      <div class="nav-bottom">
        <a 
          class="nav-item" 
          href="https://gitee.com/quequnlong/shiyi-blog" 
          target="_blank"
          title="查看源码"
        >
          <i class="fab fa-github"></i>
          <span class="nav-text">源码</span>
        </a>
      </div>
    </div>

    <!-- 遮罩层 -->
    <div 
      v-if="isMobile && !isListHidden" 
      class="mobile-overlay"
      @click="toggleList"
    ></div>

    <div 
      class="chat-list-container" 
      :class="{ 'mobile-hidden': isMobile && isListHidden }"
    >
      <div class="search-box">
        <input type="text" placeholder="搜索">
      </div>
      <div class="chat-list">
        <template v-if="currentNav === 'chat'">
          <div 
            v-for="chat in chatList"
            :key="chat.id"
            class="chat-item"
            :class="{ active: currentChat.id === chat.id }"
          >
            <div class="avatar">
              <img :src="chat.avatar" >
            </div>
            <div class="chat-info">
              <div class="name">{{ chat.name }}</div>
              <div class="last-message">{{ currentChat.lastMessage }}</div>
            </div>
            <div class="meta">
              <div class="time">{{ currentChat.lastTime }}</div>
            </div>
          </div>
        </template>
        <template v-else-if="currentNav === 'friends'">
          <div 
            v-for="friend in friendsList"
            :key="friend.id"
            class="friend-item"
            :class="{ active: selectedFriend && selectedFriend.id === friend.id }"
            @click="selectFriend(friend)"
          >
            <div class="avatar">
              <img :src="friend.avatar" >
            </div>
            <div class="friend-info">
              <div class="name">{{ friend.name }}</div>
            </div>
          </div>
        </template>
      </div>
    </div>
    
    <div class="chat-main" v-if="currentNav === 'chat'">
      <div class="chat-header">
        <div class="user-info">
          <div class="toggle-list-btn" @click="toggleList" v-if="isMobile">
            <i class="fas fa-bars"></i>
          </div>
          <h3>{{ currentChat.name }}</h3>
        </div>
      </div>
      
      <div class="messages" ref="messageContainer">
        <div v-if="loading" class="loading-messages">
          <i class="fas fa-spinner fa-spin"></i>
          加载中...
        </div>
        
        <div 
          v-for="(msg, index) in currentChat.messages" 
          :key="msg.id || 'msg-' + index"
          :class="['message', { 'message-self': msg.userId === $store.state.userInfo.id }]"
        >
          <div class="avatar" @contextmenu.prevent="handleAvatarContextMenu(msg, $event)">
            <img :src="msg.avatar">
          </div>
          <div class="message-content">
            <div class="message-header">
              <div v-if="currentChat.isGroup && msg.userId !== $store.state.userInfo.id" class="sender-name">
                {{ msg.name }}
                <span v-if="msg.userId === 1" class="author-tag">作者</span>
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
                :key="'img-' + (msg.id || index)"
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

          <label class="toolbar-btn image-upload-btn" for="image-upload">
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
        
        <div class="input-area">
          <textarea 
            ref="messageTextarea"
            v-model="messageText" 
            @keydown.enter.prevent="handleEnterKey"
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

    <!-- 好友信息显示区域 -->
    <div v-if="selectedFriend" class="friend-details">
      <h3>{{ selectedFriend.name }}</h3>
      <p class="signature">签名：{{ selectedFriend.signature || '这个人很懒，什么都没写。' }}</p>
      <p class="gender">性别：{{ selectedFriend.gender || '未知' }}</p>
      <el-button type="primary" size="small" icon="el-icon-message" @click="sendMessageToFriend">发送信息</el-button>
      <el-button type="danger" size="small" icon="el-icon-delete" @click="deleteFriend">删除好友</el-button>
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
      currentNav: 'chat',
      chatList: [
        {
          id: 1,
          name: '博客交流群',
          avatar: this.$store.state.webSiteInfo.logo,
          lastMessage: '',
          lastTime: '',
        }
      ],
      friendsList: [
        {
          id: 1,
          name: '张三',
          avatar: 'https://foruda.gitee.com/avatar/1677004143848886034/2106773_hhf1237_1647845148.png',
          signature: '热爱生活，热爱编程。',
          gender: '男'
        },
        {
          id: 2,
          name: '李四',
          avatar: 'https://foruda.gitee.com/avatar/1677079463351115261/7467101_unique_perfect_1638710768.png',
          signature: '旅行是我的灵魂。',
          gender: '女'
        }
      ],
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
      isMobile: false,
      isListHidden: false,
      selectedFriend: null, // 用于存储选中的好友信息
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
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);
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
    window.removeEventListener('resize', this.checkMobile);
  },
  methods: {
    switchNav(nav) {
      this.currentNav = nav;
      this.selectedFriend = null
      if (nav === 'chat') {
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },
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
        id: message.id || Date.now() + Math.random(), // 确保每条消息都有唯一ID
        type: message.type || 'text',
        content: message.content,
        time: formatTime(new Date()),
        userId: message.userId,
        name: message.name,
        avatar: message.avatar,
        location: message.location
      }
      
      this.currentChat.messages.push(newMessage)
      this.currentChat.lastMessage = message.type === 'text' ? message.content : '[图片]'
      this.currentChat.lastTime = '刚刚'
      this.shouldScrollToBottom = true

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
        const response = await uploadFileApi(formData,'chat')
        
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
     * 处理Enter键
     * @param {KeyboardEvent} event 
     */
    handleEnterKey(event) {
      // 如果按下了Ctrl键，则插入换行
      if (event.ctrlKey) {
        const textarea = this.$refs.messageTextarea;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        this.messageText = 
          this.messageText.substring(0, start) + 
          '\n' + 
          this.messageText.substring(end);
        
        // 将光标移动到换行后的位置
        this.$nextTick(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1;
        });
      } else {
        // 否则发送消息
        this.sendMessage();
      }
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

    toggleList() {
      if (!this.isMobile) return;
      this.isListHidden = !this.isListHidden;
    },

    /**
     * 检查是否为移动设备
     */
    checkMobile() {
      const width = window.innerWidth;
      this.isMobile = width <= 768;
      // 在移动端时默认隐藏列表
      if (this.isMobile) {
        this.isListHidden = true;
      } else {
        this.isListHidden = false;
      }
    },

    selectFriend(friend) {
      this.selectedFriend = friend;
    },

    sendMessageToFriend() {
      // 实现发送信息的逻辑
      this.$message.info(`发送信息给 ${this.selectedFriend.name}`);
    },

    deleteFriend() {
      // 实现删除好友的逻辑
      this.$message.info(`删除好友 ${this.selectedFriend.name}`);
    },
  }
}
</script>

<style lang="scss" scoped>
.chat-container {
  height: calc(100vh - 140px);
  display: grid;
  grid-template-columns: 80px 280px 1fr;
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: $shadow-lg;
  margin: $spacing-lg auto;
  overflow: hidden;
  max-width: 1200px;
  position: relative;

  @media screen and (max-width: 768px) {
    height: 100vh;
    margin: 0;
    border-radius: 0;
    grid-template-columns: 80px 1fr;
    padding-top: 0; // 移除顶部padding
  }
}

.nav-sidebar {
  background: linear-gradient(180deg, #2c3e50 0%, #3498db 100%);
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  z-index: 200;

  @media screen and (max-width: 768px) {
    position: fixed;
    left: 0;
    top: 70px;
    bottom: 0;
    width: 80px;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, rgba(44, 62, 80, 0.1) 100%);
    z-index: 1;
  }

  .nav-header {
    padding: $spacing-md;
    display: flex;
    justify-content: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: $spacing-md;
    background: rgba(255, 255, 255, 0.05);
    position: relative;
    z-index: 2;

    .user-avatar {
      width: 48px;
      height: 48px;
      border-radius: 16px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid transparent;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      
      &:hover {
        border-color: rgba(255, 255, 255, 0.8);
        transform: scale(1.05) translateY(-2px);
        box-shadow: 0 8px 16px rgba(52, 152, 219, 0.3);
      }
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  .nav-menu {
    padding: $spacing-sm 0;
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
    position: relative;
    z-index: 2;
    height: calc(100% - 100px); // 为底部源码按钮留出空间
    justify-content: flex-start;

    .nav-item {
      height: 64px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      cursor: pointer;
      color: rgba(255, 255, 255, 0.7);
      transition: all 0.3s ease;
      position: relative;
      margin: 0 $spacing-sm;
      border-radius: 16px;
      backdrop-filter: blur(8px);
      &:hover {
        color: white;
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-1px);
        
        .nav-text {
          opacity: 1;
          transform: scale(1.02);
        }

        i {
          transform: scale(1.05);
        }

        &.chat-icon i {
          color: #2ecc71;
        }
        
        &.friends-icon i {
          color: #e74c3c;
        }
        
        &.groups-icon i {
          color: #f1c40f;
        }
      }
      
      &.active {
        color: white;
        background: rgba(255, 255, 255, 0.15);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

        &::before {
          content: '';
          position: absolute;
          left: -$spacing-sm;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 24px;
          background: white;
          border-radius: 0 4px 4px 0;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
        }
        
        .nav-text {
          opacity: 1;
          color: white;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        &.chat-icon i {
          color: #2ecc71;
        }
        
        &.friends-icon i {
          color: #e74c3c;
        }
        
        &.groups-icon i {
          color: #f1c40f;
        }
      }

      i {
        font-size: 1.4em;
        transition: all 0.3s ease;
      }

      .nav-text {
        font-size: 0.85em;
        opacity: 0.8;
        transition: all 0.3s ease;
        font-weight: 500;
      }

      &::after {
        content: '';
        position: absolute;
        left: 50%;
        bottom: -$spacing-sm;
        transform: translateX(-50%);
        width: 3px;
        height: 3px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
      }

      &:last-child::after {
        display: none;
      }
    }
  }

  // 添加底部源码按钮样式
  .nav-bottom {
    position: absolute;
    bottom: $spacing-md;
    left: 0;
    right: 0;
    padding: 0 $spacing-sm;
    z-index: 2;

    .nav-item {
      height: 64px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      cursor: pointer;
      color: rgba(255, 255, 255, 0.7);
      transition: all 0.3s ease;
      border-radius: 16px;
      backdrop-filter: blur(8px);
      text-decoration: none !important;

      &:hover {
        color: white;
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-1px);
        
        .nav-text {
          opacity: 1;
        }

        i {
          color: #f1c40f;
          transform: scale(1.1);
        }
      }

      i {
        font-size: 1.4em;
        transition: all 0.3s ease;
      }

      .nav-text {
        font-size: 0.85em;
        opacity: 0.8;
        transition: all 0.3s ease;
        font-weight: 500;
      }
    }
  }
}

.chat-list-container {
  background: var(--card-bg);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media screen and (max-width: 768px) {
    position: absolute;
    left: 80px;
    top: 0;
    bottom: 0;
    width: 280px;
    z-index: 150;
    background: var(--card-bg);
    transform: translateX(0);
    transition: transform 0.3s ease;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
    
    &.mobile-hidden {
      transform: translateX(-280px);
    }
  }

  .search-box {
    padding: $spacing-md;
    border-bottom: 1px solid var(--border-color);
    background: var(--card-bg);
    position: relative;
    
    &::before {
      content: '\f002';
      font-family: 'Font Awesome 5 Free';
      font-weight: 900;
      position: absolute;
      left: 24px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-secondary);
      font-size: 0.9em;
      opacity: 0.7;
    }
    
    input {
      width: 100%;
      padding: $spacing-sm $spacing-xl $spacing-sm 42px;
      border: 1px solid var(--border-color);
      border-radius: 24px;
      background: var(--input-bg);
      color: var(--text-primary);
      font-size: 0.9em;
      transition: all 0.3s ease;
      
      &:focus {
        outline: none;
        border-color: $primary;
        box-shadow: 0 0 0 3px rgba($primary, 0.1);
        
        & + .search-icon {
          color: $primary;
        }
      }

      &::placeholder {
        color: var(--text-secondary);
        opacity: 0.7;
      }
    }
  }

  .chat-list {
    flex: 1;
    overflow-y: auto;
    padding: $spacing-sm 0;
  }

  .friend-item {
    padding: $spacing-md;
    display: flex;
    align-items: center;
    gap: $spacing-md;
    margin: $spacing-sm $spacing-xs;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover, &.active {
      background: var(--hover-bg);
    }
    
    .avatar {
      width: 42px;
      height: 42px;
      flex-shrink: 0;
      
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
      }
    }
    
    .friend-info {
      .name {
        font-size: 0.95em;
        font-weight: 500;
        color: var(--text-primary);
      }
    }
  }
}

.chat-item {
  padding: $spacing-md;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: $spacing-md;
  margin: 0 $spacing-xs;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--hover-bg);
  }
  
  &.active {
    background: var(--hover-bg);
  }
  
  .avatar {
    width: 42px;
    height: 42px;
    flex-shrink: 0;
    
    img {
      width: 100%;
      height: 100%;
      border-radius: 12px;
      object-fit: cover;
    }
  }
  
  .chat-info {    
    min-width: 0; // 确保文本可以正确截断
    
    .name {
      margin-bottom: 4px;
      font-size: 0.95em;
      font-weight: 500;
      color: var(--text-primary);
      
    }
    
    .last-message {
      font-size: 0.85em;
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 170px;
    }
  }
  
  .meta {
    flex-shrink: 0;
    
    .time {
      font-size: 0.8em;
      color: var(--text-secondary);
    }
  }
}

.empty-tip {
  padding: $spacing-lg;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9em;
}

.chat-main {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--card-bg);
  border-left: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
  
  @media screen and (max-width: 768px) {
    grid-column: 2;
    padding-top: 60px; // 为header留出空间
    height: 100vh; // 设置全屏高度
    position: fixed; // 固定定位
    right: 0; // 固定在右侧
    left: 80px; // 留出左侧导航栏的空间
  }

  .chat-header {
    height: 70px;
    flex-shrink: 0;
    padding: $spacing-md $spacing-lg;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    background: var(--card-bg);
    z-index: 10;

    .user-info {
      display: flex;
      align-items: center;
      gap: $spacing-md;
      width: 100%;
      
      h3 {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
      }
      
      .toggle-list-btn {
        display: none;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--hover-bg);
        cursor: pointer;
        margin-right: $spacing-sm;
        
        @media screen and (max-width: 768px) {
          display: flex;
        }
        
        &:hover {
          background: var(--border-color);
        }
        
        i {
          color: var(--text-primary);
          font-size: 1.1em;
        }
      }
    }
  }

  .messages {
    flex: 1;
    overflow-y: auto;
    padding: $spacing-md $spacing-lg;
    padding-bottom: 100px;
    background: var(--bg);
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
    
    .message {
      display: flex;
      gap: $spacing-sm;
      align-items: flex-start;
      
      &.message-self {
        flex-direction: row-reverse;
        
        .message-content {
          align-items: flex-end;
          
          .message-text {
            background: $primary;
            color: white;
            border-radius: 16px 16px 4px 16px;
          }

          .message-header {
            flex-direction: row-reverse;
          }

          .sender-name {
            text-align: right;
          }
        }
      }
      
      .avatar {
        width: 36px;
        height: 36px;
        flex-shrink: 0;
        
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
        max-width: 70%;
        
        .message-header {
          display: flex;
          align-items: center;
          gap: $spacing-sm;
          
          .sender-name {
            font-size: 0.85em;
            color: var(--text-secondary);
          }
        }
        
        .message-text {
          background: var(--hover-bg);
          padding: $spacing-sm $spacing-md;
          border-radius: 16px 16px 16px 4px;
          color: var(--text-primary);
          word-break: break-word;
          
          :deep(mention) {
            color: rgb(84, 214, 231);
            font-weight: 500;
            cursor: pointer;
            
            &:hover {
              text-decoration: underline;
            }
          }
        }
        
        .message-time {
          font-size: 0.8em;
          color: var(--text-secondary);
          margin-top: 2px;
        }
      }
    }
  }

  .chat-input {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: $spacing-md;
    border-top: 1px solid var(--border-color);
    background: var(--card-bg);
    display: flex;
    gap: $spacing-md;
    z-index: 10;
    
    @media screen and (max-width: 768px) {
      position: fixed; // 固定定位
      left: 80px; // 与左侧导航栏对齐
    }

    .input-toolbar {
      display: flex;
      gap: $spacing-sm;
      align-items: center;
      
      :deep(.emoji-picker i){
        color: #f1c40f !important;
      }
      .image-upload-btn{
        color: $primary  ;
      }
      .toolbar-btn {
        padding: $spacing-sm;
        border: none;
        background: none;
        cursor: pointer;
        border-radius: 4px;
        
        &:hover {
          background: var(--hover-bg);
          color: $primary;
        }
      }
    }
    .input-area {
      flex: 1;
      display: flex;
      gap: $spacing-sm;
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
}

.message-text {
  background: var(--hover-bg);
  padding: $spacing-sm $spacing-md;
  border-radius: 12px 12px 12px 4px;
  color: var(--text-primary);
  max-width: 600px;
  
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

// 添加遮罩层样式
.mobile-overlay {
  display: none;
  
  @media screen and (max-width: 768px) {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 140;
  }
}

.friend-details {
  padding: $spacing-lg;
  border-radius: 12px;
  margin: $spacing-lg auto;
  max-width: 600px;
  text-align: center;

  h3 {
    font-size: 1.5em;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: $spacing-md;
  }

  .signature, .gender {
    font-size: 1em;
    color: var(--text-secondary);
    margin-bottom: $spacing-md;
  }
  

}
</style> 