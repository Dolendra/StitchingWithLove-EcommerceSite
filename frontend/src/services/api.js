// import axios from "axios";

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

// // Axios instance
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Attach JWT
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("auth_token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // Global error handling
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem("auth_token");
//       localStorage.removeItem("auth_user");
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   }
// );

// // Products API
// export const productsAPI = {
//   getAll: () => api.get("/products"),
//   getById: (id) => api.get(`/products/${id}`),
//   create: (product) => api.post("/products", product),
//   update: (id, product) => api.put(`/products/${id}`, product),
//   delete: (id) => api.delete(`/products/${id}`),
// };

// // Auth API
// export const authAPI = {
//   login: (credentials) => api.post("/auth/login", credentials),
//   register: (userData) => api.post("/auth/register", userData),
//   getProfile: () => api.get("/auth/profile"),
// };

// // Orders API
// export const ordersAPI = {
//   create: (orderData) => api.post("/orders", orderData),
//   getMyOrders: () => api.get("/orders/my"),
//   getAll: () => api.get("/orders"),
//   updateStatus: (id, status, note) => api.post(`/orders/${id}/track`, { status, note }),
//   cancel: (id) => api.post(`/orders/${id}/cancel`),
// };

// // Payments API (Stripe)
// export const paymentsAPI = {
//   createSession: (paymentData) => api.post("/payments/create-session", paymentData),
//   confirm: (params) => api.get(`/payments/confirm`, { params }),
// };

// // Cart API
// export const cartAPI = {
//   get: () => api.get("/cart"),
//   add: (productId, quantity = 1) => api.post("/cart/add", { productId, quantity }),
//   update: (productId, quantity) => api.put("/cart/update", { productId, quantity }),
// };

// // Admin: appointments
// export const appointmentsAPI = {
//   list: () => api.get('/appointments/admin/list'),
//   updateStatus: (id, status) => api.post(`/appointments/${id}/status`, { status }),
// };

// export default api;


import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/api";

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// Products API
export const productsAPI = {
  getAll: () => api.get("/products"),
  getById: (id) => api.get(`/products/${id}`),
  create: (product) => api.post("/products", product),
  update: (id, product) => api.put(`/products/${id}`, product),
  delete: (id) => api.delete(`/products/${id}`),
};

// Auth API
export const authAPI = {
  login: (credentials) =>
    api.post("/auth/login", credentials),

  register: (userData) =>
    api.post("/auth/register", userData),

  getProfile: () => api.get("/auth/profile"),
};

// Orders API
export const ordersAPI = {
  create: (orderData) =>
    api.post("/orders", orderData),

  getMyOrders: () => api.get("/orders/my"),

  getAll: () => api.get("/orders"),

  updateStatus: (id, status, note) =>
    api.post(`/orders/${id}/track`, {
      status,
      note,
    }),

  cancel: (id) =>
    api.post(`/orders/${id}/cancel`),
};

// Payments API
export const paymentsAPI = {
  createSession: (paymentData) =>
    api.post("/payments/create-session", paymentData),

  confirm: (params) =>
    api.get("/payments/confirm", { params }),
};

// Cart API
export const cartAPI = {
  get: () => api.get("/cart"),

  add: (productId, quantity = 1) =>
    api.post("/cart/add", {
      productId,
      quantity,
    }),

  update: (productId, quantity) =>
    api.put("/cart/update", {
      productId,
      quantity,
    }),
};

// Appointments API
export const appointmentsAPI = {
  list: () => api.get("/appointments/admin/list"),

  updateStatus: (id, status) =>
    api.post(`/appointments/${id}/status`, {
      status,
    }),
};

export default api;