import { request, refreshToken } from "../src/js/protocol.js";


LiteGraph.registered_node_types = {};

let isLoadingProject = false;


var graph = new LGraph();
var canvas = new LGraphCanvas("#editor-canvas", graph);


let scenario_id = -1;
let scenario_label = "";
let scenario_description = "";

canvas.getNodeMenuOptions = function(node) {
    return [
        {
            content: "Clone",
            callback: () => {
                const newNode = LiteGraph.createNode(node.type);
                if (!newNode) {
                    return;
                }
                newNode.configure(node.serialize());
                newNode.pos = [
                    node.pos[0] + 30,
                    node.pos[1] + 30
                ];

                graph.add(newNode);
            }
        },
        {
            content: "Remove",
            callback: () => {
                graph.remove(node);
            }
        }
    ];
};

canvas.allow_searchbox = false;





// ============================================================
// Base
// ============================================================

class ScenarioNode extends LGraphNode {
    constructor(title) {
        super();

        this.title = title;
        this.size = [220, 80];
    }


    addTextProperty(name, label, value = "") {
        this.properties[name] = value;
        return this.addWidget("text", label, value, name);
    }

    addNumberProperty(name, label, value = 0) {
        this.properties[name] = value;
        return this.addWidget("number", label, value, name, {});
    }

    addBooleanProperty(name, label, value = false) {
        this.properties[name] = value;
        return this.addWidget("toggle", label, value, name);
    }

    addResourceProperty(name) {
        this.properties[name] = "";

        this.addWidget(
            "button",
            "Upload Resource",
            "Upload",
            () => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";

                input.onchange = (event) => {
                    const file = event.target.files?.[0];

                    if (!file) {
                        return;
                    }

                    const reader = new FileReader();

                    reader.onload = () => {
                        this.properties[name] = reader.result;
                        this.setDirtyCanvas(true, true);
                    };

                    reader.readAsDataURL(file);
                };

                input.click();
            }
        );

        this.addWidget(
            "button",
            "View Resource",
            "View",
            () => {
                const resource = this.properties[name];

                if (!resource) {
                    return;
                }

                const newWindow = window.open("", "_blank");

                if (!newWindow) {
                    return;
                }

                newWindow.document.write(`<img src="${resource}">`);
                newWindow.document.close();
            }
        );
    }

    addInInput() {
        this.addInput("in", "node", {color_on: "#00FF00", color_off: "#00FF00"});

        const input = this.inputs[this.inputs.length - 1];
        input.isDynamicIn = true;
    }

    onConnectionsChange(type, slotIndex, connected, linkInfo) {

        if (isLoadingProject) {
            return;
        }

        if (type !== LiteGraph.INPUT) {
            return;
        }

        const input = this.inputs[slotIndex];

        if (!input?.isDynamicIn) {
            return;
        }

        if (connected) {

            if (slotIndex === this.getLastDynamicInputIndex()) {
                this.addInInput();
            }

            return;
        }

        const dynamicCount = this.inputs.filter(
            input => input.isDynamicIn
        ).length;

        if (dynamicCount > 1) {
            this.removeInput(slotIndex);
        }
    }

    getLastDynamicInputIndex() {
        for (let i = this.inputs.length - 1; i >= 0; i--) {
            if (this.inputs[i].isDynamicIn) {
                return i;
            }
        }

        return -1;
    }


    getInInputs() {
        return this.inputs
            .map((input, index) => ({
                input,
                index
            }))
            .filter(({ input }) => input.link != null)
            .map(({ index }) => this.getInputData(index));
    }


    onConnectOutput(outputIndex, inputType, inputSlot, inputNode) {
        const output = this.outputs[outputIndex];

        if (
            output.type === "node" &&
            output.links &&
            output.links.length > 0
        ) {
            return false;
        }

        return true;
    }
}



// ============================================================
// BEGIN
// ============================================================

class BeginNode extends ScenarioNode {
    constructor() {
        super("Begin");

        this.addOutput("out", "node");

        this.size = [180, 60];
    }
}

LiteGraph.registerNodeType("scenario/begin", BeginNode);


// ============================================================
// TRIGGER
// ============================================================

class TriggerNode extends ScenarioNode {
    constructor() {
        super("Trigger");

        this.addTextProperty("name", "Name", "<state-var-name>")

        this.addInInput()
        this.addOutput("out", "node");
    }
}

