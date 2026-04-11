document.addEventListener('DOMContentLoaded', function() {
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const messageDiv = document.getElementById('cart-message');
    const cartBadge = document.getElementById('cart-badge');

    function showMessage(text, isError = false) {
        messageDiv.textContent = text;
        messageDiv.style.color = isError ? 'red' : 'green';
        setTimeout(() => { messageDiv.textContent = ''; }, 3000);
    }

    function updateCartBadge(count) {
        if (cartBadge) {
            cartBadge.textContent = count;
        }
    }

    async function getCartCount() {
        try {
            const response = await fetch('/api/cart', {
                method: 'GET',
                credentials: 'same-origin'
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.items
                ? data.items.reduce((acc, item) => (acc + item.quantity), 0)
                : 0;
            }
            return 0;
        } catch (error) {
            return 0;
        }
    }

    addToCartBtn?.addEventListener('click', async function() {
        const productId = this.dataset.productId;
        const quantity = 1;

        if (!productId) {
            showMessage('Ошибка: ID товара не найден', true);
            return;
        }

        this.disabled = true;

        try {
            const response = await fetch('/api/cart/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify(
                    { 
                        productId: parseInt(productId),
                        quantity: quantity
                    }
                )
            });

            const result = await response.json();

            if (response.ok) {
                showMessage('Товар добавлен в корзину');
                const count = await getCartCount();
                updateCartBadge(count);
            } else if (response.status = 401) {
                showMessage('Сначала войдите в аккаунт', true);
                setTimeout(() => { window.location.href = '/login'; }, 1500);
            } else if (response.status = 404) {
                showMessage('Товар не найден', true);
            } else {
                showMessage(result.message || 'Ошибка', true);
            }
        } catch (error) {
            console.error('Ошибка:', error);
            showMessage('Ошибка соединения', true);
        } finally {
            this.disabled = false;
        }
    });
});