import { refreshToken } from "/static/src/js/protocol.js";
import { request } from "/static/src/js/protocol.js";

const getProfileUrl = "/admin/profile";

async function loadProfile() {
  const data = await request(getProfileUrl, null, 'GET');

  document.getElementById('client_id').textContent = data.client_id ?? '';
  document.getElementById('is_active').textContent = data.is_active ? 'Да' : 'Нет';
  document.getElementById('client_type').textContent = data.client_type ?? '';
  document.getElementById('email').textContent = data.email ?? '';
  document.getElementById('user_type').textContent = data.user_type ?? '';
}

function init() {
  refreshToken().then(loadProfile);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
