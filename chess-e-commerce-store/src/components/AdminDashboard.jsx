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
import { useToast } from "../context/ToastContext";
import AdminImageUpload from "./AdminImageUpload";

const NAV_ITEMS = [
  { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },
  { id: "categories", label: "التصنيفات", icon: FolderOpen },
  { id: "products", label: "المنتجات", icon: Package },
  { id: "orders", label: "الطلبات", icon: Receipt },
  { id: "customers", label: "العملاء", icon: Users }
];

const STATUS_OPTIONS = [
  { value: "pending", label: "قيد الانتظار" },
  { value: "processing", label: "قيد المعالجة" },
  { value: "shipped", label: "تم الشحن" },
  { value: "delivered", label: "تم التوصيل" },
  { value: "cancelled", label: "ملغى" }
];

const STATUS_LABELS = {
  Pending: "قيد الانتظار",
  Processing: "قيد المعالجة",
  Shipped: "تم الشحن",
  Delivered: "تم التوصيل",
  Cancelled: "ملغى",
  pending: "قيد الانتظار",
  processing: "قيد المعالجة",
  shipped: "تم الشحن",
  delivered: "تم التوصيل",
  cancelled: "ملغى",
  "نشط": "نشط",
  "مخفي": "مخفي",
  Active: "نشط",
  Hidden: "مخفي"
};

