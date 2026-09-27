import { refreshToken } from "/static/src/js/protocol.js";
import { request, ValidationError } from "/static/src/js/protocol.js";

const getProfileUrl = "/manager/profile";
const editProfileUrl = "/manager/profile/edit";

async function loadProfile() {
  const data = await request(getProfileUrl, null, 'GET');

  document.getElementById('client_id').textContent = data.client_id ?? '';
  document.getElementById('is_active').textContent = data.is_active ? 'Да' : 'Нет';
  document.getElementById('client_type').textContent = data.client_type ?? '';
  document.getElementById('email').textContent = data.email ?? '';
  document.getElementById('user_type').textContent = data.user_type ?? '';
  document.getElementById('name').textContent = data.name ?? '';
}

async function changeName() {
  const currentValue = document.getElementById('name').textContent;
  const newValue = prompt('Введите новое имя:', currentValue);

  if (newValue === null || newValue.trim() === '') return;

  const params = new URLSearchParams();
  params.append('name', newValue.trim());

  try {
    const updatedData = await request(
      `${editProfileUrl}?${params.toString()}`,
      null,
      'POST'
    );

    // Обновляем UI из ответа
    document.getElementById('name').textContent = updatedData.name ?? '';
  } catch (err) {
    if (err instanceof ValidationError) {
      alert(`Ошибка валидации: ${err.reason}`);
    } else {
      alert(`Ошибка: ${err.message}`);
    }
  }
}

function init() {
  document.getElementById('edit-name').addEventListener('click', changeName);

  refreshToken().then(loadProfile);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
