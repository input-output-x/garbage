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

const STATUS_ICON = {
  pending_payment: '💳',
  paid: '⏳',
  assigned: '🚴',
  picked_up: '📦',
  disposed: '✅',
  completed: '🎉',
  cancelled: '❌',
};

const TYPE_MAP = {
  kitchen: '餐厨垃圾',
  other: '其他垃圾',
  bulky: '大件垃圾',
  recyclable: '可回收物',
};

Page({
  data: {
    order: null,
    statusMap: STATUS_MAP,
    statusIcon: '⏳',
    typeMap: TYPE_MAP,
    showReview: false,
    rating: 5,
    reviewText: '非常满意',
  },

  onLoad(options) {
    this.orderId = options.id;
    this.load();
  },

  async load() {
    try {
      const order = await api.getOrder(this.orderId);
      this.setData({
        order,
        statusIcon: STATUS_ICON[order.status] || '⏳',
        showReview: order.status === 'completed' && !order.rating,
      });
    } catch (e) {
      wx.showToast({ title: e.message, icon: 'none' });
    }
  },

  onRatingChange(e) {
    this.setData({ rating: Number(e.currentTarget.dataset.star) });
  },

  onReviewInput(e) {
    this.setData({ reviewText: e.detail.value });
  },

  async submitReview() {
    try {
      await api.reviewOrder(this.orderId, {
        rating: this.data.rating,
        content: this.data.reviewText,
      });
      wx.showToast({ title: '评价成功' });
      this.load();
    } catch (e) {
      wx.showToast({ title: e.message, icon: 'none' });
    }
  },

  goOrders() {
    wx.switchTab({ url: '/pages/order/list' });
  },
});
