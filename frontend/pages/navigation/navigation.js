// navigation.js
const app = getApp()

Page({
  data: {
    currentLocation: '',
    destination: '',
    instructions: [],
    currentInstructionIndex: 0,
    estimatedTime: 0,
    congestionInfo: {},
    is3DReady: false,
    isNavigating: true,
    isPlayingVoice: false,
    autoPlayVoice: true,
    showCongestionAlert: false,
    congestionAlertText: '',
    accelerometerEnabled: true,
    lastAccelerometerUpload: 0
  },

  onLoad(options) {
    // 获取目的地和当前位置信息
    this.setData({
      currentLocation: app.globalData.currentLocation || '1楼大厅',
      destination: app.globalData.destination || '目的地未设置'
    })
    
    // 初始化 3D 渲染环境
    this.init3DEnvironment()
    
    // 获取导航路径
    this.getNavigationPath()
    
    // 启动加速度计数据收集
    if (this.data.accelerometerEnabled) {
      this.startAccelerometerCollection()
    }
  },
  
  onUnload() {
    // 停止加速度计数据收集
    if (this.data.accelerometerEnabled) {
      this.stopAccelerometerCollection()
    }
    
    // 停止语音播放
    if (this.innerAudioContext) {
      this.innerAudioContext.stop()
    }
  },
  
  // 初始化 3D 渲染环境
  init3DEnvironment() {
    // 获取 canvas 上下文
    const query = wx.createSelectorQuery()
    query.select('#navigation-canvas')
      .node()
      .exec((res) => {
        const canvas = res[0].node
        
        // 初始化 three.js
        if (canvas) {
          console.log('Canvas 准备就绪，初始化 3D 环境')
          
          // 实际项目中，这里会初始化 three.js 并加载 3D 模型
          // 由于微信小程序的限制，这里只是模拟 3D 环境准备就绪
          
          setTimeout(() => {
            this.setData({
              is3DReady: true
            })
          }, 1000)
        }
      })
  },
  
  // 获取导航路径
  getNavigationPath() {
    wx.showLoading({
      title: '路径计算中...',
    })
    
    // 调用云函数获取导航路径
    wx.cloud.callFunction({
      name: 'getNavigationPath',
      data: {
        user_id: app.globalData.userId || 'user123',
        current_location: this.data.currentLocation,
        destination: this.data.destination,
        building_id: app.globalData.buildingId
      },
      success: (res) => {
        console.log('导航路径结果', res.result)
        
        if (res.result && res.result.instructions) {
          // 更新导航指令和路径
          this.setData({
            instructions: res.result.instructions,
            estimatedTime: res.result.estimated_time || 120,
            congestionInfo: res.result.congestion_info || {}
          })
          
          // 渲染 3D 路径
          if (res.result.path_3d) {
            this.render3DPath(res.result.path_3d, res.result.path_segments)
          }
          
          // 播放第一条导航指令
          if (this.data.autoPlayVoice) {
            this.playInstructionVoice(0)
          }
        } else {
          wx.showToast({
            title: '获取导航路径失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('获取导航路径失败', err)
        wx.showToast({
          title: '获取导航路径失败',
          icon: 'none'
        })
        
        // 使用模拟数据（实际项目中应删除）
        this.useSimulatedData()
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },
  
  // 使用模拟数据（实际项目中应删除）
  useSimulatedData() {
    const simulatedInstructions = [
      '从当前位置向东走5.0米',
      '向北走10.0米，然后上楼梯到2楼',
      '在2楼向西走15.0米',
      '向北走8.0米到达目的地'
    ]
    
    const simulatedCongestion = {
      'segment1': '通畅',
      'segment2': '轻微拥堵',
      'segment3': '通畅'
    }
    
    this.setData({
      instructions: simulatedInstructions,
      estimatedTime: 120,
      congestionInfo: simulatedCongestion
    })
    
    // 播放第一条导航指令
    if (this.data.autoPlayVoice) {
      this.playInstructionVoice(0)
    }
  },
  
  // 渲染 3D 路径
  render3DPath(path3D, pathSegments) {
    // 实际项目中，这里会使用 three.js 渲染 3D 路径
    console.log('渲染 3D 路径', path3D.length, '个点')
    
    // 检查路径中是否有拥堵路段
    if (pathSegments) {
      for (const segment of pathSegments) {
        const segmentId = segment.start_node_id + '_' + segment.end_node_id
        const congestionStatus = this.data.congestionInfo[segmentId]
        
        if (congestionStatus && (congestionStatus === '拥堵' || congestionStatus === '严重拥堵')) {
          this.setData({
            showCongestionAlert: true,
            congestionAlertText: `前方${congestionStatus}，已为您重新规划路线`
          })
          
          // 3 秒后隐藏提示
          setTimeout(() => {
            this.setData({
              showCongestionAlert: false
            })
          }, 3000)
          
          break
        }
      }
    }
  },
  
  // 播放导航指令语音
  playInstructionVoice(index) {
    if (index >= this.data.instructions.length) return
    
    const instruction = this.data.instructions[index]
    
    this.setData({
      currentInstructionIndex: index,
      isPlayingVoice: true
    })
    
    // 调用云函数进行文字转语音
    wx.cloud.callFunction({
      name: 'textToSpeech',
      data: {
        text: instruction,
        voice_id: '0',
        output_format: 'mp3'
      },
      success: (res) => {
        if (res.result && res.result.audio_data) {
          // 将 base64 音频数据转换为临时文件
          const fsm = wx.getFileSystemManager()
          const filePath = `${wx.env.USER_DATA_PATH}/nav_instruction_${index}.mp3`
          
          fsm.writeFile({
            filePath: filePath,
            data: res.result.audio_data,
            encoding: 'base64',
            success: () => {
              // 播放合成的语音
              if (this.innerAudioContext) {
                this.innerAudioContext.destroy()
              }
              
              this.innerAudioContext = wx.createInnerAudioContext()
              this.innerAudioContext.src = filePath
              this.innerAudioContext.play()
              
              // 监听播放结束
              this.innerAudioContext.onEnded(() => {
                this.setData({
                  isPlayingVoice: false
                })
              })
            },
            fail: (err) => {
              console.error('写入音频文件失败', err)
              this.setData({
                isPlayingVoice: false
              })
            }
          })
        } else {
          this.setData({
            isPlayingVoice: false
          })
        }
      },
      fail: (err) => {
        console.error('语音合成失败', err)
        this.setData({
          isPlayingVoice: false
        })
      }
    })
  },
  
  // 下一条指令
  nextInstruction() {
    const nextIndex = this.data.currentInstructionIndex + 1
    if (nextIndex < this.data.instructions.length) {
      this.playInstructionVoice(nextIndex)
    } else {
      // 已到达终点
      this.onArrival()
    }
  },
  
  // 上一条指令
  prevInstruction() {
    const prevIndex = this.data.currentInstructionIndex - 1
    if (prevIndex >= 0) {
      this.playInstructionVoice(prevIndex)
    }
  },
  
  // 重播当前指令
  replayInstruction() {
    this.playInstructionVoice(this.data.currentInstructionIndex)
  },
  
  // 到达终点
  onArrival() {
    wx.showModal({
      title: '到达目的地',
      content: `您已到达${this.data.destination}`,
      showCancel: false,
      success: (res) => {
        if (res.confirm) {
          // 返回首页
          wx.switchTab({
            url: '/pages/index/index'
          })
        }
      }
    })
  },
  
  // 取消导航
  cancelNavigation() {
    wx.showModal({
      title: '取消导航',
      content: '确定要取消当前导航吗？',
      success: (res) => {
        if (res.confirm) {
          // 返回首页
          wx.switchTab({
            url: '/pages/index/index'
          })
        }
      }
    })
  },
  
  // 开始收集加速度计数据
  startAccelerometerCollection() {
    // 检查设备是否支持加速度计
    wx.startAccelerometer({
      interval: 'game', // 更新频率: game(20ms), ui(60ms), normal(200ms)
      success: () => {
        console.log('加速度计启动成功')
        
        // 监听加速度计数据
        wx.onAccelerometerChange((res) => {
          // 收集数据并定期上传
          this.collectAccelerometerData(res)
        })
      },
      fail: (err) => {
        console.error('加速度计启动失败', err)
        this.setData({
          accelerometerEnabled: false
        })
      }
    })
    
    // 初始化加速度计数据缓存
    this.accelerometerDataCache = []
  },
  
  // 停止收集加速度计数据
  stopAccelerometerCollection() {
    wx.stopAccelerometer({
      success: () => {
        console.log('加速度计已停止')
      }
    })
    
    // 上传剩余的数据
    if (this.accelerometerDataCache && this.accelerometerDataCache.length > 0) {
      this.uploadAccelerometerData()
    }
  },
  
  // 收集加速度计数据
  collectAccelerometerData(data) {
    // 添加时间戳和位置信息
    const dataPoint = {
      x: data.x,
      y: data.y,
      z: data.z,
      timestamp: Date.now() / 1000,
      location_id: this.getCurrentLocationId()
    }
    
    this.accelerometerDataCache.push(dataPoint)
    
    // 当缓存达到一定大小或距离上次上传超过一定时间时上传数据
    const now = Date.now()
    if (this.accelerometerDataCache.length >= 50 || 
        (now - this.data.lastAccelerometerUpload > 10000 && this.accelerometerDataCache.length > 0)) {
      this.uploadAccelerometerData()
      this.setData({
        lastAccelerometerUpload: now
      })
    }
  },
  
  // 上传加速度计数据
  uploadAccelerometerData() {
    if (!this.accelerometerDataCache || this.accelerometerDataCache.length === 0) return
    
    const dataToUpload = [...this.accelerometerDataCache]
    this.accelerometerDataCache = []
    
    // 调用云函数上传数据
    wx.cloud.callFunction({
      name: 'updateCongestion',
      data: {
        user_id: app.globalData.userId || 'user123',
        building_id: app.globalData.buildingId,
        accelerometer_data: dataToUpload
      },
      success: (res) => {
        console.log('拥堵数据上传成功', res.result)
        
        // 如果返回了更新的拥堵信息，可以更新导航路径
        if (res.result && res.result.updated_locations > 0) {
          // 检查是否需要重新规划路线
          this.checkForRerouting()
        }
      },
      fail: (err) => {
        console.error('拥堵数据上传失败', err)
      }
    })
  },
  
  // 获取当前位置 ID
  getCurrentLocationId() {
    // 实际应用中，这里应该根据当前导航进度返回当前所在的路段 ID
    // 例如 'path_node1_node2'
    
    // 简化处理，使用当前指令索引生成位置 ID
    const index = this.data.currentInstructionIndex
    return `path_segment${index + 1}`
  },
  
  // 检查是否需要重新规划路线
  checkForRerouting() {
    // 实际应用中，这里应该根据最新的拥堵数据判断是否需要重新规划路线
    // 如果需要，则调用 getNavigationPath 重新获取路径
    
    // 简化处理，这里不实现重新规划
  },
  
  // 3D 视图操作：放大
  zoomIn() {
    console.log('放大 3D 视图')
    // 实际项目中，这里会调用 three.js 的缩放功能
  },
  
  // 3D 视图操作：缩小
  zoomOut() {
    console.log('缩小 3D 视图')
    // 实际项目中，这里会调用 three.js 的缩放功能
  },
  
  // 3D 视图操作：旋转
  onTouchMove(e) {
    // 实际项目中，这里会根据触摸事件旋转 3D 模型
    console.log('旋转 3D 视图', e.touches[0])
  }
})
