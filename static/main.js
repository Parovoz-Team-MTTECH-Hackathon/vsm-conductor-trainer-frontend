document.addEventListener('DOMContentLoaded', () => {
  const guestNav = document.getElementById('guest-nav');
  const userNav = document.getElementById('user-nav');
  const logoutBtn = document.getElementById('logout-btn');

  // Проверяем наличие токена (замените 'token' или 'access_token' на то, как вы сохраняете его при входе)
  const token = localStorage.getItem('token') || localStorage.getItem('access_token');

  if (token) {
    // Если пользователь авторизован — показываем кнопку Профиля
    guestNav.style.display = 'none';
    userNav.style.display = 'flex';
  } else {
    // Если не авторизован — показываем Вход и Регистрацию
    guestNav.style.display = 'flex';
    userNav.style.display = 'none';
  }

  // Логика выхода из аккаунта
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('access_token');
      window.location.reload(); // Перезагружаем страницу
    });
  }
});
