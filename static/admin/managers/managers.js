import { refreshToken } from "/static/src/js/protocol.js";
import { request, ValidationError } from "/static/src/js/protocol.js";

const listUrl       = "/admin/managers";
const activateUrl   = "/admin/activate";
const inactivateUrl = "/admin/inactivate";
const deleteUrl     = "/auth/delete";

async function loadManagers() {
  const statusEl = document.getElementById('status');
  const tableEl = document.getElementById('managers-table');
  const bodyEl = document.getElementById('managers-body');

  try {
    const managers = await request(listUrl, null, 'GET');

    if (!Array.isArray(managers)) {
      throw new Error('Сервер вернул неожиданный формат данных');
    }

    bodyEl.innerHTML = '';

    if (managers.length === 0) {
      tableEl.hidden = true;
      statusEl.hidden = false;
      statusEl.className = '';
      statusEl.textContent = 'Менеджеров нет';
      return;
    }

    for (const m of managers) {
      const tr = document.createElement('tr');

      tr.appendChild(actionsCell(m, tr));
      tr.appendChild(cell(m.client_id ?? ''));
      tr.appendChild(statusCell(m.is_active));
      tr.appendChild(cell(m.client_type ?? ''));
      tr.appendChild(cell(m.email ?? ''));
      tr.appendChild(cell(m.user_type ?? ''));
      tr.appendChild(cell(m.name ?? ''));

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

function actionsCell(manager, row) {
  const td = document.createElement('td');
  const wrap = document.createElement('div');
  wrap.className = 'actions';

  // --- переключатель активности ---
  const toggle = document.createElement('input');
  toggle.type = 'checkbox';
  toggle.checked = manager.is_active === true;
  toggle.title = 'Активен';
  toggle.addEventListener('change', () => toggleActive(manager, toggle));

  const toggleLabel = document.createElement('span');
  toggleLabel.className = 'toggle-label';
  toggleLabel.textContent = 'Активен';

  wrap.appendChild(toggle);
  wrap.appendChild(toggleLabel);

  // --- кнопка удаления ---
  const del = document.createElement('button');
  del.className = 'del-btn';
  del.textContent = 'Удалить';
  del.addEventListener('click', () => removeManager(manager, row, del));

  wrap.appendChild(del);

  td.appendChild(wrap);
  return td;
}

// --- действия ---

async function toggleActive(manager, toggle) {
  const nextState = !manager.is_active;
  const url = nextState ? activateUrl : inactivateUrl;

  toggle.disabled = true;

  try {
    const params = new URLSearchParams();
    params.append('client_id', manager.client_id);

    await request(`${url}?${params.toString()}`, null, 'GET');

    // локально отразим новое состояние
    manager.is_active = nextState;

    // обновим ячейку статуса и чекбокс
    const row = toggle.closest('tr');
    const statusTd = row.children[2]; // колонка «Активен»
    statusTd.textContent = nextState ? 'Да' : 'Нет';
    statusTd.className = nextState ? 'status-active' : 'status-inactive';
  } catch (err) {
    // откат чекбокса
    toggle.checked = manager.is_active;

    if (err instanceof ValidationError) {
      alert(`Ошибка валидации: ${err.reason}`);
    } else {
      alert(`Не удалось изменить статус: ${err.message}`);
    }
  } finally {
    toggle.disabled = false;
  }
}

async function removeManager(manager, row, btn) {
  const name = manager.name || manager.email || `ID ${manager.client_id}`;

  if (!confirm(`Удалить менеджера «${name}»? Действие необратимо.`)) return;

  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = '…';

  try {
    await request(deleteUrl, { client_id: manager.client_id }, 'POST');

    row.remove();

    const bodyEl = document.getElementById('managers-body');
    if (bodyEl.children.length === 0) {
      const statusEl = document.getElementById('status');
      statusEl.hidden = false;
      statusEl.className = '';
      statusEl.textContent = 'Менеджеров нет';
      document.getElementById('managers-table').hidden = true;
    }
  } catch (err) {
    btn.disabled = false;
    btn.textContent = originalText;

    if (err instanceof ValidationError) {
      alert(`Ошибка валидации: ${err.reason}`);
    } else {
      alert(`Не удалось удалить: ${err.message}`);
    }
  }
}

// --- init ---

function init() {
  refreshToken().then(loadManagers);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
