const api = require('../../utils/api');

Page({
  data: {
    id: '',
    communityId: '',
    communityName: '',
    building: '',
    unit: '',
    room: '',
    contactName: '',
    contactPhone: '',
    isDefault: false,
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id });
      wx.setNavigationBarTitle({ title: '编辑地址' });
      this.loadAddress(options.id);
    }
  },

  async loadAddress(id) {
    const list = await api.getAddresses();
    const addr = list.find((a) => a.id === id);
    if (addr) {
      this.setData({
        communityId: addr.communityId,
        communityName: addr.communityName,
        building: addr.building,
        unit: addr.unit === '-' ? '' : addr.unit,
        room: addr.room,
        contactName: addr.contactName,
        contactPhone: addr.contactPhone,
        isDefault: addr.isDefault,
      });
    }
  },

  selectCommunity() {
    wx.navigateTo({ url: '/pages/community/select?from=address' });
  },

  onInput(e) {
    this.setData({ [e.currentTarget.dataset.field]: e.detail.value });
  },

  onDefaultChange(e) {
    this.setData({ isDefault: e.detail.value });
  },

  async save() {
    const d = this.data;
    if (!d.communityId || !d.building || !d.room || !d.contactName || !d.contactPhone) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    const payload = {
      communityId: d.communityId,
      building: d.building,
      unit: d.unit || '-',
      room: d.room,
      contactName: d.contactName,
      contactPhone: d.contactPhone,
      isDefault: d.isDefault,
    };
    wx.showLoading({ title: '保存中' });
    try {
      if (d.id) {
        await api.updateAddress(d.id, payload);
      } else {
        await api.createAddress(payload);
      }
      wx.hideLoading();
      wx.navigateBack();
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message, icon: 'none' });
    }
  },
});
