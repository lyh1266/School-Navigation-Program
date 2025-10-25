// destination.js
const app = getApp()

Page({
  data: {
    floors: [],
    selectedFloor: 1,
    rooms: [],
    filteredRooms: [],
    searchText: '',
    favoriteDestinations: [],
    recentDestinations: [],
    isRecording: false,
    recordingTips: '按住说话',
    voiceInputResult: '',
    isProcessingVoice: false,
    currentLocation: '1楼大厅' // 默认当前位置
  },

  onLoad() {
    // 初始化楼层和房间数据
    this.initFloorAndRoomData()
    
    // 获取收藏的目的地
    this.getFavoriteDestinations()
    
    // 获取最近的导航历史
    this.getRecentDestinations()
    
    // 初始化录音管理器
    this.recorderManager = wx.getRecorderManager()
    this.recorderManager.onStop((res) => {
      if (this.data.isProcessingVoice) return
      
      this.setData({
        isProcessingVoice: true
      })
      
      const { tempFilePath } = res
      
      // 读取录音文件为 base64
      wx.getFileSystemManager().readFile({
        filePath: tempFilePath,
        encoding: 'base64',
        success: (res) => {
          // 发送到语音识别服务
          this.processVoiceCommand(res.data)
        },
        fail: (err) => {
          console.error('读取录音文件失败', err)
          this.setData({
            isProcessingVoice: false
          })
          wx.showToast({
            title: '语音识别失败',
            icon: 'none'
          })
        }
      })
    })
  },
  
  onShow() {
    // 每次页面显示时重置状态
    this.setData({
      voiceInputResult: ''
    })
  },
  
  // 初始化楼层和房间数据
  initFloorAndRoomData() {
    // 模拟数据，实际应从服务器获取
    const floors = [
      { floor: 1, name: '1楼' },
      { floor: 2, name: '2楼' },
      { floor: 3, name: '3楼' },
      { floor: 4, name: '4楼' },
      { floor: 5, name: '5楼' }
    ]
    
    const rooms = [
      { id: '101', name: '101教室', floor: 1, type: '教室' },
      { id: '102', name: '102教室', floor: 1, type: '教室' },
      { id: '103', name: '103实验室', floor: 1, type: '实验室' },
      { id: '1hall', name: '1楼大厅', floor: 1, type: '大厅' },
      { id: '1wc', name: '1楼洗手间', floor: 1, type: '洗手间' },
      
      { id: '201', name: '201教室', floor: 2, type: '教室' },
      { id: '202', name: '202教室', floor: 2, type: '教室' },
      { id: '203', name: '203会议室', floor: 2, type: '会议室' },
      { id: '2wc', name: '2楼洗手间', floor: 2, type: '洗手间' },
      
      { id: '301', name: '301教室', floor: 3, type: '教室' },
      { id: '302', name: '302教室', floor: 3, type: '教室' },
      { id: '303', name: '303教室', floor: 3, type: '教室' },
      { id: '304', name: '304实验室', floor: 3, type: '实验室' },
      { id: '3wc', name: '3楼洗手间', floor: 3, type: '洗手间' },
      
      { id: '401', name: '401教室', floor: 4, type: '教室' },
      { id: '402', name: '402教室', floor: 4, type: '教室' },
      { id: '403', name: '403办公室', floor: 4, type: '办公室' },
      { id: '4wc', name: '4楼洗手间', floor: 4, type: '洗手间' },
      
      { id: '501', name: '501实验室', floor: 5, type: '实验室' },
      { id: '502', name: '502实验室', floor: 5, type: '实验室' },
      { id: '503', name: '503会议室', floor: 5, type: '会议室' },
      { id: '5wc', name: '5楼洗手间', floor: 5, type: '洗手间' }
    ]
    
    this.setData({
      floors: floors,
      rooms: rooms,
      filteredRooms: this.filterRoomsByFloor(rooms, 1)
    })
  },
  
  // 根据楼层筛选房间
  filterRoomsByFloor(rooms, floor) {
    return rooms.filter(room => room.floor === floor)
  },
  
  // 楼层切换
  onFloorChange(e) {
    const floor = parseInt(e.currentTarget.dataset.floor)
    this.setData({
      selectedFloor: floor,
      filteredRooms: this.filterRoomsByFloor(this.data.rooms, floor)
    })
  },
  
  // 搜索框输入
  onSearchInput(e) {
    const searchText = e.detail.value.toLowerCase()
    this.setData({
      searchText: searchText
    })
    
    if (searchText) {
      // 搜索所有楼层
      const filtered = this.data.rooms.filter(room => 
        room.name.toLowerCase().includes(searchText) ||
        room.id.toLowerCase().includes(searchText) ||
        room.type.toLowerCase().includes(searchText)
      )
      this.setData({
        filteredRooms: filtered
      })
    } else {
      // 恢复当前楼层的显示
      this.setData({
        filteredRooms: this.filterRoomsByFloor(this.data.rooms, this.data.selectedFloor)
      })
    }
  },
  
  // 获取收藏的目的地
  getFavoriteDestinations() {
    // 实际应从服务器或本地存储获取
    const favorites = [
      { id: '302', name: '302教室', floor: 3, type: '教室', custom_name: '我的教室' },
      { id: '501', name: '501实验室', floor: 5, type: '实验室', custom_name: '实验室' }
    ]
    
    this.setData({
      favoriteDestinations: favorites
    })
  },
  
  // 获取最近的导航历史
  getRecentDestinations() {
    // 实际应从服务器或本地存储获取
    const recents = [
      { id: '302', name: '302教室', floor: 3, type: '教室', time: '今天 10:30' },
      { id: '1hall', name: '1楼大厅', floor: 1, type: '大厅', time: '今天 09:15' },
      { id: '403', name: '403办公室', floor: 4, type: '办公室', time: '昨天 14:20' }
    ]
    
    this.setData({
      recentDestinations: recents
    })
  },
  
  // 选择目的地
  selectDestination(e) {
    const { id, name } = e.currentTarget.dataset
    
    // 保存目的地信息
    app.globalData.destination = name
    app.globalData.currentLocation = this.data.currentLocation
    
    // 跳转到导航页面
    wx.navigateTo({
      url: '/pages/navigation/navigation'
    })
  },
  
  // 收藏目的地
  toggleFavorite(e) {
    const { id } = e.currentTarget.dataset
    
    // 实际应调用服务器 API 进行收藏/取消收藏操作
    wx.showToast({
      title: '收藏成功',
      icon: 'success'
    })
  },
  
  // 开始录音
  startRecording() {
    this.setData({
      isRecording: true,
      recordingTips: '松开结束'
    })
    
    this.recorderManager.start({
      duration: 60000, // 最长录音时间，单位 ms
      sampleRate: 16000, // 采样率
      numberOfChannels: 1, // 录音通道数
      encodeBitRate: 96000, // 编码码率
      format: 'wav' // 音频格式
    })
  },
  
  // 结束录音
  stopRecording() {
    this.setData({
      isRecording: false,
      recordingTips: '按住说话'
    })
    
    this.recorderManager.stop()
  },
  
  // 处理语音命令
  processVoiceCommand(audioData) {
    wx.showLoading({
      title: '正在识别...',
    })
    
    // 调用云函数进行语音识别
    wx.cloud.callFunction({
      name: 'speechToText',
      data: {
        audio_data: audioData,
        format: 'wav',
        sample_rate: 16000
      },
      success: (res) => {
        console.log('语音识别结果', res.result)
        
        if (res.result && res.result.text) {
          const recognizedText = res.result.text
          
          this.setData({
            voiceInputResult: recognizedText
          })
          
          // 处理为导航指令
          this.handleNavigationCommand(recognizedText)
        } else {
          wx.showToast({
            title: '未能识别语音',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('语音识别失败', err)
        wx.showToast({
          title: '语音识别失败',
          icon: 'none'
        })
      },
      complete: () => {
        wx.hideLoading()
        this.setData({
          isProcessingVoice: false
        })
      }
    })
  },
  
  // 处理导航指令
  handleNavigationCommand(command) {
    console.log('导航指令:', command)
    
    // 调用云函数解析导航指令
    wx.cloud.callFunction({
      name: 'parseInstruction',
      data: {
        text: command
      },
      success: (res) => {
        console.log('指令解析结果', res.result)
        
        if (res.result && res.result.command_type === 'navigate' && res.result.destination) {
          // 保存目的地信息
          app.globalData.destination = res.result.destination
          app.globalData.currentLocation = this.data.currentLocation
          
          // 播放确认提示
          this.playTextToSpeech(`好的，正在为您导航到${res.result.destination}`)
          
          // 跳转到导航页面
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/navigation/navigation'
            })
          }, 1500)
        } else {
          // 无法识别为导航指令
          this.playTextToSpeech('抱歉，我没有听清您要去哪里，请再说一次')
        }
      },
      fail: (err) => {
        console.error('指令解析失败', err)
        wx.showToast({
          title: '无法理解您的指令',
          icon: 'none'
        })
      }
    })
  },
  
  // 文字转语音
  playTextToSpeech(text) {
    wx.cloud.callFunction({
      name: 'textToSpeech',
      data: {
        text: text,
        voice_id: '0',
        output_format: 'mp3'
      },
      success: (res) => {
        if (res.result && res.result.audio_data) {
          // 将 base64 音频数据转换为临时文件
          const fsm = wx.getFileSystemManager()
          const filePath = `${wx.env.USER_DATA_PATH}/tts_output.mp3`
          
          fsm.writeFile({
            filePath: filePath,
            data: res.result.audio_data,
            encoding: 'base64',
            success: () => {
              // 播放合成的语音
              const innerAudioContext = wx.createInnerAudioContext()
              innerAudioContext.src = filePath
              innerAudioContext.play()
            },
            fail: (err) => {
              console.error('写入音频文件失败', err)
            }
          })
        }
      },
      fail: (err) => {
        console.error('语音合成失败', err)
      }
    })
  },
  
  // 触摸开始事件
  touchStart() {
    this.startRecording()
  },
  
  // 触摸结束事件
  touchEnd() {
    this.stopRecording()
  },
  
  // 触摸取消事件（手指划出按钮区域）
  touchCancel() {
    if (this.data.isRecording) {
      this.stopRecording()
      
      wx.showToast({
        title: '录音已取消',
        icon: 'none'
      })
    }
  }
})
