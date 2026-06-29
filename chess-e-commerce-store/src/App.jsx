import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  X
} from "lucide-react";
import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard";
import ProductDetailsModal from "./components/ProductDetailsModal";
import CartPage from "./components/CartPage";
import CheckoutPage from "./components/CheckoutPage";
import AccountPage from "./components/AccountPage";
import WishlistPage from "./components/WishlistPage";
import AdminDashboard from "./components/AdminDashboard";
import HomePage from "./components/HomePage";
import Footer from "./components/Footer";
import { FaChessKnight } from "react-icons/fa6";
import "./styles/Catalog.css";
import "./styles/Auth.css";
import { api } from "./utils/api";
import { cartToUiItems, markBestSellers } from "./utils/mappers";
import { useLanguage } from "./context/LanguageContext";
import { useToast } from "./context/ToastContext";
import { hasPasswordResetLink } from "./utils/authParams";
import { scrollToTop } from "./components/ScrollToTop";

const USER_TABS = new Set(["home", "shop", "cart", "checkout", "account", "wishlist"]);

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
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

  useEffect(() => {
    scrollToTop();
  }, [activeTab]);

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

  if (isAdmin && !passwordResetLink) {
    return (
      <div className="min-h-screen beidaq-app-shell text-charcoal-custom d-flex flex-col flex-column rtl text-end">
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
    <div className="min-h-screen beidaq-app-shell text-charcoal-custom d-flex flex-col flex-column rtl text-end">
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
          <HomePage
            t={t}
            categories={categories}
            products={products}
            loadingProducts={loadingProducts}
            featuredProduct={featuredProduct}
            getCategoryLabel={getCategoryLabel}
            handleCategorySelect={handleCategorySelect}
            handleSelectProduct={handleSelectProduct}
            handleAddToCart={handleAddToCart}
            handleToggleWishlist={handleToggleWishlist}
            isWishlisted={isWishlisted}
          />
        )}

        {activeTab === "shop" && (
          <section className="beidaq-catalog rtl" id="shop-view-page">
            <div className="beidaq-catalog-glow" aria-hidden="true" />
            <div className="beidaq-catalog-pattern" aria-hidden="true" />

            <div className="container position-relative">
              <header className="beidaq-catalog-header beidaq-catalog-fade-in">
                <div className="beidaq-catalog-header-icon">
                  <FaChessKnight aria-hidden="true" />
                </div>
                <h1 className="beidaq-catalog-title">{t("sovereignCatalog")}</h1>
                <p className="beidaq-catalog-subtitle">{t("catalogSub")}</p>
                <div className="beidaq-catalog-divider" />
              </header>

              <div className="beidaq-catalog-toolbar">
                <form onSubmit={handleSearchSubmit} className="beidaq-catalog-search">
                  <input
                    type="text"
                    placeholder={t("fastSearch")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="beidaq-catalog-search-input"
                  />
                  <Search size={16} className="beidaq-catalog-search-icon" />
                </form>

                <div className="d-flex flex-column flex-md-row align-items-md-center gap-3 beidaq-catalog-filters-row flex-row-reverse">
                  <div className="beidaq-catalog-filters" id="category-filters">
                    {categoryFilters.map((cat) => (
                      <button
                        key={cat.slug || cat.id}
                        type="button"
                        onClick={() => handleCategorySelect(cat.slug)}
                        className={`beidaq-filter-pill${selectedCategory === cat.slug ? " beidaq-filter-pill--active" : ""}`}
                      >
                        {cat.slug === "all" ? getCategoryLabel("all") : cat.name}
                      </button>
                    ))}
                  </div>

                  <div className="beidaq-catalog-sort flex-row-reverse">
                    <span className="beidaq-catalog-sort-label">{t("sortByLabel")}</span>
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="beidaq-catalog-sort-select"
                    >
                      <option value="popularity">{t("sortPopularity")}</option>
                      <option value="price-low">{t("sortPriceLow")}</option>
                      <option value="price-high">{t("sortPriceHigh")}</option>
                      <option value="newest">{t("sortNewest")}</option>
                    </select>
                  </div>
                </div>
              </div>

              {products.length === 0 ? (
                <div className="beidaq-catalog-empty">{t("noProducts")}</div>
              ) : (
                <div className="row beidaq-catalog-grid" id="catalog-grid">
                  {products.map((product, index) => (
                    <div className="col-12 col-md-6 col-lg-3" key={product.id}>
                      <ProductCard
                        product={product}
                        onSelect={handleSelectProduct}
                        onAddToCart={handleAddToCart}
                        onToggleWishlist={handleToggleWishlist}
                        isWishlisted={isWishlisted(product.id)}
                        animationIndex={index}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === "wishlist" && (
          <WishlistPage
            wishlist={wishlist}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            onNavigateToShop={() => handleCategorySelect("all")}
          />
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

      <Footer
        onCategorySelect={handleCategorySelect}
        onNavigate={setActiveTab}
      />

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
        <div className="beidaq-auth-overlay rtl" tabIndex="-1" onClick={() => setAuthOpen(false)} role="presentation">
          <div className="beidaq-auth-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
            <button type="button" className="beidaq-auth-modal__close" onClick={() => setAuthOpen(false)} aria-label="إغلاق">
              <X size={18} />
            </button>
            <div className="beidaq-auth-modal__notice">
              <p className="beidaq-auth-modal__notice-title" id="auth-modal-title">التحقق من الهوية مطلوب</p>
              <p className="beidaq-auth-modal__notice-text">يرجى تسجيل الدخول أو إنشاء حساب قبل المتابعة</p>
            </div>
            <AccountPage
              embedded
              currentUser={currentUser}
              onLoginSuccess={(user) => {
                handleLoginSuccess(user);
                setAuthOpen(false);
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
      )}
    </div>
  );
}
