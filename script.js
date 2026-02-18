document.addEventListener('DOMContentLoaded', function () {

    // ═══════════════════════════════════════════
    // Cart State
    // ═══════════════════════════════════════════
    let cart = JSON.parse(localStorage.getItem('clonex-cart')) || [];

    const $id = id => document.getElementById(id);
    const cartCountEl = $id('cart-count');
    const cartItemsEl = $id('cart-items');
    const subtotalEl = $id('subtotal');
    const totalEl = $id('total');
    const orderIdEl = $id('order-id');
    const orderDateEl = $id('order-date');
    const resetBtn = $id('reset-cart');
    const checkoutBtn = $id('checkout-btn');
    const navbar = $id('navbar');
    const themeToggle = $id('theme-toggle');

    // ═══════════════════════════════════════════
    // Theme Toggle
    // ═══════════════════════════════════════════
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (themeToggle) themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
        localStorage.setItem('clonex-theme', theme);
    }

    // Default = dark. Only go light if explicitly saved.
    const savedTheme = localStorage.getItem('clonex-theme') || 'dark';
    applyTheme(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') || 'dark';
            applyTheme(current === 'dark' ? 'light' : 'dark');
        });
    }

    // ═══════════════════════════════════════════
    // Navbar scroll behavior
    // ═══════════════════════════════════════════
    function handleScroll() {
        if (!navbar) return;
        const scrolled = window.scrollY > 60;
        navbar.classList.toggle('navbar--top', !scrolled);
        navbar.classList.toggle('navbar--scrolled', scrolled);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // ═══════════════════════════════════════════
    // Scroll Reveal
    // ═══════════════════════════════════════════
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // ═══════════════════════════════════════════
    // Page Navigation
    // ═══════════════════════════════════════════
    window.showPage = function (page) {
        const pages = ['home-page', 'about-page', 'receipt-page', 'thankyou-page'];
        pages.forEach(p => {
            const el = $id(p);
            if (el) el.classList.add('hidden');
        });

        const target = $id(page + '-page');
        if (target) target.classList.remove('hidden');

        if (page === 'receipt') updateCartDisplay();

        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Re-observe new reveals that may have become visible
        document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
            revealObserver.observe(el);
        });

        // Reset navbar state
        handleScroll();
    };

    // ═══════════════════════════════════════════
    // Cart Functions
    // ═══════════════════════════════════════════
    window.addToCart = function (name, price) {
        cart.push({ name, price });
        saveCart();
        updateCartCount();

        // Button feedback
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✓ Přidáno!';
        btn.classList.add('btn-success-state');

        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('btn-success-state');
        }, 1400);

        // Toast
        showToast(name + ' přidáno do košíku');

        // Cart badge bump
        if (cartCountEl) {
            cartCountEl.classList.remove('bump');
            void cartCountEl.offsetWidth;
            cartCountEl.classList.add('bump');
        }
    };

    function updateCartCount() {
        if (cartCountEl) cartCountEl.textContent = cart.length;
    }

    function updateCartDisplay() {
        if (!cartItemsEl) return;
        cartItemsEl.innerHTML = '';
        let subtotal = 0;

        if (cart.length === 0) {
            cartItemsEl.innerHTML = '<li class="cart-empty">Košík je prázdný</li>';
            if (checkoutBtn) checkoutBtn.style.display = 'none';
        } else {
            cart.forEach((item, i) => {
                const li = document.createElement('li');
                li.style.cssText = 'display:flex;justify-content:space-between;align-items:center;';

                const name = document.createElement('span');
                name.textContent = item.name;

                const right = document.createElement('span');
                right.style.cssText = 'display:flex;align-items:center;gap:0.75rem;';

                const price = document.createElement('span');
                price.style.fontWeight = '600';
                price.textContent = item.price.toLocaleString('cs-CZ') + ' Kč';

                const del = document.createElement('button');
                del.className = 'btn-danger';
                del.textContent = '✕';
                del.addEventListener('click', () => {
                    cart.splice(i, 1);
                    saveCart();
                    updateCartCount();
                    updateCartDisplay();
                });

                right.appendChild(price);
                right.appendChild(del);
                li.appendChild(name);
                li.appendChild(right);
                cartItemsEl.appendChild(li);
                subtotal += item.price;
            });
            if (checkoutBtn) checkoutBtn.style.display = '';
        }

        if (subtotalEl) subtotalEl.textContent = subtotal.toLocaleString('cs-CZ') + ' Kč';
        if (totalEl) totalEl.textContent = subtotal.toLocaleString('cs-CZ') + ' Kč';
        if (orderIdEl) orderIdEl.textContent = String(Math.floor(Math.random() * 100000)).padStart(5, '0');
        if (orderDateEl) orderDateEl.textContent = new Date().toLocaleDateString('cs-CZ');
    }

    function saveCart() {
        localStorage.setItem('clonex-cart', JSON.stringify(cart));
    }

    function resetCart() {
        cart = [];
        saveCart();
        updateCartCount();
        updateCartDisplay();
    }

    function checkout() {
        showPage('thankyou');
        cart = [];
        saveCart();
        updateCartCount();
    }

    // ═══════════════════════════════════════════
    // Toast
    // ═══════════════════════════════════════════
    function showToast(message) {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = '<span class="toast-check">✓</span><span>' + message + '</span>';
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => toast.classList.add('show'));
        });

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 350);
        }, 2500);
    }

    // ═══════════════════════════════════════════
    // Event Listeners
    // ═══════════════════════════════════════════
    if (resetBtn) resetBtn.addEventListener('click', resetCart);
    if (checkoutBtn) checkoutBtn.addEventListener('click', checkout);

    // Initialize
    updateCartCount();
});