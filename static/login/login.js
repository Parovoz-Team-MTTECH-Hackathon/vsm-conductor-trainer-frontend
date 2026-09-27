import { ValidationError } from "/static/src/js/protocol.js";
import { setSession } from "/static/src/js/session.js";
import { request } from "/static/src/js/protocol.js";

const email = document.getElementById('email');
const password = document.getElementById('pass');
const err = document.getElementById('err');
const button = document.getElementById('send');

const signUpUrl = "/auth/login/user"

button.addEventListener('click', async () => {
  err.textContent = '';
  button.disabled = true;
  try {
    const result = await request(signUpUrl, {
      email: email.value,
      password: password.value,
    }, 'POST');
    setSession(result)
    document.location.href = '/static/index.html'
  } catch (e) {
    if (e instanceof ValidationError) {
      err.textContent = e.reason;
    }
  } finally {
    button.disabled = false;
  }
});
