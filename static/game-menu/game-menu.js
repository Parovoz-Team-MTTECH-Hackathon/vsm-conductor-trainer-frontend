import { refreshToken } from "/static/src/js/protocol.js";
import { request, ValidationError } from "/static/src/js/protocol.js";

const topUrl           = "/player/top";
const listScenariosUrl = "/scenario/list";

// Куда ведут клики
const PUBLIC_PROFILE_URL = "/static/public-profile/public-profile.html";           // ?player_id=...
const ENGINE_URL         = "/static/engine/engine.html";     // ?scenario_id=...

// ---------- таблица лидеров ----------

async function loadLeaders() {
  const statusEl = document.getElementById('leaders-status');
  const tableEl  = document.getElementById('leaders-table');
  const bodyEl   = document.getElementById('leaders-body');

  try {
    const leaders = await request(topUrl, null, 'GET');

    if (!Array.isArray(leaders)) {
      throw new Error('Сервер вернул неожиданный формат данных');
    }

    bodyEl.innerHTML = '';

    if (leaders.length === 0) {
      tableEl.hidden = true;
      statusEl.hidden = false;
      statusEl.className = 'empty';
      statusEl.textContent = 'Пока никого нет';
      return;
    }

    leaders.forEach((p, i) => {
      const tr = document.createElement('tr');
      tr.title = 'Открыть публичный профиль';

      const rank = document.createElement('td');
      rank.className = 'rank';
      rank.textContent = String(i + 1);
      tr.appendChild(rank);

      const name = document.createElement('td');
      name.textContent = p.shorted_name ?? `Игрок #${p.player_id}`;
      tr.appendChild(name);

      const score = document.createElement('td');
      score.className = 'score';
      score.textContent = p.score ?? 0;
      tr.appendChild(score);

      tr.addEventListener('click', () => {
        window.location.href =
          `${PUBLIC_PROFILE_URL}?player_id=${encodeURIComponent(p.player_id)}`;
      });

      bodyEl.appendChild(tr);
    });

    statusEl.hidden = true;
    tableEl.hidden = false;
  } catch (err) {
    tableEl.hidden = true;
    statusEl.hidden = false;
    statusEl.className = 'error';
    statusEl.textContent = (err instanceof ValidationError)
      ? `Ошибка валидации: ${err.reason}`
      : `Не удалось загрузить таблицу лидеров: ${err.message}`;
  }
}

// ---------- список сценариев ----------

async function loadScenarios() {
  const statusEl = document.getElementById('scenarios-status');
  const listEl   = document.getElementById('scenario-list');

  try {
    const scenarios = await request(listScenariosUrl, null, 'GET');

    if (!Array.isArray(scenarios)) {
      throw new Error('Сервер вернул неожиданный формат данных');
    }

    listEl.innerHTML = '';

    if (scenarios.length === 0) {
      listEl.hidden = true;
      statusEl.hidden = false;
      statusEl.className = 'empty';
      statusEl.textContent = 'Сценариев нет';
      return;
    }

    for (const s of scenarios) {
      listEl.appendChild(scenarioButton(s));
    }

    statusEl.hidden = true;
    listEl.hidden = false;
  } catch (err) {
    listEl.hidden = true;
    statusEl.hidden = false;
    statusEl.className = 'error';
    statusEl.textContent = (err instanceof ValidationError)
      ? `Ошибка валидации: ${err.reason}`
      : `Не удалось загрузить сценарии: ${err.message}`;
  }
}

function scenarioButton(s) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'scenario-btn';

  const icon = document.createElement('img');
  icon.className = 'icon';
  icon.alt = '';
  icon.src = s.icon || '';

  const meta = document.createElement('span');
  meta.className = 'meta';

  const title = document.createElement('span');
  title.className = 'title';
  title.textContent = s.label || `Сценарий #${s.scenario_id}`;
  title.title = s.label || '';

  const desc = document.createElement('span');
  desc.className = 'desc';
  desc.textContent = s.description || '';
  desc.title = s.description || '';

  meta.appendChild(title);
  if (s.description) meta.appendChild(desc);

  btn.appendChild(icon);
  btn.appendChild(meta);

  btn.addEventListener('click', () => {
    window.location.href =
      `${ENGINE_URL}?scenario_id=${encodeURIComponent(s.scenario_id)}`;
  });

  return btn;
}

// ---------- init ----------

function init() {
  refreshToken().then(() => {
    loadLeaders();
    loadScenarios();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