LiteGraph.registerNodeType("scenario/trigger", TriggerNode);


// ============================================================
// END
// ============================================================

class EndNode extends ScenarioNode {
    constructor() {
        super("End");

        this.addBooleanProperty("is_completed", "Is completed?")

        this.addInInput()
    }
}

LiteGraph.registerNodeType("scenario/end", EndNode);


// ============================================================
// IMAGE
// ============================================================

class ImageNode extends ScenarioNode {
    constructor() {
        super("Image");

        this.addResourceProperty("resource", "Image Resource")
        this.addOutput("out", "resource");
    }
}

LiteGraph.registerNodeType("scenario/image", ImageNode);


// ============================================================
// SCENE
// ============================================================

class SceneNode extends ScenarioNode {
    constructor() {
        super("Scene");

        this.addTextProperty("label", "Label")
        this.addTextProperty("text", "Text")

        this.addInput("image", "resource", {color_on: "#FF0000", color_off: "#FF0000"});
        this.addInInput()
        this.addOutput("out", "node");
    }
}

LiteGraph.registerNodeType("scenario/scene", SceneNode);


// ============================================================
// CHOICE
// ============================================================

class ChoiceNode extends ScenarioNode {
    constructor() {
        super("Choice");

        this.properties.choice = [];

        this.addTextProperty("topic", "Topic");

        this.addInInput()

        this.addOutput("out", "node");
        this.addWidget(
            "button",
            "ADD",
            null,
            () => {
                this.addChoice();
            }
        );

        this.refreshChoices();
    }

    addChoice(text = "") {
        const index = this.properties.choice.length;

        this.properties.choice.push({
            text: text
        });

        this.addOutput(
            `choice_${index}`,
            "node"
        );

        this.refreshChoices();

        this.setDirtyCanvas(true, true);
    }

    removeChoice(index) {

        if (
            index < 0 ||
            index >= this.properties.choice.length
        ) {
            return;
        }

        // choice_0 находится в output[1]
        this.removeOutput(index + 1);

        this.properties.choice.splice(index, 1);

        // output[0] = out
        for (let i = 1; i < this.outputs.length; i++) {
            this.outputs[i].name = `choice_${i - 1}`;
        }

        this.refreshChoices();

        this.setDirtyCanvas(true, true);
    }

    refreshChoices() {
        // Оставляем topic и ADD
        this.widgets = this.widgets.slice(0, 2);

        this.properties.choice.forEach((choice, index) => {

            // Поле текста choice
            const textWidget = this.addWidget(
                "text",
                `Choice ${index}`,
                choice.text,
                `choice_${index}`
            );

            textWidget.callback = (value) => {
                choice.text = value;
            };

            // REMOVE
            this.addWidget(
                "button",
                "REMOVE",
                null,
                () => {
                    this.removeChoice(index);
                }
            );
        });
    }

    onConfigure() {
        this.refreshChoices();
    }
}

LiteGraph.registerNodeType(
    "scenario/choice",
    ChoiceNode
);




// ============================================================
// TIME CHOICE
// ============================================================

class TimeChoiceNode extends ScenarioNode {
    constructor() {
        super("Choice");

        this.properties.choice = [];

        this.addTextProperty("topic", "Topic");
        this.addNumberProperty("time", "Time (s)")

        this.addInInput()

        this.addOutput("out", "node");
        this.addWidget(
            "button",
            "ADD",
            null,
            () => {
                this.addChoice();
            }
        );

        this.refreshChoices();
    }

    addChoice(text = "") {
        const index = this.properties.choice.length;

        this.properties.choice.push({
            text: text
        });

        this.addOutput(
            `choice_${index}`,
            "node"
        );

        this.refreshChoices();

        this.setDirtyCanvas(true, true);
    }

    removeChoice(index) {

        if (
            index < 0 ||
            index >= this.properties.choice.length
        ) {
            return;
        }

        // choice_0 находится в output[1]
        this.removeOutput(index + 1);

        this.properties.choice.splice(index, 1);

        // output[0] = out
        for (let i = 1; i < this.outputs.length; i++) {
            this.outputs[i].name = `choice_${i - 1}`;
        }

        this.refreshChoices();

        this.setDirtyCanvas(true, true);
    }

