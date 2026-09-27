import { refreshToken } from "/static/src/js/protocol.js";
import { request, ValidationError } from "/static/src/js/protocol.js";

const getProfileUrl = "/player/profile";
const editProfileUrl = "/player/profile/edit";

async function loadProfile() {
  const data = await request(getProfileUrl, null, 'GET');

  document.getElementById('client_id').textContent = data.client_id ?? '';
  document.getElementById('is_active').textContent = data.is_active ? 'Да' : 'Нет';
  document.getElementById('client_type').textContent = data.client_type ?? '';
  document.getElementById('email').textContent = data.email ?? '';
  document.getElementById('user_type').textContent = data.user_type ?? '';
  document.getElementById('first_name').textContent = data.first_name ?? '';
  document.getElementById('last_name').textContent = data.last_name ?? '';
  document.getElementById('patronymic_name').textContent = data.patronymic_name ?? '';
}

// Функция для смены одного поля
async function changeField(fieldName, label) {
  const currentValue = document.getElementById(fieldName).textContent;

  const newValue = prompt(`Введите новое значение для "${label}":`, currentValue);

  // Если пользователь нажал "Отмена" или ничего не ввёл
  if (newValue === null) return;

  // Формируем query-параметры (согласно swagger)
  const params = new URLSearchParams();
  params.append('first_name', fieldName === 'first_name' ? newValue : document.getElementById('first_name').textContent);
  params.append('last_name', fieldName === 'last_name' ? newValue : document.getElementById('last_name').textContent);
  params.append('patronymic_name', fieldName === 'patronymic_name' ? newValue : document.getElementById('patronymic_name').textContent);

  try {
    // ВАЖНО: API ожидает query-параметры, поэтому передаём null в body,
    // а параметры добавляем в URL
    const urlWithParams = `${editProfileUrl}?${params.toString()}`;

    const updatedData = await request(urlWithParams, null, 'POST');

    // Обновляем UI из ответа
    document.getElementById('first_name').textContent = updatedData.first_name ?? '';
    document.getElementById('last_name').textContent = updatedData.last_name ?? '';
    document.getElementById('patronymic_name').textContent = updatedData.patronymic_name ?? '';
  } catch (err) {
    if (err instanceof ValidationError) {
      alert(`Ошибка валидации: ${err.reason}`);
    } else {
      alert(`Ошибка: ${err.message}`);
    }
  }
}

// Навешиваем обработчики
document.getElementById('first').addEventListener('click', () => changeField('first_name', 'Имя'));
document.getElementById('last').addEventListener('click', () => changeField('last_name', 'Фамилия'));
document.getElementById('patr').addEventListener('click', () => changeField('patronymic_name', 'Отчество'));

await refreshToken();
loadProfile();
