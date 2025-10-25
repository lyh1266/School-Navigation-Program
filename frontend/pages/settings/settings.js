// settings.js
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    voiceVolume: 80,
    wakeWord: '小导小导',
    wakeWordOptions: ['小导小导', '导航导航', '你好导航'],
    showWakeWordPicker: false,
    favoriteDestinations: [],
    navigationHistory: []
  },

  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
    
    // 加载用户设置
    this.loadUserSettings()
    
    // 获取收藏的目的地
    this.getFavoriteDestinations()
    
    // 获取导航历史
    this.getNavigationHistory()
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
  
  // 加载用户设置
  loadUserSettings() {
    // 从全局数据或本地存储获取设置
    const settings = app.globalData.settings || {}
    
    this.setData({
      voiceVolume: settings.voiceVolume || 80,
      wakeWord: settings.wakeWord || '小导小导'
    })
  },
  
  // 获取收藏的目的地
  getFavoriteDestinations() {
    // 调用云函数获取收藏的目的地
    wx.cloud.callFunction({
      name: 'getFavoriteDestinations',
      data: {
        user_id: app.globalData.userId || 'user123',
        operation: 'list'
      },
      success: (res) => {
        console.log('收藏的目的地', res.result)
        
        if (res.result && res.result.favorites) {
          this.setData({
            favoriteDestinations: res.result.favorites
          })
        }
      },
      fail: (err) => {
        console.error('获取收藏的目的地失败', err)
        
        // 使用模拟数据（实际项目中应删除）
        this.setData({
          favoriteDestinations: [
            { id: '1', node_id: '302', name: '302教室', custom_name: '我的教室' },
            { id: '2', node_id: '501', name: '501实验室', custom_name: '实验室' }
          ]
        })
      }
    })
  },
  
  // 获取导航历史
  getNavigationHistory() {
    // 调用云函数获取导航历史
    wx.cloud.callFunction({
      name: 'getNavigationHistory',
      data: {
        user_id: app.globalData.userId || 'user123',
        limit: 10
      },
      success: (res) => {
        console.log('导航历史', res.result)
        
        if (res.result && res.result.history) {
          this.setData({
            navigationHistory: res.result.history
          })
        }
      },
      fail: (err) => {
        console.error('获取导航历史失败', err)
        
        // 使用模拟数据（实际项目中应删除）
        this.setData({
          navigationHistory: [
            { 
              id: '1', 
              start_node_id: '1hall', 
              end_node_id: '302',
              start_time: '2023-10-25T10:30:00',
              end_time: '2023-10-25T10:35:00',
              start_name: '1楼大厅',
              end_name: '302教室'
            },
            { 
              id: '2', 
              start_node_id: '302', 
              end_node_id: '1hall',
              start_time: '2023-10-25T12:00:00',
              end_time: '2023-10-25T12:05:00',
              start_name: '302教室',
              end_name: '1楼大厅'
            },
            { 
              id: '3', 
              start_node_id: '1hall', 
              end_node_id: '403',
              start_time: '2023-10-24T14:20:00',
              end_time: '2023-10-24T14:25:00',
              start_name: '1楼大厅',
              end_name: '403办公室'
            }
          ]
        })
      }
    })
  },
  
  // 音量滑块变化
  onVolumeChange(e) {
    const volume = e.detail.value
    this.setData({
      voiceVolume: volume
    })
    
    // 更新全局设置
    app.globalData.settings.voiceVolume = volume
    
    // 保存设置到服务器
    this.saveUserSettings()
  },
  
  // 显示唤醒词选择器
  showWakeWordPicker() {
    this.setData({
      showWakeWordPicker: true
    })
  },
  
  // 唤醒词选择器取消
  onWakeWordPickerCancel() {
    this.setData({
      showWakeWordPicker: false
    })
  },
  
  // 唤醒词选择器确认
  onWakeWordPickerConfirm(e) {
    const index = e.detail.value
    const wakeWord = this.data.wakeWordOptions[index]
    
    this.setData({
      wakeWord: wakeWord,
      showWakeWordPicker: false
    })
    
    // 更新全局设置
    app.globalData.settings.wakeWord = wakeWord
    
    // 保存设置到服务器
    this.saveUserSettings()
  },
  
  // 保存用户设置
  saveUserSettings() {
    // 调用云函数保存用户设置
    wx.cloud.callFunction({
      name: 'updateUserSettings',
      data: {
        user_id: app.globalData.userId || 'user123',
        settings: {
          voice_volume: this.data.voiceVolume,
          wake_word: this.data.wakeWord
        }
      },
      success: (res) => {
        console.log('保存用户设置成功', res.result)
      },
      fail: (err) => {
        console.error('保存用户设置失败', err)
      }
    })
  },
  
  // 删除收藏的目的地
  deleteFavorite(e) {
    const { id } = e.currentTarget.dataset
    
    wx.showModal({
      title: '删除收藏',
      content: '确定要删除这个收藏的目的地吗？',
      success: (res) => {
        if (res.confirm) {
          // 调用云函数删除收藏
          wx.cloud.callFunction({
            name: 'deleteFavoriteDestination',
            data: {
              user_id: app.globalData.userId || 'user123',
              favorite_id: id
            },
            success: (res) => {
              console.log('删除收藏成功', res.result)
              
              // 更新收藏列表
              this.getFavoriteDestinations()
              
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })
            },
            fail: (err) => {
              console.error('删除收藏失败', err)
              wx.showToast({
                title: '删除失败',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },
  
  // 清空导航历史
  clearHistory() {
    wx.showModal({
      title: '清空历史',
      content: '确定要清空所有导航历史吗？',
      success: (res) => {
        if (res.confirm) {
          // 调用云函数清空历史
          wx.cloud.callFunction({
            name: 'clearNavigationHistory',
            data: {
              user_id: app.globalData.userId || 'user123'
            },
            success: (res) => {
              console.log('清空历史成功', res.result)
              
              // 更新历史列表
              this.setData({
                navigationHistory: []
              })
              
              wx.showToast({
                title: '已清空',
                icon: 'success'
              })
            },
            fail: (err) => {
              console.error('清空历史失败', err)
              wx.showToast({
                title: '操作失败',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },
  
  // 关于我们
  showAbout() {
    wx.showModal({
      title: '关于室内导航',
      content: '室内导航系统 v1.0.0\n为您提供精准的室内导航服务',
      showCancel: false
    })
  },
  
  // 反馈建议
  showFeedback() {
    wx.showModal({
      title: '反馈建议',
      content: '如有问题或建议，请联系我们：\ncontact@example.com',
      showCancel: false
    })
  }
})
