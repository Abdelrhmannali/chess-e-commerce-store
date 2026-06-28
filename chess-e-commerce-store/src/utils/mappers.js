const NEW_ARRIVAL_DAYS = 30;

function unwrapData(payload) {
  if (payload && typeof payload === "object" && "data" in payload && !payload.token && !payload.user && !payload.cart && !payload.order) {
    return payload.data;
  }
  return payload;
}

function isRecent(createdAt) {
  if (!createdAt) return false;
  const created = new Date(createdAt);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - NEW_ARRIVAL_DAYS);
  return created >= cutoff;
}

export function mapCategory(raw) {
  const c = unwrapData(raw);
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: c.image,
    description: c.description,
    productsCount: c.products_count ?? 0
  };
}

export function mapProduct(raw) {
  const p = unwrapData(raw);
  const price = Number(p.price);
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description ?? "",
    categoryId: p.category_id,
    category: p.category?.slug || p.category?.name || String(p.category_id ?? ""),
    categoryName: p.category?.name || "",
    price,
    stock: p.quantity ?? 0,
    quantity: p.quantity ?? 0,
    image: p.image || "",
    images: p.image ? [p.image] : [],
    status: p.status,
    created_at: p.created_at,
    rating: 4.8,
    reviewsCount: 0,
    isBestSeller: false,
    isNewArrival: isRecent(p.created_at),
    discountPrice: undefined
  };
}

export function mapProducts(raw) {
  const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
  return list.map(mapProduct);
}

export function mapUser(raw) {
  const u = unwrapData(raw);
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone || "",
    address: u.address || "",
    joinedDate: u.created_at ? new Date(u.created_at).toLocaleDateString() : "",
    created_at: u.created_at
  };
}

export function mapOrderItem(item) {
  const product = item.product ? mapProduct(item.product) : null;
  return {
    productId: item.product_id,
    name: product?.name || `Product #${item.product_id}`,
    quantity: item.quantity,
    price: Number(item.price),
    image: product?.image || product?.images?.[0] || "",
    subtotal: Number(item.subtotal ?? item.price * item.quantity)
  };
}

const STATUS_DISPLAY = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled"
};

export function mapOrder(raw) {
  const o = unwrapData(raw);
  const items = (o.items || []).map(mapOrderItem);
  return {
    id: o.id,
    userId: o.user_id,
    customerName: o.user?.name || "",
    email: o.user?.email || "",
    phone: o.phone || "",
    address: o.shipping_address || "",
    shipping_address: o.shipping_address || "",
    items,
    total: Number(o.total_price),
    total_price: Number(o.total_price),
    status: STATUS_DISPLAY[o.status] || o.status,
    statusRaw: o.status,
    payment_method: o.payment_method,
    payment_status: o.payment_status,
    date: o.created_at,
    created_at: o.created_at,
    trackingNumber: `CH-${String(o.id).padStart(8, "0")}-IS`
  };
}

export function mapOrders(raw) {
  const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
  return list.map(mapOrder);
}

export function mapCartItem(raw) {
  const item = unwrapData(raw);
  const product = item.product ? mapProduct(item.product) : null;
  return {
    id: item.id,
    productId: item.product_id,
    product,
    quantity: item.quantity,
    price: Number(item.price),
    subtotal: Number(item.subtotal ?? item.price * item.quantity)
  };
}

export function mapCart(raw) {
  const cart = unwrapData(raw);
  const items = (cart.items || []).map(mapCartItem).filter((i) => i.product);
  return {
    id: cart.id,
    items: items.map(({ product, quantity, id, price, subtotal }) => ({
      id,
      product,
      quantity,
      price,
      subtotal
    })),
    total: Number(cart.total ?? 0)
  };
}

export function cartToUiItems(cart) {
  return cart.items.map(({ product, quantity, id }) => ({
    id,
    product,
    quantity
  }));
}

export function mapAdminDashboard(raw) {
  const stats = raw.statistics || {};
  const recentOrders = (raw.recent_orders || []).map((o) => ({
    id: o.id,
    user: o.user,
    total: Number(o.total_price),
    status: STATUS_DISPLAY[o.status] || o.status,
    statusRaw: o.status,
    payment_status: o.payment_status,
    items_count: o.items_count,
    created_at: o.created_at
  }));

  return {
    totalSales: Number(stats.total_revenue ?? 0),
    totalOrders: stats.orders ?? 0,
    totalCustomers: stats.users ?? 0,
    totalProducts: stats.products ?? 0,
    totalCategories: stats.categories ?? 0,
    pendingOrders: stats.pending_orders ?? 0,
    recentOrders,
    salesByDay: [],
    salesByMonth: [],
    bestSellers: []
  };
}

export function toApiStatus(displayStatus) {
  const map = {
    New: "pending",
    Pending: "pending",
    Processing: "processing",
    Shipped: "shipped",
    Delivered: "delivered",
    Cancelled: "cancelled"
  };
  return map[displayStatus] || displayStatus?.toLowerCase();
}

export function markBestSellers(products, count = 3) {
  return products.map((p, i) => ({
    ...p,
    isBestSeller: i < count
  }));
}
