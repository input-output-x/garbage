const { request } = require('./request');

module.exports = {
  login: (code) => request({ url: '/auth/wx/login', method: 'POST', data: { code } }),

  getCommunities: () => request({ url: '/communities', method: 'GET' }),
  getCommunity: (id) => request({ url: `/communities/${id}`, method: 'GET' }),

  getPackagePlans: () => request({ url: '/packages/plans', method: 'GET' }),
  getMyPackage: () => request({ url: '/packages/my', method: 'GET' }),
  purchasePackage: (planId) =>
    request({ url: '/packages/purchase', method: 'POST', data: { planId } }),

  getAddresses: () => request({ url: '/addresses', method: 'GET' }),
  createAddress: (data) => request({ url: '/addresses', method: 'POST', data }),
  updateAddress: (id, data) => request({ url: `/addresses/${id}`, method: 'PATCH', data }),
  deleteAddress: (id) => request({ url: `/addresses/${id}`, method: 'DELETE' }),
  setDefaultAddress: (id) => request({ url: `/addresses/${id}/default`, method: 'POST' }),

  getReviews: (limit = 5) =>
    request({ url: `/reviews?limit=${limit}`, method: 'GET' }),

  getOrders: (params = {}) => {
    const qs = Object.entries(params)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    return request({ url: `/orders${qs ? '?' + qs : ''}`, method: 'GET' });
  },
  getOrder: (id) => request({ url: `/orders/${id}`, method: 'GET' }),
  createOrder: (data) => request({ url: '/orders', method: 'POST', data }),
  payOrder: (id) => request({ url: `/orders/${id}/pay`, method: 'POST' }),
  reviewOrder: (id, data) =>
    request({ url: `/orders/${id}/review`, method: 'POST', data }),

  getPricing: (tenantId, communityId) =>
    request({ url: `/pricing?tenantId=${tenantId}&communityId=${communityId}`, method: 'GET' }),
};
