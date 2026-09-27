import { refreshToken } from "../src/js/protocol.js";
import { buildHeaders, request } from "/static/src/js/protocol.js";

  const getProfileUrl = "/player/profile";

  async function loadProfile() {
    const data = await request(getProfileUrl, null,  'GET');

    document.getElementById('client_id').textContent = data.client_id ?? '';
    document.getElementById('is_active').textContent = data.is_active ? 'Да' : 'Нет';
    document.getElementById('client_type').textContent = data.client_type ?? '';
    document.getElementById('email').textContent = data.email ?? '';
    document.getElementById('user_type').textContent = data.user_type ?? '';
    document.getElementById('first_name').textContent = data.first_name ?? '';
    document.getElementById('last_name').textContent = data.last_name ?? '';
    document.getElementById('patronymic_name').textContent = data.patronymic_name ?? '';
  }
  await refreshToken();
  loadProfile();