    refreshChoices() {
        // Оставляем topic и ADD
        this.widgets = this.widgets.slice(0, 2);

        this.properties.choice.forEach((choice, index) => {

            // Поле текста choice
            const textWidget = this.addWidget(
                "text",
                `Choice ${index}`,
                choice.text,
                `choice_${index}`
            );

            textWidget.callback = (value) => {
                choice.text = value;
            };

            // REMOVE
            this.addWidget(
                "button",
                "REMOVE",
                null,
                () => {
                    this.removeChoice(index);
                }
            );
        });
    }

    onConfigure() {
        this.refreshChoices();
    }
}

LiteGraph.registerNodeType(
    "scenario/time_choice",
    TimeChoiceNode
);


// ============================================================
// NOTICE
// ============================================================

class NoticeNode extends ScenarioNode {
    constructor() {
        super("Notice");

        this.addTextProperty("text", "Text")


        this.addInInput()
        this.addOutput("out", "node");
    }
}

LiteGraph.registerNodeType("scenario/notice", NoticeNode);


// ============================================================
// LOYALTY
// ============================================================

class LoyaltyNode extends ScenarioNode {
    constructor() {
        super("Loyalty");

        this.addNumberProperty("delta", "Loyalty delta")


        this.addInInput()
        this.addOutput("out", "node");
    }
}

LiteGraph.registerNodeType("scenario/loyalty", LoyaltyNode);


// ============================================================
// SAFETY
// ============================================================

class SafetyNode extends ScenarioNode {
    constructor() {
        super("Safety");

        this.addNumberProperty("delta", "Safety delta")

        this.addInInput()
        this.addOutput("out", "node");
    }
}

LiteGraph.registerNodeType("scenario/safety", SafetyNode);


// ============================================================
// START TIMER
// ============================================================

class StartTimerNode extends ScenarioNode {
    constructor() {
        super("Start Timer");

        this.addTextProperty("name", "Name");
        this.addTextProperty("label", "Label");
        this.addNumberProperty("time", "Time (s)")

        this.addOutput("interruption", "node");
        this.addOutput("finish", "node");
        this.addInInput()
        this.addOutput("out", "node");
    }
}

LiteGraph.registerNodeType(
    "scenario/start_timer",
    StartTimerNode
);


// ============================================================
// INTERRUPT TIMER
// ============================================================

class InterruptTimerNode extends ScenarioNode {
    constructor() {
        super("Interrupt Timer");

        this.addTextProperty("name", "Name");

        this.addInInput()
        this.addOutput("out", "node");
    }
}

LiteGraph.registerNodeType(
    "scenario/interrupt_timer",
    InterruptTimerNode
);


// ============================================================
// KILL TIMER
// ============================================================

class KillTimerNode extends ScenarioNode {
    constructor() {
        super("Kill Timer");

        this.addTextProperty("name", "Name");

        this.addInInput()
        this.addOutput("out", "node");
    }
}

LiteGraph.registerNodeType(
    "scenario/kill_timer",
    KillTimerNode
);


// ============================================================
// KILL ALL TIMERS
// ============================================================

class KillAllTimersNode extends ScenarioNode {
    constructor() {
        super("Kill All Timers");

        this.addInInput()
        this.addOutput("out", "node");
    }
}

LiteGraph.registerNodeType(
    "scenario/kill_all_timers",
    KillAllTimersNode
);


// ============================================================
// ACHIEVEMENT
// ============================================================

class AchievementNode extends ScenarioNode {
    constructor() {
        super("Achievement");

        this.addTextProperty("name", "Name");
        this.addTextProperty("label", "Label");
        this.addTextProperty("description", "Description");
        this.addNumberProperty("score_delta", "Score delta")
        this.addInput("icon", "resource", {color_on: "#FF0000", color_off: "#FF0000"});
        this.addInInput()
        this.addOutput("out", "node");
    }
}

LiteGraph.registerNodeType(
    "scenario/achievement",
    AchievementNode
);


// ============================================================
// GOTO
// ============================================================

class GotoNode extends ScenarioNode {
    constructor() {
        super("Goto");

        this.addOutput("goto", "node");
        this.addInInput()
        this.addOutput("out", "node");
    }
}

LiteGraph.registerNodeType("scenario/goto", GotoNode);


