document.addEventListener('DOMContentLoaded', function() {
    const messageDiv = document.getElementById('cart-message');

    function showMessage(text, isError = false) {
        if (messageDiv) {
            messageDiv.textContent = text;
            messageDiv.style.color = isError ? 'red' : 'green';
            setTimeout(() => { messageDiv.textContent = ''; }, 3000);
        }
    }

    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const productId = this.dataset.productId;

            if (!confirm('Удалить товар?')) return;

            try {
                const response = await fetch(`/cart/remove/${productId}`, {
                    method: 'DELETE'
                });

                const result = await response.json();

                if (result.success) {
                    showMessage('Товар удалён');
                    setTimeout(() => { window.location.reload(); }, 500);
                } else {
                    showMessage(result.message || 'Ошибка', true);
                }
            } catch (error) {
                console.error('Ошибка:', error);
                showMessage('Ошибка соединения', true);
            }
        });
    });
});