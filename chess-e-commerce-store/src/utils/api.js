import {
  mapProduct,
  mapProducts,
  mapUser,
  mapOrder,
  mapOrders,
  mapCart,
  mapCategory,
  mapAdminDashboard,
  toApiStatus
} from "./mappers";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

function extractError(data) {
  if (data?.errors) {
    const first = Object.values(data.errors)[0];
    return Array.isArray(first) ? first[0] : String(first);
  }
  return data?.message || data?.error || "Request failed";
}

async function request(path, options = {}) {
  const token = localStorage.getItem("chess_token");
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(extractError(data));
  }
  return data;
}

function storeSession(token, user) {
  localStorage.setItem("chess_token", token);
  if (user?.id) {
    localStorage.setItem("chess_current_user_id", String(user.id));
  }
}

export function getHeaders() {
  const token = localStorage.getItem("chess_token");
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export const api = {
  async login(email, password) {
    const result = await request("/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    storeSession(result.token, result.user);
    return { ...result, user: mapUser(result.user) };
  },

  async register(name, email, password, passwordConfirmation, phone, address) {
    const result = await request("/register", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        phone: phone || null,
        address: address || null
      })
    });
    storeSession(result.token, result.user);
    return { ...result, user: mapUser(result.user) };
  },

  async logout() {
    try {
      await request("/logout", { method: "POST" });
    } finally {
      localStorage.removeItem("chess_token");
      localStorage.removeItem("chess_current_user_id");
    }
  },

  async getMe() {
    const result = await request("/me");
    return { user: mapUser(result.user) };
  },

  async getCategories() {
    const result = await request("/categories?per_page=100");
    const list = Array.isArray(result.data) ? result.data : [];
    return list.map(mapCategory);
  },

  async getProducts(params = {}) {
    const query = new URLSearchParams();
    query.set("per_page", String(params.per_page || 100));
    if (params.category_id) query.set("category_id", params.category_id);
    if (params.search) query.set("search", params.search);
    if (params.min_price) query.set("min_price", params.min_price);
    if (params.max_price) query.set("max_price", params.max_price);

    const result = await request(`/products?${query.toString()}`);
    let products = mapProducts(result);

    if (params.sortBy === "price-low") {
      products.sort((a, b) => a.price - b.price);
    } else if (params.sortBy === "price-high") {
      products.sort((a, b) => b.price - a.price);
    } else if (params.sortBy === "newest") {
      products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return products;
  },

  async getProduct(id) {
    const result = await request(`/products/${id}`);
    return mapProduct(result.data ?? result);
  },

  async getAdminProducts(params = {}) {
    const query = new URLSearchParams();
    query.set("per_page", String(params.per_page || 100));
    if (params.category_id) query.set("category_id", params.category_id);
    if (params.search) query.set("search", params.search);
    const result = await request(`/admin/products?${query.toString()}`);
    return mapProducts(result);
  },

  async addProduct(product) {
    const result = await request("/admin/products", {
      method: "POST",
      body: JSON.stringify(product)
    });
    return mapProduct(result.product);
  },

  async updateProduct(id, product) {
    const result = await request(`/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product)
    });
    return mapProduct(result.product);
  },

  async deleteProduct(id) {
    await request(`/admin/products/${id}`, { method: "DELETE" });
    return { success: true };
  },

  async getCart() {
    const result = await request("/cart");
    return mapCart(result.data ?? result);
  },

  async addCartItem(productId, quantity = 1) {
    const result = await request("/cart/items", {
      method: "POST",
      body: JSON.stringify({ product_id: productId, quantity })
    });
    return mapCart(result.cart?.data ?? result.cart);
  },

  async updateCartItem(cartItemId, quantity) {
    const result = await request(`/cart/items/${cartItemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity })
    });
    return mapCart(result.cart?.data ?? result.cart);
  },

  async removeCartItem(cartItemId) {
    const result = await request(`/cart/items/${cartItemId}`, { method: "DELETE" });
    return mapCart(result.cart?.data ?? result.cart);
  },

  async clearCart() {
    const result = await request("/cart", { method: "DELETE" });
    return mapCart(result.cart?.data ?? result.cart ?? { items: [], total: 0 });
  },

  async syncLocalCartToServer(localItems) {
    for (const item of localItems) {
      try {
        await this.addCartItem(item.product.id, item.quantity);
      } catch (e) {
        console.warn("Failed to sync cart item", item.product.id, e);
      }
    }
  },

  async placeOrder({ payment_method, shipping_address, phone }) {
    const result = await request("/orders", {
      method: "POST",
      body: JSON.stringify({ payment_method, shipping_address, phone })
    });
    return { success: true, order: mapOrder(result.order) };
  },

  async getOrders() {
    const result = await request("/orders?per_page=100");
    return mapOrders(result);
  },

  async getAdminOrders() {
    const result = await request("/admin/orders?per_page=100");
    return mapOrders(result);
  },

  async updateOrderStatus(id, status) {
    const result = await request(`/admin/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status: toApiStatus(status) })
    });
    return mapOrder(result.order);
  },

  async getAdminDashboard() {
    const result = await request("/admin/dashboard");
    return mapAdminDashboard(result);
  },

  async getAdminUsers() {
    const result = await request("/admin/users?per_page=100");
    const list = Array.isArray(result.data) ? result.data : [];
    return list.map(mapUser);
  },

  async getAdminCategories() {
    const result = await request("/admin/categories?per_page=100");
    const list = Array.isArray(result.data) ? result.data : [];
    return list.map(mapCategory);
  },

  async addCategory(category) {
    const result = await request("/admin/categories", {
      method: "POST",
      body: JSON.stringify(category)
    });
    return mapCategory(result.category);
  },

  async updateCategory(id, category) {
    const result = await request(`/admin/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(category)
    });
    return mapCategory(result.category);
  },

  async deleteCategory(id) {
    await request(`/admin/categories/${id}`, { method: "DELETE" });
    return { success: true };
  },

  async deleteOrder(id) {
    await request(`/admin/orders/${id}`, { method: "DELETE" });
    return { success: true };
  },

  async healthCheck() {
    const base = API_BASE.replace(/\/api\/?$/, "");
    const res = await fetch(`${base}/up`);
    if (!res.ok) throw new Error("API offline");
    return { status: "ok" };
  }
};
