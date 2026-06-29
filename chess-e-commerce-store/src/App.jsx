import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  ChevronRight,
  Sparkles,
  Gem,
  Heart,
  ShoppingCart,
  ArrowRight,
  Lock,
  Award,
  Crown,
  BookOpen,
  Clock,
  ExternalLink
} from "lucide-react";
import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard";
import ProductDetailsModal from "./components/ProductDetailsModal";
import CartPage from "./components/CartPage";
import CheckoutPage from "./components/CheckoutPage";
import AccountPage from "./components/AccountPage";
import AdminDashboard from "./components/AdminDashboard";
import { api } from "./utils/api";
import { cartToUiItems, markBestSellers } from "./utils/mappers";
import { useLanguage } from "./context/LanguageContext";
import { useToast } from "./context/ToastContext";
import { hasPasswordResetLink } from "./utils/authParams";

const USER_TABS = new Set(["home", "shop", "cart", "checkout", "account", "wishlist"]);

export default function App() {
  const [activeTab, setActiveTab] = useState(() => (hasPasswordResetLink() ? "account" : "home"));
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popularity");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);

  const [apiOnline, setApiOnline] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const isAdmin = currentUser?.role === "admin";
  const passwordResetLink = hasPasswordResetLink();

  const loadCart = useCallback(async () => {
    if (!localStorage.getItem("chess_token")) return;
    try {
      const cart = await api.getCart();
      setCartItems(cartToUiItems(cart));
    } catch (e) {
      console.warn("Failed to load cart", e);
    }
  }, []);

  const reloadProducts = useCallback(async (cat = selectedCategory, q = searchQuery, sort = sortBy) => {
    try {
      const params = { search: q || undefined, sortBy: sort };
      if (cat !== "all") {
        const category = categories.find((c) => c.slug === cat || String(c.id) === cat);
        if (category) params.category_id = category.id;
      }
      const list = await api.getProducts(params);
      setProducts(markBestSellers(list, 3));
    } catch (e) {
      console.error("Error reloading products catalog", e);
    }
  }, [selectedCategory, searchQuery, sortBy, categories]);

  useEffect(() => {
    async function loadInitialData() {
      setLoadingProducts(true);
      try {
        await api.healthCheck();
        setApiOnline(true);
      } catch {
        setApiOnline(false);
      }

      try {
        const cats = await api.getCategories();
        setCategories(cats);

        const catalog = await api.getProducts({ per_page: 100 });
        setProducts(markBestSellers(catalog, 3));

        const token = localStorage.getItem("chess_token");
        if (hasPasswordResetLink()) {
          localStorage.removeItem("chess_token");
          setCurrentUser(null);
          setActiveTab("account");
        } else if (token) {
          const session = await api.getMe();
          setCurrentUser(session.user);
          if (session.user.role === "admin") {
            setActiveTab("admin");
          } else {
            const userOrders = await api.getOrders();
            setOrders(userOrders);
            await loadCart();
          }
        }
      } catch (err) {
        console.warn("Failed to load store data", err);
        setApiOnline(false);
        localStorage.removeItem("chess_token");
      } finally {
        setLoadingProducts(false);
      }
    }

    const cachedWish = localStorage.getItem("chess_wishlist");
    if (cachedWish) {
      try {
        setWishlist(JSON.parse(cachedWish));
      } catch (e) {
        console.error("Wish cache corrupt", e);
      }
    }

    loadInitialData();
  }, [loadCart]);

  useEffect(() => {
    if (isAdmin && USER_TABS.has(activeTab) && !hasPasswordResetLink()) {
      setActiveTab("admin");
    }
  }, [isAdmin, activeTab]);

  useEffect(() => {
    if (categories.length > 0) {
      reloadProducts();
    }
  }, [categories.length]);

  useEffect(() => {
    localStorage.setItem("chess_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setActiveTab("shop");
    reloadProducts(cat, searchQuery, sortBy);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveTab("shop");
    reloadProducts(selectedCategory, searchQuery, sortBy);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    reloadProducts(selectedCategory, searchQuery, newSort);
  };

  const handleLoginSuccess = async (user) => {
    setCurrentUser(user);
    setAuthOpen(false);

    if (user.role === "admin") {
      setActiveTab("admin");
      showSuccess("مرحباً بك في لوحة الإدارة.");
      return;
    }

    showSuccess("تم تسجيل الدخول بنجاح.");

    const pendingLocal = localStorage.getItem("chess_cart_pending");
    if (pendingLocal) {
      try {
        const items = JSON.parse(pendingLocal);
        await api.syncLocalCartToServer(items);
        localStorage.removeItem("chess_cart_pending");
      } catch (e) {
        console.warn("Cart sync failed", e);
      }
    }

    try {
      const userOrders = await api.getOrders();
      setOrders(userOrders);
      await loadCart();
    } catch (e) {
      console.error("Error syncing session", e);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      localStorage.removeItem("chess_token");
    }
    setCurrentUser(null);
    setOrders([]);
    setCartItems([]);
    setActiveTab("home");
    showSuccess("تم تسجيل الخروج.");
  };

  const handleAddToCart = async (product, e) => {
    if (e) e.stopPropagation();
    if (product.stock === 0) return;

    if (!currentUser) {
      setAuthOpen(true);
      return;
    }

    try {
      const cart = await api.addCartItem(product.id, 1);
      setCartItems(cartToUiItems(cart));
      setActiveTab("cart");
    } catch (err) {
      showError(err.message || "تعذر إضافة المنتج إلى السلة.");
    }
  };

  const handleUpdateQuantity = async (cartItemId, productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveFromCart(cartItemId, productId);
      return;
    }

    if (!currentUser) return;

    try {
      const cart = cartItemId
        ? await api.updateCartItem(cartItemId, newQty)
        : await api.addCartItem(productId, newQty);
      setCartItems(cartToUiItems(cart));
    } catch (err) {
      showError(err.message || "تعذر تحديث السلة.");
    }
  };

  const handleRemoveFromCart = async (cartItemId, productId) => {
    if (!currentUser) return;

    try {
      const cart = cartItemId
        ? await api.removeCartItem(cartItemId)
        : await api.clearCart();
      setCartItems(cartToUiItems(cart));
    } catch (err) {
      console.error(err);
      setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
    }
  };

  const handleToggleWishlist = (product, e) => {
    if (e) e.stopPropagation();
    setWishlist((prevWish) => {
      const exists = prevWish.some((item) => item.id === product.id);
      if (exists) return prevWish.filter((item) => item.id !== product.id);
      return [...prevWish, product];
    });
  };

  const handleRemoveFromWishlist = (productId, e) => {
    e.stopPropagation();
    setWishlist((prevWish) => prevWish.filter((item) => item.id !== productId));
  };

  const handleOrderCompleted = async () => {
    setCartItems([]);
    try {
      const freshCatalog = await api.getProducts({ per_page: 100 });
      setProducts(markBestSellers(freshCatalog, 3));
      const freshOrders = await api.getOrders();
      setOrders(freshOrders);
      if (currentUser) {
        const session = await api.getMe();
        setCurrentUser(session.user);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectProduct = async (product) => {
    try {
      const fresh = await api.getProduct(product.id);
      setSelectedProduct(fresh);
    } catch {
      setSelectedProduct(product);
    }
  };

  const handleBeginCheckout = () => {
    if (!currentUser) {
      setAuthOpen(true);
      return;
    }
    if (cartItems.length === 0) {
      setActiveTab("cart");
      return;
    }
    setActiveTab("checkout");
  };

  const refreshCatalogFull = async () => {
    try {
      const [freshCategories, freshCatalog] = await Promise.all([
        api.getCategories(),
        api.getProducts({ per_page: 100 })
      ]);
      setCategories(freshCategories);
      setProducts(markBestSellers(freshCatalog, 3));
    } catch (e) {
      console.error(e);
    }
  };

  const isWishlisted = (id) => wishlist.some((item) => item.id === id);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const categoryFilters = [{ slug: "all", name: "الكل" }, ...categories];

  const getCategoryLabel = (cat) => {
    if (cat === "all") return "الكل";
    const found = categories.find((c) => c.slug === cat);
    if (found) return found.name;
    if (cat === "boards") return t("boards");
    if (cat === "pieces") return t("pieces");
    if (cat === "clocks") return t("clocks");
    if (cat === "accessories") return t("accessories");
    return cat;
  };

  const featuredProduct = products[0];

  const footerCategories = categories.length > 0
    ? categories.slice(0, 4)
    : [
        { id: "boards", slug: "boards", name: t("boards") },
        { id: "pieces", slug: "pieces", name: t("pieces") },
        { id: "clocks", slug: "clocks", name: t("clocks") },
        { id: "accessories", slug: "accessories", name: t("accessories") }
      ];

  if (isAdmin && !passwordResetLink) {
    return (
      <div className="min-h-screen bg-white text-charcoal-custom d-flex flex-col flex-column rtl text-end">
        <Navbar
          currentUser={currentUser}
          onLogout={handleLogout}
          cartCount={0}
          wishlistCount={0}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAuth={() => setAuthOpen(true)}
          isAdminMode
        />
        <main className="flex-grow-1">
          {activeTab === "admin" && <AdminDashboard categories={categories} onRefreshCatalog={refreshCatalogFull} />}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-charcoal-custom d-flex flex-col flex-column rtl text-end">
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setAuthOpen(true)}
      />

      <main className="flex-grow-1">
        {activeTab === "home" && (
          <div className="d-grid gap-5 pb-5" id="home-view-page">
            <section className="hero-section text-white py-5 py-sm-5 border-bottom border-custom overflow-hidden position-relative">
              <div className="container py-4 position-relative" style={{ zIndex: "2" }}>
                <div className="row align-items-center g-4">
                  <div className="col-lg-6 order-lg-2 text-lg-end">
                    <div className="d-inline-flex align-items-center gap-1 hero-badge px-3 py-1 font-mono-custom text-uppercase mb-3" style={{ fontSize: "10px" }}>
                      <Sparkles size={12} className="animate-pulse" />
                      <span>{t("choiceOfSovereigns")}</span>
                    </div>
                    <h1 className="display-4 font-serif-custom fw-bold text-uppercase leading-tight mb-3">
                      {t("tactileStrategy")} <br />
                      <span className="hero-headline-accent">{t("uncompromised")}</span>
                    </h1>
                    <p className="hero-desc font-sans mb-4">
                      {t("heroDesc")}
                    </p>
                    <div className="d-flex flex-wrap gap-3">
                      <button onClick={() => handleCategorySelect("all")} className="btn btn-gold-custom px-4 py-3 text-uppercase fw-bold font-mono-custom d-flex align-items-center gap-2" style={{ fontSize: "11px" }}>
                        <span>{t("browseCatalog")}</span>
                        <ArrowRight size={14} className="rotate-180" />
                      </button>
                      {categories[0] && (
                        <button onClick={() => handleCategorySelect(categories[0].slug)} className="btn btn-outline-hero px-4 py-3 text-uppercase fw-bold font-mono-custom" style={{ fontSize: "11px" }}>
                          {t("explorePieces")}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="col-lg-6 d-flex justify-content-center order-lg-1">
                    <div className="hero-glass-card p-3 w-100 shadow-lg" style={{ maxWidth: "450px" }}>
                      <img
                        src={featuredProduct?.images?.[0] || "https://images.unsplash.com/photo-1523821741446-edb2b68bb7a0?auto=format&fit=crop&w=800&q=80"}
                        alt="Luxury Chess Setup"
                        referrerPolicy="no-referrer"
                        className="w-100 object-fit-cover"
                        style={{ height: "250px" }}
                      />
                      <div className="card-body p-0 pt-3 d-flex justify-content-between align-items-center">
                        <div className="text-start">
                          <span className="hero-headline-accent font-mono-custom text-uppercase d-block fw-bold" style={{ fontSize: "9px" }}>{t("artisanMasterpiece")}</span>
                          <span className="text-white fw-bold d-block" style={{ fontSize: "13px" }}>{featuredProduct?.name || t("championshipPieces")}</span>
                        </div>
                        {featuredProduct && (
                          <button onClick={() => handleSelectProduct(featuredProduct)} className="btn btn-outline-gold py-2 px-3 text-uppercase fw-bold font-mono-custom d-flex align-items-center gap-1" style={{ fontSize: "10px" }}>
                            <span>{t("inspect")}</span>
                            <ExternalLink size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="container">
              <div className="text-center mb-5">
                <span className="section-label-accent font-sans d-block mb-1" style={{ fontSize: "12px" }}>{t("featuredLayouts")}</span>
                <h3 className="font-serif-custom fw-bold text-charcoal-custom text-uppercase m-0">{t("curationCollections")}</h3>
                <div className="section-divider-accent" />
              </div>
              <div className="row g-3">
                {(categories.length > 0 ? categories.slice(0, 4) : [
                  { slug: "boards", name: t("boards"), description: t("boardsDesc") },
                  { slug: "pieces", name: t("pieces"), description: t("piecesDesc") },
                  { slug: "clocks", name: t("clocks"), description: t("clocksDesc") },
                  { slug: "accessories", name: t("accessories"), description: t("accessoriesDesc") }
                ]).map((cat, idx) => {
                  const icons = [Award, Crown, Clock, BookOpen];
                  const Icon = icons[idx] || Gem;
                  return (
                    <div className="col-6 col-md-3" key={cat.slug || cat.id}>
                      <div onClick={() => handleCategorySelect(cat.slug)} className="card h-100 p-4 border-custom bg-white text-center rounded-0 cursor-pointer shadow-sm category-hover-card">
                        <div className="d-flex align-items-center justify-content-center mx-auto mb-3 category-icon-wrap" style={{ width: "52px", height: "52px" }}>
                          <Icon size={20} />
                        </div>
                        <h6 className="font-mono-custom fw-bold text-charcoal-custom text-uppercase m-0">{cat.name}</h6>
                        <span className="text-muted font-mono-custom mt-1 d-block text-uppercase" style={{ fontSize: "9px" }}>{cat.description || ""}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="container mt-4">
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-baseline border-bottom pb-3 mb-4 flex-row-reverse">
                <div className="text-start">
                  <span className="section-label-accent font-sans d-block" style={{ fontSize: "10px" }}>{t("acquisitionLeaders")}</span>
                  <h4 className="font-serif-custom fw-bold text-charcoal-custom text-uppercase m-0">{t("bestSellers")}</h4>
                </div>
                <button onClick={() => handleCategorySelect("all")} className="btn btn-link text-decoration-none text-charcoal-custom font-sans fw-bold text-uppercase p-0 mt-2 mt-sm-0 d-flex align-items-center gap-1" style={{ fontSize: "11px" }}>
                  <span>{t("viewFullCatalog")}</span>
                  <ChevronRight size={14} className="rotate-180" />
                </button>
              </div>
              <div className="row g-4">
                {loadingProducts ? (
                  <div className="col-12 text-center text-muted font-mono-custom py-4">جاري تحميل الكتالوج...</div>
                ) : (
                  products.filter((p) => p.isBestSeller).slice(0, 3).map((product) => (
                    <div className="col-md-6 col-lg-4" key={product.id}>
                      <ProductCard product={product} onSelect={handleSelectProduct} onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} isWishlisted={isWishlisted(product.id)} />
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="container mt-4">
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-baseline border-bottom pb-3 mb-4 flex-row-reverse">
                <div className="text-start">
                  <span className="section-label-accent font-sans d-block" style={{ fontSize: "10px" }}>{t("craftHotRelease")}</span>
                  <h4 className="font-serif-custom fw-bold text-charcoal-custom text-uppercase m-0">{t("eliteNewArrivals")}</h4>
                </div>
                <button onClick={() => handleCategorySelect("all")} className="btn btn-link text-decoration-none text-charcoal-custom font-sans fw-bold text-uppercase p-0 mt-2 mt-sm-0 d-flex align-items-center gap-1" style={{ fontSize: "11px" }}>
                  <span>{t("viewFullCatalog")}</span>
                  <ChevronRight size={14} className="rotate-180" />
                </button>
              </div>
              <div className="row g-4">
                {products.filter((p) => p.isNewArrival).slice(0, 3).map((product) => (
                  <div className="col-md-6 col-lg-4" key={product.id}>
                    <ProductCard product={product} onSelect={handleSelectProduct} onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} isWishlisted={isWishlisted(product.id)} />
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === "shop" && (
          <div className="container py-5" id="shop-view-page">
            <div className="border-bottom pb-4 mb-4 d-flex flex-column md:flex-row align-items-md-center justify-content-between gap-3 flex-row-reverse">
              <div>
                <h2 className="font-serif-custom fw-bold text-charcoal-custom text-uppercase m-0">{t("sovereignCatalog")}</h2>
                <p className="text-muted font-mono-custom m-0 mt-1" style={{ fontSize: "11px" }}>{t("catalogSub")}</p>
              </div>
              <form onSubmit={handleSearchSubmit} className="position-relative d-flex align-items-center" style={{ minWidth: "280px" }}>
                <input type="text" placeholder={t("fastSearch")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="form-control rounded-0 font-mono-custom" style={{ fontSize: "12px", paddingLeft: "12px", paddingRight: "32px" }} />
                <Search size={14} className="text-muted position-absolute" style={{ left: "auto", right: "12px" }} />
              </form>
            </div>

            <div className="d-flex flex-column sm:flex-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4 flex-row-reverse">
              <div className="d-flex flex-wrap gap-1.5" id="category-filters">
                {categoryFilters.map((cat) => (
                  <button key={cat.slug || cat.id} onClick={() => handleCategorySelect(cat.slug)} className={`btn btn-sm font-mono-custom text-uppercase fw-bold px-3 py-1.5 border rounded-0 ${selectedCategory === cat.slug ? "btn-gold-custom" : "btn-light text-muted border-custom"}`} style={{ fontSize: "10px" }}>
                    {cat.slug === "all" ? getCategoryLabel("all") : cat.name}
                  </button>
                ))}
              </div>
              <div className="d-flex align-items-center gap-2 font-mono-custom flex-row-reverse" style={{ fontSize: "11px" }}>
                <span className="text-muted text-uppercase">{t("sortByLabel")}</span>
                <select value={sortBy} onChange={(e) => handleSortChange(e.target.value)} className="form-select form-select-sm rounded-0 text-charcoal-custom font-mono-custom" style={{ fontSize: "11px", width: "150px" }}>
                  <option value="popularity">{t("sortPopularity")}</option>
                  <option value="price-low">{t("sortPriceLow")}</option>
                  <option value="price-high">{t("sortPriceHigh")}</option>
                  <option value="newest">{t("sortNewest")}</option>
                </select>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="py-5 text-center font-mono-custom text-muted border bg-white" style={{ fontSize: "12px" }}>{t("noProducts")}</div>
            ) : (
              <div className="row g-4" id="catalog-grid">
                {products.map((product) => (
                  <div className="col-sm-6 col-md-4 col-lg-3" key={product.id}>
                    <ProductCard product={product} onSelect={handleSelectProduct} onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} isWishlisted={isWishlisted(product.id)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "wishlist" && (
          <div className="container py-5" id="wishlist-view-page">
            <div className="border-bottom pb-4 mb-4 text-end">
              <h2 className="font-serif-custom fw-bold text-charcoal-custom text-uppercase m-0">{t("myStrategyWishlist")}</h2>
              <p className="text-muted font-mono-custom m-0 mt-1" style={{ fontSize: "11px" }}>{t("wishlistSub")}</p>
            </div>
            {wishlist.length === 0 ? (
              <div className="card rounded-0 p-4 border-custom bg-white text-center mx-auto" style={{ maxWidth: "450px" }}>
                <div className="d-flex align-items-center justify-content-center bg-light border rounded-3 mx-auto mb-3 text-gold-custom shadow-sm" style={{ width: "48px", height: "48px" }}>
                  <Heart size={20} />
                </div>
                <h6 className="font-serif-custom fw-bold text-charcoal-custom text-uppercase mb-1">{t("noWishlistTitle")}</h6>
                <p className="text-muted font-sans mb-4" style={{ fontSize: "11px" }}>{t("noWishlistDesc")}</p>
                <button onClick={() => handleCategorySelect("all")} className="btn btn-gold-custom py-2 px-4 text-uppercase fw-bold font-mono-custom" style={{ fontSize: "11px" }}>{t("exploreElite")}</button>
              </div>
            ) : (
              <div className="row g-4" id="wishlist-grid">
                {wishlist.map((product) => (
                  <div className="col-sm-6 col-md-4 col-lg-3" key={product.id}>
                    <ProductCard product={product} onSelect={handleSelectProduct} onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} isWishlisted={true} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "cart" && (
          <CartPage
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveFromCart}
            onCheckout={handleBeginCheckout}
            onNavigateToShop={() => handleCategorySelect("all")}
          />
        )}

        {activeTab === "checkout" && (
          <CheckoutPage
            cartItems={cartItems}
            currentUser={currentUser}
            onOrderCompleted={handleOrderCompleted}
            onNavigateToShop={() => handleCategorySelect("all")}
            onNavigateToOrders={() => setActiveTab("account")}
          />
        )}

        {activeTab === "account" && (
          <AccountPage
            currentUser={currentUser}
            onLoginSuccess={handleLoginSuccess}
            onLogout={handleLogout}
            orders={orders}
            wishlist={wishlist}
            onRemoveFromWishlist={handleRemoveFromWishlist}
            onSelectProduct={handleSelectProduct}
            onRefreshOrders={async () => {
              try {
                const freshOrders = await api.getOrders();
                setOrders(freshOrders);
              } catch (e) {
                console.error(e);
              }
            }}
          />
        )}

        {activeTab === "admin" && currentUser?.role === "admin" && (
          <AdminDashboard categories={categories} onRefreshCatalog={refreshCatalogFull} />
        )}
      </main>

      <footer className="site-footer mt-auto rtl" id="app-footer">
        <div className="container py-5">
          <div className="row g-4 g-lg-5">
            <div className="col-lg-4 col-md-6">
              <div className="footer-brand mb-3">
                <span className="footer-logo-mark">♔</span>
                <span className="footer-brand-name">{t("grandmaster")}</span>
              </div>
              <p className="footer-text mb-0">{t("footerDesc")}</p>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <h6 className="footer-heading">{t("catalogLines")}</h6>
              <ul className="footer-links list-unstyled mb-0">
                {footerCategories.map((cat) => (
                  <li key={cat.id}>
                    <button type="button" onClick={() => handleCategorySelect(cat.slug)} className="footer-link">
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <h6 className="footer-heading">{t("corporate")}</h6>
              <ul className="footer-links list-unstyled mb-0">
                <li><button type="button" onClick={() => setActiveTab("account")} className="footer-link">{t("profileVault")}</button></li>
                <li><button type="button" onClick={() => setActiveTab("wishlist")} className="footer-link">{t("wishlistsCache")}</button></li>
                <li><button type="button" onClick={() => setActiveTab("cart")} className="footer-link">{t("cartManifest")}</button></li>
                <li><button type="button" onClick={() => handleCategorySelect("all")} className="footer-link">{t("catalog")}</button></li>
              </ul>
            </div>

            <div className="col-md-6 col-lg-4">
              <h6 className="footer-heading">{t("telemetryStatus")}</h6>
              <div className="footer-status flex-row-reverse">
                <span className={`api-status-dot ${apiOnline ? "online" : apiOnline === false ? "offline" : "loading-shimmer"}`} />
                <span className={apiOnline ? "footer-status-live" : apiOnline === false ? "footer-status-offline" : "footer-text"}>
                  {apiOnline ? t("nodeLive") : apiOnline === false ? "غير متصل بالخادم" : "..."}
                </span>
              </div>
              <p className="footer-text footer-meta mb-0">
                {apiOnline ? t("connectedLog") : "شغّل Laravel: php artisan serve"}
              </p>
            </div>
          </div>

          <div className="footer-bottom">
            <span className="footer-copy">&copy; {new Date().getFullYear()} {t("copyright")}</span>
          </div>
        </div>
      </footer>

      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          isWishlisted={isWishlisted(selectedProduct.id)}
        />
      )}

      {authOpen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(17,17,17,0.7)", backdropFilter: "blur(3px)", zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "450px" }}>
            <div className="modal-content rounded-0 border-custom bg-white shadow-lg">
              <div className="modal-header border-0 pb-0">
                <button type="button" className="btn-close" onClick={() => setAuthOpen(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body pt-0">
                <div className="text-center mb-4 text-charcoal-custom">
                  <div className="d-flex align-items-center justify-content-center bg-light border border-custom mx-auto mb-3 text-gold-custom" style={{ width: "48px", height: "48px" }}>
                    <Lock size={20} />
                  </div>
                  <h6 className="font-serif-custom fw-bold text-uppercase m-0">التحقق من الهوية مطلوب</h6>
                  <p className="text-muted font-sans mt-1 m-0" style={{ fontSize: "11px" }}>يرجى تسجيل الدخول أو إنشاء حساب قبل المتابعة</p>
                </div>
                <AccountPage
                  currentUser={currentUser}
                  onLoginSuccess={(user) => {
                    handleLoginSuccess(user);
                    if (cartItems.length > 0 || activeTab === "cart") setActiveTab("checkout");
                  }}
                  orders={[]}
                  wishlist={[]}
                  onRemoveFromWishlist={() => {}}
                  onSelectProduct={() => {}}
                  onRefreshOrders={() => {}}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
