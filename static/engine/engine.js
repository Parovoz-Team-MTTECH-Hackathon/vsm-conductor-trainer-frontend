import { request, refreshToken } from "../src/js/protocol.js";

const menu = document.querySelector('#menu')
const close = document.querySelector('#close')
const content = document.querySelector('#content')
const progress = document.querySelector('#progress')
const domtimer = document.querySelector('#timer')
const panel = document.querySelector('#panel')

const loyalty = document.querySelector('#loyalty')
const safety = document.querySelector('#safety')

let game_data = {}
let pointer = "";   
let state = {
    "loyalty": 50,
    "safety": 50,
    "0": 0,
    "100": 100
};

let timerInterval = null;



menu.onclick = () => panel.classList.add('open')
close.onclick = () => panel.classList.remove('open')

function render_text(title, text) {
    progress.hidden = true

    content.innerHTML = `
        <h1>${title}</h1>
        <p>${text}</p>
        <button class="choice" onclick="choice(0)">Далее</button>
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
    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    render_choice(title, choices);

    progress.hidden = false;

    domtimer.min = 0;
    domtimer.max = 100;
    domtimer.value = 100;

    const start = Date.now();
    const duration = seconds * 1000;

    timerInterval = setInterval(() => {
        const elapsed = Date.now() - start;
        const left = Math.max(0, duration - elapsed);

        domtimer.value = (left / duration) * 100;

        if (left <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;

            // Автоматически выбираем первый вариант
            choice(0);
        }
    }, 50);
}

window.choice = function(index) {

    // Останавливаем таймер при выборе ответа
    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    progress.hidden = true;

    const node = game_data["nodes"][pointer];

    if (node["content_type"] === "scene") {
        pointer = node["content"]["next_node"];
    }

    if (node["content_type"] === "choice") {
        pointer = node["content"]["choice"][index]["next_node"];
    }
    handle();

};


let scenario_id = -1;


function load() {
    var url = new URL(window.location.href);
    var scenario_id_str = url.searchParams.get("scenario_id");

    if (scenario_id_str == null) {
        alert("scenario_id get parameter is not defined");
        return;
    }
    scenario_id = parseInt(scenario_id_str); 
    request('/scenario/get?scenario_id=' + scenario_id, {}, 'GET').then(data=>{run(data)}).catch(error => {alert(error)});
}

await refreshToken()

load()



function run(data){
    game_data = data;
    for (let [key, value] of Object.entries(data["nodes"])) {
        if (value["content_type"] == "begin") {
            pointer = key
            break;
        }
    }
    pointer = game_data["nodes"][pointer]["content"]["next_node"];
    handle()
}


function handle() {
    let content_type = game_data["nodes"][pointer]["content_type"];
    let content = game_data["nodes"][pointer]["content"];
    console.log(content_type, content)
    switch(content_type){
        case "scene":
            if (content["image_node"] != null) {
                setSrcImage(game_data["nodes"][content["image_node"]]["content"]["resource"]);
            }
            render_text(content["label"], content["text"]);
            break;
        case "choice":
            let choices = []
            for (let [key, value] of Object.entries(content["choice"])) {
                choices.push(value["text"]);
            }
            render_timed_choice(content["topic"], choices, 5);
            break;
        case "safety":
            state["safety"] += content["delta"]
            pointer = content["next_node"];
            safety.value = state["safety"]
            handle()
            check_state()
            break;
        case "loyalty":
            state["loyalty"] += content["delta"]
            pointer = content["next_node"];
            loyalty.value = state["loyalty"]
            handle()
            check_state()
            break;
        case "achievement":
            request('/scenario/achieve?scenario_id=' + scenario_id + "&achievement_name="+content["name"], {}, 'GET');
            alert("Получено достижение \""+content["label"]+"\"!")
            pointer = content["next_node"];
            handle()
            break;
        case "end":
            if (content["is_completed"]) {
                alert("Сценарий успешно пройден!")
                request('/scenario/complete?scenario_id=' + scenario_id + "&achievement_name="+content["name"], {}, 'GET');
            } else {
                alert("Сценарий не пройден!")
            }
            window.location.href = "/static/game-menu/game-menu.html"
            break;
    }
}

function check_state() {
    if (state["safety"] <= 0) {
        alert("Сценарий не пройден! Вы грубо нарушили правила безопасности на транспорте.")
        window.location.href = "/static/game-menu/game-menu.html"
    }

    if (state["loyalty"] <= 0) {
        alert("Сценарий не пройден! Начальнику поезда на вас поступило очень много жалоб от пассажиров.")
        window.location.href = "/static/game-menu/game-menu.html"
    }
}

function setSrcImage(src) {
    document.getElementById("image").src = src;
}