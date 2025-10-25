// index.js
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    isListening: false,
    isWakeWordDetected: false,
    animationData: {},
    buildingName: '教学楼',
    isRecording: false,
    recordingTips: '按住说话',
    voiceInputResult: '',
    isProcessingVoice: false
  },

  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
    
    // 创建动画实例
    this.animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })
    
    // 获取建筑信息
    this.getBuildingInfo()
    
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
      isListening: false,
      isWakeWordDetected: false,
      voiceInputResult: ''
    })
  },
  
  // 获取用户信息
  getUserProfile(e) {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        app.globalData.userInfo = res.userInfo
      }
    })
  },
  
  // 获取建筑信息
  getBuildingInfo() {
    // 这里可以调用后端 API 获取建筑信息
    // 示例中使用默认值
    this.setData({
      buildingName: '计算机科学与技术学院教学楼'
    })
  },
  
  // 开始导航按钮点击
  startNavigation() {
    wx.navigateTo({
      url: '/pages/destination/destination'
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
          
          // 检查是否包含唤醒词
          const wakeWord = app.globalData.settings.wakeWord || '小导小导'
          if (recognizedText.includes(wakeWord)) {
            this.handleWakeWordDetected(recognizedText)
          } else {
            // 直接处理为导航指令
            this.handleNavigationCommand(recognizedText)
          }
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
  
  // 处理唤醒词检测
  handleWakeWordDetected(text) {
    // 播放唤醒成功的提示音
    const innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.src = '/assets/audio/wake_word_detected.mp3'
    innerAudioContext.play()
    
    this.setData({
      isWakeWordDetected: true
    })
    
    // 提取唤醒词之后的内容作为导航指令
    const wakeWord = app.globalData.settings.wakeWord || '小导小导'
    const commandText = text.split(wakeWord)[1] || ''
    
    if (commandText.trim()) {
      // 如果有指令内容，直接处理
      this.handleNavigationCommand(commandText)
    } else {
      // 否则等待用户进一步输入
      wx.showToast({
        title: '我在听，请说出您要去的地方',
        icon: 'none',
        duration: 2000
      })
      
      // 短暂延迟后自动开始新一轮录音
      setTimeout(() => {
        if (this.data.isWakeWordDetected && !this.data.isRecording) {
          this.startRecording()
          
          // 5秒后如果还在录音，自动结束
          setTimeout(() => {
            if (this.data.isRecording) {
              this.stopRecording()
            }
          }, 5000)
        }
      }, 2000)
    }
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