// ============================================================
// CALL
// ============================================================

class CallNode extends ScenarioNode {
    constructor() {
        super("Call");

        this.addInInput()
        this.addOutput("out", "node");
    }
}

LiteGraph.registerNodeType("scenario/call", CallNode);


// ============================================================
// SET
// ============================================================

class SetNode extends ScenarioNode {
    constructor() {
        super("Set");

        this.addTextProperty("name", "Name");
        this.addTextProperty("value", "Value");

        this.addInInput()
        this.addOutput("out", "node");
    }
}

LiteGraph.registerNodeType("scenario/set", SetNode);


// ============================================================
// IF EQUALS
// ============================================================

class IfEqualsNode extends ScenarioNode {
    constructor() {
        super("If Equals");

        this.addTextProperty("name_a", "Name A ==");
        this.addTextProperty("name_b", "== Name B");

        this.addInInput()
        this.addOutput("true", "node");
        this.addOutput("false", "node");
    }
}

LiteGraph.registerNodeType(
    "scenario/if_equals",
    IfEqualsNode
);


// ============================================================
// IF COMPARE
// ============================================================

class IfCompareNode extends ScenarioNode {
    constructor() {
        super("If Compare");

        this.addTextProperty("name_a", "Name A >");
        this.addTextProperty("name_b", "> Name B");

        this.addInInput()
        this.addOutput("true", "node");
        this.addOutput("false", "node");
    }
}

LiteGraph.registerNodeType(
    "scenario/if_compare",
    IfCompareNode
);


function createScenarioNode(target_name) {
    const node = LiteGraph.createNode(target_name);

    if (!node) {
        return;
    }

    // Текущая позиция мыши в координатах графа
    node.pos = [
        canvas.graph_mouse[0],
        canvas.graph_mouse[1]
    ];

    graph.add(node);
}


canvas.getMenuOptions = function () {
    return [
        {
            content: "Begin",
            callback: () => {
                createScenarioNode("scenario/begin");
            }
        },
        {
            content: "Trigger",
            callback: () => {
                createScenarioNode("scenario/trigger");
            }
        },
        {
            content: "End",
            callback: () => {
                createScenarioNode("scenario/end");
            }
        },
        {
            content: "Image",
            callback: () => {
                createScenarioNode("scenario/image");
            }
        },
        {
            content: "Scene",
            callback: () => {
                createScenarioNode("scenario/scene");
            }
        },
        {
            content: "Choice",
            callback: () => {
                createScenarioNode("scenario/choice");
            }
        },
        {
            content: "Time Choice",
            callback: () => {
                createScenarioNode("scenario/time_choice");
            }
        },
        {
            content: "Notice",
            callback: () => {
                createScenarioNode("scenario/notice");
            }
        },
        {
            content: "Loyalty",
            callback: () => {
                createScenarioNode("scenario/loyalty");
            }
        },
        {
            content: "Safety",
            callback: () => {
                createScenarioNode("scenario/safety");
            }
        },
        {
            content: "Start Timer",
            callback: () => {
                createScenarioNode("scenario/start_timer");
            }
        },
        {
            content: "Interrupt Timer",
            callback: () => {
                createScenarioNode("scenario/interrupt_timer");
            }
        },
        {
            content: "Kill Timer",
            callback: () => {
                createScenarioNode("scenario/kill_timer");
            }
        },
        {
            content: "Kill All Timers",
            callback: () => {
                createScenarioNode("scenario/kill_all_timers");
            }
        },
        {
            content: "Achievement",
            callback: () => {
                createScenarioNode("scenario/achievement");
            }
        },
        {
            content: "Goto",
            callback: () => {
                createScenarioNode("scenario/goto");
            }
        },
        {
            content: "Call",
            callback: () => {
                createScenarioNode("scenario/call");
            }
        },
        {
            content: "Set",
            callback: () => {
                createScenarioNode("scenario/set");
            }
        },
        {
            content: "If Equals",
            callback: () => {
                createScenarioNode("scenario/if_equals");
            }
        },
        {
            content: "If Compare",
            callback: () => {
                createScenarioNode("scenario/if_compare");
            }
        },
        {
            content: "UPLOAD SCENARIO TO SERVER",
            callback: () => {
                upload()
            }
        },

        {
            content: "SET SCENARIO LABEL",
            callback: () => {
                scenario_label = prompt("Scenario Label", "")
            }
        },
        {
            content: "SET SCENARIO DESCRIPTION",
            callback: () => {
                scenario_description = prompt("Scenario Description", "")
            }
        }
    ];
};

