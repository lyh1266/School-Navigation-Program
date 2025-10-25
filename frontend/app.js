// app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          // 可以将 res.code 发送给后台，再经过解析获取用户的 openId
          this.globalData.code = res.code
          this.getUserInfo()
        } else {
          console.log('登录失败：' + res.errMsg)
        }
      }
    })
  },

  getUserInfo: function() {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },

  // 全局变量
  globalData: {
    userInfo: null,
    userId: null,
    code: null,
    buildingId: 'building123', // 默认建筑ID
    serverUrl: 'https://example.com/api', // 云函数接口地址
    currentLocation: null,
    destination: null,
    navigationPath: null,
    navigationInstructions: null,
    settings: {
      voiceVolume: 80,
      wakeWord: '小导小导',
      favoriteDestinations: []
    }
  }
})
