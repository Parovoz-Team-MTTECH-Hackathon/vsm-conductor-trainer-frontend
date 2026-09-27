let accessToken = null;
let clientType = null;
let userType = null;

export function setSession(data) {
  accessToken = data.access_token;
  clientType = data.client_type;
  userType = data.user_type;
}

export function getToken() { return accessToken; }
export function getClientType() { return clientType; }
export function getUserType() { return userType; }

export function clearSession() {
  accessToken = null;
  clientType = null;
  userType = null;
}

export function isAuthenticated() {
  return Boolean(accessToken);
}