graph.start()



const domCanvas = document.getElementById("editor-canvas");

function resizeCanvas() {
    const scale = window.devicePixelRatio || 1;

    domCanvas.width = window.innerWidth * scale;
    domCanvas.height = window.innerHeight * scale;

    domCanvas.style.width = `${window.innerWidth}px`;
    domCanvas.style.height = `${window.innerHeight}px`;

    // Не накапливаем ctx.scale() после каждого resize.
    const ctx = domCanvas.getContext("2d");

    ctx.setTransform(
        scale,
        0,
        0,
        scale,
        0,
        0
    );

    canvas.resize();
}

window.addEventListener("load", resizeCanvas);
window.addEventListener("resize", resizeCanvas);




function saveProjectJSON() {
    return graph.serialize();
}

function loadProjectJSON(json) {
    if (json == NaN || json == {} || json == null || json == "" || Object.keys(json).length == 0){
        graph.clear();
        return false;
    }
 
    const data =
        typeof json === "string"
            ? JSON.parse(json)
            : json;

    if (
        !data ||
        !Array.isArray(data.nodes)
    ) {
        throw new Error(
            "Invalid LiteGraph project"
        );
    }

    isLoadingProject = true;

    try {

        graph.stop();

        graph.configure(data);

    } finally {

        isLoadingProject = false;

    }

    canvas.setDirty(true, true);
    return true;
}


