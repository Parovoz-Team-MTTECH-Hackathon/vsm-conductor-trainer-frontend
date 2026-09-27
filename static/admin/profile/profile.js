import { refreshToken } from "/static/src/js/protocol.js";
import { request, ValidationError } from "/static/src/js/protocol.js";

const getProfileUrl     = "/admin/profile";
const listScenariosUrl  = "/scenario/list";
const createScenarioUrl = "/scenario/create";

// Куда редиректим и при создании, и при открытии сценария
const EDITOR_URL = "/static/editor/editor.html";

// ---------- профиль ----------

async function loadProfile() {
  const data = await request(getProfileUrl, null, 'GET');

  document.getElementById('client_id').textContent = data.client_id ?? '';
  document.getElementById('is_active').textContent = data.is_active ? 'Да' : 'Нет';
  document.getElementById('client_type').textContent = data.client_type ?? '';
  document.getElementById('email').textContent = data.email ?? '';
  document.getElementById('user_type').textContent = data.user_type ?? '';
}

// ---------- сценарии: список ----------

async function loadScenarios() {
  const listEl = document.getElementById('scenario-list');

  try {
    const scenarios = await request(listScenariosUrl, null, 'GET');

    if (!Array.isArray(scenarios)) {
      throw new Error('Сервер вернул неожиданный формат данных');
    }

    listEl.innerHTML = '';

    if (scenarios.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = 'Сценариев нет';
      listEl.appendChild(empty);
      return;
    }

    for (const s of scenarios) {
      listEl.appendChild(scenarioButton(s));
    }
  } catch (err) {
    listEl.innerHTML = '';
    const empty = document.createElement('div');
    empty.className = 'error';
    empty.textContent = (err instanceof ValidationError)
      ? `Ошибка валидации: ${err.reason}`
      : `Не удалось загрузить сценарии: ${err.message}`;
    listEl.appendChild(empty);
  }
}

function scenarioButton(s) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'scenario-btn';

  const icon = document.createElement('span');
  icon.className = 'icon';
  icon.textContent = s.icon || '📄';

  const meta = document.createElement('span');
  meta.className = 'meta';

  const title = document.createElement('span');
  title.className = 'title';
  title.textContent = s.label || `Сценарий #${s.scenario_id}`;

  const desc = document.createElement('span');
  desc.className = 'desc';
  desc.textContent = s.description || '';

  meta.appendChild(title);
  if (desc.textContent) meta.appendChild(desc);

  btn.appendChild(icon);
  btn.appendChild(meta);

  btn.addEventListener('click', () => {
    window.location.href = `${EDITOR_URL}?scenario_id=${s.scenario_id}`;
  });

  return btn;
}

// ---------- сценарии: создание ----------

async function createScenario(btn) {
  const errorEl = document.getElementById('scenario-error');
  errorEl.hidden = true;
  errorEl.textContent = '';

  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Создание…';

  try {
    const created = await request(createScenarioUrl, null, 'GET');

    const id = created.scenario_id;
    if (id === undefined || id === null) {
      throw new Error('Сервер не вернул scenario_id');
    }

    window.location.href = `${EDITOR_URL}?scenario_id=${id}`;
  } catch (err) {
    btn.disabled = false;
    btn.textContent = originalText;

    errorEl.hidden = false;
    errorEl.textContent = (err instanceof ValidationError)
      ? `Ошибка валидации: ${err.reason}`
      : `Не удалось создать сценарий: ${err.message}`;
  }
}

// ---------- init ----------

function init() {
  document.getElementById('create-scenario')
    .addEventListener('click', (e) => createScenario(e.currentTarget));

  refreshToken().then(() => {
    loadProfile();
    loadScenarios();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
