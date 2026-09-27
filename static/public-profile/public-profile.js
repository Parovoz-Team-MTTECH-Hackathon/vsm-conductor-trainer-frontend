import { request, ValidationError } from "/static/src/js/protocol.js";

const publicProfileUrl = "/player/public";

function getPlayerIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('player_id');
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}

async function loadPublicProfile(playerId) {
  const statusEl = document.getElementById('status');
  const contentEl = document.getElementById('content');

  try {
    const params = new URLSearchParams();
    params.append('player_id', playerId);

    const data = await request(
      `${publicProfileUrl}?${params.toString()}`,
      null,
      'GET'
    );

    document.getElementById('client_id').textContent = data.client_id ?? '';
    document.getElementById('client_type').textContent = data.client_type ?? '';
    document.getElementById('user_type').textContent = data.user_type ?? '';
    document.getElementById('shorted_name').textContent = data.shorted_name ?? '';

    const active = data.is_active === true;
    const activeEl = document.getElementById('is_active');
    activeEl.textContent = active ? 'Да' : 'Нет';
    activeEl.className = 'value ' + (active ? 'status-active' : 'status-inactive');

    statusEl.hidden = true;
    contentEl.hidden = false;
  } catch (err) {
    contentEl.hidden = true;
    statusEl.hidden = false;
    statusEl.className = 'error';
    statusEl.textContent = (err instanceof ValidationError)
      ? `Ошибка валидации: ${err.reason}`
      : `Ошибка: ${err.message}`;
  }
}

function init() {
  const playerId = getPlayerIdFromUrl();
  const statusEl = document.getElementById('status');

  if (playerId === null) {
    statusEl.className = 'error';
    statusEl.textContent = 'Не указан player_id в URL. Пример: public-profile.html?player_id=1';
    return;
  }

  loadPublicProfile(playerId);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