function compileJSON(options = {}) {


    const {
        scenario_id = -1,
        label = "",
        description = "",
        icon = null,
        creation_time = new Date().toISOString()
    } = options;


    // ========================================================
    // Helpers
    // ========================================================

    const nodes = graph._nodes || [];

    /*
     * Превращаем LiteGraph ID в строковый ID сценария.
     *
     * Например:
     *
     * LiteGraph node.id = 17
     * =>
     * "node_17"
     */
    function nodeName(node) {
        return `node_${node.id}`;
    }


    /*
     * Получить node по LiteGraph ID.
     */
    const nodesById = {};

    for (const node of nodes) {
        nodesById[node.id] = node;
    }


    /*
     * graph.links:
     *
     * link.id
     * link.origin_id
     * link.origin_slot
     * link.target_id
     * link.target_slot
     */
    function getLink(linkId) {

        if (linkId == null) {
            return null;
        }

        return graph.links[linkId] || null;
    }


    /*
     * Получить node, подключённую к output.
     *
     * outputIndex — индекс output.
     *
     * В твоей схеме output должен иметь максимум одно
     * подключение, кроме resource/output, где это тоже
     * желательно контролировать.
     */
    function getOutputTarget(node, outputIndex) {

        const output = node.outputs?.[outputIndex];

        if (!output || !output.links || !output.links.length) {
            return null;
        }

        const link = getLink(output.links[0]);

        if (!link) {
            return null;
        }

        return nodesById[link.target_id] || null;
    }


    /*
     * Получить node, подключённую к output по имени.
     *
     * Например:
     *
     * getOutputTargetByName(node, "out")
     * getOutputTargetByName(node, "true")
     * getOutputTargetByName(node, "choice_0")
     */
    function getOutputTargetByName(node, outputName) {

        if (!node.outputs) {
            return null;
        }

        const index = node.outputs.findIndex(
            output => output && output.name === outputName
        );

        if (index === -1) {
            return null;
        }

        return getOutputTarget(node, index);
    }


    /*
     * Получить имя следующей ноды.
     *
     * Если connection отсутствует -> null.
     */
    function nextNode(node, outputName = "out") {

        const target = getOutputTargetByName(node, outputName);

        return target
            ? nodeName(target)
            : null;
    }


    /*
     * Получить node, подключённую к input.
     *
     * Нужно для resource:
     *
     * Scene.image
     * Achievement.icon
     */
    function getInputSource(node, inputName) {

        if (!node.inputs) {
            return null;
        }

        const index = node.inputs.findIndex(
            input => input && input.name === inputName
        );

        if (index === -1) {
            return null;
        }

        const input = node.inputs[index];

        if (input.link == null) {
            return null;
        }

        const link = getLink(input.link);

        if (!link) {
            return null;
        }

        return nodesById[link.origin_id] || null;
    }


    /*
     * Для динамических input'ов.
     *
     * Важно:
     * у тебя несколько "in", поэтому нельзя искать только
     * по имени.
     */
    function getConnectedInputSources(node) {

        if (!node.inputs) {
            return [];
        }

        const result = [];

        for (const input of node.inputs) {

            if (!input || input.link == null) {
                continue;
            }

            const link = getLink(input.link);

            if (!link) {
                continue;
            }

            const source = nodesById[link.origin_id];

            if (source) {
                result.push(source);
            }
        }

        return result;
    }


    /*
     * Получить property.
     */
    function prop(node, name, defaultValue = null) {

        if (!node.properties) {
            return defaultValue;
        }

        return node.properties[name] !== undefined
            ? node.properties[name]
            : defaultValue;
    }


    /*
     * Проверка типа node.
     */
    function isType(node, type) {
        return node && node.type === `scenario/${type}`;
    }


    /*
     * Найти node определённого типа.
     */
    function findNodes(type) {

        return nodes.filter(
            node => isType(node, type)
        );
    }


    /*
     * Если у ноды несколько подключений туда, где по спецификации
     * разрешено только одно — берём первое.
     *
     * Здесь можно позже добавить validation.
     */
    function requireSingleTarget(node, outputName) {

        const output = node.outputs?.find(
            output => output?.name === outputName
        );

        if (!output || !output.links || output.links.length === 0) {
            return null;
        }

        if (output.links.length > 1) {

            console.warn(
                `Node ${nodeName(node)} output "${outputName}" ` +
                `has ${output.links.length} connections. ` +
                `Using the first one.`
            );
        }

        return nextNode(node, outputName);
    }


    // ========================================================
    // Result
    // ========================================================

    const result = {
        scenario_id,
        label,
        description,
        icon,
        nodes: {},
        creation_time: new Date().toISOString()
    };


    // ========================================================
    // Compile node
    // ========================================================

    for (const node of nodes) {

        const name = nodeName(node);

        let compiled = null;


        // ====================================================
        // BEGIN
        // ====================================================

        if (isType(node, "begin")) {

            compiled = {
                label: node.title,
                content_type: "begin",
                content: {
                    next_node: requireSingleTarget(node, "out")
                }
            };
        }


        // ====================================================
        // TRIGGER
        // ====================================================

        else if (isType(node, "trigger")) {

            compiled = {
                label: node.title,
                content_type: "trigger",
                content: {
                    name: prop(node, "name"),
                    next_node: requireSingleTarget(node, "out")
                }
            };
        }


        // ====================================================
        // END
        // ====================================================

        else if (isType(node, "end")) {

            compiled = {
                label: node.title,
                content_type: "end",
                content: {
                    is_completed: !!prop(
                        node,
                        "is_completed",
                        false
                    )
                }
            };
        }


        // ====================================================
        // IMAGE
        // ====================================================

        else if (isType(node, "image")) {

            compiled = {
                label: node.title,
                content_type: "image",
                content: {
                    resource: prop(node, "resource", "")
                }
            };
        }


        // ====================================================
        // SCENE
        // ====================================================

        else if (isType(node, "scene")) {

            const imageNode = getInputSource(node, "image");

            compiled = {
                label: node.title,
                content_type: "scene",
                content: {
                    image_node: imageNode
                        ? nodeName(imageNode)
                        : null,

                    label: prop(node, "label", ""),

                    text: prop(node, "text", ""),

                    next_node: requireSingleTarget(node, "out")
                }
            };
        }


        // ====================================================
        // CHOICE
        // ====================================================

        else if (isType(node, "choice")) {

            const choices = [];

            const choiceProperties = prop(
                node,
                "choice",
                []
            );

            for (let i = 0; i < choiceProperties.length; i++) {

                const choice = choiceProperties[i];

                const target = getOutputTargetByName(
                    node,
                    `choice_${i}`
                );

                choices.push({
                    text: choice?.text ?? "",
                    next_node: target
                        ? nodeName(target)
                        : null
                });
            }

            compiled = {
                label: node.title,
                content_type: "choice",
                content: {
                    topic: prop(node, "topic", ""),
                    choice: choices
                }
            };
        }


        // ====================================================
        // TIME CHOICE
        // ====================================================

        else if (isType(node, "time_choice")) {

            const choices = [];

            const choiceProperties = prop(
                node,
                "choice",
                []
            );

            for (let i = 0; i < choiceProperties.length; i++) {

                const choice = choiceProperties[i];

                const target = getOutputTargetByName(
                    node,
                    `choice_${i}`
                );

                choices.push({
                    text: choice?.text ?? "",
                    next_node: target
                        ? nodeName(target)
                        : null
                });
            }

            /*
             * В текущем LiteGraph TimeChoiceNode у тебя
             * НЕТ output "timeout".
             *
             * Поэтому timeout_node пока будет null.
             *
             * Ниже я отдельно покажу, как добавить его.
             */

            compiled = {
                label: node.title,
                content_type: "time_choice",
                content: {
                    topic: prop(node, "topic", ""),

                    choice: choices,

                    time: prop(node, "time", 0),

                    timeout_node: null
                }
            };
        }


        // ====================================================
        // NOTICE
        // ====================================================

        else if (isType(node, "notice")) {

            compiled = {
                label: node.title,
                content_type: "notice",
                content: {
                    text: prop(node, "text", ""),

                    next_node: requireSingleTarget(
                        node,
                        "out"
                    )
                }
            };
        }


        // ====================================================
        // LOYALTY
        // ====================================================

        else if (isType(node, "loyalty")) {

            compiled = {
                label: node.title,
                content_type: "loyalty",
                content: {
                    delta: prop(node, "delta", 0),

                    next_node: requireSingleTarget(
                        node,
                        "out"
                    )
                }
            };
        }


        // ====================================================
        // SAFETY
        // ====================================================

        else if (isType(node, "safety")) {

            compiled = {
                label: node.title,
                content_type: "safety",
                content: {
                    delta: prop(node, "delta", 0),

                    next_node: requireSingleTarget(
                        node,
                        "out"
                    )
                }
            };
        }


        // ====================================================
        // START TIMER
        // ====================================================

        else if (isType(node, "start_timer")) {

            compiled = {
                label: node.title,
                content_type: "start_timer",
                content: {

                    name: prop(node, "name", ""),

                    label: prop(node, "label", ""),

                    time: prop(node, "time", 0),

                    interruption_node:
                        requireSingleTarget(
                            node,
                            "interruption"
                        ),

                    finish_node:
                        requireSingleTarget(
                            node,
                            "finish"
                        ),

                    next_node:
                        requireSingleTarget(
                            node,
                            "out"
                        )
                }
            };
        }


        // ====================================================
        // INTERRUPT TIMER
        // ====================================================

        else if (isType(node, "interrupt_timer")) {

            compiled = {
                label: node.title,
                content_type: "interrupt_timer",
                content: {

                    name: prop(node, "name", ""),

                    next_node:
                        requireSingleTarget(
                            node,
                            "out"
                        )
                }
            };
        }


        // ====================================================
        // KILL TIMER
        // ====================================================

        else if (isType(node, "kill_timer")) {

            compiled = {
                label: node.title,
                content_type: "kill_timer",
                content: {

                    name: prop(node, "name", ""),

                    next_node:
                        requireSingleTarget(
                            node,
                            "out"
                        )
                }
            };
        }


        // ====================================================
        // KILL ALL TIMERS
        // ====================================================

        else if (isType(node, "kill_all_timers")) {

            compiled = {
                label: node.title,
                content_type: "kill_all_timers",
                content: {

                    next_node:
                        requireSingleTarget(
                            node,
                            "out"
                        )
                }
            };
        }


        // ====================================================
        // ACHIEVEMENT
        // ====================================================

        else if (isType(node, "achievement")) {

            const iconNode = getInputSource(
                node,
                "icon"
            );

            compiled = {
                label: node.title,
                content_type: "achievement",
                content: {

                    name: prop(node, "name", ""),

                    label: prop(node, "label", ""),

                    description: prop(
                        node,
                        "description",
                        ""
                    ),

                    icon: iconNode
                        ? nodeName(iconNode)
                        : null,

                    score_delta: prop(
                        node,
                        "score_delta",
                        0
                    ),

                    next_node:
                        requireSingleTarget(
                            node,
                            "out"
                        )
                }
            };
        }


        // ====================================================
        // GOTO
        // ====================================================

        else if (isType(node, "goto")) {

            compiled = {
                label: node.title,
                content_type: "goto",
                content: {

                    goto_node:
                        requireSingleTarget(
                            node,
                            "goto"
                        ),

                    next_node:
                        requireSingleTarget(
                            node,
                            "out"
                        )
                }
            };
        }


        // ====================================================
        // CALL
        // ====================================================

        else if (isType(node, "call")) {

            compiled = {
                label: node.title,
                content_type: "call",
                content: {

                    next_node:
                        requireSingleTarget(
                            node,
                            "out"
                        )
                }
            };
        }


        // ====================================================
        // SET
        // ====================================================

        else if (isType(node, "set")) {

            compiled = {
                label: node.title,
                content_type: "set",
                content: {

                    name: prop(node, "name", ""),

                    value: prop(node, "value", ""),

                    next_node:
                        requireSingleTarget(
                            node,
                            "out"
                        )
                }
            };
        }


        // ====================================================
        // IF EQUALS
        // ====================================================

        else if (isType(node, "if_equals")) {

            compiled = {
                label: node.title,
                content_type: "if_equals",
                content: {

                    name_a: prop(node, "name_a", ""),

                    name_b: prop(node, "name_b", ""),

                    neq_node:
                        requireSingleTarget(
                            node,
                            "false"
                        ),

                    next_node:
                        requireSingleTarget(
                            node,
                            "true"
                        )
                }
            };
        }


        // ====================================================
        // IF COMPARE
        // ====================================================

        else if (isType(node, "if_compare")) {

            compiled = {
                label: node.title,
                content_type: "if_compare",
                content: {

                    name_a: prop(node, "name_a", ""),

                    name_b: prop(node, "name_b", ""),

                    ncp_node:
                        requireSingleTarget(
                            node,
                            "false"
                        ),

                    next_node:
                        requireSingleTarget(
                            node,
                            "true"
                        )
                }
            };
        }


        // ====================================================
        // Unknown
        // ====================================================

        else {

            console.warn(
                "Unknown scenario node type:",
                node.type
            );

            continue;
        }


        result.nodes[name] = compiled;
    }


    return result;
}


