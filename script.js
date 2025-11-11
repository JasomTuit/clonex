document.addEventListener('DOMContentLoaded', function() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const resetCartButton = document.getElementById('reset-cart');
    const subtotalElement = document.getElementById('subtotal');
    const deliveryFeesElement = document.getElementById('delivery-fees');
    const totalElement = document.getElementById('total');
    const cartStatus = document.querySelector('.cart-status');
    const orderIdElement = document.querySelector('.receipt-header p:first-child');
    const dateElement = document.querySelector('.receipt-header p:last-child');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function updateCartDisplay() {
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = '';
        }
        let subtotal = 0;

        cart.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.name} - $${item.price.toFixed(2)}`;
            if (cartItemsContainer) {
                cartItemsContainer.appendChild(li);
            }
            subtotal += item.price;
        });

        if (subtotalElement) {
            subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        }
        const deliveryFees = 5.00; // Delivery Fees
        if (deliveryFeesElement) {
            deliveryFeesElement.textContent = `$${deliveryFees.toFixed(2)}`;
        }
        const total = subtotal + deliveryFees;
        if (totalElement) {
            totalElement.textContent = `$${total.toFixed(2)}`;
        }
        if (cartCount) {
            cartCount.textContent = cart.length;
        }

        // Update order ID and date
        const orderId = generateOrderId();
        const currentDate = new Date().toLocaleDateString();
        if (orderIdElement) {
            orderIdElement.textContent = `Order #${orderId}`;
        }
        if (dateElement) {
            dateElement.textContent = `Date: ${currentDate}`;
        }
    }

    function generateOrderId() {
        return Math.floor(Math.random() * 100000);
    }

    window.addToCart = function(name, price) {
        const item = { name, price };
        cart.push(item);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
    };

    function resetCart() {
        cart = [];
        localStorage.removeItem('cart');
        updateCartDisplay();
    }

    if (resetCartButton) {
        resetCartButton.addEventListener('click', resetCart);
    }

    updateCartDisplay();
});