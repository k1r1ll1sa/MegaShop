document.addEventListener('DOMContentLoaded', function() {
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const messageDiv = document.getElementById('cart-message');

    function showMessage(text, isError = false) {
        messageDiv.textContent = text;
        messageDiv.style.color = isError ? 'red' : 'green';
        setTimeout(() => { messageDiv.textContent = ''; }, 3000);
    }

    addToCartBtn?.addEventListener('click', async function() {
        const productId = this.dataset.productId;

        if (!productId) {
            showMessage('Ошибка: ID товара не найден', true);
            return;
        }

        try {
            const response = await fetch('/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: parseInt(productId) })
            });

            const result = await response.json();

            if (result.success) {
                showMessage('Товар добавлен в корзину');
                setTimeout(() => { window.location.reload(); }, 500);
            } else if (result.redirect) {
                showMessage('Сначала войдите в аккаунт', true);
                setTimeout(() => { window.location.href = '/login'; }, 1500);
            } else {
                showMessage(result.message || 'Ошибка', true);
            }
        } catch (error) {
            console.error('Ошибка:', error);
            showMessage('Ошибка соединения', true);
        }
    });
});