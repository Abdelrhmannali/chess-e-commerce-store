import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Layers,
  Trophy,
  ArrowDownCircle,
  Eye,
  X
} from "lucide-react";
import { FaChessKing } from "react-icons/fa6";
import { api } from "../utils/api";
import { computeProductSalesRankings } from "../utils/mappers";
import { useToast } from "../context/ToastContext";
import AdminImageUpload from "./AdminImageUpload";
import { scrollToTop } from "./ScrollToTop";
import "../styles/Admin.css";
import "../styles/UserPages.css";

const formatSAR = (amount) =>
  `${Number(amount).toLocaleString("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س`;

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
    key === "delivered" ? "beidaq-admin__status--delivered" :
    key === "shipped" ? "beidaq-admin__status--shipped" :
    key === "processing" ? "beidaq-admin__status--processing" :
    key === "cancelled" ? "beidaq-admin__status--cancelled" :
    key === "نشط" || key === "active" ? "beidaq-admin__status--active" :
    key === "مخفي" || key === "hidden" ? "beidaq-admin__status--hidden" :
    "beidaq-admin__status--pending";
  const label = STATUS_LABELS[status] || STATUS_LABELS[key] || status;
  return <span className={`beidaq-admin__status ${cls}`}>{label}</span>;
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

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [catName, setCatName] = useState("");
  const [catDescription, setCatDescription] = useState("");
  const [catImageFile, setCatImageFile] = useState(null);
  const [catExistingImage, setCatExistingImage] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);
  const [categoryUploadProgress, setCategoryUploadProgress] = useState(null);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingCustomerDetail, setLoadingCustomerDetail] = useState(false);

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
    if (adminTab !== "customers") {
      setSelectedCustomer(null);
      setCustomerOrders([]);
    }
  }, [adminTab]);

  useEffect(() => {
    scrollToTop();
  }, [adminTab]);

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
      if (selectedCustomer) {
        const { orders } = await api.getAdminCustomer(selectedCustomer.id);
        setCustomerOrders(orders);
      }
    } catch (err) {
      flash(err.message || "فشل تحديث الطلب.", true);
    }
  };

  const handleSelectCustomer = async (customer) => {
    if (selectedCustomer?.id === customer.id) {
      setSelectedCustomer(null);
      setCustomerOrders([]);
      return;
    }

    setSelectedCustomer(customer);
    setCustomerOrders([]);
    setLoadingCustomerDetail(true);
    try {
      const { user, orders } = await api.getAdminCustomer(customer.id);
      setSelectedCustomer(user);
      setCustomerOrders(orders);
    } catch (err) {
      flash(err.message || "تعذر تحميل بيانات العميل.", true);
      setSelectedCustomer(null);
    } finally {
      setLoadingCustomerDetail(false);
    }
  };

  const statCards = stats ? [
    { key: "revenue", label: "إجمالي الإيرادات (مُحصَّل)", value: formatSAR(stats.totalSales), icon: DollarSign, iconBg: "rgba(212,175,55,0.12)", iconColor: "#B8962E" },
    { key: "pending-revenue", label: "إيرادات قيد التحصيل", value: formatSAR(stats.pendingRevenue ?? 0), icon: Clock, iconBg: "rgba(245,158,11,0.12)", iconColor: "#F59E0B" },
    { key: "orders", label: "إجمالي الطلبات", value: stats.totalOrders, icon: Receipt, iconBg: "rgba(124,58,237,0.1)", iconColor: "#7C3AED" },
    { key: "pending", label: "طلبات قيد الانتظار", value: stats.pendingOrders, icon: Clock, iconBg: "rgba(245,158,11,0.12)", iconColor: "#F59E0B" },
    { key: "users", label: "المستخدمون المسجلون", value: stats.totalCustomers, icon: Users, iconBg: "rgba(5,150,105,0.1)", iconColor: "#059669" },
    { key: "products", label: "المنتجات", value: stats.totalProducts, icon: Package, iconBg: "rgba(225,29,72,0.08)", iconColor: "#E11D48" },
    { key: "categories", label: "التصنيفات", value: stats.totalCategories, icon: Layers, iconBg: "rgba(15,17,21,0.06)", iconColor: "#121212" }
  ] : [];

  const navCounts = {
    categories: adminCategories.length,
    products: productsList.length,
    orders: ordersList.length,
    customers: customersList.length
  };

  const productSalesRankings = useMemo(
    () => computeProductSalesRankings(ordersList, productsList),
    [ordersList, productsList]
  );

  const renderProductInsightCard = (product, variant, label, Icon) => {
    if (!product) {
      return (
        <div className={`beidaq-admin__product-insight beidaq-admin__product-insight--${variant}`}>
          <div className="beidaq-admin__product-insight-head">
            <span className="beidaq-admin__product-insight-badge">
              <Icon size={15} />
              {label}
            </span>
          </div>
          <p className="beidaq-admin__product-insight-empty">لا توجد مبيعات بعد</p>
        </div>
      );
    }

    const isSameProduct =
      productSalesRankings.topProduct &&
      productSalesRankings.bottomProduct &&
      productSalesRankings.topProduct.productId === productSalesRankings.bottomProduct.productId &&
      productSalesRankings.topProduct.name === productSalesRankings.bottomProduct.name;

    return (
      <div className={`beidaq-admin__product-insight beidaq-admin__product-insight--${variant}`}>
        <div className="beidaq-admin__product-insight-head">
          <span className="beidaq-admin__product-insight-badge">
            <Icon size={15} />
            {label}
          </span>
          {variant === "bottom" && isSameProduct && (
            <span className="beidaq-admin__product-insight-note">منتج واحد فقط</span>
          )}
        </div>
        <div className="beidaq-admin__product-insight-body">
          {product.image ? (
            <img src={product.image} alt={product.name} className="beidaq-admin__product-insight-img" referrerPolicy="no-referrer" />
          ) : (
            <div className="beidaq-admin__product-insight-img beidaq-admin__product-insight-img--placeholder">
              <Package size={22} />
            </div>
          )}
          <div className="beidaq-admin__product-insight-info">
            <h3 className="beidaq-admin__product-insight-name">{product.name}</h3>
            <div className="beidaq-admin__product-insight-metrics">
              <span>
                <strong>{product.quantity.toLocaleString("ar-SA")}</strong>
                {" "}وحدة مباعة
              </span>
              <span className="beidaq-admin__product-insight-revenue">{formatSAR(product.revenue)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="beidaq-admin rtl" id="admin-dashboard-layout">
      <div className="container">
        <div className="beidaq-admin__layout">
          <aside className="beidaq-admin__sidebar">
            <div className="beidaq-admin__brand">
              <div className="beidaq-admin__brand-icon">
                <FaChessKing size={18} />
              </div>
              <h2 className="beidaq-admin__brand-title">مركز القيادة</h2>
              <span className="beidaq-admin__brand-sub">لوحة إدارة بيدق</span>
            </div>
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setAdminTab(id)}
                className={`beidaq-admin__nav-item${adminTab === id ? " beidaq-admin__nav-item--active" : ""}`}
              >
                <Icon size={18} />
                {label}
                {navCounts[id] !== undefined && (
                  <span className="beidaq-admin__nav-badge">{navCounts[id]}</span>
                )}
              </button>
            ))}
            <div className="mt-auto pt-3">
              <button type="button" onClick={loadAdminData} className="beidaq-admin__nav-item">
                <RefreshCw size={16} />
                تحديث البيانات
              </button>
            </div>
          </aside>

          <div className="beidaq-admin__mobile-tabs w-100">
            {NAV_ITEMS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setAdminTab(id)}
                className={`beidaq-admin__tab-pill${adminTab === id ? " beidaq-admin__tab-pill--active" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>

          <main className="beidaq-admin__main">
            {errorMessage && (
              <div className="beidaq-admin__alert beidaq-admin__alert--error">⚠ {errorMessage}</div>
            )}

            {loading ? (
              <div className="beidaq-admin__loading" />
            ) : (
              <>
                {adminTab === "overview" && stats && (
                  <div>
                    <div className="beidaq-admin__page-head">
                      <div>
                        <h1 className="beidaq-admin__page-title">نظرة عامة على المتجر</h1>
                        <p className="beidaq-admin__page-sub">إحصائيات مباشرة من الخادم</p>
                      </div>
                      <div className="beidaq-admin__live-badge">
                        <TrendingUp size={15} />
                        <span>مباشر</span>
                      </div>
                    </div>

                    <div className="beidaq-admin__stat-grid">
                      {statCards.map(({ key, label, value, icon: Icon, iconBg, iconColor }) => (
                        <div key={key} className="beidaq-admin__stat-card">
                          <div className="beidaq-admin__stat-icon" style={{ background: iconBg, color: iconColor }}>
                            <Icon size={22} />
                          </div>
                          <div className="beidaq-admin__stat-value">{value}</div>
                          <div className="beidaq-admin__stat-label">{label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="beidaq-admin__product-insight-grid mb-4">
                      {renderProductInsightCard(
                        productSalesRankings.topProduct,
                        "top",
                        "الأكثر مبيعاً",
                        Trophy
                      )}
                      {renderProductInsightCard(
                        productSalesRankings.bottomProduct,
                        "bottom",
                        "الأقل مبيعاً",
                        ArrowDownCircle
                      )}
                    </div>

                    {productSalesRankings.totalUnitsSold > 0 && (
                      <div className="beidaq-admin__insight-summary mb-4">
                        <TrendingUp size={16} />
                        <span>
                          إجمالي الوحدات المباعة:{" "}
                          <strong>{productSalesRankings.totalUnitsSold.toLocaleString("ar-SA")}</strong>
                          {" "}وحدة عبر {ordersList.filter((o) => String(o.statusRaw || "").toLowerCase() !== "cancelled").length} طلب
                        </span>
                      </div>
                    )}

                    <div className="row g-4">
                      <div className="col-lg-7">
                        <div className="beidaq-admin__panel">
                          <div className="beidaq-admin__panel-head">
                            <h2 className="beidaq-admin__panel-title">أحدث الطلبات</h2>
                            <button type="button" onClick={() => setAdminTab("orders")} className="beidaq-admin__panel-link">
                              عرض الكل ←
                            </button>
                          </div>
                          <div className="table-responsive">
                            <table className="beidaq-admin__table">
                              <thead>
                                <tr><th>الطلب</th><th>العميل</th><th>الإجمالي</th><th>الحالة</th></tr>
                              </thead>
                              <tbody>
                                {(stats.recentOrders?.length ? stats.recentOrders : ordersList.slice(0, 5)).map((o) => (
                                  <tr key={o.id}>
                                    <td><strong>#{o.id}</strong></td>
                                    <td>{o.user?.name || "—"}</td>
                                    <td className="beidaq-admin__price">{formatSAR(Number(o.total ?? o.total_price))}</td>
                                    <td><StatusBadge status={o.status} /></td>
                                  </tr>
                                ))}
                                {!stats.recentOrders?.length && ordersList.length === 0 && (
                                  <tr><td colSpan={4} className="text-center py-4" style={{ color: "#737373" }}>لا توجد طلبات بعد</td></tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-5">
                        <div className="beidaq-admin__panel">
                          <div className="beidaq-admin__panel-head">
                            <h2 className="beidaq-admin__panel-title">تنبيه المخزون المنخفض</h2>
                          </div>
                          <div className="beidaq-admin__panel-body">
                            {productsList.filter((p) => p.stock <= 5).length === 0 ? (
                              <p className="beidaq-admin__stock-ok">✓ جميع مستويات المخزون جيدة</p>
                            ) : (
                              productsList.filter((p) => p.stock <= 5).map((p) => (
                                <div key={p.id} className="beidaq-admin__stock-row">
                                  <span className="beidaq-admin__stock-name">{p.name}</span>
                                  <span className={`beidaq-admin__status ${p.stock === 0 ? "beidaq-admin__status--cancelled" : "beidaq-admin__status--pending"}`}>
                                    {p.stock === 0 ? "نفد" : `متبقي ${p.stock}`}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                        <div className="beidaq-admin__panel mt-3">
                          <div className="beidaq-admin__panel-head">
                            <h2 className="beidaq-admin__panel-title">إجراءات سريعة</h2>
                          </div>
                          <div className="beidaq-admin__panel-body d-grid gap-2">
                            <button
                              type="button"
                              onClick={() => { resetCategoryForm(); setAdminTab("categories"); }}
                              className="beidaq-admin__btn-dark"
                            >
                              <Plus size={14} />
                              إضافة تصنيف
                            </button>
                            <button
                              type="button"
                              onClick={() => { resetProductForm(); setAdminTab("products"); }}
                              className="beidaq-btn-gold beidaq-btn-gold--full"
                            >
                              <Plus size={14} />
                              إضافة منتج
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {adminTab === "categories" && (
                  <div className="row g-4">
                    <div className="col-lg-4">
                      <div className="beidaq-admin__form-card">
                        <h2 className="beidaq-admin__form-title">
                          {selectedCategory ? "تعديل التصنيف" : "تصنيف جديد"}
                        </h2>
                        <form onSubmit={handleSaveCategory} className="d-grid gap-3">
                          <div>
                            <label>الاسم *</label>
                            <input className="form-control" required value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="رقاع الشطرنج" />
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
                          <button type="submit" className="beidaq-btn-gold beidaq-btn-gold--full" disabled={savingCategory}>
                            {savingCategory ? "جاري الرفع…" : selectedCategory ? "حفظ التغييرات" : "إنشاء التصنيف"}
                          </button>
                          {selectedCategory && (
                            <button type="button" onClick={resetCategoryForm} className="beidaq-btn-outline">إلغاء</button>
                          )}
                        </form>
                      </div>
                    </div>
                    <div className="col-lg-8">
                      <div className="beidaq-admin__panel">
                        <div className="beidaq-admin__panel-head">
                          <h2 className="beidaq-admin__panel-title">جميع التصنيفات ({adminCategories.length})</h2>
                        </div>
                        <div className="table-responsive">
                          <table className="beidaq-admin__table">
                            <thead><tr><th>الاسم</th><th>الصورة</th><th>المنتجات</th><th>الوصف</th><th></th></tr></thead>
                            <tbody>
                              {adminCategories.map((c) => (
                                <tr key={c.id}>
                                  <td className="fw-bold">{c.name}</td>
                                  <td>
                                    {c.image ? (
                                      <img src={c.image} alt="" className="beidaq-admin__table-thumb" />
                                    ) : (
                                      <span style={{ fontSize: "0.72rem", color: "#737373" }}>—</span>
                                    )}
                                  </td>
                                  <td><span className="beidaq-admin__status beidaq-admin__status--processing">{c.productsCount ?? 0}</span></td>
                                  <td className="text-truncate" style={{ maxWidth: "180px", color: "#737373" }}>{c.description || "—"}</td>
                                  <td>
                                    <button type="button" onClick={() => handleEditCategory(c)} className="beidaq-admin__action-btn me-1"><Edit2 size={14} /></button>
                                    <button type="button" onClick={() => handleDeleteCategory(c.id, c.name)} className="beidaq-admin__action-btn beidaq-admin__action-btn--danger"><Trash2 size={14} /></button>
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

                {adminTab === "products" && (
                  <div className="row g-4">
                    <div className="col-lg-4">
                      <div className="beidaq-admin__form-card">
                        <h2 className="beidaq-admin__form-title">
                          {selectedProduct ? "تعديل المنتج" : "منتج جديد"}
                        </h2>
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
                              <label>السعر (ر.س) *</label>
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
                            <label className="form-check-label" htmlFor="prod-active">نشط في المتجر</label>
                          </div>
                          <button type="submit" className="beidaq-btn-gold beidaq-btn-gold--full" disabled={savingProduct}>
                            {savingProduct ? "جاري الرفع…" : selectedProduct ? "حفظ المنتج" : "إنشاء المنتج"}
                          </button>
                          {selectedProduct && (
                            <button type="button" onClick={resetProductForm} className="beidaq-btn-outline">إلغاء</button>
                          )}
                        </form>
                      </div>
                    </div>
                    <div className="col-lg-8">
                      <div className="beidaq-admin__panel">
                        <div className="beidaq-admin__panel-head">
                          <h2 className="beidaq-admin__panel-title">مخزون المنتجات ({productsList.length})</h2>
                        </div>
                        <div className="table-responsive">
                          <table className="beidaq-admin__table">
                            <thead><tr><th>المنتج</th><th>التصنيف</th><th>السعر</th><th>المخزون</th><th>الحالة</th><th></th></tr></thead>
                            <tbody>
                              {productsList.map((p) => (
                                <tr key={p.id}>
                                  <td>
                                    <div className="d-flex align-items-center gap-2 flex-row-reverse">
                                      {p.image && <img src={p.image} alt="" className="beidaq-admin__table-thumb" />}
                                      <div>
                                        <div className="fw-bold">{p.name}</div>
                                        <div style={{ fontSize: "0.68rem", color: "#737373" }}>#{p.id}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td>{p.categoryName || p.category}</td>
                                  <td className="beidaq-admin__price">{formatSAR(p.price)}</td>
                                  <td className={p.stock <= 5 ? "text-danger fw-bold" : ""}>{p.stock}</td>
                                  <td><StatusBadge status={p.status !== false ? "نشط" : "مخفي"} /></td>
                                  <td>
                                    <button type="button" onClick={() => handleEditProduct(p)} className="beidaq-admin__action-btn me-1"><Edit2 size={14} /></button>
                                    <button type="button" onClick={() => handleDeleteProduct(p.id, p.name)} className="beidaq-admin__action-btn beidaq-admin__action-btn--danger"><Trash2 size={14} /></button>
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

                {adminTab === "orders" && (
                  <div className="beidaq-admin__panel">
                    <div className="beidaq-admin__panel-head">
                      <h2 className="beidaq-admin__panel-title">إدارة الطلبات ({ordersList.length})</h2>
                      <ShoppingBag size={20} style={{ color: "#B8962E" }} />
                    </div>
                    <div className="table-responsive">
                      <table className="beidaq-admin__table">
                        <thead>
                          <tr><th>الطلب</th><th>العميل</th><th>العناصر</th><th>الإجمالي</th><th>الدفع</th><th>الحالة</th><th>تحديث</th></tr>
                        </thead>
                        <tbody>
                          {ordersList.map((o) => (
                            <tr key={o.id}>
                              <td>
                                <strong>#{o.id}</strong>
                                <div style={{ fontSize: "0.68rem", color: "#737373" }}>
                                  {new Date(o.date || o.created_at).toLocaleDateString("ar-SA")}
                                </div>
                              </td>
                              <td>
                                <div className="fw-semibold">{o.customerName || "—"}</div>
                                <div style={{ fontSize: "0.72rem", color: "#737373" }}>{o.phone}</div>
                              </td>
                              <td style={{ maxWidth: "160px" }}>
                                {o.items?.map((i, idx) => (
                                  <div key={idx} className="text-truncate" style={{ fontSize: "0.72rem", color: "#737373" }}>
                                    {i.name} ×{i.quantity}
                                  </div>
                                ))}
                              </td>
                              <td className="beidaq-admin__price">{formatSAR(Number(o.total))}</td>
                              <td><code style={{ fontSize: "0.7rem" }}>{o.payment_method}</code></td>
                              <td><StatusBadge status={o.status} /></td>
                              <td>
                                <select
                                  value={o.statusRaw || "pending"}
                                  onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                                  className="form-select form-select-sm"
                                  style={{ width: "130px" }}
                                >
                                  {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                                </select>
                              </td>
                            </tr>
                          ))}
                          {ordersList.length === 0 && (
                            <tr><td colSpan={7} className="text-center py-5" style={{ color: "#737373" }}>لا توجد طلبات بعد</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {adminTab === "customers" && (
                  <div className="d-flex flex-column gap-4">
                    <div className="beidaq-admin__panel">
                      <div className="beidaq-admin__panel-head">
                        <h2 className="beidaq-admin__panel-title">سجل العملاء ({customersList.length})</h2>
                      </div>
                      <div className="table-responsive">
                        <table className="beidaq-admin__table">
                          <thead>
                            <tr><th>الاسم</th><th>البريد</th><th>الهاتف</th><th>تاريخ الانضمام</th><th></th></tr>
                          </thead>
                          <tbody>
                            {customersList.map((c) => (
                              <tr
                                key={c.id}
                                className={`beidaq-admin__customer-row${
                                  selectedCustomer?.id === c.id ? " beidaq-admin__customer-row--active" : ""
                                }`}
                                onClick={() => handleSelectCustomer(c)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === "Enter" && handleSelectCustomer(c)}
                              >
                                <td className="fw-bold">{c.name}</td>
                                <td>{c.email}</td>
                                <td>{c.phone || "—"}</td>
                                <td style={{ color: "#737373" }}>{c.joinedDate || "—"}</td>
                                <td>
                                  <button
                                    type="button"
                                    className="beidaq-admin__action-btn"
                                    onClick={(e) => { e.stopPropagation(); handleSelectCustomer(c); }}
                                    title="عرض الطلبات"
                                    aria-label="عرض الطلبات"
                                  >
                                    <Eye size={14} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {customersList.length === 0 && (
                              <tr><td colSpan={5} className="text-center py-5" style={{ color: "#737373" }}>لا يوجد عملاء بعد</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {selectedCustomer && (
                      <div className="beidaq-admin__panel beidaq-admin__customer-detail">
                        <div className="beidaq-admin__panel-head">
                          <div>
                            <h2 className="beidaq-admin__panel-title mb-1">طلبات {selectedCustomer.name}</h2>
                            <p className="beidaq-admin__customer-meta mb-0">
                              {selectedCustomer.email}
                              {selectedCustomer.phone ? ` · ${selectedCustomer.phone}` : ""}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="beidaq-admin__action-btn"
                            onClick={() => { setSelectedCustomer(null); setCustomerOrders([]); }}
                            aria-label="إغلاق"
                          >
                            <X size={14} />
                          </button>
                        </div>

                        {loadingCustomerDetail ? (
                          <div className="beidaq-admin__loading" style={{ height: "120px" }} />
                        ) : customerOrders.length === 0 ? (
                          <p className="beidaq-admin__customer-empty">لا توجد طلبات لهذا العميل بعد.</p>
                        ) : (
                          <div className="beidaq-admin__customer-orders d-grid gap-3">
                            {customerOrders.map((order) => (
                              <article key={order.id} className="beidaq-admin__customer-order">
                                <div className="beidaq-admin__customer-order-head">
                                  <div>
                                    <strong>طلب #{order.id}</strong>
                                    <span className="beidaq-admin__customer-order-date">
                                      {new Date(order.date || order.created_at).toLocaleDateString("ar-SA")}
                                    </span>
                                  </div>
                                  <div className="d-flex align-items-center gap-2 flex-row-reverse">
                                    <StatusBadge status={order.status} />
                                    <span className="beidaq-admin__price">{formatSAR(Number(order.total))}</span>
                                  </div>
                                </div>
                                <ul className="beidaq-admin__customer-order-items">
                                  {order.items?.map((item, idx) => (
                                    <li key={idx} className="beidaq-admin__customer-order-item">
                                      {item.image && (
                                        <img src={item.image} alt="" className="beidaq-admin__table-thumb" referrerPolicy="no-referrer" />
                                      )}
                                      <span className="beidaq-admin__customer-order-item-name">{item.name}</span>
                                      <span className="beidaq-admin__customer-order-item-qty">&times;{item.quantity}</span>
                                      <span className="beidaq-admin__price">{formatSAR(item.subtotal ?? item.price * item.quantity)}</span>
                                    </li>
                                  ))}
                                </ul>
                                <div className="beidaq-admin__customer-order-foot">
                                  <span>الدفع: <code>{order.payment_method || "—"}</code></span>
                                  <span>التتبع: {order.trackingNumber}</span>
                                </div>
                              </article>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </section>
  );
}