function StatusBadge({ status }) {
  const key = (status || "").toLowerCase();
  const cls =
    key === "delivered" ? "status-delivered" :
    key === "shipped" ? "status-shipped" :
    key === "processing" ? "status-processing" :
    key === "cancelled" ? "status-cancelled" : "status-pending";
  const label = STATUS_LABELS[status] || STATUS_LABELS[key] || status;
  return <span className={`status-badge ${cls}`}>{label}</span>;
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

  // Product form
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formName, setFormName] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formQuantity, setFormQuantity] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImageFile, setFormImageFile] = useState(null);
  const [formExistingImage, setFormExistingImage] = useState("");
  const [formStatus, setFormStatus] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);
  const [productUploadProgress, setProductUploadProgress] = useState(null);

  // Category form
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catDescription, setCatDescription] = useState("");
  const [catImageFile, setCatImageFile] = useState(null);
  const [catExistingImage, setCatExistingImage] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);
  const [categoryUploadProgress, setCategoryUploadProgress] = useState(null);

  const { showSuccess, showError } = useToast();

  const flash = (msg, isError = false) => {
    if (isError) showError(msg);
    else showSuccess(msg);
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
      setErrorMessage(err.message || "فشل تحميل بيانات لوحة الإدارة.");
    } finally {
      setLoading(false);
    }
  }, [categories, formCategoryId]);

  useEffect(() => { loadAdminData(); }, [adminTab]);

  useEffect(() => {
    if (categories.length > 0) {
      setAdminCategories(categories);
    }
  }, [categories]);

  const resetProductForm = () => {
    setSelectedProduct(null);
    setFormName("");
    setFormCategoryId(String(adminCategories[0]?.id || ""));
    setFormPrice("");
    setFormQuantity("");
    setFormDescription("");
    setFormImageFile(null);
    setFormExistingImage("");
    setFormStatus(true);
    setProductUploadProgress(null);
  };

  const resetCategoryForm = () => {
    setSelectedCategory(null);
    setCatName("");
    setCatSlug("");
    setCatDescription("");
    setCatImageFile(null);
    setCatExistingImage("");
    setCategoryUploadProgress(null);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formName || !formPrice || !formQuantity || !formCategoryId) {
      flash("يرجى إكمال جميع حقول المنتج المطلوبة.", true);
      return;
    }
    if (!selectedProduct && !formImageFile) {
      flash("يرجى رفع صورة للمنتج.", true);
      return;
    }
    const payload = {
      category_id: Number(formCategoryId),
      name: formName,
      description: formDescription,
      price: Number(formPrice),
      quantity: Number(formQuantity),
      status: formStatus
    };
    setSavingProduct(true);
    setProductUploadProgress(0);
    try {
      const onProgress = (pct) => setProductUploadProgress(pct);
      if (selectedProduct) await api.updateProduct(selectedProduct.id, payload, formImageFile, onProgress);
      else await api.addProduct(payload, formImageFile, onProgress);
      flash(selectedProduct ? `تم تحديث "${formName}".` : `تم إنشاء "${formName}".`);
      resetProductForm();
      await loadAdminData();
      onRefreshCatalog?.();
    } catch (err) {
      flash(err.message || "فشل حفظ المنتج.", true);
    } finally {
      setSavingProduct(false);
      setProductUploadProgress(null);
    }
  };

  const handleEditProduct = (prod) => {
    setSelectedProduct(prod);
    setFormName(prod.name);
    setFormCategoryId(String(prod.categoryId || adminCategories[0]?.id || ""));
    setFormPrice(prod.price.toString());
    setFormQuantity(prod.stock.toString());
    setFormDescription(prod.description || "");
    setFormImageFile(null);
    setFormExistingImage(prod.image || prod.images?.[0] || "");
    setFormStatus(prod.status !== false);
    setProductUploadProgress(null);
    setAdminTab("products");
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`حذف "${name}"؟`)) return;
    try {
      await api.deleteProduct(id);
      flash(`تم حذف "${name}".`);
      await loadAdminData();
      onRefreshCatalog?.();
    } catch (err) {
      flash(err.message || "فشل الحذف.", true);
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) { flash("اسم التصنيف مطلوب.", true); return; }
    if (!selectedCategory && !catImageFile) {
      flash("يرجى رفع صورة للتصنيف.", true);
      return;
    }
    const payload = {
      name: catName.trim(),
      slug: catSlug.trim() || undefined,
      description: catDescription.trim() || undefined
    };
    setSavingCategory(true);
    setCategoryUploadProgress(0);
    try {
      const onProgress = (pct) => setCategoryUploadProgress(pct);
      if (selectedCategory) await api.updateCategory(selectedCategory.id, payload, catImageFile, onProgress);
      else await api.addCategory(payload, catImageFile, onProgress);
      flash(selectedCategory ? `تم تحديث "${catName}".` : `تم إنشاء "${catName}".`);
      resetCategoryForm();
      await loadAdminData();
      onRefreshCatalog?.();
    } catch (err) {
      flash(err.message || "فشل حفظ التصنيف.", true);
    } finally {
      setSavingCategory(false);
      setCategoryUploadProgress(null);
    }
  };

  const handleEditCategory = (cat) => {
    setSelectedCategory(cat);
    setCatName(cat.name);
    setCatSlug(cat.slug || "");
    setCatDescription(cat.description || "");
    setCatImageFile(null);
    setCatExistingImage(cat.image || "");
    setCategoryUploadProgress(null);
    setAdminTab("categories");
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`حذف التصنيف "${name}"؟ قد تتأثر المنتجات التابعة له.`)) return;
    try {
      await api.deleteCategory(id);
      flash(`تم حذف "${name}".`);
      await loadAdminData();
      onRefreshCatalog?.();
    } catch (err) {
      flash(err.message || "فشل حذف التصنيف.", true);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await api.updateOrderStatus(orderId, status);
      flash(`الطلب #${orderId} → ${STATUS_OPTIONS.find((s) => s.value === status)?.label || status}`);
      await loadAdminData();
    } catch (err) {
      flash(err.message || "فشل تحديث الطلب.", true);
    }
  };

  const statCards = stats ? [
    { key: "revenue", label: "إجمالي الإيرادات", value: `$${stats.totalSales.toFixed(2)}`, icon: DollarSign, stat: "stat-revenue", iconBg: "rgba(0,0,0,0.06)", iconColor: "#121212" },
    { key: "orders", label: "إجمالي الطلبات", value: stats.totalOrders, icon: Receipt, stat: "stat-orders", iconBg: "rgba(124,58,237,0.12)", iconColor: "#7C3AED" },
    { key: "pending", label: "طلبات قيد الانتظار", value: stats.pendingOrders, icon: Clock, stat: "stat-pending", iconBg: "rgba(245,158,11,0.12)", iconColor: "#F59E0B" },
    { key: "users", label: "المستخدمون المسجلون", value: stats.totalCustomers, icon: Users, stat: "stat-users", iconBg: "rgba(5,150,105,0.12)", iconColor: "#059669" },
    { key: "products", label: "المنتجات", value: stats.totalProducts, icon: Package, stat: "stat-products", iconBg: "rgba(225,29,72,0.1)", iconColor: "#E11D48" },
    { key: "categories", label: "التصنيفات", value: stats.totalCategories, icon: Layers, stat: "stat-categories", iconBg: "rgba(107,63,160,0.12)", iconColor: "#6B3FA0" }
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
            <h5>♔ مركز القيادة</h5>
            <span>لوحة الإدارة</span>
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
              <RefreshCw size={16} /> تحديث البيانات
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
                      <h2 className="font-serif-custom fw-bold m-0" style={{ fontSize: "1.75rem" }}>نظرة عامة على المتجر</h2>
                      <p className="text-muted m-0 mt-1" style={{ fontSize: "0.85rem" }}>إحصائيات مباشرة من الخادم</p>
                    </div>
                    <div className="d-flex align-items-center gap-2 text-success" style={{ fontSize: "0.75rem" }}>
                      <TrendingUp size={16} />
                      <span className="fw-bold">مباشر</span>
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
                          <h6>أحدث الطلبات</h6>
                          <button onClick={() => setAdminTab("orders")} className="btn btn-link text-gold-custom p-0" style={{ fontSize: "0.75rem" }}>عرض الكل ←</button>
                        </div>
                        <div className="table-responsive">
                          <table className="admin-table">
                            <thead><tr><th>الطلب</th><th>العميل</th><th>الإجمالي</th><th>الحالة</th></tr></thead>
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
                                <tr><td colSpan={4} className="text-center text-muted py-4">لا توجد طلبات بعد</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-5">
                      <div className="admin-panel-card">
                        <div className="admin-panel-header"><h6>تنبيه المخزون المنخفض</h6></div>
                        <div className="p-3">
                          {productsList.filter((p) => p.stock <= 5).length === 0 ? (
                            <p className="text-success fw-bold m-0 py-3 text-center" style={{ fontSize: "0.85rem" }}>✓ جميع مستويات المخزون جيدة</p>
                          ) : (
                            productsList.filter((p) => p.stock <= 5).map((p) => (
                              <div key={p.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                                <span style={{ fontSize: "0.82rem" }} className="fw-semibold text-truncate me-2">{p.name}</span>
                                <span className={`status-badge ${p.stock === 0 ? "status-cancelled" : "status-pending"}`}>{p.stock === 0 ? "نفد" : `متبقي ${p.stock}`}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                      <div className="admin-panel-card mt-3">
                        <div className="admin-panel-header"><h6>إجراءات سريعة</h6></div>
                        <div className="p-3 d-grid gap-2">
                          <button onClick={() => { resetCategoryForm(); setAdminTab("categories"); }} className="btn btn-dark-custom py-2 d-flex align-items-center gap-2 justify-content-center" style={{ fontSize: "0.78rem" }}>
                            <Plus size={14} /> إضافة تصنيف
                          </button>
                          <button onClick={() => { resetProductForm(); setAdminTab("products"); }} className="btn btn-gold-custom py-2 d-flex align-items-center gap-2 justify-content-center" style={{ fontSize: "0.78rem" }}>
                            <Plus size={14} /> إضافة منتج
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
                        {selectedCategory ? "تعديل التصنيف" : "تصنيف جديد"}
                      </h6>
                      <form onSubmit={handleSaveCategory} className="d-grid gap-3">
                        <div>
                          <label>الاسم *</label>
                          <input className="form-control" required value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="رقاع الشطرنج" />
                        </div>
                        <div>
                          <label>الرابط (Slug)</label>
                          <input className="form-control" value={catSlug} onChange={(e) => setCatSlug(e.target.value)} placeholder="boards (يُنشأ تلقائياً إن تُرك فارغاً)" />
                        </div>
                        <div>
                          <label>الوصف</label>
                          <textarea className="form-control" rows={2} value={catDescription} onChange={(e) => setCatDescription(e.target.value)} />
                        </div>
                        <AdminImageUpload
                          label="رفع صورة"
                          required={!selectedCategory}
                          existingImage={catExistingImage}
                          file={catImageFile}
                          onFileChange={setCatImageFile}
                          onError={(msg) => flash(msg, true)}
                          disabled={savingCategory}
                          uploadProgress={savingCategory ? categoryUploadProgress : null}
                        />
                        <button type="submit" className="btn btn-gold-custom py-2 fw-bold" disabled={savingCategory}>
                          {savingCategory ? "جاري الرفع…" : selectedCategory ? "حفظ التغييرات" : "إنشاء التصنيف"}
                        </button>
                        {selectedCategory && (
                          <button type="button" onClick={resetCategoryForm} className="btn btn-outline-gold py-2">إلغاء</button>
                        )}
                      </form>
                    </div>
                  </div>
                  <div className="col-lg-8">
                    <div className="admin-panel-card">
                      <div className="admin-panel-header"><h6>جميع التصنيفات ({adminCategories.length})</h6></div>
                      <div className="table-responsive">
                        <table className="admin-table">
                          <thead><tr><th>الاسم</th><th>الصورة</th><th>Slug</th><th>المنتجات</th><th>الوصف</th><th></th></tr></thead>
                          <tbody>
                            {adminCategories.map((c) => (
                              <tr key={c.id}>
                                <td className="fw-bold">{c.name}</td>
                                <td>
                                  {c.image ? (
                                    <img src={c.image} alt="" className="admin-table-thumb" />
                                  ) : (
                                    <span className="text-muted" style={{ fontSize: "0.72rem" }}>—</span>
                                  )}
                                </td>
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
                        {selectedProduct ? "تعديل المنتج" : "منتج جديد"}
                      </h6>
                      <form onSubmit={handleSaveProduct} className="d-grid gap-3">
                        <div>
                          <label>الاسم *</label>
                          <input className="form-control" required value={formName} onChange={(e) => setFormName(e.target.value)} />
                        </div>
                        <div>
                          <label>التصنيف *</label>
                          <select className="form-select" required value={formCategoryId} onChange={(e) => setFormCategoryId(e.target.value)}>
                            {adminCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                        <div className="row g-2">
                          <div className="col-6">
                            <label>السعر *</label>
                            <input type="number" step="0.01" className="form-control" required value={formPrice} onChange={(e) => setFormPrice(e.target.value)} />
                          </div>
                          <div className="col-6">
                            <label>الكمية *</label>
                            <input type="number" min="0" className="form-control" required value={formQuantity} onChange={(e) => setFormQuantity(e.target.value)} />
                          </div>
                        </div>
                        <AdminImageUpload
                          label="رفع صورة المنتج"
                          required={!selectedProduct}
                          existingImage={formExistingImage}
                          file={formImageFile}
                          onFileChange={setFormImageFile}
                          onError={(msg) => flash(msg, true)}
                          disabled={savingProduct}
                          uploadProgress={savingProduct ? productUploadProgress : null}
                        />
                        <div>
                          <label>الوصف</label>
                          <textarea className="form-control" rows={3} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
                        </div>
                        <div className="form-check">
                          <input type="checkbox" className="form-check-input" id="prod-active" checked={formStatus} onChange={(e) => setFormStatus(e.target.checked)} />
                          <label className="form-check-label text-white-50" htmlFor="prod-active" style={{ fontSize: "0.8rem" }}>نشط في المتجر</label>
                        </div>
                        <button type="submit" className="btn btn-gold-custom py-2 fw-bold" disabled={savingProduct}>
                          {savingProduct ? "جاري الرفع…" : selectedProduct ? "حفظ المنتج" : "إنشاء المنتج"}
                        </button>
                        {selectedProduct && <button type="button" onClick={resetProductForm} className="btn btn-outline-gold py-2">إلغاء</button>}
                      </form>
                    </div>
                  </div>
                  <div className="col-lg-8">
                    <div className="admin-panel-card">
                      <div className="admin-panel-header"><h6>مخزون المنتجات ({productsList.length})</h6></div>
                      <div className="table-responsive">
                        <table className="admin-table">
                          <thead><tr><th>المنتج</th><th>التصنيف</th><th>السعر</th><th>المخزون</th><th>الحالة</th><th></th></tr></thead>
                          <tbody>
                            {productsList.map((p) => (
                              <tr key={p.id}>
                                <td>
                                  <div className="d-flex align-items-center gap-2">
                                    {p.image && <img src={p.image} alt="" className="admin-table-thumb" />}
                                    <div>
                                      <div className="fw-bold">{p.name}</div>
                                      <div className="text-muted" style={{ fontSize: "0.68rem" }}>#{p.id}</div>
                                    </div>
                                  </div>
                                </td>
                                <td>{p.categoryName || p.category}</td>
                                <td className="fw-bold">${p.price.toFixed(2)}</td>
                                <td className={p.stock <= 5 ? "text-danger fw-bold" : ""}>{p.stock}</td>
                                <td><StatusBadge status={p.status !== false ? "نشط" : "مخفي"} /></td>
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
                    <h6>إدارة الطلبات ({ordersList.length})</h6>
                    <ShoppingBag size={20} className="text-gold-custom" />
                  </div>
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr><th>الطلب</th><th>العميل</th><th>العناصر</th><th>الإجمالي</th><th>الدفع</th><th>الحالة</th><th>تحديث</th></tr>
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
                                value={o.statusRaw || "pending"}
                                onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                                className="form-select form-select-sm"
                                style={{ fontSize: "0.75rem", width: "130px", borderRadius: "var(--radius-sm)" }}
                              >
                                {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                              </select>
                            </td>
                          </tr>
                        ))}
                        {ordersList.length === 0 && (
                          <tr><td colSpan={7} className="text-center text-muted py-5">لا توجد طلبات بعد</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* CUSTOMERS */}
              {adminTab === "customers" && (
                <div className="admin-panel-card">
                  <div className="admin-panel-header"><h6>سجل العملاء ({customersList.length})</h6></div>
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead><tr><th>الاسم</th><th>البريد</th><th>الهاتف</th><th>تاريخ الانضمام</th></tr></thead>
                      <tbody>
                        {customersList.map((c) => (
                          <tr key={c.id}>
                            <td className="fw-bold">{c.name}</td>
                            <td>{c.email}</td>
                            <td>{c.phone || "—"}</td>
                            <td className="text-muted">{c.joinedDate || "—"}</td>
                          </tr>
                        ))}
                        {customersList.length === 0 && (
                          <tr><td colSpan={4} className="text-center text-muted py-5">لا يوجد عملاء بعد</td></tr>
                        )}
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
