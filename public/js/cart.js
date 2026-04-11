document.addEventListener('DOMContentLoaded', function() {
    const messageDiv = document.getElementById('cart-message');
    const totalElement = document.getElementById('cart-total');
    const cartBadge = document.getElementById('cart-badge');
    
    function showMessage(text, isError = false) {
        if (messageDiv) {
            messageDiv.textContent = text;
            messageDiv.style.color = isError ? 'red' : 'green';
            setTimeout(() => { messageDiv.textContent = ''; }, 3000);
        }
    }
    
    function updateTotal(newTotal) {
        if (totalElement) {
            totalElement.textContent = `${newTotal} Руб.`;
        }
    }
    
    function updateCartBadge(count) {
        if (cartBadge) {
            cartBadge.textContent = count;
            if (count === 0) {
                cartBadge.style.display = 'inline-block';
            }
        }
    }
    
    function removeItemUI(productId) {
        const item = document.querySelector(`.cart-item[data-product-id="${productId}"]`);
        if (item) {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            item.style.transition = 'opacity 0.3s, transform 0.3s';
            setTimeout(() => {
                item.remove();
                if (document.querySelectorAll('.cart-item').length === 0) {
                    window.location.reload();
                }
            }, 300);
        }
    }
    
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const productId = this.dataset.productId;
            
            if (!confirm('Удалить товар из корзины?')) return;
            
            try {
                const response = await fetch(`/api/cart/items/${productId}`, {
                    method: 'DELETE',
                    credentials: 'same-origin'
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    showMessage('Товар удалён');
                    
                    removeItemUI(productId);
                    updateTotal(result.total);
                    updateCartBadge(result.items.reduce((acc, item) => acc + item.quantity, 0));
                    
                } else if (response.status === 401) {
                    showMessage('Требуется авторизация', true);
                    setTimeout(() => { window.location.href = '/login'; }, 1500);
                } else {
                    showMessage(result.message || 'Ошибка удаления', true);
                }
            } catch (error) {
                console.error('Ошибка:', error);
                showMessage('Ошибка соединения с сервером', true);
            }
        });
    });
    
    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const productId = this.dataset.productId;
            const isPlus = this.classList.contains('qty-plus');
            const item = document.querySelector(`.cart-item[data-product-id="${productId}"]`);
            const qtyValue = item?.querySelector('.qty-value');
            const currentQty = parseInt(qtyValue?.textContent || '1');
            const newQty = isPlus ? currentQty + 1 : Math.max(1, currentQty - 1);
            
            if (newQty === currentQty) return;
            
            try {
                const response = await fetch(`/api/cart/items/${productId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'same-origin',
                    body: JSON.stringify({ quantity: newQty })
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    if (qtyValue) qtyValue.textContent = newQty;
                    
                    const itemData = result.items.find(i => i.productId == productId);
                    if (itemData) {
                        const lineTotal = item.querySelector('.cart-item-line-total strong');
                        if (lineTotal) lineTotal.textContent = `${itemData.lineTotal} ₽`;
                    }
                    
                    updateTotal(result.total);
                    updateCartBadge(result.items.reduce((acc, item) => acc + item.quantity, 0));
                    
                    showMessage('Количество обновлено');
                } else if (response.status === 401) {
                    showMessage('Требуется авторизация', true);
                    setTimeout(() => { window.location.href = '/login'; }, 1500);
                } else {
                    showMessage(result.message || 'Ошибка', true);
                }
            } catch (error) {
                console.error('Ошибка:', error);
                showMessage('Ошибка соединения с сервером', true);
            }
        });
    });
});