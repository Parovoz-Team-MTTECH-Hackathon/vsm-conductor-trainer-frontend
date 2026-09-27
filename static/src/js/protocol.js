import { getToken, setSession, clearSession } from './session.js';

export class ValidationError extends Error {
  constructor(reason) {
    super(reason || 'Ошибка валидации');
    this.name = 'ValidationError';
    this.reason = reason;
  }
}

// --- public API ---

export async function request(url, data, method) {
  const response = await doFetch(url, data, method);

  if (response.ok) {
    return parseJson(response);
  }

  if (response.status === 401) {
    return retryAfterRefresh(url, data, method);
  }

  await throwResponseError(response);
}

export function buildHeaders(extra = {}) {
  const headers = { ...extra };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function refreshToken() {
  try {
    const res = await fetch('/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (!res.ok) return false;

    const data = await parseJson(res);
    if (data?.access_token) {
      setSession(data);
    }
    return true;
  } catch {
    return false;
  }
}

// --- internals ---

function buildOptions(data, method) {
  const options = {
    method,
    headers: buildHeaders(),
  };

  const hasBody = method !== 'GET'
    && method !== 'HEAD'
    && data !== null
    && data !== undefined;

  if (hasBody) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(data);
  }

  return options;
}

async function doFetch(url, data, method) {
  return fetch(url, buildOptions(data, method));
}

async function parseJson(response) {
  // 204 No Content и пустое тело — не ошибка
  if (response.status === 204) return null;

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text; // если пришёл не JSON — вернём как есть
  }
}

async function retryAfterRefresh(url, data, method) {
  const refreshed = await refreshToken();

  if (!refreshed) {
    clearSession();
    throw new Error('Сессия истекла, войдите заново');
  }

  const retry = await doFetch(url, data, method);

  if (retry.ok) {
    return parseJson(retry);
  }

  // если после refresh снова 401 — не зацикливаемся
  if (retry.status === 401) {
    clearSession();
    throw new Error('Сессия истекла, войдите заново');
  }

  await throwResponseError(retry);
}

async function throwResponseError(response) {
  if (response.status === 422) {
    const body = await parseJson(response);
    const payload = body?.detail?.[0]?.ctx?.reason
      || body?.detail?.[0]?.msg
      || 'Ошибка валидации';
    throw new ValidationError(payload);
  }

  switch (response.status) {
    case 403:
    case 404:
    case 409:
    case 501: {
      throw new Error(await extractMessage(response));
    }
    default: {
      throw new Error(await extractMessage(response, 'Ошибка сервера'));
    }
  }
}

async function extractMessage(response, fallback = 'Ошибка сервера') {
  const body = await parseJson(response).catch(() => null);
  if (typeof body === 'string' && body) return body;
  return body?.detail || body?.message || `${fallback} (${response.status})`;
}
