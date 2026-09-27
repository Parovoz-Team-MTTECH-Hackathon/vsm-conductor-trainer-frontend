import { refreshToken } from "/static/src/js/protocol.js";
import { request, ValidationError } from "/static/src/js/protocol.js";

const listUrl       = "/admin/players";
const activateUrl   = "/admin/activate";
const inactivateUrl = "/admin/inactivate";
const deleteUrl     = "/auth/delete";

async function loadPlayers() {
  const statusEl = document.getElementById('status');
  const tableEl  = document.getElementById('players-table');
  const bodyEl   = document.getElementById('players-body');

  try {
    const players = await request(listUrl, null, 'GET');

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

      tr.appendChild(actionsCell(p, tr));
      tr.appendChild(statCell(p));
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
    statusEl.textContent = (err instanceof ValidationError)
      ? `Ошибка валидации: ${err.reason}`
      : `Ошибка: ${err.message}`;
  }
}

// --- ячейки ---

function cell(value) {
  const td = document.createElement('td');
  td.textContent = value;
  return td;
}

function statusCell(isActive) {
  const td = document.createElement('td');
  const active = isActive === true;
  td.textContent = active ? 'Да' : 'Нет';
  td.className = active ? 'status-active' : 'status-inactive';
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

function actionsCell(player, row) {
  const td = document.createElement('td');
  const wrap = document.createElement('div');
  wrap.className = 'actions';

  const toggle = document.createElement('input');
  toggle.type = 'checkbox';
  toggle.checked = player.is_active === true;
  toggle.title = 'Активен';
  toggle.addEventListener('change', () => toggleActive(player, toggle));

  const toggleLabel = document.createElement('span');
  toggleLabel.className = 'toggle-label';
  toggleLabel.textContent = 'Активен';

  wrap.appendChild(toggle);
  wrap.appendChild(toggleLabel);

  const del = document.createElement('button');
  del.className = 'del-btn';
  del.textContent = 'Удалить';
  del.addEventListener('click', () => removePlayer(player, row, del));
  wrap.appendChild(del);

  td.appendChild(wrap);
  return td;
}

// --- действия ---

async function toggleActive(player, toggle) {
  const nextState = !player.is_active;
  const url = nextState ? activateUrl : inactivateUrl;

  toggle.disabled = true;

  try {
    const params = new URLSearchParams();
    params.append('client_id', player.client_id);

    await request(`${url}?${params.toString()}`, null, 'GET');

    player.is_active = nextState;

    // Обновляем ячейку «Активен» — это 4-я колонка (индекс 3)
    const row = toggle.closest('tr');
    const statusTd = row.children[3];
    statusTd.textContent = nextState ? 'Да' : 'Нет';
    statusTd.className = nextState ? 'status-active' : 'status-inactive';
  } catch (err) {
    toggle.checked = player.is_active;
    alert((err instanceof ValidationError)
      ? `Ошибка валидации: ${err.reason}`
      : `Не удалось изменить статус: ${err.message}`);
  } finally {
    toggle.disabled = false;
  }
}

async function removePlayer(player, row, btn) {
  const name = [player.last_name, player.first_name, player.patronymic_name]
    .filter(Boolean).join(' ')
    || player.email
    || `ID ${player.client_id}`;

  if (!confirm(`Удалить игрока «${name}»? Действие необратимо.`)) return;

  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = '…';

  try {
    await request(deleteUrl, { client_id: player.client_id }, 'POST');

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
    alert((err instanceof ValidationError)
      ? `Ошибка валидации: ${err.reason}`
      : `Не удалось удалить: ${err.message}`);
  }
}

// --- init ---

function init() {
  refreshToken().then(loadPlayers);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
