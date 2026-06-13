const api = require('../../utils/api');

const TYPE_NAMES = {
  kitchen: '餐厨垃圾',
  other: '其他垃圾',
  bulky: '大件垃圾',
  recyclable: '可回收物',
};

Page({
  data: {
    garbageType: '',
    typeName: '',
    communityId: '',
    quantity: 1,
    unitPrice: 3,
    unitLabel: '袋',
    total: 3,
    addresses: [],
    selectedAddressId: '',
    usePackage: false,
    activePackage: null,
    remark: '',
    manualMode: false,
    building: '',
    unit: '',
    room: '',
    contactName: '',
    contactPhone: '',
  },

  onLoad(options) {
    const { type, communityId } = options;
    this.setData({
      garbageType: type,
      typeName: TYPE_NAMES[type] || type,
      communityId,
      unitLabel: type === 'bulky' ? '件' : '袋',
    });
    this.loadPrice();
    this.loadAddresses();
    this.loadPackage();
  },

  async loadPrice() {
    try {
      const community = await api.getCommunity(this.data.communityId);
      const rules = await api.getPricing(community.tenantId, community.id);
      const rule = rules.find((r) => r.garbageType === this.data.garbageType);
      if (rule) this.updateTotal(rule.unitPrice, rule.unitLabel);
    } catch (_) {}
  },

  async loadAddresses() {
    try {
      await getApp().login();
      const addresses = await api.getAddresses();
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      this.setData({
        addresses,
        selectedAddressId: defaultAddr?.id || '',
      });
    } catch (_) {}
  },

  async loadPackage() {
    try {
      const pkg = await api.getMyPackage();
      if (pkg) this.setData({ activePackage: pkg, usePackage: true });
    } catch (_) {}
  },

  updateTotal(unitPrice, unitLabel) {
    const total = this.data.usePackage ? 0 : unitPrice * this.data.quantity;
    const data = { unitPrice, total };
    if (unitLabel) data.unitLabel = unitLabel;
    this.setData(data);
  },

  decQty() {
    if (this.data.quantity <= 1) return;
    this.setData({ quantity: this.data.quantity - 1 });
    this.updateTotal(this.data.unitPrice);
  },

  incQty() {
    this.setData({ quantity: this.data.quantity + 1 });
    this.updateTotal(this.data.unitPrice);
  },

  selectAddress(e) {
    this.setData({ selectedAddressId: e.currentTarget.dataset.id, manualMode: false });
  },

  toggleManual() {
    this.setData({ manualMode: true, selectedAddressId: '' });
  },

  togglePackage(e) {
    const usePackage = e.detail.value;
    this.setData({ usePackage });
    this.updateTotal(this.data.unitPrice);
  },

  onInput(e) {
    this.setData({ [e.currentTarget.dataset.field]: e.detail.value });
  },

  goAddAddress() {
    wx.navigateTo({ url: '/pages/address/edit' });
  },

  async submit() {
    const d = this.data;
    wx.showLoading({ title: '提交中' });
    try {
      const payload = {
        communityId: d.communityId,
        garbageType: d.garbageType,
        quantity: d.quantity,
        usePackage: d.usePackage && !!d.activePackage,
        remark: d.remark,
      };
      if (d.selectedAddressId && !d.manualMode) {
        payload.addressId = d.selectedAddressId;
      } else {
        if (!d.building || !d.room || !d.contactName || !d.contactPhone) {
          wx.hideLoading();
          wx.showToast({ title: '请选择地址或填写完整', icon: 'none' });
          return;
        }
        Object.assign(payload, {
          building: d.building,
          unit: d.unit || '-',
          room: d.room,
          contactName: d.contactName,
          contactPhone: d.contactPhone,
        });
      }
      const order = await api.createOrder(payload);
      if (order.status === 'pending_payment') {
        await api.payOrder(order.id);
      }
      wx.hideLoading();
      wx.redirectTo({ url: `/pages/order/detail?id=${order.id}` });
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message, icon: 'none' });
    }
  },
});
