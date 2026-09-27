export interface ScenarioPackage {
  id?: string;
  name: string;
  label: string;
  description: string;
  icon: string;
  creation_time: number;
  nodes: Record<string, any>;
}

export function exportScenario(scenario: Partial<ScenarioPackage>) {
  if (!import.meta.client) return;

  const exportPayload: ScenarioPackage = {
    name: scenario.name || "scenario_pack",
    label: scenario.label || "Новый сценарий",
    description: scenario.description || "",
    icon: scenario.icon || "",
    creation_time: scenario.creation_time || Math.floor(Date.now() / 1000),
    nodes: scenario.nodes || {}
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `${exportPayload.name}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importScenarioFromFile(file: File): Promise<ScenarioPackage> {
  return new Promise((resolve, reject) => {
    if (!import.meta.client) return reject(new Error("Только на клиенте"));

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (!json.name && !json.label) {
          throw new Error("Невалидный JSON: отсутствуют обязательные поля name/label");
        }
        resolve({
          name: json.name || "imported_scenario",
          label: json.label || "Импортированный сценарий",
          description: json.description || "",
          icon: json.icon || "",
          creation_time: json.creation_time || Math.floor(Date.now() / 1000),
          nodes: json.nodes || {}
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
}
