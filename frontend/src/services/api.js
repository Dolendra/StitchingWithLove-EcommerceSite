import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      const path = window.location.pathname;
      if (!path.startsWith("/login") && !path.startsWith("/register")) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const productsAPI = {
  getAll: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (product) => api.post("/products", product),
  update: (id, product) => api.put(`/products/${id}`, product),
  delete: (id) => api.delete(`/products/${id}`),
};

export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  getProfile: () => api.get("/auth/profile"),
};

export const ordersAPI = {
  create: (orderData) => api.post("/orders", orderData),
  getMyOrders: () => api.get("/orders/my"),
  getAll: (params) => api.get("/orders", { params }),
  getById: (id) => api.get(`/orders/${id}`),
  getStatuses: () => api.get("/orders/statuses"),
  updateStatus: (id, status, note, extra = {}) =>
    api.post(`/orders/${id}/track`, { status, note, ...extra }),
  cancel: (id) => api.post(`/orders/${id}/cancel`),
  message: (id, text) => api.post(`/orders/${id}/message`, { text }),
  fittingDecision: (id, decision) =>
    api.post(`/orders/${id}/fitting-decision`, { decision }),
  requestAlteration: (id, data) => api.post(`/orders/${id}/alteration`, data),
};

export const paymentsAPI = {
  createSession: (paymentData) => api.post("/payments/create-session", paymentData),
  confirm: (params) => api.get("/payments/confirm", { params }),
  cancelPending: (orderId) => api.post("/payments/cancel-pending", { orderId }),
};

export const cartAPI = {
  get: () => api.get("/cart"),
  add: (productId, quantity = 1, meta = {}) =>
    api.post("/cart/add", { productId, quantity, ...meta }),
  update: (productId, quantity, meta = {}) =>
    api.put("/cart/update", { productId, quantity, ...meta }),
  clear: () => api.delete("/cart"),
};

export const appointmentsAPI = {
  create: (data) => api.post("/appointments", data),
  my: () => api.get("/appointments/my"),
  slots: (date) => api.get("/appointments/slots", { params: { date } }),
  list: () => api.get("/appointments/admin/list"),
  updateStatus: (id, status, adminNote) =>
    api.post(`/appointments/${id}/status`, { status, adminNote }),
};

export const measurementsAPI = {
  fields: () => api.get("/measurements/fields"),
  list: () => api.get("/measurements"),
  create: (data) => api.post("/measurements", data),
  update: (id, data) => api.put(`/measurements/${id}`, data),
  duplicate: (id) => api.post(`/measurements/${id}/duplicate`),
  remove: (id) => api.delete(`/measurements/${id}`),
};

export const wishlistAPI = {
  get: () => api.get("/wishlist"),
  toggle: (productId) => api.post("/wishlist/toggle", { productId }),
};

export const notificationsAPI = {
  list: () => api.get("/notifications"),
  markRead: (id) => api.post(`/notifications/${id}/read`),
  readAll: () => api.post("/notifications/read-all"),
};

export const reviewsAPI = {
  forProduct: (productId) => api.get(`/reviews/product/${productId}`),
  create: (data) => api.post("/reviews", data),
};

export default api;
