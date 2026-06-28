import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "db.json");

function readDb() {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export function getUserFromToken(token) {
  if (!token?.startsWith("Bearer mock-jwt-token-for-")) return null;
  const userId = token.replace("Bearer mock-jwt-token-for-", "");
  const db = readDb();
  return db.users.find((u) => u.id === userId) || null;
}

export function login(email) {
  const db = readDb();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) throw new Error("User not found / البريد الإلكتروني غير مسجل");
  const token = `mock-jwt-token-for-${user.id}`;
  return { success: true, token, user };
}

export function register(name, email, phone, address) {
  const db = readDb();
  if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("Email already registered / البريد الإلكتروني مسجل بالفعل");
  }
  const newUser = {
    id: `u${db.users.length + 1}_${Math.floor(Math.random() * 1000)}`,
    name,
    email,
    role: "customer",
    phone,
    address,
    joinedDate: new Date().toISOString().split("T")[0],
    ordersCount: 0,
    totalSpent: 0
  };
  db.users.push(newUser);
  writeDb(db);
  const token = `mock-jwt-token-for-${newUser.id}`;
  return { success: true, token, user: newUser };
}

export function getMe(userId) {
  const db = readDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error("User not found");
  return { user };
}

export function updateProfile(userId, { name, phone, address }) {
  const db = readDb();
  const idx = db.users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error("User not found");
  db.users[idx].name = name;
  db.users[idx].phone = phone;
  db.users[idx].address = address;
  writeDb(db);
  return { success: true, user: db.users[idx] };
}

export function getProducts(params = {}) {
  const db = readDb();
  let products = [...db.products];

  if (params.category && params.category !== "all") {
    products = products.filter((p) => p.category === params.category);
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    products = products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }
  if (params.sortBy) {
    if (params.sortBy === "price-low") {
      products.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
    } else if (params.sortBy === "price-high") {
      products.sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price));
    } else if (params.sortBy === "newest") {
      products.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
    } else {
      products.sort((a, b) => b.rating - a.rating);
    }
  }
  return products;
}

export function getProduct(id) {
  const db = readDb();
  const product = db.products.find((p) => p.id === id);
  if (!product) throw new Error("Product not found");
  return product;
}

export function addProduct(product) {
  const db = readDb();
  const newProduct = {
    ...product,
    id: `p${db.products.length + 1}_${Math.floor(Math.random() * 100)}`,
    price: Number(product.price),
    discountPrice: product.discountPrice ? Number(product.discountPrice) : undefined,
    rating: 5.0,
    reviewsCount: 0,
    stock: Number(product.stock) || 10,
    images:
      product.images?.length > 0
        ? product.images
        : ["https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=800&q=80"]
  };
  db.products.push(newProduct);
  writeDb(db);
  return { success: true, product: newProduct };
}

export function updateProduct(id, product) {
  const db = readDb();
  const idx = db.products.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("Product not found");
  db.products[idx] = {
    ...db.products[idx],
    ...product,
    price: Number(product.price),
    discountPrice: product.discountPrice ? Number(product.discountPrice) : undefined,
    stock: Number(product.stock)
  };
  writeDb(db);
  return { success: true, product: db.products[idx] };
}

export function deleteProduct(id) {
  const db = readDb();
  db.products = db.products.filter((p) => p.id !== id);
  writeDb(db);
  return { success: true };
}

export function getReviews(productId) {
  const db = readDb();
  return db.reviews.filter((r) => r.productId === productId);
}

export function addReview(productId, username, rating, comment) {
  const db = readDb();
  const newReview = {
    id: `r${db.reviews.length + 1}_${Math.floor(Math.random() * 1000)}`,
    productId,
    username,
    rating: Number(rating),
    comment,
    date: new Date().toISOString().split("T")[0]
  };
  db.reviews.push(newReview);

  const pIdx = db.products.findIndex((p) => p.id === productId);
  if (pIdx !== -1) {
    const pReviews = db.reviews.filter((r) => r.productId === productId);
    const sum = pReviews.reduce((s, r) => s + r.rating, 0);
    db.products[pIdx].reviewsCount = pReviews.length;
    db.products[pIdx].rating = Number((sum / pReviews.length).toFixed(1));
  }
  writeDb(db);
  return { success: true, review: newReview };
}

