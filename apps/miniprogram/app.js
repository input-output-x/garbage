const { API_BASE } = require('./utils/config');

App({
  globalData: {
    token: '',
    user: null,
    selectedCommunity: null,
  },

  onLaunch() {
    const token = wx.getStorageSync('token');
    if (token) {
      this.globalData.token = token;
    }
  },

  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: ({ code }) => {
          wx.request({
            url: `${API_BASE}/auth/wx/login`,
            method: 'POST',
            data: { code },
            success: (res) => {
              if (res.data?.code === 0) {
                const { token, user } = res.data.data;
                this.globalData.token = token;
                this.globalData.user = user;
                wx.setStorageSync('token', token);
                resolve({ token, user });
              } else {
                reject(new Error(res.data?.message || '登录失败'));
              }
            },
            fail: reject,
          });
        },
        fail: reject,
      });
    });
  },
});
