import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import * as store from "./store.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

function authRequired(req, res, next) {
  const user = store.getUserFromToken(req.headers.authorization);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  req.user = user;
  next();
}

function adminRequired(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Admin access required" });
  next();
}

function handle(fn) {
  return async (req, res) => {
    try {
      const result = await fn(req, res);
      if (result !== undefined) res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };
}

// Auth
app.post("/api/auth/login", handle((req) => store.login(req.body.email)));
app.post("/api/auth/register", handle((req) => store.register(req.body.name, req.body.email, req.body.phone, req.body.address)));
app.get("/api/auth/me", authRequired, handle((req) => store.getMe(req.user.id)));
app.put("/api/auth/profile", authRequired, handle((req) => store.updateProfile(req.user.id, req.body)));

// Products
app.get("/api/products", handle((req) => store.getProducts(req.query)));
app.get("/api/products/:id", handle((req) => store.getProduct(req.params.id)));
app.post("/api/products", authRequired, adminRequired, handle((req) => store.addProduct(req.body)));
app.put("/api/products/:id", authRequired, adminRequired, handle((req) => store.updateProduct(req.params.id, req.body)));
app.delete("/api/products/:id", authRequired, adminRequired, handle((req) => store.deleteProduct(req.params.id)));

// Reviews
app.get("/api/reviews/featured", handle(() => store.getFeaturedReviews()));
app.get("/api/products/:id/reviews", handle((req) => store.getReviews(req.params.id)));
app.post("/api/products/:id/reviews", handle((req) =>
  store.addReview(req.params.id, req.body.username, req.body.rating, req.body.comment)
));

// Cart validation (sync with DB stock/prices)
app.post("/api/cart/validate", handle((req) => store.validateCart(req.body.items || [])));

// Coupons
app.post("/api/coupons/validate", handle((req) => store.checkCoupon(req.body.code)));

// Orders
app.get("/api/orders", authRequired, handle((req) => store.getOrders(req.user)));
app.post("/api/orders", handle((req) => store.placeOrder(req.body)));
app.patch("/api/orders/:id/status", authRequired, adminRequired, handle((req) =>
  store.updateOrderStatus(req.params.id, req.body.status)
));

// Admin
app.get("/api/admin/stats", authRequired, adminRequired, handle(() => store.getAdminStats()));
app.get("/api/admin/customers", authRequired, adminRequired, handle(() => store.getAdminCustomers()));

// Newsletter
app.post("/api/newsletter", handle((req) => store.subscribeNewsletter(req.body.email)));

// Health check
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// Serve production build
const distPath = path.join(__dirname, "..", "dist");
app.use(express.static(distPath));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(distPath, "index.html"), (err) => {
    if (err) next();
  });
});

app.listen(PORT, () => {
  console.log(`Chess Store API running on http://localhost:${PORT}`);
});
