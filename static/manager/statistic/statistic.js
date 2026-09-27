import { refreshToken } from "/static/src/js/protocol.js";
import { request, ValidationError } from "/static/src/js/protocol.js";

const statisticUrl = "/manager/statistic";

function getPlayerIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('player_id');
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}

async function loadStatistic(playerId) {
  const statusEl = document.getElementById('status');
  const contentEl = document.getElementById('content');

  try {
    const params = new URLSearchParams();
    params.append('player_id', playerId);

    const data = await request(`${statisticUrl}?${params.toString()}`, null, 'GET');

    // --- верхняя карточка ---
    document.getElementById('player_id').textContent = data.player_id ?? playerId;
    document.getElementById('score').textContent = data.score ?? 0;

    const completed = Array.isArray(data.completed_scenarios) ? data.completed_scenarios : [];
    document.getElementById('completed-count').textContent = completed.length;

    const completedWrap = document.getElementById('completed-wrap');
    completedWrap.innerHTML = '';
    if (completed.length === 0) {
      const span = document.createElement('span');
      span.className = 'empty';
      span.textContent = 'Нет пройденных сценариев';
      completedWrap.appendChild(span);
    } else {
      for (const id of completed) {
        const chip = document.createElement('span');
        chip.className = 'scenario-chip';
        chip.textContent = `#${id}`;
        completedWrap.appendChild(chip);
      }
    }

    // --- таблица достижений ---
    const achievements = Array.isArray(data.achievements) ? data.achievements : [];
    const achTable = document.getElementById('achievements-table');
    const achBody = document.getElementById('achievements-body');
    const achEmpty = document.getElementById('achievements-empty');

    achBody.innerHTML = '';

    if (achievements.length === 0) {
      achTable.hidden = true;
      achEmpty.hidden = false;
    } else {
      achEmpty.hidden = true;
      achTable.hidden = false;

      for (const a of achievements) {
        const tr = document.createElement('tr');
        tr.appendChild(cell(a.icon ?? '', 'icon'));
        tr.appendChild(cell(a.scenario_id ?? ''));
        tr.appendChild(cell(a.achievement_name ?? ''));
        tr.appendChild(cell(a.label ?? ''));
        tr.appendChild(cell(a.description ?? ''));
        tr.appendChild(cell(a.score_delta ?? ''));
        achBody.appendChild(tr);
      }
    }

    statusEl.hidden = true;
    contentEl.hidden = false;
  } catch (err) {
    contentEl.hidden = true;
    statusEl.hidden = false;
    statusEl.className = 'error';
    if (err instanceof ValidationError) {
      statusEl.textContent = `Ошибка валидации: ${err.reason}`;
    } else {
      statusEl.textContent = `Ошибка: ${err.message}`;
    }
  }
}

function cell(value, className) {
  const td = document.createElement('td');
  td.textContent = value;
  if (className) td.className = className;
  return td;
}

function init() {
  const playerId = getPlayerIdFromUrl();
  const statusEl = document.getElementById('status');

  if (playerId === null) {
    statusEl.className = 'error';
    statusEl.textContent = 'Не указан player_id в URL. Пример: statistic.html?player_id=1';
    return;
  }

  refreshToken().then(() => loadStatistic(playerId));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
