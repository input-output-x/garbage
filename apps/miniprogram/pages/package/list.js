const api = require('../../utils/api');

Page({
  data: { plans: [], loading: true },

  onShow() {
    this.load();
  },

  async load() {
    this.setData({ loading: true });
    try {
      const plans = await api.getPackagePlans();
      this.setData({ plans, loading: false });
    } catch (e) {
      this.setData({ loading: false });
      wx.showToast({ title: e.message, icon: 'none' });
    }
  },

  async buy(e) {
    const plan = e.currentTarget.dataset.plan;
    try {
      await getApp().login();
    } catch (err) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    wx.showModal({
      title: `购买${plan.name}`,
      content: `¥${plan.price} · ${plan.description}\n（开发环境模拟支付）`,
      confirmColor: '#FF8A00',
      success: async (res) => {
        if (!res.confirm) return;
        wx.showLoading({ title: '购买中' });
        try {
          await api.purchasePackage(plan.id);
          wx.hideLoading();
          wx.showToast({ title: '购买成功' });
          setTimeout(() => wx.navigateBack(), 1500);
        } catch (err) {
          wx.hideLoading();
          wx.showToast({ title: err.message, icon: 'none' });
        }
      },
    });
  },
});