async function fullCompileJSON(scenario_id, label, description) {
    const input = document.createElement("input");

    input.type = "file";
    input.accept = "image/*";

    return new Promise((resolve, reject) => {

        input.onchange = (event) => {
            const file = event.target.files?.[0];

            // Пользователь отменил выбор файла
            if (!file) {
                resolve(null);
                return;
            }

            const reader = new FileReader();

            reader.onload = () => {
                try {
                    const result = compileJSON({
                        scenario_id: scenario_id,
                        label: label,
                        description: description,
                        icon: reader.result
                    });

                    resolve(result);

                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => {
                reject(
                    reader.error ||
                    new Error("Failed to read icon file")
                );
            };

            reader.readAsDataURL(file);
        };

        input.onerror = () => {
            reject(new Error("Failed to open file picker"));
        };

        input.click();
    });
}


function load() {
  var url = new URL(window.location.href);
  var scenario_id_str = url.searchParams.get("scenario_id");

  if (scenario_id_str == null) {
    alert("scenario_id get parameter is not defined");
    return; // ← важно: без этого код пойдёт дальше с NaN
  }

  scenario_id = Number(scenario_id_str); // 
  request('/scenario/get?scenario_id=' + scenario_id, {}, 'GET').then(data => {
    scenario_label = data["label"];
    scenario_description = data["description"];
    alert("Сценарий: " + scenario_label  + "(" + scenario_id + ")" + " Описание: " + scenario_description);
    
  }).catch(error => {alert(error)});

  request('/scenario/project?scenario_id=' + scenario_id, {}, 'GET').then(data => {loadProjectJSON(data)}).catch(error => {alert(error)});

}


function upload() {
  let data = fullCompileJSON(scenario_id, scenario_label, scenario_description).then(data => {
    var json = request('/scenario/upload?scenario_id=' + scenario_id, {
      scenario_project_json: saveProjectJSON(),
      scenario_compiled_json: data
    }, 'POST').catch(error => {alert(error)});
  });
}
await refreshToken();
load()
