import { request, refreshToken } from "../src/js/protocol.js";

const menu = document.querySelector('#menu')
const close = document.querySelector('#close')
const content = document.querySelector('#content')
const progress = document.querySelector('#progress')
const bar = document.querySelector('#bar')
const panel = document.querySelector('#panel')

menu.onclick = () => panel.classList.add('open')
close.onclick = () => panel.classList.remove('open')

function render_text(title, text) {
    progress.hidden = true

    content.innerHTML = `
        <h1>${title}</h1>
        <p>${text}</p>
        <button>Далее</button>
    `
}

function render_choice(title, choices) {
    progress.hidden = true

    content.innerHTML = `
        <h1>${title}</h1>
        ${choices.map((x, i) =>
            `<button class="choice" onclick="choice(${i})">${x}</button>`
        ).join('')}
    `
}

function render_timed_choice(title, choices, seconds) {
    render_choice(title, choices)

    progress.hidden = false
    bar.style.width = '100%'

    const start = Date.now()

    const timer = setInterval(() => {
        const left = Math.max(
            0,
            seconds * 1000 - (Date.now() - start)
        )

        bar.style.width =
            `${left / (seconds * 1000) * 100}%`

        if (!left) clearInterval(timer)
    }, 50)
}

function choice(index) {
    console.log(index)
}

render_text("zxc", "ccffffffffffffffffffffffffffc")

await refreshToken()
