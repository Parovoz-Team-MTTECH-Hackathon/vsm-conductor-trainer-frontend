import { setSession } from "/static/src/js/session.js";
import { request } from "/static/src/js/protocol.js";

const email = document.getElementById('email');
const password = document.getElementById('pass');
const passwordRepeat = document.getElementById('pass-rep');
const firstName = document.getElementById('first_name');
const lastName = document.getElementById('last_name');
const patronymicName = document.getElementById('patronymic_name');
const err = document.getElementById('err');
const button = document.getElementById('send');

const signUpUrl = "/auth/signup/player"

button.addEventListener('click', async () => {
  err.textContent = '';

  if (password.value !== passwordRepeat.value) {
    err.textContent = 'Пароли должны совпадать';
    return;
  }

  button.disabled = true;
  try {
    const result = await request(signUpUrl, {
      email: email.value,
      password: password.value,
      first_name: firstName.value,
      last_name: lastName.value,
      patronymic_name: patronymicName.value,
    }, 'POST');
    setSession(result)
    document.location.href = '/static/index.html'
  } catch (e) {
    err.textContent = e.message || 'Что-то пошло не так';
  } finally {
    button.disabled = false;
  }
});
