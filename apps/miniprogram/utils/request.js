const { API_BASE } = require('./config');

function request(options) {
  const app = getApp();
  const token = app.globalData.token || wx.getStorageSync('token');

  return new Promise((resolve, reject) => {
    wx.request({
      ...options,
      url: options.url.startsWith('http') ? options.url : `${API_BASE}${options.url}`,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.header,
      },
      success(res) {
        if (res.data?.code === 0) {
          resolve(res.data.data);
        } else {
          reject(new Error(res.data?.message || '请求失败'));
        }
      },
      fail: reject,
    });
  });
}

module.exports = { request };
