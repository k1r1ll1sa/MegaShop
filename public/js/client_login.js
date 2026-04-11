document.addEventListener('DOMContentLoaded', function() {
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const loginBtn = document.getElementById('login-btn');
    const messageDiv = document.getElementById('login-message');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function showMessage(text, isError = true) {
        messageDiv.textContent = text;
        messageDiv.style.color = isError ? 'red' : 'green';
    }

    async function handleLogin() {
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Валидация
        if (!emailRegex.test(email)) {
            showMessage('Некорректный формат email');
            return;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ email, password})
            });

            const result = await response.json();

            if (response.ok) {
                showMessage('Успешный вход!', false);
                // Перенаправление или сохранение сессии
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } else if (response.status === 401) {
                showMessage(result.message || 'Неверный email или пароль');
            } else {
                showMessage(result.message || 'Ошибка входа');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            showMessage('Ошибка соединения с сервером');
        }
    }

    loginBtn.addEventListener('click', handleLogin);

    // Вход Enter
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleLogin();
    });
});