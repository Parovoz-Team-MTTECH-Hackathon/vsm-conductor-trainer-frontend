import { refreshToken } from "/static/src/js/protocol.js";
import { request, ValidationError } from "/static/src/js/protocol.js";

const getProfileUrl    = "/player/profile";
const editProfileUrl   = "/player/profile/edit";
const statisticUrl     = "/player/statistic";

// ---------- профиль ----------

async function loadProfile() {
  const data = await request(getProfileUrl, null, 'GET');

  document.getElementById('client_id').textContent = data.client_id ?? '';
  document.getElementById('is_active').textContent = data.is_active ? 'Да' : 'Нет';
  document.getElementById('client_type').textContent = data.client_type ?? '';
  document.getElementById('email').textContent = data.email ?? '';
  document.getElementById('user_type').textContent = data.user_type ?? '';
  document.getElementById('first_name').textContent = data.first_name ?? '';
  document.getElementById('last_name').textContent = data.last_name ?? '';
  document.getElementById('patronymic_name').textContent = data.patronymic_name ?? '';
}

async function changeField(fieldName, label) {
  const currentValue = document.getElementById(fieldName).textContent;

  const newValue = prompt(`Введите новое значение для "${label}":`, currentValue);
  if (newValue === null) return;

  const params = new URLSearchParams();
  params.append('first_name', fieldName === 'first_name' ? newValue : document.getElementById('first_name').textContent);
  params.append('last_name',  fieldName === 'last_name'  ? newValue : document.getElementById('last_name').textContent);
  params.append('patronymic_name', fieldName === 'patronymic_name' ? newValue : document.getElementById('patronymic_name').textContent);

  try {
    const urlWithParams = `${editProfileUrl}?${params.toString()}`;
    const updatedData = await request(urlWithParams, null, 'POST');

    document.getElementById('first_name').textContent = updatedData.first_name ?? '';
    document.getElementById('last_name').textContent = updatedData.last_name ?? '';
    document.getElementById('patronymic_name').textContent = updatedData.patronymic_name ?? '';
  } catch (err) {
    if (err instanceof ValidationError) {
      alert(`Ошибка валидации: ${err.reason}`);
    } else {
      alert(`Ошибка: ${err.message}`);
    }
  }
}

// ---------- статистика ----------

async function loadStatistic() {
  const statusEl   = document.getElementById('stat-status');
  const contentEl  = document.getElementById('stat-content');
  const achStatus  = document.getElementById('stat-ach-status');
  const achTable   = document.getElementById('stat-ach-table');
  const achBody    = document.getElementById('stat-ach-body');

  try {
    const data = await request(statisticUrl, null, 'GET');

    // --- шапка статистики ---
    document.getElementById('stat_name').textContent = data.shortened_name ?? '';
    document.getElementById('stat_player_id').textContent = data.player_id ?? '';
    document.getElementById('stat_score').textContent = data.score ?? 0;

    const completed = Array.isArray(data.completed_scenarios) ? data.completed_scenarios : [];
    document.getElementById('stat_completed_count').textContent = completed.length;

    const chipsWrap = document.getElementById('stat_completed');
    chipsWrap.innerHTML = '';
    if (completed.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = 'Нет пройденных сценариев';
      chipsWrap.appendChild(empty);
    } else {
      for (const id of completed) {
        const chip = document.createElement('span');
        chip.className = 'chip';
        chip.textContent = `#${id}`;
        chipsWrap.appendChild(chip);
      }
    }

    // --- достижения ---
    const achievements = Array.isArray(data.achievements) ? data.achievements : [];

    achBody.innerHTML = '';

    if (achievements.length === 0) {
      achTable.hidden = true;
      achStatus.hidden = false;
      achStatus.className = 'empty';
      achStatus.textContent = 'Достижений нет';
    } else {
      for (const a of achievements) {
        achBody.appendChild(achievementRow(a));
      }
      achStatus.hidden = true;
      achTable.hidden = false;
    }

    statusEl.hidden = true;
    contentEl.hidden = false;
  } catch (err) {
    contentEl.hidden = true;
    statusEl.hidden = false;
    statusEl.className = 'error';
    statusEl.textContent = (err instanceof ValidationError)
      ? `Ошибка валидации: ${err.reason}`
      : `Не удалось загрузить статистику: ${err.message}`;
  }
}

function achievementRow(a) {
  const tr = document.createElement('tr');

  // иконка
  const tdIcon = document.createElement('td');
  const img = document.createElement('img');
  img.className = 'icon';
  img.alt = '';
  img.src = a.icon || '';
  tdIcon.appendChild(img);
  tr.appendChild(tdIcon);

  tr.appendChild(cell(a.scenario_id ?? ''));
  tr.appendChild(cell(a.achievement_name ?? ''));
  tr.appendChild(cell(a.label ?? ''));
  tr.appendChild(cell(a.description ?? ''));

  const tdDelta = document.createElement('td');
  tdDelta.className = 'delta';
  tdDelta.textContent = a.score_delta ?? 0;
  tr.appendChild(tdDelta);

  return tr;
}

function cell(value) {
  const td = document.createElement('td');
  td.textContent = value;
  return td;
}

// ---------- init ----------

function init() {
  document.getElementById('first').addEventListener('click', () => changeField('first_name', 'Имя'));
  document.getElementById('last').addEventListener('click', () => changeField('last_name', 'Фамилия'));
  document.getElementById('patr').addEventListener('click', () => changeField('patronymic_name', 'Отчество'));

  refreshToken().then(() => {
    loadProfile();
    loadStatistic();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
