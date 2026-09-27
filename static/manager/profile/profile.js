import { refreshToken } from "/static/src/js/protocol.js";
import { request, ValidationError } from "/static/src/js/protocol.js";

const getProfileUrl = "/manager/profile";
const editProfileUrl = "/manager/profile/edit";

let currentClientId = null;

async function loadProfile() {
  const data = await request(getProfileUrl, null, 'GET');

  currentClientId = data.client_id ?? null;

  document.getElementById('client_id').textContent = data.client_id ?? '';
  document.getElementById('is_active').textContent = data.is_active ? 'Да' : 'Нет';
  document.getElementById('client_type').textContent = data.client_type ?? '';
  document.getElementById('email').textContent = data.email ?? '';
  document.getElementById('user_type').textContent = data.user_type ?? '';
  document.getElementById('name').textContent = data.name ?? '';

  updateInviteLink();
}

function buildInviteUrl(managerId) {
  // Ссылка, по которой игрок зайдёт: /player/join?manager_id=<id>
  const url = new URL('/player/join', window.location.origin);
  url.searchParams.set('manager_id', managerId);
  return url.toString();
}

function updateInviteLink() {
  const linkEl = document.getElementById('invite-link');
  const copyBtn = document.getElementById('copy-invite');

  if (currentClientId === null || currentClientId === undefined) {
    linkEl.textContent = '—';
    copyBtn.disabled = true;
    return;
  }

  const url = buildInviteUrl(currentClientId);
  linkEl.textContent = url;
  linkEl.dataset.url = url;
  copyBtn.disabled = false;
}

async function copyInvite() {
  const linkEl = document.getElementById('invite-link');
  const copyBtn = document.getElementById('copy-invite');
  const url = linkEl.dataset.url;
  if (!url) return;

  try {
    await navigator.clipboard.writeText(url);

    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Скопировано';
    copyBtn.classList.add('copied');
    setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.classList.remove('copied');
    }, 1500);
  } catch (err) {
    alert('Не удалось скопировать: ' + err.message);
  }
}
async function changeName() {
  const currentValue = document.getElementById('name').textContent;
  const newValue = prompt('Введите новое имя:', currentValue);

  if (newValue === null || newValue.trim() === '') return;

  const params = new URLSearchParams();
  params.append('name', newValue.trim());

  try {
    const updatedData = await request(
      `${editProfileUrl}?${params.toString()}`,
      null,
      'POST'
    );

    document.getElementById('name').textContent = updatedData.name ?? '';
  } catch (err) {
    if (err instanceof ValidationError) {
      alert(`Ошибка валидации: ${err.reason}`);
    } else {
      alert(`Ошибка: ${err.message}`);
    }
  }
}

function init() {
  document.getElementById('edit-name').addEventListener('click', changeName);
  document.getElementById('copy-invite').addEventListener('click', copyInvite);

  refreshToken().then(loadProfile);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