export function checkCoupon(code) {
  const db = readDb();
  const coupon = db.coupons.find((c) => c.code.toUpperCase() === code.toUpperCase());
  if (!coupon) throw new Error("Invalid coupon / كود الخصم غير صحيح");
  return coupon;
}

function calculateOrderTotals(items, couponCode) {
  const db = readDb();
  let subtotal = 0;
  const validatedItems = items.map((item) => {
    const product = db.products.find((p) => p.id === item.productId);
    if (!product) throw new Error(`Product not found / المنتج غير موجود: ${item.name || item.productId}`);
    if (product.stock < item.quantity) {
      throw new Error(
        `Insufficient stock for "${product.name}". Available: ${product.stock} / مخزون غير كافٍ: ${product.stock}`
      );
    }
    const price = product.discountPrice ?? product.price;
    subtotal += price * item.quantity;
    return {
      productId: product.id,
      name: product.name,
      price,
      quantity: item.quantity,
      image: product.images[0]
    };
  });

  let discount = 0;
  let couponUsed = undefined;
  if (couponCode) {
    const coupon = db.coupons.find((c) => c.code.toUpperCase() === couponCode.toUpperCase());
    if (!coupon) throw new Error("Invalid coupon / كود الخصم غير صحيح");
    if (coupon.minSpend && subtotal < coupon.minSpend) {
      throw new Error(
        `Minimum spend $${coupon.minSpend.toFixed(2)} required for coupon ${coupon.code} / الحد الأدنى $${coupon.minSpend.toFixed(2)}`
      );
    }
    if (coupon.discountType === "percentage") {
      discount = subtotal * (coupon.value / 100);
    } else {
      discount = coupon.value;
    }
    discount = Math.min(discount, subtotal);
    couponUsed = coupon.code;
  }

  const shipping = subtotal > 150 ? 0 : 15;
  const total = Number((subtotal - discount + shipping).toFixed(2));

  return { validatedItems, subtotal: Number(subtotal.toFixed(2)), discount: Number(discount.toFixed(2)), shipping, total, couponUsed };
}

export function placeOrder(orderData) {
  const db = readDb();

  if (!orderData.items?.length) {
    throw new Error("Cart is empty / السلة فارغة");
  }

  const { validatedItems, subtotal, discount, shipping, total, couponUsed } = calculateOrderTotals(
    orderData.items,
    orderData.couponUsed
  );

  const newOrder = {
    customerName: orderData.customerName,
    email: orderData.email,
    phone: orderData.phone,
    address: orderData.address,
    items: validatedItems,
    subtotal,
    discount,
    shipping,
    total,
    paymentMethod: orderData.paymentMethod,
    couponUsed,
    userId: orderData.userId,
    id: `o${1000 + db.orders.length + 1}_${Math.floor(Math.random() * 100)}`,
    status: "New",
    date: new Date().toISOString(),
    trackingNumber: `CH-${Math.floor(10000000 + Math.random() * 90000000)}-IS`
  };
  db.orders.push(newOrder);

  validatedItems.forEach((item) => {
    const pIdx = db.products.findIndex((p) => p.id === item.productId);
    if (pIdx !== -1) {
      db.products[pIdx].stock -= item.quantity;
    }
  });

  if (orderData.userId && orderData.userId !== "guest") {
    const uIdx = db.users.findIndex((u) => u.id === orderData.userId);
    if (uIdx !== -1) {
      db.users[uIdx].ordersCount = (db.users[uIdx].ordersCount || 0) + 1;
      db.users[uIdx].totalSpent = Number(((db.users[uIdx].totalSpent || 0) + total).toFixed(2));
    }
  }

  writeDb(db);
  return { success: true, order: newOrder };
}

