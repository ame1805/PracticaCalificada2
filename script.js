document.addEventListener("DOMContentLoaded", () => {
  // Elementos del DOM
  const ruletaCanvas = document.getElementById("ruletaCanvas");
  const ruletaText = document.getElementById("ruletaText");
  const optionsTextarea = document.getElementById("optionsTextarea");
  const btnIniciar = document.getElementById("btnIniciar");
  const btnReiniciar = document.getElementById("btnReiniciar");
  const btnEditar = document.getElementById("btnEditar");
  const btnEsconder = document.getElementById("btnEsconder");
  const resultado = document.getElementById("resultado");

  // Variables globales
  let opciones = [];
  let opcionesOcultas = [];
  let opcionSeleccionada = null;
  let estaGirando = false;
  let anguloActual = 0;
  let animacionId = null;
  let modoEdicion = false;
  let elementoEnPosicionFlecha = null;

  // F2: 5 colores básicos que se repetirán
  const colores = [
    "#FF5252", // Rojo
    "#4CAF50", // Verde
    "#2196F3", // Azul
    "#FFC107", // Amarillo
    "#9C27B0"  // Morado
  ];

  // Inicialización
  inicializar();

  function inicializar() {
    // F3/F5: Cargar opciones iniciales del textarea
    actualizarOpciones();
    
    // F1: Dibujar ruleta inicial con subsectores
    dibujarRuleta();
    
    // Configurar eventos
    configurarEventos();
  }

  function configurarEventos() {
    // F3: Eventos para girar la ruleta
    ruletaCanvas.addEventListener("click", girarRuleta);
    btnIniciar.addEventListener("click", girarRuleta);
    
    // F8: Reiniciar
    btnReiniciar.addEventListener("click", reiniciarRuleta);
    
    // F7: Edición
    btnEditar.addEventListener("click", toggleEdicion);
    
    // F6: Ocultar elemento
    btnEsconder.addEventListener("click", ocultarElementoSeleccionado);
    
    // F5: Actualizar cuando cambia el textarea
    optionsTextarea.addEventListener("input", actualizarOpciones);
    
    // F7: Click en textarea para editar
    optionsTextarea.addEventListener("click", () => {
      if (!modoEdicion) toggleEdicion();
    });
    
    // Manejador de teclado para todas las funcionalidades
    document.addEventListener("keydown", manejarTeclado);
  }

  // F1: Dibujar ruleta con subsectores claramente diferenciados
  function dibujarRuleta() {
    const ctx = ruletaCanvas.getContext("2d");
    const width = ruletaCanvas.width = ruletaCanvas.offsetWidth;
    const height = ruletaCanvas.height = ruletaCanvas.offsetHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx.clearRect(0, 0, width, height);

    // Obtener opciones visibles (no ocultas)
    const opcionesVisibles = opciones.filter(opcion => !opcionesOcultas.includes(opcion));

    if (opcionesVisibles.length === 0) {
      // Dibujar ruleta vacía
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = "#f0f0f0";
      ctx.fill();
      ctx.strokeStyle = "#ddd";
      ctx.stroke();
      
      ctx.fillStyle = "#666";
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("No hay elementos", centerX, centerY);
      return;
    }

    // Calcular ángulo por sector con separación
    const anguloPorSector = (2 * Math.PI) / opcionesVisibles.length;
    const separacion = 2 * (Math.PI/180); // 2 grados de separación
    const anchoSector = anguloPorSector - separacion;
    
    // Dibujar cada sector con separación
    opcionesVisibles.forEach((opcion, index) => {
      const startAngle = anguloActual + (index * anguloPorSector) + (separacion/2);
      const endAngle = startAngle + anchoSector;
      
      // F2: Asignar color cíclicamente
      ctx.fillStyle = colores[index % colores.length];
      
      // Dibujar sector
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fill();
      
      // Borde blanco para destacar separación
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Texto del sector (centrado)
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + (anchoSector/2));
      ctx.translate(radius * 0.7, 0);
      ctx.rotate(Math.PI/2); // Texto vertical
      ctx.fillStyle = "#fff";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(opcion, 0, 0);
      ctx.restore();
    });
    
    // Círculo central
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.1, 0, 2 * Math.PI);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = "#ddd";
    ctx.stroke();
    
    // Determinar qué elemento está en la posición de la flecha (0°)
    const anguloNormalizado = ((anguloActual % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const sectorEnFlecha = Math.floor((2 * Math.PI - anguloNormalizado) / anguloPorSector) % opcionesVisibles.length;
    elementoEnPosicionFlecha = opcionesVisibles[sectorEnFlecha];
  }

  // F3: Girar la ruleta
  function girarRuleta() {
    if (estaGirando || opciones.length === 0) return;
    
    estaGirando = true;
    ruletaText.textContent = "Girando...";
    
    // Seleccionar elemento aleatorio como destino
    const opcionesVisibles = opciones.filter(opcion => !opcionesOcultas.includes(opcion));
    const indiceAleatorio = Math.floor(Math.random() * opcionesVisibles.length);
    const anguloPorSector = (2 * Math.PI) / opcionesVisibles.length;
    
    // Calcular ángulo para que el elemento quede en la flecha
    const anguloDestino = 2 * Math.PI - (indiceAleatorio * anguloPorSector + anguloPorSector/2);
    const vueltas = 3 + Math.random() * 2; // 3-5 vueltas
    const anguloTotal = anguloDestino + vueltas * 2 * Math.PI;
    
    // Animación
    const duracion = 3000;
    const inicio = performance.now();
    
    function animar(timestamp) {
      const progreso = (timestamp - inicio) / duracion;
      
      if (progreso < 1) {
        const easing = 1 - Math.pow(1 - progreso, 3); // Easing cúbico
        anguloActual = anguloTotal * easing;
        dibujarRuleta();
        animacionId = requestAnimationFrame(animar);
      } else {
        finalizarGiro();
      }
    }
    
    animacionId = requestAnimationFrame(animar);
  }

  function finalizarGiro() {
    estaGirando = false;
    opcionSeleccionada = elementoEnPosicionFlecha;
    resultado.textContent = opcionSeleccionada;
    resaltarOpcionSeleccionada();
  }

  // F5: Actualizar opciones desde textarea
  function actualizarOpciones() {
    opciones = optionsTextarea.value.split("\n")
      .map(item => item.trim())
      .filter(item => item !== "");
    
    opcionesOcultas = opcionesOcultas.filter(opcion => opciones.includes(opcion));
    dibujarRuleta();
  }

  // F6: Ocultar elemento seleccionado
  function resaltarOpcionSeleccionada() {
    if (!opcionSeleccionada) return;
    
    const lineas = optionsTextarea.value.split("\n");
    const indice = lineas.findIndex(linea => linea.trim() === opcionSeleccionada);
    
    if (indice >= 0) {
      optionsTextarea.focus();
      optionsTextarea.setSelectionRange(
        lineas.slice(0, indice).join("\n").length + (indice > 0 ? 1 : 0),
        lineas.slice(0, indice).join("\n").length + (indice > 0 ? 1 : 0) + opcionSeleccionada.length
      );
    }
  }

  function ocultarElementoSeleccionado() {
    if (!opcionSeleccionada) return;
    
    if (!opcionesOcultas.includes(opcionSeleccionada)) {
      opcionesOcultas.push(opcionSeleccionada);
    }
    
    dibujarRuleta();
    resultado.textContent = "";
  }

  // F7: Toggle edición
  function toggleEdicion() {
    modoEdicion = !modoEdicion;
    btnEditar.textContent = modoEdicion ? "Guardar" : "Editar";
    optionsTextarea.disabled = !modoEdicion;
    
    if (modoEdicion) {
      optionsTextarea.focus();
    } else {
      actualizarOpciones();
    }
  }

  // F8: Reiniciar ruleta
  function reiniciarRuleta() {
    if (animacionId) {
      cancelAnimationFrame(animacionId);
      estaGirando = false;
    }
    
    opcionesOcultas = [];
    anguloActual = 0;
    opcionSeleccionada = null;
    dibujarRuleta();
    resultado.textContent = "";
  }

  // F9: Pantalla completa
  function togglePantallaCompleta() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  // Manejador de teclado para F1-F4
  function manejarTeclado(e) {
    // Prevenir comportamiento por defecto de F1-F4
    if (["F1", "F2", "F3", "F4"].includes(e.key)) {
      e.preventDefault();
    }
    
    switch(e.key) {
      case "F1":
        mostrarAyuda();
        break;
      case "F2":
        rotarColores();
        break;
      case "F3":
        if (!estaGirando) girarRuleta();
        break;
      case "F4":
        toggleEdicion();
        break;
      case " ":
        e.preventDefault();
        if (!estaGirando) girarRuleta();
        break;
      case "s":
      case "S":
        e.preventDefault();
        ocultarElementoSeleccionado();
        break;
      case "r":
      case "R":
        e.preventDefault();
        reiniciarRuleta();
        break;
      case "e":
      case "E":
        e.preventDefault();
        toggleEdicion();
        break;
      case "f":
      case "F":
        e.preventDefault();
        togglePantallaCompleta();
        break;
    }
  }

  // Funciones adicionales para F1-F4
  function mostrarAyuda() {
    alert("AYUDA DE LA RULETA:\n\n" +
          "F1 - Muestra esta ayuda\n" +
          "F2 - Cambia los colores\n" +
          "F3 - Gira la ruleta\n" +
          "F4 - Editar elementos\n" +
          "ESPACIO - Girar\n" +
          "S - Ocultar elemento\n" +
          "R - Reiniciar\n" +
          "E - Editar\n" +
          "F - Pantalla completa");
  }

  function rotarColores() {
    colores.unshift(colores.pop());
    dibujarRuleta();
  }
});