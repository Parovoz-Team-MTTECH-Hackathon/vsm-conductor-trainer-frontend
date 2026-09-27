import { refreshToken } from "/static/src/js/protocol.js";
import { request, ValidationError } from "/static/src/js/protocol.js";

const listUrl       = "/admin/integrations";
const activateUrl   = "/admin/activate";
const inactivateUrl = "/admin/inactivate";
const deleteUrl     = "/auth/delete";

async function loadIntegrations() {
  const statusEl = document.getElementById('status');
  const tableEl  = document.getElementById('integrations-table');
  const bodyEl   = document.getElementById('integrations-body');

  try {
    const integrations = await request(listUrl, null, 'GET');

    if (!Array.isArray(integrations)) {
      throw new Error('Сервер вернул неожиданный формат данных');
    }

    bodyEl.innerHTML = '';

    if (integrations.length === 0) {
      tableEl.hidden = true;
      statusEl.hidden = false;
      statusEl.className = '';
      statusEl.textContent = 'Интеграций нет';
      return;
    }

    for (const it of integrations) {
      const tr = document.createElement('tr');

      tr.appendChild(actionsCell(it, tr));
      tr.appendChild(cell(it.client_id ?? ''));
      tr.appendChild(statusCell(it.is_active));
      tr.appendChild(cell(it.client_type ?? ''));
      tr.appendChild(cell(it.name ?? ''));
      tr.appendChild(keyCell(it.key));

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

function keyCell(key) {
  const td = document.createElement('td');
  const wrap = document.createElement('div');
  wrap.className = 'key-cell';

  const code = document.createElement('code');
  code.textContent = key || '—';
  code.title = key || '';
  wrap.appendChild(code);

  if (key) {
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'Копировать';
    btn.addEventListener('click', () => copyKey(key, btn));
    wrap.appendChild(btn);
  }

  td.appendChild(wrap);
  return td;
}

function actionsCell(integration, row) {
  const td = document.createElement('td');
  const wrap = document.createElement('div');
  wrap.className = 'actions';

  const toggle = document.createElement('input');
  toggle.type = 'checkbox';
  toggle.checked = integration.is_active === true;
  toggle.title = 'Активна';
  toggle.addEventListener('change', () => toggleActive(integration, toggle));

  const toggleLabel = document.createElement('span');
  toggleLabel.className = 'toggle-label';
  toggleLabel.textContent = 'Активна';

  wrap.appendChild(toggle);
  wrap.appendChild(toggleLabel);

  const del = document.createElement('button');
  del.className = 'del-btn';
  del.textContent = 'Удалить';
  del.addEventListener('click', () => removeIntegration(integration, row, del));
  wrap.appendChild(del);

  td.appendChild(wrap);
  return td;
}

// --- действия ---

async function copyKey(key, btn) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(key);
    } else {
      // fallback для http
      const ta = document.createElement('textarea');
      ta.value = key;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      // @ts-ignore — deprecated, нужен как fallback
      document.execCommand('copy');
      document.body.removeChild(ta);
    }

    const original = btn.textContent;
    btn.textContent = 'Скопировано';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove('copied');
    }, 1500);
  } catch (err) {
    alert('Не удалось скопировать: ' + err.message);
  }
}

async function toggleActive(integration, toggle) {
  const nextState = !integration.is_active;
  const url = nextState ? activateUrl : inactivateUrl;

  toggle.disabled = true;

  try {
    const params = new URLSearchParams();
    params.append('client_id', integration.client_id);

    await request(`${url}?${params.toString()}`, null, 'GET');

    integration.is_active = nextState;

    // Обновляем ячейку «Активен» — индекс 2 (0=Действия, 1=Client ID, 2=Активен)
    const row = toggle.closest('tr');
    const statusTd = row.children[2];
    statusTd.textContent = nextState ? 'Да' : 'Нет';
    statusTd.className = nextState ? 'status-active' : 'status-inactive';
  } catch (err) {
    toggle.checked = integration.is_active;
    alert((err instanceof ValidationError)
      ? `Ошибка валидации: ${err.reason}`
      : `Не удалось изменить статус: ${err.message}`);
  } finally {
    toggle.disabled = false;
  }
}

async function removeIntegration(integration, row, btn) {
  const name = integration.name || `ID ${integration.client_id}`;

  if (!confirm(`Удалить интеграцию «${name}»? Действие необратимо.`)) return;

  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = '…';

  try {
    await request(deleteUrl, { client_id: integration.client_id }, 'POST');

    row.remove();

    const bodyEl = document.getElementById('integrations-body');
    if (bodyEl.children.length === 0) {
      const statusEl = document.getElementById('status');
      statusEl.hidden = false;
      statusEl.className = '';
      statusEl.textContent = 'Интеграций нет';
      document.getElementById('integrations-table').hidden = true;
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
  refreshToken().then(loadIntegrations);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