export function getFeaturedReviews(limit = 3) {
  const db = readDb();
  return [...db.reviews]
    .sort((a, b) => b.rating - a.rating || new Date(b.date) - new Date(a.date))
    .slice(0, limit)
    .map((review) => {
      const product = db.products.find((p) => p.id === review.productId);
      return { ...review, productName: product?.name || null };
    });
}

export function validateCart(items) {
  const db = readDb();
  const validated = [];
  const errors = [];

  for (const item of items) {
    const productId = item.productId || item.product?.id;
    const quantity = item.quantity;
    const product = db.products.find((p) => p.id === productId);
    if (!product) {
      errors.push(`Product ${productId} no longer exists / المنتج غير موجود`);
      continue;
    }
    const qty = Math.min(quantity, product.stock);
    if (product.stock === 0) {
      errors.push(`${product.name} is out of stock / نفد المخزون`);
    } else if (quantity > product.stock) {
      errors.push(`${product.name}: only ${product.stock} available / متوفر ${product.stock} فقط`);
    }
    if (qty > 0) validated.push({ product, quantity: qty });
  }

  return { validated, errors };
}

export function getOrders(user) {
  const db = readDb();
  if (user?.role === "admin") return db.orders;
  return db.orders.filter((o) => o.userId === user.id);
}

export function updateOrderStatus(id, status) {
  const db = readDb();
  const idx = db.orders.findIndex((o) => o.id === id);
  if (idx === -1) throw new Error("Order not found");
  db.orders[idx].status = status;
  writeDb(db);
  return { success: true, order: db.orders[idx] };
}

export function getAdminStats() {
  const db = readDb();
  const { orders, users } = db;

  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const totalCustomers = users.filter((u) => u.role === "customer").length;

  const productSalesMap = {};
  orders.forEach((order) => {
    order.items.forEach((item) => {
      if (!productSalesMap[item.name]) {
        productSalesMap[item.name] = { name: item.name, quantity: 0, sales: 0 };
      }
      productSalesMap[item.name].quantity += item.quantity;
      productSalesMap[item.name].sales += item.price * item.quantity;
    });
  });

  const bestSellers = Object.values(productSalesMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const salesByDayMap = {};
  orders.forEach((order) => {
    const day = order.date.split("T")[0];
    if (!salesByDayMap[day]) salesByDayMap[day] = { date: day, sales: 0, orders: 0 };
    salesByDayMap[day].sales += order.total;
    salesByDayMap[day].orders += 1;
  });

  const salesByDay = Object.values(salesByDayMap)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const salesByMonthMap = {};
  orders.forEach((order) => {
    const d = new Date(order.date);
    const key = monthNames[d.getMonth()];
    if (!salesByMonthMap[key]) salesByMonthMap[key] = { month: key, sales: 0, orders: 0 };
    salesByMonthMap[key].sales += order.total;
    salesByMonthMap[key].orders += 1;
  });

  const salesByMonth =
    Object.keys(salesByMonthMap).length > 0
      ? Object.values(salesByMonthMap)
      : monthNames.slice(0, 6).map((month) => ({ month, sales: 0, orders: 0 }));

  return { totalSales, totalOrders, totalCustomers, bestSellers, salesByDay, salesByMonth };
}

export function getAdminCustomers() {
  const db = readDb();
  return db.users.filter((u) => u.role === "customer");
}

export function subscribeNewsletter(email) {
  const db = readDb();
  if (!db.subscribers) db.subscribers = [];
  if (db.subscribers.some((s) => s.email.toLowerCase() === email.toLowerCase())) {
    return { success: true, message: "Already subscribed" };
  }
  db.subscribers.push({ email, date: new Date().toISOString() });
  writeDb(db);
  return { success: true };
}
