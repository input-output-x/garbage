const api = require('../../utils/api');

Page({
  data: { list: [] },

  onShow() {
    this.load();
  },

  async load() {
    try {
      await getApp().login();
      const list = await api.getAddresses();
      this.setData({ list });
    } catch (e) {
      wx.showToast({ title: e.message, icon: 'none' });
    }
  },

  add() {
    wx.navigateTo({ url: '/pages/address/edit' });
  },

  edit(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/address/edit?id=${id}` });
  },

  async setDefault(e) {
    const id = e.currentTarget.dataset.id;
    try {
      await api.setDefaultAddress(id);
      wx.showToast({ title: '已设为默认' });
      this.load();
    } catch (err) {
      wx.showToast({ title: err.message, icon: 'none' });
    }
  },

  deleteAddr(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除地址',
      content: '确定删除该地址？',
      confirmColor: '#FF8A00',
      success: async (res) => {
        if (!res.confirm) return;
        try {
          await api.deleteAddress(id);
          this.load();
        } catch (err) {
          wx.showToast({ title: err.message, icon: 'none' });
        }
      },
    });
  },
});
