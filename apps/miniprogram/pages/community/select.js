const api = require('../../utils/api');

Page({
  data: { list: [], loading: true, from: '' },

  onLoad(options) {
    this.setData({ from: options.from || '' });
  },

  onShow() {
    this.load();
  },

  async load() {
    try {
      const list = await api.getCommunities();
      this.setData({ list, loading: false });
    } catch (e) {
      wx.showToast({ title: e.message, icon: 'none' });
      this.setData({ loading: false });
    }
  },

  select(e) {
    const item = e.currentTarget.dataset.item;
    if (this.data.from === 'address') {
      const pages = getCurrentPages();
      const prev = pages[pages.length - 2];
      if (prev) {
        prev.setData({ communityId: item.id, communityName: item.name });
      }
      wx.navigateBack();
      return;
    }
    const app = getApp();
    app.globalData.selectedCommunity = item;
    wx.setStorageSync('selectedCommunity', item);
    wx.navigateBack();
  },
});
