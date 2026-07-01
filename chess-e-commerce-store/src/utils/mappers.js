const NEW_ARRIVAL_DAYS = 30;

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export function resolveImageUrl(image) {
  if (!image) return "";
  if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("//")) {
    return image;
  }
  const base = API_BASE.replace(/\/api\/?$/, "");
  return `${base}${image.startsWith("/") ? image : `/${image}`}`;
}

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
    image: resolveImageUrl(c.image),
    description: c.description,
    productsCount: c.products_count ?? 0
  };
}

export function mapProduct(raw) {
  const p = unwrapData(raw);
  const price = Number(p.price);
  const rawDiscount = p.discount_price !== undefined && p.discount_price !== null
    ? Number(p.discount_price)
    : null;
  const discountPrice =
    rawDiscount !== null && rawDiscount > 0 && rawDiscount < price
      ? rawDiscount
      : undefined;
  const effectivePrice = discountPrice !== undefined ? discountPrice : price;
  const discountPercent =
    discountPrice !== undefined
      ? Math.round(((price - discountPrice) / price) * 100)
      : 0;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description ?? "",
    categoryId: p.category_id,
    category: p.category?.slug || p.category?.name || String(p.category_id ?? ""),
    categoryName: p.category?.name || "",
    price,
    discountPrice,
    effectivePrice,
    discountPercent,
    stock: p.quantity ?? 0,
    quantity: p.quantity ?? 0,
    image: resolveImageUrl(p.image || ""),
    images: p.image ? [resolveImageUrl(p.image)] : [],
    status: p.status,
    created_at: p.created_at,
    rating: 4.8,
    reviewsCount: 0,
    isBestSeller: false,
    isNewArrival: isRecent(p.created_at),
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
  pending: "قيد الانتظار",
  processing: "قيد المعالجة",
  shipped: "تم الشحن",
  delivered: "تم التوصيل",
  cancelled: "ملغى"
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
    pendingRevenue: Number(stats.pending_revenue ?? 0),
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
    "قيد الانتظار": "pending",
    Processing: "processing",
    "قيد المعالجة": "processing",
    Shipped: "shipped",
    "تم الشحن": "shipped",
    Delivered: "delivered",
    "تم التوصيل": "delivered",
    Cancelled: "cancelled",
    "ملغى": "cancelled"
  };
  return map[displayStatus] || displayStatus?.toLowerCase();
}

export function markBestSellers(products, count = 3) {
  return products.map((p, i) => ({
    ...p,
    isBestSeller: i < count
  }));
}

function isOrderCancelled(order) {
  const raw = String(order.statusRaw || order.status || "").toLowerCase();
  return raw === "cancelled" || raw === "ملغى";
}

/** Aggregate sold quantities from orders + catalog for admin overview rankings. */
export function computeProductSalesRankings(orders = [], products = []) {
  const salesMap = new Map();

  orders
    .filter((o) => !isOrderCancelled(o))
    .forEach((order) => {
      (order.items || []).forEach((item) => {
        const key = item.productId ?? item.name;
        const prev = salesMap.get(key) || {
          productId: item.productId,
          name: item.name,
          image: item.image || "",
          quantity: 0,
          revenue: 0
        };
        prev.quantity += item.quantity || 0;
        prev.revenue += Number(item.subtotal ?? (item.price || 0) * (item.quantity || 0));
        if (!prev.image && item.image) prev.image = item.image;
        salesMap.set(key, prev);
      });
    });

  products.forEach((p) => {
    const key = p.id;
    if (!salesMap.has(key)) {
      salesMap.set(key, {
        productId: p.id,
        name: p.name,
        image: p.image || p.images?.[0] || "",
        quantity: 0,
        revenue: 0
      });
    } else {
      const entry = salesMap.get(key);
      if (!entry.image) entry.image = p.image || p.images?.[0] || "";
      if (!entry.name) entry.name = p.name;
    }
  });

  const ranked = [...salesMap.values()].sort(
    (a, b) => b.quantity - a.quantity || b.revenue - a.revenue
  );

  const totalUnitsSold = ranked.reduce((sum, p) => sum + p.quantity, 0);
  if (totalUnitsSold === 0) {
    return { topProduct: null, bottomProduct: null, totalUnitsSold: 0 };
  }

  return {
    topProduct: ranked[0],
    bottomProduct: ranked[ranked.length - 1],
    totalUnitsSold
  };
}
