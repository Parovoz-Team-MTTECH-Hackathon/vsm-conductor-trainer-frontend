import { getToken, setSession, clearSession } from './session.js';

export class ValidationError extends Error {
  constructor(reason) {
    super(reason || 'Ошибка валидации');
    this.name = 'ValidationError';
    this.reason = reason;
  }
}

export async function request(url, data, method) {
  const options = {
      method,
      headers: buildHeaders(),
    };

    if (method !== 'GET' && method !== 'HEAD' && data !== null && data !== undefined) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

  if (response.ok) {
    return response.json();
  }

  switch (response.status) {
    case 401:
      return retryAfterRefresh(url, data, method, response);
    case 422: {
      const body = await response.json().catch(() => null);
      const payload = body?.detail?.[0]?.ctx?.reason
        || body?.detail?.[0]?.msg
        || 'Ошибка валидации';
      throw new ValidationError(payload);
    }
    case 403:
    case 404:
    case 409:
    case 501: {
      const msg = await extractMessage(response);
      throw new Error(msg);
    }

    default: {
      const msg = await extractMessage(response, 'Ошибка сервера');
      throw new Error(msg);
    }
  }
}

// --- helpers ---

export function buildHeaders(extra = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...extra,
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function extractMessage(response, fallback = 'Ошибка сервера') {
  const body = await response.json().catch(() => null);
  return body?.detail || body?.message || `${fallback} (${response.status})`;
}

async function retryAfterRefresh(url, data, method, originalResponse) {
  const refreshed = await refreshToken();

  if (!refreshed) {
    clearSession();
    throw new Error('Сессия истекла, войдите заново');
  }

  const options = {
      method,
      headers: buildHeaders(),
    };

  if (method !== 'GET' && method !== 'HEAD' && data !== null && data !== undefined) {
    options.body = JSON.stringify(data);
  }

  const retry = await fetch(url, options);

  if (retry.ok) {
    return retry.json();
  }

  const msg = await extractMessage(retry);
  throw new Error(msg);
}

export async function refreshToken() {
  try {
    const res = await fetch('/auth/refresh', {
      method: 'POST',
      credentials: 'include', // httpOnly cookie с refresh
    });

    if (!res.ok) return false;

    const data = await res.json();
    if (data?.access_token) {
      setSession(data);
    }
    return true;
  } catch {
    return false;
  }
}
