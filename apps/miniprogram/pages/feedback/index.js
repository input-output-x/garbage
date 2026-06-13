Page({
  data: { content: '', phone: '' },

  onInput(e) {
    this.setData({ [e.currentTarget.dataset.field]: e.detail.value });
  },

  submit() {
    if (!this.data.content) {
      wx.showToast({ title: '请填写反馈内容', icon: 'none' });
      return;
    }
    wx.showToast({ title: '感谢您的反馈' });
    setTimeout(() => wx.navigateBack(), 1500);
  },
});
