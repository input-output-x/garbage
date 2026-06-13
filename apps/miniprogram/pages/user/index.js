Page({
  data: { user: null, memberId: '', days: 1 },

  onShow() {
    const app = getApp();
    const user = app.globalData.user;
    if (user) {
      const joinDate = user.createdAt || wx.getStorageSync('joinDate');
      const days = joinDate
        ? Math.max(1, Math.ceil((Date.now() - new Date(joinDate).getTime()) / 86400000))
        : 1;
      this.setData({
        user,
        memberId: user.memberId || wx.getStorageSync('memberId'),
        days,
      });
    } else {
      this.setData({ user: null });
    }
  },

  async onProfileTap() {
    if (this.data.user) return;
    try {
      const { user } = await getApp().login();
      if (user.createdAt) wx.setStorageSync('joinDate', user.createdAt);
      if (user.memberId) wx.setStorageSync('memberId', user.memberId);
      this.setData({ user, memberId: user.memberId, days: 1 });
      wx.showToast({ title: '登录成功' });
    } catch (e) {
      wx.showToast({ title: e.message || '登录失败', icon: 'none' });
    }
  },

  openVip() {
    wx.navigateTo({ url: '/pages/package/list' });
  },

  goAddress() {
    wx.navigateTo({ url: '/pages/address/list' });
  },

  goFeedback() {
    wx.navigateTo({ url: '/pages/feedback/index' });
  },

  goAbout() {
    wx.showModal({
      title: '关于丢呗',
      content: '丢呗是一款上门代扔垃圾服务小程序，帮助忙碌的您轻松处理日常垃圾投放。用户需自行完成垃圾分类。',
      showCancel: false,
      confirmColor: '#FF8A00',
    });
  },

  contactService() {
    wx.makePhoneCall({ phoneNumber: '4000000000' });
  },
});
