const api = require('../../utils/api');

const GARBAGE_TYPES = [
  { code: 'kitchen', name: '餐厨垃圾', desc: '3kg/袋 · 已分类', icon: '🥗' },
  { code: 'other', name: '其他垃圾', desc: '3kg/袋 · 已分类', icon: '🗑️' },
  { code: 'bulky', name: '大件垃圾', desc: '床 / 衣柜等', icon: '🛏️' },
  { code: 'recyclable', name: '可回收物', desc: '有偿回收', icon: '♻️' },
];

const STEPS = [
  { icon: '🛒', label: '购买套餐' },
  { icon: '🚪', label: '上门服务' },
  { icon: '🗑️', label: '清理垃圾' },
  { icon: '⭐', label: '完成评价' },
];

Page({
  data: {
    community: null,
    activePackage: null,
    packageTip: '您当前无正在使用的套餐',
    reviews: [],
    reviewTotal: 0,
    types: GARBAGE_TYPES,
    steps: STEPS,
    showTypePicker: false,
  },

  onShow() {
    this.loadCommunity();
    this.loadData();
  },

  loadCommunity() {
    const app = getApp();
    const community = app.globalData.selectedCommunity
      || wx.getStorageSync('selectedCommunity');
    this.setData({ community });
  },

  async ensureLogin() {
    const app = getApp();
    if (!app.globalData.token) {
      const { token, user } = await app.login();
      app.globalData.user = user;
      return user;
    }
    return app.globalData.user;
  },

  async loadData() {
    try {
      const reviewRes = await api.getReviews(5);
      this.setData({
        reviews: reviewRes.items || [],
        reviewTotal: reviewRes.total || 0,
      });
    } catch (_) {}

    try {
      await this.ensureLogin();
      const pkg = await api.getMyPackage();
      if (pkg) {
        this.setData({
          activePackage: pkg,
          packageTip: `${pkg.planName} · 剩余 ${pkg.remainingTimes} 次 · ${pkg.expireAt.slice(0, 10)} 到期`,
        });
      } else {
        this.setData({
          activePackage: null,
          packageTip: '您当前无正在使用的套餐',
        });
      }
    } catch (_) {}
  },

  selectCommunity() {
    wx.navigateTo({ url: '/pages/community/select' });
  },

  subscribeMsg() {
    wx.requestSubscribeMessage({
      tmplIds: [''],
      fail: () => {
        wx.showToast({ title: '请在正式版配置消息模板', icon: 'none' });
      },
    });
  },

  goPackage() {
    wx.navigateTo({ url: '/pages/package/list' });
  },

  async goSingle() {
    try {
      await this.ensureLogin();
    } catch (err) {
      wx.showToast({ title: err.message || '请先登录', icon: 'none' });
      return;
    }
    if (!this.data.community) {
      wx.showModal({
        title: '提示',
        content: '请先选择所在小区',
        confirmColor: '#FF8A00',
        success: (res) => {
          if (res.confirm) this.selectCommunity();
        },
      });
      return;
    }
    this.setData({ showTypePicker: true });
  },

  closeTypePicker() {
    this.setData({ showTypePicker: false });
  },

  pickType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ showTypePicker: false });
    wx.navigateTo({
      url: `/pages/order/create?type=${type}&communityId=${this.data.community.id}`,
    });
  },

  contactService() {
    wx.makePhoneCall({ phoneNumber: '4000000000' });
  },

  goPartner() {
    wx.showModal({
      title: '招募合作伙伴',
      content: '诚招城市运营商、物业合作方，请联系 400-000-0000',
      confirmText: '拨打电话',
      confirmColor: '#FF8A00',
      success: (res) => {
        if (res.confirm) this.contactService();
      },
    });
  },

  formatReviewDate(dateStr) {
    return dateStr ? dateStr.slice(0, 10) : '';
  },
});
