document.getElementById("generate").addEventListener("click", () => {
  const input = document.getElementById("participants").value.trim();
  const lines = input.split("\n").filter(l => l.trim() !== "").slice(0, 100);
  const title = document.getElementById("title").value;
  const divideBy = document.querySelector('input[name="divide"]:checked').value;
  const optionValue = parseInt(document.getElementById("teamOption").value);

  if (lines.length === 0) return alert("Ingresa al menos un participante.");

  let teams = [];
  if (divideBy === "teams") {
    for (let i = 0; i < optionValue; i++) teams.push([]);
    const shuffled = lines.sort(() => Math.random() - 0.5);
    shuffled.forEach((p, i) => teams[i % optionValue].push(p));
  } else {
    const total = Math.ceil(lines.length / optionValue);
    for (let i = 0; i < total; i++) teams.push([]);
    const shuffled = lines.sort(() => Math.random() - 0.5);
    shuffled.forEach((p, i) => teams[Math.floor(i / optionValue)].push(p));
  }

  const container = document.getElementById("teamsContainer");
  container.innerHTML = "";
  teams.forEach((group, i) => {
    const div = document.createElement("div");
    div.className = "team";
    div.innerHTML = `<h4>Equipo ${i + 1}</h4>` + group.map(p => `<p>${p}</p>`).join("");
    container.appendChild(div);
  });

  document.getElementById("resultTitle").innerText = title || "Equipos generados";
  document.getElementById("result").classList.remove("hidden");
});

document.getElementById("clear").addEventListener("click", () => {
  document.getElementById("participants").value = "";
  document.getElementById("title").value = "";
  document.getElementById("result").classList.add("hidden");
});

document.getElementById("copy").addEventListener("click", () => {
  const content = document.getElementById("teamsContainer").innerText;
  navigator.clipboard.writeText(content).then(() => alert("Copiado al portapapeles."));
});

document.getElementById("copyCols").addEventListener("click", () => {
  const teams = document.querySelectorAll(".team");
  let output = "";
  teams.forEach(team => {
    output += team.innerText + "\n\n";
  });
  navigator.clipboard.writeText(output).then(() => alert("Copiado en formato columnas."));
});

document.getElementById("download").addEventListener("click", () => {
  html2canvas(document.getElementById("teamsContainer")).then(canvas => {
    const link = document.createElement("a");
    link.download = "equipos.jpg";
    link.href = canvas.toDataURL("image/jpeg");
    link.click();
  });
});
