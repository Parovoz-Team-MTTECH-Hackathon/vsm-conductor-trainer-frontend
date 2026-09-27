import { refreshToken } from "/static/src/js/protocol.js";
import { request, ValidationError } from "/static/src/js/protocol.js";

const playersUrl = "/manager/players";
const kickUrl = "/manager/kick";

async function loadPlayers() {
  const statusEl = document.getElementById('status');
  const tableEl = document.getElementById('players-table');
  const bodyEl = document.getElementById('players-body');

  try {
    const players = await request(playersUrl, null, 'GET');

    if (!Array.isArray(players)) {
      throw new Error('Сервер вернул неожиданный формат данных');
    }

    bodyEl.innerHTML = '';

    if (players.length === 0) {
      tableEl.hidden = true;
      statusEl.hidden = false;
      statusEl.className = '';
      statusEl.textContent = 'Игроков нет';
      return;
    }

    for (const p of players) {
      const tr = document.createElement('tr');

      tr.appendChild(statCell(p));
      tr.appendChild(kickCell(p));
      tr.appendChild(cell(p.client_id ?? ''));
      tr.appendChild(statusCell(p.is_active));
      tr.appendChild(cell(p.client_type ?? ''));
      tr.appendChild(cell(p.email ?? ''));
      tr.appendChild(cell(p.user_type ?? ''));
      tr.appendChild(cell(p.first_name ?? ''));
      tr.appendChild(cell(p.last_name ?? ''));
      tr.appendChild(cell(p.patronymic_name ?? ''));

      bodyEl.appendChild(tr);
    }

    statusEl.hidden = true;
    tableEl.hidden = false;
  } catch (err) {
    tableEl.hidden = true;
    statusEl.hidden = false;
    statusEl.className = 'error';
    if (err instanceof ValidationError) {
      statusEl.textContent = `Ошибка валидации: ${err.reason}`;
    } else {
      statusEl.textContent = `Ошибка: ${err.message}`;
    }
  }
}

function cell(value) {
  const td = document.createElement('td');
  td.textContent = value;
  return td;
}

function statCell(player) {
  const td = document.createElement('td');
  const btn = document.createElement('button');
  btn.className = 'stat-btn';
  btn.textContent = 'Стата';
  btn.addEventListener('click', () => {
    window.location.href = `statistic.html?player_id=${encodeURIComponent(player.client_id)}`;
  });
  td.appendChild(btn);
  return td;
}

function statusCell(isActive) {
  const td = document.createElement('td');
  const active = isActive === true;
  td.textContent = active ? 'Да' : 'Нет';
  td.className = active ? 'status-active' : 'status-inactive';
  return td;
}

function kickCell(player) {
  const td = document.createElement('td');
  const btn = document.createElement('button');
  btn.className = 'kick-btn';
  btn.textContent = 'Кикнуть';
  btn.addEventListener('click', () => kickPlayer(player, btn, td.closest('tr')));
  td.appendChild(btn);
  return td;
}

async function kickPlayer(player, btn, row) {
  const name = [player.last_name, player.first_name, player.patronymic_name]
    .filter(Boolean)
    .join(' ') || `ID ${player.client_id}`;

  if (!confirm(`Кикнуть игрока «${name}»?`)) return;

  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = '…';

  try {
    const params = new URLSearchParams();
    params.append('player_id', player.client_id);

    const result = await request(`${kickUrl}?${params.toString()}`, null, 'GET');
    console.log('Ответ сервера на kick:', result);


    row.remove();


    const bodyEl = document.getElementById('players-body');
    if (bodyEl.children.length === 0) {
      const statusEl = document.getElementById('status');
      statusEl.hidden = false;
      statusEl.className = '';
      statusEl.textContent = 'Игроков нет';
      document.getElementById('players-table').hidden = true;
    }
  } catch (err) {
    btn.disabled = false;
    btn.textContent = originalText;

    if (err instanceof ValidationError) {
      alert(`Ошибка валидации: ${err.reason}`);
    } else {
      alert(`Не удалось кикнуть: ${err.message}`);
    }
  }
}

function init() {
  refreshToken().then(loadPlayers);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
