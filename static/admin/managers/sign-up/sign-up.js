import { setSession } from "/static/src/js/session.js";
import { request } from "/static/src/js/protocol.js";

const email = document.getElementById('email');
const password = document.getElementById('pass');
const passwordRepeat = document.getElementById('pass-rep');
const nameInput = document.getElementById('name');
const err = document.getElementById('err');
const button = document.getElementById('send');

const signUpUrl = "/auth/signup/manager";

// Куда перейти после успешной регистрации менеджера
const afterSignUpRedirect = "../managers.html";

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
      name: nameInput.value,
    }, 'POST');

    setSession(result);
    document.location.href = afterSignUpRedirect;
  } catch (e) {
    err.textContent = e.message || 'Что-то пошло не так';
  } finally {
    button.disabled = false;
  }
});
