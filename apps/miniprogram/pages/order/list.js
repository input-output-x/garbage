const api = require('../../utils/api');

const STATUS_MAP = {
  pending_payment: '待支付',
  paid: '待派单',
  assigned: '已派单',
  picked_up: '已取袋',
  disposed: '已投放',
  completed: '已完成',
  cancelled: '已取消',
};

const TYPE_MAP = {
  kitchen: '餐厨垃圾',
  other: '其他垃圾',
  bulky: '大件垃圾',
  recyclable: '可回收物',
};

Page({
  data: {
    orders: [],
    tab: 'all',
    tabs: [
      { key: 'all', label: '全部' },
      { key: 'ongoing', label: '进行中' },
      { key: 'done', label: '已完成' },
    ],
    statusMap: STATUS_MAP,
    typeMap: TYPE_MAP,
  },

  onShow() {
    this.load();
  },

  switchTab(e) {
    this.setData({ tab: e.currentTarget.dataset.tab });
    this.load();
  },

  async load() {
    try {
      await getApp().login();
      const user = getApp().globalData.user;
      const result = await api.getOrders({
        userId: user.id,
        tab: this.data.tab === 'all' ? '' : this.data.tab,
      });
      this.setData({ orders: result.items || [] });
    } catch (e) {
      wx.showToast({ title: e.message, icon: 'none' });
    }
  },

  goDetail(e) {
    wx.navigateTo({ url: `/pages/order/detail?id=${e.currentTarget.dataset.id}` });
  },

  goOrder() {
    wx.switchTab({ url: '/pages/index/index' });
  },
});
