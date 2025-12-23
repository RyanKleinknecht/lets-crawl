/* ======================================================
   SCREEN FLOW (Splash → Launcher → Player Form)
   ====================================================== */

function setActiveScreen(screenId) {
  const screens = ["splashScreen", "launcherScreen", "appScreen"];
  screens.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle("active", id === screenId);
  });
}

function goToLauncher() {
  setActiveScreen("launcherScreen");
}

function launchPlayerForm() {
  setActiveScreen("appScreen");
  ensureDefaultRows();
}

/* Start on splash */
document.addEventListener("DOMContentLoaded", () => {
  setActiveScreen("splashScreen");
});

/* ======================================================
   COLLAPSIBLE SECTIONS
   ====================================================== */

function toggleSection(header) {
  header.parentElement.classList.toggle("open");
}

/* ======================================================
   DYNAMIC ENTRY CREATION
   ====================================================== */

function createEntry(fields, values = [], isTextarea = false) {
  const div = document.createElement("div");
  div.className = "entry";

  fields.forEach((labelText, index) => {
    const label = document.createElement("label");

    const span = document.createElement("span");
    span.textContent = labelText + ":";

    const field = isTextarea
      ? document.createElement("textarea")
      : document.createElement("input");

    field.dataset.field = labelText;
    field.value = values[index] || "";

    label.appendChild(span);
    label.appendChild(field);
    div.appendChild(label);
  });

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.textContent = "Remove";
  removeBtn.onclick = () => {
    if (confirm("Are you sure you want to remove this entry?")) {
      div.remove();
    }
  };

  div.appendChild(removeBtn);
  return div;
}

/* ======================================================
   ADD ENTRY FUNCTIONS
   ====================================================== */

function addAttack(values = []) {
  document.getElementById("attacks").appendChild(
    createEntry(
      ["Attack Name", "Type", "Ability Used", "Attack Bonus", "Damage"],
      values
    )
  );
}

function addSkill(values = []) {
  document.getElementById("skills").appendChild(
    createEntry(
      ["Skill Name", "Base Ability", "Level", "Benefit"],
      values
    )
  );
}

function addAchievement(values = []) {
  document.getElementById("achievements").appendChild(
    createEntry(
      ["Achievement Name", "How Earned", "Benefits"],
      values
    )
  );
}

function addItem(values = []) {
  document.getElementById("inventory").appendChild(
    createEntry(
      ["Item Name", "Type", "Benefits / Effects"],
      values
    )
  );
}

function addPlayerNote(values = []) {
  document.getElementById("playerNotes").appendChild(
    createEntry(["Note"], values, true)
  );
}

function addGMNote(values = []) {
  document.getElementById("gmNotes").appendChild(
    createEntry(["Note"], values, true)
  );
}

/* ======================================================
   DEFAULT ROWS (Fix for “missing lines”)
   ====================================================== */

function ensureDefaultRows() {
  const ensure = (id, addFn) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.children.length === 0) addFn([]);
  };

  ensure("attacks", addAttack);
  ensure("skills", addSkill);
  ensure("achievements", addAchievement);
  ensure("inventory", addItem);
  ensure("playerNotes", addPlayerNote);
  ensure("gmNotes", addGMNote);
}

/* ======================================================
   DATA COLLECTION / RESTORATION
   ====================================================== */

function collectCharacterData() {
  const collectEntries = (id) =>
    [...document.getElementById(id).children].map(entry =>
      [...entry.querySelectorAll("[data-field]")].map(f => f.value)
    );

  return {
    characterInfo: [...document.querySelectorAll("#characterInfo input")].map(
      input => input.value
    ),
    attacks: collectEntries("attacks"),
    skills: collectEntries("skills"),
    achievements: collectEntries("achievements"),
    inventory: collectEntries("inventory"),
    playerNotes: collectEntries("playerNotes"),
    gmNotes: collectEntries("gmNotes")
  };
}

function restoreCharacterData(data) {
  document.querySelectorAll("#characterInfo input").forEach((input, i) => {
    input.value = data.characterInfo?.[i] || "";
  });

  const clearAndRestore = (id, addFn, values) => {
    const container = document.getElementById(id);
    container.innerHTML = "";
    (values || []).forEach(v => addFn(v));
  };

  clearAndRestore("attacks", addAttack, data.attacks);
  clearAndRestore("skills", addSkill, data.skills);
  clearAndRestore("achievements", addAchievement, data.achievements);
  clearAndRestore("inventory", addItem, data.inventory);
  clearAndRestore("playerNotes", addPlayerNote, data.playerNotes);
  clearAndRestore("gmNotes", addGMNote, data.gmNotes);

  // If any lists were empty in the loaded file, show 1 blank row anyway
  ensureDefaultRows();
}

/* ======================================================
   SAVE / LOAD (Android & Desktop safe)
   ====================================================== */

/* Save = Download JSON */
function saveCharacter() {
  const data = collectCharacterData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "character.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* Load = Upload JSON */
function loadCharacter() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";

  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;

    const text = await file.text();
    restoreCharacterData(JSON.parse(text));
  };

  input.click();
}

/* ======================================================
   PRINT
   ====================================================== */

function printCharacter() {
  setActiveScreen("appScreen");

  // Expand all sections so print includes everything
  document.querySelectorAll(".collapsible").forEach(section => section.classList.add("open"));

  setTimeout(() => window.print(), 100);
}
