import React, { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  FolderOpen,
  Package,
  Receipt,
  Users,
  Trash2,
  Edit2,
  Plus,
  RefreshCw,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Clock,
  Layers
} from "lucide-react";
import { api } from "../utils/api";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "categories", label: "Categories", icon: FolderOpen },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: Receipt },
  { id: "customers", label: "Customers", icon: Users }
];

const STATUS_OPTIONS = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

function StatusBadge({ status }) {
  const key = (status || "").toLowerCase();
  const cls =
    key === "delivered" ? "status-delivered" :
    key === "shipped" ? "status-shipped" :
    key === "processing" ? "status-processing" :
    key === "cancelled" ? "status-cancelled" : "status-pending";
  return <span className={`status-badge ${cls}`}>{status}</span>;
}

export default function AdminDashboard({ categories = [], onRefreshCatalog }) {
  const [adminTab, setAdminTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [productsList, setProductsList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [customersList, setCustomersList] = useState([]);
  const [adminCategories, setAdminCategories] = useState(categories);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Product form
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formName, setFormName] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formQuantity, setFormQuantity] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formStatus, setFormStatus] = useState(true);

  // Category form
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catDescription, setCatDescription] = useState("");
  const [catImage, setCatImage] = useState("");

  const flash = (msg, isError = false) => {
    if (isError) setErrorMessage(msg);
    else setSuccessMessage(msg);
    setTimeout(() => { setSuccessMessage(""); setErrorMessage(""); }, 4000);
  };

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const [statsData, prodsData, ordsData, custsData, catsData] = await Promise.all([
        api.getAdminDashboard(),
        api.getAdminProducts(),
        api.getAdminOrders(),
        api.getAdminUsers(),
        api.getAdminCategories()
      ]);
      setStats(statsData);
      setProductsList(prodsData);
      setOrdersList(ordsData.reverse());
      setCustomersList(custsData);
      setAdminCategories(catsData.length ? catsData : categories);
      if (catsData.length && !formCategoryId) {
        setFormCategoryId(String(catsData[0].id));
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  }, [categories, formCategoryId]);

  useEffect(() => { loadAdminData(); }, [adminTab]);

  const resetProductForm = () => {
    setSelectedProduct(null);
    setFormName("");
    setFormCategoryId(String(adminCategories[0]?.id || ""));
    setFormPrice("");
    setFormQuantity("");
    setFormDescription("");
    setFormImage("");
    setFormStatus(true);
  };

  const resetCategoryForm = () => {
    setSelectedCategory(null);
    setCatName("");
    setCatSlug("");
    setCatDescription("");
    setCatImage("");
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formName || !formPrice || !formQuantity || !formCategoryId) {
      flash("Complete all required product fields.", true);
      return;
    }
    const payload = {
      category_id: Number(formCategoryId),
      name: formName,
      description: formDescription,
      price: Number(formPrice),
      quantity: Number(formQuantity),
      image: formImage || null,
      status: formStatus
    };
    try {
      if (selectedProduct) await api.updateProduct(selectedProduct.id, payload);
      else await api.addProduct(payload);
      flash(selectedProduct ? `"${formName}" updated.` : `"${formName}" created.`);
      resetProductForm();
      await loadAdminData();
      onRefreshCatalog?.();
    } catch (err) {
      flash(err.message || "Failed to save product.", true);
    }
  };

  const handleEditProduct = (prod) => {
    setSelectedProduct(prod);
    setFormName(prod.name);
    setFormCategoryId(String(prod.categoryId || adminCategories[0]?.id || ""));
    setFormPrice(prod.price.toString());
    setFormQuantity(prod.stock.toString());
    setFormDescription(prod.description || "");
    setFormImage(prod.image || prod.images?.[0] || "");
    setFormStatus(prod.status !== false);
    setAdminTab("products");
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await api.deleteProduct(id);
      flash(`"${name}" deleted.`);
      await loadAdminData();
      onRefreshCatalog?.();
    } catch (err) {
      flash(err.message || "Failed to delete.", true);
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) { flash("Category name is required.", true); return; }
    const payload = {
      name: catName.trim(),
      slug: catSlug.trim() || undefined,
      description: catDescription.trim() || undefined,
      image: catImage.trim() || undefined
    };
    try {
      if (selectedCategory) await api.updateCategory(selectedCategory.id, payload);
      else await api.addCategory(payload);
      flash(selectedCategory ? `"${catName}" updated.` : `"${catName}" created.`);
      resetCategoryForm();
      await loadAdminData();
      onRefreshCatalog?.();
    } catch (err) {
      flash(err.message || "Failed to save category.", true);
    }
  };

  const handleEditCategory = (cat) => {
    setSelectedCategory(cat);
    setCatName(cat.name);
    setCatSlug(cat.slug || "");
    setCatDescription(cat.description || "");
    setCatImage(cat.image || "");
    setAdminTab("categories");
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"? Products in it may be affected.`)) return;
    try {
      await api.deleteCategory(id);
      flash(`"${name}" deleted.`);
      await loadAdminData();
      onRefreshCatalog?.();
    } catch (err) {
      flash(err.message || "Failed to delete category.", true);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await api.updateOrderStatus(orderId, status);
      flash(`Order #${orderId} → ${status}`);
      await loadAdminData();
    } catch (err) {
      flash(err.message || "Failed to update order.", true);
    }
  };

  const statCards = stats ? [
    { key: "revenue", label: "Total Revenue", value: `$${stats.totalSales.toFixed(2)}`, icon: DollarSign, stat: "stat-revenue", iconBg: "rgba(0,0,0,0.06)", iconColor: "#121212" },
    { key: "orders", label: "Total Orders", value: stats.totalOrders, icon: Receipt, stat: "stat-orders", iconBg: "rgba(124,58,237,0.12)", iconColor: "#7C3AED" },
    { key: "pending", label: "Pending Orders", value: stats.pendingOrders, icon: Clock, stat: "stat-pending", iconBg: "rgba(245,158,11,0.12)", iconColor: "#F59E0B" },
    { key: "users", label: "Registered Users", value: stats.totalCustomers, icon: Users, stat: "stat-users", iconBg: "rgba(5,150,105,0.12)", iconColor: "#059669" },
    { key: "products", label: "Products", value: stats.totalProducts, icon: Package, stat: "stat-products", iconBg: "rgba(225,29,72,0.1)", iconColor: "#E11D48" },
    { key: "categories", label: "Categories", value: stats.totalCategories, icon: Layers, stat: "stat-categories", iconBg: "rgba(107,63,160,0.12)", iconColor: "#6B3FA0" }
  ] : [];

  const navCounts = {
    categories: adminCategories.length,
    products: productsList.length,
    orders: ordersList.length,
    customers: customersList.length
  };

  return (
    <div className="container py-4" id="admin-dashboard-layout">
      <div className="admin-layout animate-fade-in-up">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar-brand">
            <h5>♔ Command Center</h5>
            <span>Admin Dashboard</span>
          </div>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setAdminTab(id)}
              className={`admin-nav-item ${adminTab === id ? "active" : ""}`}
            >
              <Icon size={18} />
              {label}
              {navCounts[id] !== undefined && (
                <span className="admin-nav-badge">{navCounts[id]}</span>
              )}
            </button>
          ))}
          <div className="mt-auto pt-3">
            <button onClick={loadAdminData} className="admin-nav-item">
              <RefreshCw size={16} /> Refresh Data
            </button>
          </div>
        </aside>

        {/* Mobile tabs */}
        <div className="admin-sidebar-mobile w-100">
          {NAV_ITEMS.map(({ id, label }) => (
            <button key={id} onClick={() => setAdminTab(id)} className={`admin-tab-pill ${adminTab === id ? "active" : ""}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <main className="admin-main">
          {successMessage && <div className="admin-alert admin-alert-success">✓ {successMessage}</div>}
          {errorMessage && <div className="admin-alert admin-alert-error">⚠ {errorMessage}</div>}

          {loading ? (
            <div className="py-5 text-center text-muted font-mono-custom loading-shimmer rounded-3" style={{ height: "200px" }} />
          ) : (
            <>
              {/* OVERVIEW */}
              {adminTab === "overview" && stats && (
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                      <h2 className="font-serif-custom fw-bold m-0" style={{ fontSize: "1.75rem" }}>Store Overview</h2>
                      <p className="text-muted m-0 mt-1" style={{ fontSize: "0.85rem" }}>Live statistics from your Laravel backend</p>
                    </div>
                    <div className="d-flex align-items-center gap-2 text-success" style={{ fontSize: "0.75rem" }}>
                      <TrendingUp size={16} />
                      <span className="fw-bold">Live</span>
                    </div>
                  </div>

                  <div className="admin-stat-grid">
                    {statCards.map(({ key, label, value, icon: Icon, stat, iconBg, iconColor }) => (
                      <div key={key} className={`admin-stat-card ${stat}`}>
                        <div className="admin-stat-icon" style={{ background: iconBg, color: iconColor }}>
                          <Icon size={22} />
                        </div>
                        <div className="admin-stat-value">{value}</div>
                        <div className="admin-stat-label">{label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="row g-4">
                    <div className="col-lg-7">
                      <div className="admin-panel-card">
                        <div className="admin-panel-header">
                          <h6>Recent Orders</h6>
                          <button onClick={() => setAdminTab("orders")} className="btn btn-link text-gold-custom p-0" style={{ fontSize: "0.75rem" }}>View all →</button>
                        </div>
                        <div className="table-responsive">
                          <table className="admin-table">
                            <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
                            <tbody>
                              {(stats.recentOrders?.length ? stats.recentOrders : ordersList.slice(0, 5)).map((o) => (
                                <tr key={o.id}>
                                  <td><strong>#{o.id}</strong></td>
                                  <td>{o.user?.name || "—"}</td>
                                  <td className="text-gold-custom fw-bold">${Number(o.total ?? o.total_price).toFixed(2)}</td>
                                  <td><StatusBadge status={o.status} /></td>
                                </tr>
                              ))}
                              {!stats.recentOrders?.length && ordersList.length === 0 && (
                                <tr><td colSpan={4} className="text-center text-muted py-4">No orders yet</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-5">
                      <div className="admin-panel-card">
                        <div className="admin-panel-header"><h6>Low Stock Alert</h6></div>
                        <div className="p-3">
                          {productsList.filter((p) => p.stock <= 5).length === 0 ? (
                            <p className="text-success fw-bold m-0 py-3 text-center" style={{ fontSize: "0.85rem" }}>✓ All stock levels healthy</p>
                          ) : (
                            productsList.filter((p) => p.stock <= 5).map((p) => (
                              <div key={p.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                                <span style={{ fontSize: "0.82rem" }} className="fw-semibold text-truncate me-2">{p.name}</span>
                                <span className={`status-badge ${p.stock === 0 ? "status-cancelled" : "status-pending"}`}>{p.stock === 0 ? "Out" : `${p.stock} left`}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                      <div className="admin-panel-card mt-3">
                        <div className="admin-panel-header"><h6>Quick Actions</h6></div>
                        <div className="p-3 d-grid gap-2">
                          <button onClick={() => { resetCategoryForm(); setAdminTab("categories"); }} className="btn btn-dark-custom py-2 d-flex align-items-center gap-2 justify-content-center" style={{ fontSize: "0.78rem" }}>
                            <Plus size={14} /> Add Category
                          </button>
                          <button onClick={() => { resetProductForm(); setAdminTab("products"); }} className="btn btn-gold-custom py-2 d-flex align-items-center gap-2 justify-content-center" style={{ fontSize: "0.78rem" }}>
                            <Plus size={14} /> Add Product
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CATEGORIES CRUD */}
              {adminTab === "categories" && (
                <div className="row g-4">
                  <div className="col-lg-4">
                    <div className="admin-form-card">
                      <h6 className="font-serif-custom fw-bold mb-3" style={{ color: "var(--color-gold-light)" }}>
                        {selectedCategory ? "Edit Category" : "New Category"}
                      </h6>
                      <form onSubmit={handleSaveCategory} className="d-grid gap-3">
                        <div>
                          <label>Name *</label>
                          <input className="form-control" required value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Chess Boards" />
                        </div>
                        <div>
                          <label>Slug</label>
                          <input className="form-control" value={catSlug} onChange={(e) => setCatSlug(e.target.value)} placeholder="boards (auto-generated if empty)" />
                        </div>
                        <div>
                          <label>Description</label>
                          <textarea className="form-control" rows={2} value={catDescription} onChange={(e) => setCatDescription(e.target.value)} />
                        </div>
                        <div>
                          <label>Image URL</label>
                          <input className="form-control" value={catImage} onChange={(e) => setCatImage(e.target.value)} placeholder="https://..." />
                        </div>
                        <button type="submit" className="btn btn-gold-custom py-2 fw-bold">
                          {selectedCategory ? "Save Changes" : "Create Category"}
                        </button>
                        {selectedCategory && (
                          <button type="button" onClick={resetCategoryForm} className="btn btn-outline-gold py-2">Cancel</button>
                        )}
                      </form>
                    </div>
                  </div>
                  <div className="col-lg-8">
                    <div className="admin-panel-card">
                      <div className="admin-panel-header"><h6>All Categories ({adminCategories.length})</h6></div>
                      <div className="table-responsive">
                        <table className="admin-table">
                          <thead><tr><th>Name</th><th>Slug</th><th>Products</th><th>Description</th><th></th></tr></thead>
                          <tbody>
                            {adminCategories.map((c) => (
                              <tr key={c.id}>
                                <td className="fw-bold">{c.name}</td>
                                <td><code style={{ fontSize: "0.75rem" }}>{c.slug}</code></td>
                                <td><span className="status-badge status-processing">{c.productsCount ?? 0}</span></td>
                                <td className="text-muted text-truncate" style={{ maxWidth: "180px" }}>{c.description || "—"}</td>
                                <td className="text-end">
                                  <button onClick={() => handleEditCategory(c)} className="admin-action-btn me-1"><Edit2 size={14} /></button>
                                  <button onClick={() => handleDeleteCategory(c.id, c.name)} className="admin-action-btn danger"><Trash2 size={14} /></button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PRODUCTS CRUD */}
              {adminTab === "products" && (
                <div className="row g-4">
                  <div className="col-lg-4">
                    <div className="admin-form-card">
                      <h6 className="font-serif-custom fw-bold mb-3" style={{ color: "var(--color-gold-light)" }}>
                        {selectedProduct ? "Edit Product" : "New Product"}
                      </h6>
                      <form onSubmit={handleSaveProduct} className="d-grid gap-3">
                        <div>
                          <label>Name *</label>
                          <input className="form-control" required value={formName} onChange={(e) => setFormName(e.target.value)} />
                        </div>
                        <div>
                          <label>Category *</label>
                          <select className="form-select" required value={formCategoryId} onChange={(e) => setFormCategoryId(e.target.value)}>
                            {adminCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                        <div className="row g-2">
                          <div className="col-6">
                            <label>Price *</label>
                            <input type="number" step="0.01" className="form-control" required value={formPrice} onChange={(e) => setFormPrice(e.target.value)} />
                          </div>
                          <div className="col-6">
                            <label>Quantity *</label>
                            <input type="number" min="0" className="form-control" required value={formQuantity} onChange={(e) => setFormQuantity(e.target.value)} />
                          </div>
                        </div>
                        <div>
                          <label>Image URL</label>
                          <input className="form-control" value={formImage} onChange={(e) => setFormImage(e.target.value)} />
                        </div>
                        <div>
                          <label>Description</label>
                          <textarea className="form-control" rows={3} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
                        </div>
                        <div className="form-check">
                          <input type="checkbox" className="form-check-input" id="prod-active" checked={formStatus} onChange={(e) => setFormStatus(e.target.checked)} />
                          <label className="form-check-label text-white-50" htmlFor="prod-active" style={{ fontSize: "0.8rem" }}>Active in store</label>
                        </div>
                        <button type="submit" className="btn btn-gold-custom py-2 fw-bold">
                          {selectedProduct ? "Save Product" : "Create Product"}
                        </button>
                        {selectedProduct && <button type="button" onClick={resetProductForm} className="btn btn-outline-gold py-2">Cancel</button>}
                      </form>
                    </div>
                  </div>
                  <div className="col-lg-8">
                    <div className="admin-panel-card">
                      <div className="admin-panel-header"><h6>Product Inventory ({productsList.length})</h6></div>
                      <div className="table-responsive">
                        <table className="admin-table">
                          <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr></thead>
                          <tbody>
                            {productsList.map((p) => (
                              <tr key={p.id}>
                                <td>
                                  <div className="d-flex align-items-center gap-2">
                                    {p.image && <img src={p.image} alt="" style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 8 }} />}
                                    <div>
                                      <div className="fw-bold">{p.name}</div>
                                      <div className="text-muted" style={{ fontSize: "0.68rem" }}>#{p.id}</div>
                                    </div>
                                  </div>
                                </td>
                                <td>{p.categoryName || p.category}</td>
                                <td className="fw-bold">${p.price.toFixed(2)}</td>
                                <td className={p.stock <= 5 ? "text-danger fw-bold" : ""}>{p.stock}</td>
                                <td><StatusBadge status={p.status !== false ? "Active" : "Hidden"} /></td>
                                <td className="text-end">
                                  <button onClick={() => handleEditProduct(p)} className="admin-action-btn me-1"><Edit2 size={14} /></button>
                                  <button onClick={() => handleDeleteProduct(p.id, p.name)} className="admin-action-btn danger"><Trash2 size={14} /></button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ORDERS */}
              {adminTab === "orders" && (
                <div className="admin-panel-card">
                  <div className="admin-panel-header">
                    <h6>Order Management ({ordersList.length})</h6>
                    <ShoppingBag size={20} className="text-gold-custom" />
                  </div>
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Update</th></tr>
                      </thead>
                      <tbody>
                        {ordersList.map((o) => (
                          <tr key={o.id}>
                            <td>
                              <strong>#{o.id}</strong>
                              <div className="text-muted" style={{ fontSize: "0.68rem" }}>{new Date(o.date || o.created_at).toLocaleDateString()}</div>
                            </td>
                            <td>
                              <div className="fw-semibold">{o.customerName || "—"}</div>
                              <div className="text-muted" style={{ fontSize: "0.72rem" }}>{o.phone}</div>
                            </td>
                            <td style={{ maxWidth: "160px" }}>
                              {o.items?.map((i, idx) => (
                                <div key={idx} className="text-muted text-truncate" style={{ fontSize: "0.72rem" }}>{i.name} ×{i.quantity}</div>
                              ))}
                            </td>
                            <td className="fw-bold text-gold-custom">${Number(o.total).toFixed(2)}</td>
                            <td><code style={{ fontSize: "0.7rem" }}>{o.payment_method}</code></td>
                            <td><StatusBadge status={o.status} /></td>
                            <td>
                              <select
                                value={o.status}
                                onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                                className="form-select form-select-sm"
                                style={{ fontSize: "0.75rem", width: "130px", borderRadius: "var(--radius-sm)" }}
                              >
                                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </td>
                          </tr>
                        ))}
                        {ordersList.length === 0 && (
                          <tr><td colSpan={7} className="text-center text-muted py-5">No orders yet</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* CUSTOMERS */}
              {adminTab === "customers" && (
                <div className="admin-panel-card">
                  <div className="admin-panel-header"><h6>Customer Registry ({customersList.length})</h6></div>
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th></tr></thead>
                      <tbody>
                        {customersList.map((c) => (
                          <tr key={c.id}>
                            <td className="fw-bold">{c.name}</td>
                            <td>{c.email}</td>
                            <td>{c.phone || "—"}</td>
                            <td><span className={`status-badge ${c.role === "admin" ? "status-shipped" : "status-processing"}`}>{c.role}</span></td>
                            <td className="text-muted">{c.joinedDate || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
