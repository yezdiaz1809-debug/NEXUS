// ==========================================
// ESTADO GLOBAL Y GENERADOR DE 200 APARTAMENTOS
// ==========================================
let currentRole = 'residente';
let activeUser = null; 
let activeView = 'home';
let selectedApartmentApto = null; // Para la vista de detalle de admin

let appData = {
    apartamentos: [],
    anuncios: [
        { id: 1, titulo: "Asamblea General Ordinaria 2026", contenido: "Se convoca a todos los copropietarios a la asamblea anual este sábado a las 10:00 AM en el salón social.", fecha: "15 de Marzo, 2026" },
        { id: 2, titulo: "Mantenimiento Preventivo de Ascensores", contenido: "Torre A y Torre B sin servicio de ascensor este jueves de 8:00 AM a 1:00 PM por revisión técnica.", fecha: "12 de Marzo, 2026" },
        { id: 3, titulo: "Normas de Reciclaje y Basuras", contenido: "Recordamos depositar únicamente en bolsas debidamente selladas en el shut correspondiente. Prohibido dejar escombros.", fecha: "10 de Marzo, 2026" }
    ],
    transaccionesGlobales: []
};

// Inicializar los 200 apartamentos automáticamente
function initDatabase() {
    const torres = ['A', 'B', 'C', 'D'];
    let idCounter = 1;
    
    const saved = localStorage.getItem('nexus_db_200_v3');
    if (saved) {
        appData = JSON.parse(saved);
        return;
    }

    for (let i = 1; i <= 50; i++) {
        torres.forEach((torre, tIdx) => {
            const numeroApto = `${(tIdx + 1)}${i < 10 ? '0' + i : i}`;
            const estadoFinanciero = i % 7 === 0 ? 'mora' : (i % 5 === 0 ? 'favor' : 'al_dia');
            const saldo = estadoFinanciero === 'mora' ? 180000 : 0; 
            const saldoBilletera = estadoFinanciero === 'favor' ? 50000 : 0;
            
            appData.apartamentos.push({
                id: idCounter++,
                apto: numeroApto,
                propietario: `Propietario Apto ${numeroApto}`,
                fechaCreacion: "10 de Enero, 2025",
                estado: estadoFinanciero,
                deudaPendiente: saldo,
                billetera: saldoBilletera,
                historial: [
                    { concepto: "Cuota de Administración", fecha: "Mar 2026", valor: "$180,000", estadoPago: estadoFinanciero === 'mora' ? 'Pendiente' : 'Pagado' },
                    { concepto: "Cuota de Administración", fecha: "Feb 2026", valor: "$180,000", estadoPago: "Pagado" }
                ]
            });
        });
    }
    saveDB();
}

function saveDB() {
    localStorage.setItem('nexus_db_200_v3', JSON.stringify(appData));
}

// ==========================================
// AUTENTICACIÓN Y ROLES
// ==========================================
function setRole(role) {
    currentRole = role;
    document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-role-${role}`).classList.add('active');
    
    const aptoGroup = document.getElementById('residente-fields');
    if (role === 'admin') {
        aptoGroup.classList.add('hidden');
    } else {
        aptoGroup.classList.remove('hidden');
    }
}

function handleLogin(event) {
    event.preventDefault();
    const pass = document.getElementById('input-pass').value;
    const errorBox = document.getElementById('auth-error');
    errorBox.classList.add('hidden');

    if (pass !== 'nexus2026') {
        errorBox.textContent = 'Contraseña incorrecta. Usa: nexus2026';
        errorBox.classList.remove('hidden');
        return;
    }

    if (currentRole === 'admin') {
        activeUser = 'admin';
        activeView = 'admin_dashboard';
    } else {
        const aptoInput = document.getElementById('input-apto').value.trim();
        const found = appData.apartamentos.find(a => a.apto === aptoInput);
        if (!found) {
            errorBox.textContent = 'Apartamento no encontrado (Prueba con 101, 201, 305...)';
            errorBox.classList.remove('hidden');
            return;
        }
        activeUser = found.apto;
        activeView = 'home';
    }

    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('app-screen').classList.remove('hidden');
    renderApp();
}

function logout() {
    activeUser = null;
    selectedApartmentApto = null;
    document.getElementById('app-screen').classList.add('hidden');
    document.getElementById('auth-screen').classList.remove('hidden');
    document.getElementById('input-pass').value = '';
}

// ==========================================
// RENDERIZADO GENERAL Y MENÚS
// ==========================================
function renderApp() {
    const isAdmin = (activeUser === 'admin');
    
    document.getElementById('topbar-user-tag').textContent = isAdmin ? 'ADMINISTRADOR' : `Apto ${activeUser}`;
    document.getElementById('sidebar-user-info').innerHTML = isAdmin ?
        `<b>Administración Central</b><span>Control General (200 Aptos)</span>` :
        `<b>Apartamento ${activeUser}</b><span>Torre Residencial Nexus</span>`;

    renderMenus(isAdmin);
    renderView();
}

function renderMenus(isAdmin) {
    const desktopMenu = document.getElementById('desktop-menu');
    const mobileNav = document.getElementById('mobile-nav');

    if (isAdmin) {
        desktopMenu.innerHTML = `
            <button class="menu-item ${activeView === 'admin_dashboard' ? 'active' : ''}" onclick="switchView('admin_dashboard')"><i class="fa-solid fa-chart-pie"></i> Tablero General</button>
            <button class="menu-item ${activeView === 'admin_aptos' || activeView === 'admin_detalle_apto' ? 'active' : ''}" onclick="switchView('admin_aptos')"><i class="fa-solid fa-building"></i> Apartamentos</button>
            <button class="menu-item ${activeView === 'admin_pagos' ? 'active' : ''}" onclick="switchView('admin_pagos')"><i class="fa-solid fa-receipt"></i> Auditoría de Pagos</button>
            <button class="menu-item ${activeView === 'admin_anuncios' ? 'active' : ''}" onclick="switchView('admin_anuncios')"><i class="fa-solid fa-bullhorn"></i> Anuncios</button>
        `;
        mobileNav.innerHTML = `
            <button class="mobile-nav-item ${activeView === 'admin_dashboard' ? 'active' : ''}" onclick="switchView('admin_dashboard')"><i class="fa-solid fa-chart-pie"></i><span>Tablero</span></button>
            <button class="mobile-nav-item ${activeView === 'admin_aptos' || activeView === 'admin_detalle_apto' ? 'active' : ''}" onclick="switchView('admin_aptos')"><i class="fa-solid fa-building"></i><span>Aptos</span></button>
            <button class="mobile-nav-item ${activeView === 'admin_pagos' ? 'active' : ''}" onclick="switchView('admin_pagos')"><i class="fa-solid fa-receipt"></i><span>Pagos</span></button>
            <button class="mobile-nav-item ${activeView === 'admin_anuncios' ? 'active' : ''}" onclick="switchView('admin_anuncios')"><i class="fa-solid fa-bullhorn"></i><span>Anuncios</span></button>
        `;
    } else {
        desktopMenu.innerHTML = `
            <button class="menu-item ${activeView === 'home' ? 'active' : ''}" onclick="switchView('home')"><i class="fa-solid fa-house"></i> Mi Unidad</button>
            <button class="menu-item ${activeView === 'wallet' ? 'active' : ''}" onclick="switchView('wallet')"><i class="fa-solid fa-wallet"></i> Pagos y Billetera</button>
            <button class="menu-item ${activeView === 'anuncios' ? 'active' : ''}" onclick="switchView('anuncios')"><i class="fa-solid fa-bullhorn"></i> Anuncios</button>
            <button class="menu-item ${activeView === 'bot' ? 'active' : ''}" onclick="switchView('bot')"><i class="fa-solid fa-robot"></i> Asistente IA</button>
        `;
        mobileNav.innerHTML = `
            <button class="mobile-nav-item ${activeView === 'home' ? 'active' : ''}" onclick="switchView('home')"><i class="fa-solid fa-house"></i><span>Unidad</span></button>
            <button class="mobile-nav-item ${activeView === 'wallet' ? 'active' : ''}" onclick="switchView('wallet')"><i class="fa-solid fa-wallet"></i><span>Billetera</span></button>
            <button class="mobile-nav-item ${activeView === 'anuncios' ? 'active' : ''}" onclick="switchView('anuncios')"><i class="fa-solid fa-bullhorn"></i><span>Anuncios</span></button>
            <button class="mobile-nav-item ${activeView === 'bot' ? 'active' : ''}" onclick="switchView('bot')"><i class="fa-solid fa-robot"></i><span>Bot IA</span></button>
        `;
    }
}

function switchView(viewName) {
    if (viewName === 'admin_aptos') {
        selectedApartmentApto = null; // Limpiar selección al volver a la lista general
    }
    activeView = viewName;
    renderApp();
}

function renderView() {
    const container = document.getElementById('dynamic-content');
    const titleContainer = document.getElementById('current-view-title');

    if (activeUser === 'admin') {
        if (activeView === 'admin_dashboard') {
            titleContainer.textContent = 'Tablero Ejecutivo de Administración';
            container.innerHTML = renderAdminDashboard();
        } else if (activeView === 'admin_aptos') {
            titleContainer.textContent = 'Auditoría de los 200 Apartamentos';
            container.innerHTML = renderAdminAptos();
        } else if (activeView === 'admin_detalle_apto') {
            titleContainer.textContent = `Expediente del Apartamento ${selectedApartmentApto}`;
            container.innerHTML = renderAdminDetalleApto();
        } else if (activeView === 'admin_pagos') {
            titleContainer.textContent = 'Recibos y Pagos Recientes del Conjunto';
            container.innerHTML = renderAdminPagos();
        } else if (activeView === 'admin_anuncios') {
            titleContainer.textContent = 'Gestión y Publicación de Comunicados';
            container.innerHTML = renderAdminAnuncios();
        }
    } else {
        if (activeView === 'home') {
            titleContainer.textContent = 'Información General de Mi Unidad';
            container.innerHTML = renderResidentHome();
        } else if (activeView === 'wallet') {
            titleContainer.textContent = 'Pasarela de Pagos y Recargas Nexus';
            container.innerHTML = renderResidentWallet();
        } else if (activeView === 'anuncios') {
            titleContainer.textContent = 'Tablón de Anuncios Oficiales';
            container.innerHTML = renderResidentAnuncios();
        } else if (activeView === 'bot') {
            titleContainer.textContent = 'Asistente Inteligente Nexus';
            container.innerHTML = renderResidentBot();
            initChatScroll();
        }
    }
}

// ==========================================
// VISTAS DE RESIDENTE
// ==========================================
function renderResidentHome() {
    const apto = appData.apartamentos.find(a => a.apto === activeUser);
    
    return `
        <div class="card-grid">
            <div class="card">
                <h3>ESTADO DE LA UNIDAD</h3>
                <div style="margin-top: 10px;">
                    <span class="big-value">Apto ${apto.apto}</span>
                    <p style="margin-top: 6px; font-size: 13px; color: var(--text-muted);">Torre ${apto.apto.charAt(0)}</p>
                </div>
            </div>
            <div class="card">
                <h3>TITULAR Y REGISTRO</h3>
                <div style="margin-top: 10px; font-size: 13px;">
                    <p><b>Propietario:</b> ${apto.propietario}</p>
                    <p style="margin-top: 6px;"><b>Cuenta creada el:</b> ${apto.fechaCreacion}</p>
                    <p style="margin-top: 6px;"><b>Estado actual:</b> ${apto.estado === 'al_dia' ? '<span class="status-badge ok">Al Día</span>' : '<span class="status-badge danger">Deuda Pendiente</span>'}</p>
                </div>
            </div>
        </div>

        <div class="card">
            <h3>Resumen Financiero Rápido</h3>
            <div style="margin-top: 15px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                <div>
                    <p style="font-size: 13px; color: var(--text-muted);">Saldo en Billetera Virtual:</p>
                    <b style="font-size: 22px; color: var(--success);">$${apto.billetera.toLocaleString()}</b>
                </div>
                <div>
                    <p style="font-size: 13px; color: var(--text-muted);">Deuda por Pagar:</p>
                    <b style="font-size: 22px; color: var(--danger);">$${apto.deudaPendiente.toLocaleString()}</b>
                </div>
                <button class="btn-primary" style="width: auto; padding: 10px 20px;" onclick="switchView('wallet')">Ir a Pagar o Recargar</button>
            </div>
        </div>
    `;
}

function renderResidentWallet() {
    const apto = appData.apartamentos.find(a => a.apto === activeUser);

    let historialRows = apto.historial.map(h => `
        <tr>
            <td>${h.concepto}</td>
            <td>${h.fecha}</td>
            <td>${h.valor}</td>
            <td><span class="status-badge ${h.estadoPago === 'Pagado' ? 'ok' : 'danger'}">${h.estadoPago}</span></td>
        </tr>
    `).join('');

    return `
        <div class="card-grid">
            <div class="card">
                <h3>BILLETERA NEXUS</h3>
                <div style="margin-top: 10px; display:flex; justify-content:space-between; align-items:center;">
                    <span class="big-value">$${apto.billetera.toLocaleString()}</span>
                    <button class="btn-primary" style="width:auto; padding:8px 14px; font-size:13px;" onclick="simularRecarga()">Recargar Saldo</button>
                </div>
                <p style="margin-top: 10px; font-size: 12px; color: var(--text-muted);">Usa tu saldo recargado para pagar cuotas de administración al instante con un solo clic.</p>
            </div>

            <div class="card">
                <h3>PAGO DE CUOTAS PENDIENTES</h3>
                <div style="margin-top: 10px;">
                    <p style="font-size: 13px; margin-bottom: 10px;">Deuda actual: <b>$${apto.deudaPendiente.toLocaleString()}</b></p>
                    ${apto.deudaPendiente > 0 ? `
                        <button class="btn-primary" onclick="pagarDeuda()">Pagar Cuota con Billetera / Pasarela</button>
                    ` : `
                        <p style="color:var(--success); font-size:13px; font-weight:600;"><i class="fa-solid fa-check-circle"></i> ¡No tienes deudas pendientes!</p>
                    `}
                </div>
            </div>
        </div>

        <div class="table-container">
            <div class="table-header-flex">
                <h3>Historial de Recibos y Pagos</h3>
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Concepto</th>
                        <th>Fecha</th>
                        <th>Valor</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    ${historialRows}
                </tbody>
            </table>
        </div>
    `;
}

function simularRecarga() {
    const montoStr = prompt("¿Cuánto deseas recargar a tu billetera Nexus? (Ej. 50000, 180000):", "50000");
    if (!montoStr) return;
    const monto = parseInt(montoStr);
    if (isNaN(monto) || monto <= 0) {
        alert("Por favor ingresa un monto válido.");
        return;
    }

    const apto = appData.apartamentos.find(a => a.apto === activeUser);
    apto.billetera += monto;
    
    appData.transaccionesGlobales.unshift({
        id: Date.now(),
        apto: apto.apto,
        tipo: "Recarga Billetera",
        valor: `$${monto.toLocaleString()}`,
        fecha: "Hoy, 2026"
    });

    saveDB();
    alert(`¡Recarga exitosa por $${monto.toLocaleString()} simulada con pasarela NexusPay!`);
    renderApp();
}

function pagarDeuda() {
    const apto = appData.apartamentos.find(a => a.apto === activeUser);
    if (apto.billetera < apto.deudaPendiente) {
        if (confirm(`Saldo en billetera insuficiente ($${apto.billetera.toLocaleString()}). ¿Deseas simular un pago directo con tarjeta de crédito/débito por $${apto.deudaPendiente.toLocaleString()}?`)) {
            procesarPagoExitoso(apto, apto.deudaPendiente);
        }
        return;
    }

    apto.billetera -= apto.deudaPendiente;
    const pagado = apto.deudaPendiente;
    apto.deudaPendiente = 0;
    apto.estado = 'al_dia';
    
    apto.historial.unshift({
        concepto: "Cuota de Administración (Pagada)",
        fecha: "Mar 2026",
        valor: `$${pagado.toLocaleString()}`,
        estadoPago: "Pagado"
    });

    appData.transaccionesGlobales.unshift({
        id: Date.now(),
        apto: apto.apto,
        tipo: "Pago de Cuota",
        valor: `$${pagado.toLocaleString()}`,
        fecha: "Hoy, 2026"
    });

    saveDB();
    alert("¡Pago realizado con éxito usando tu billetera Nexus!");
    renderApp();
}

function procesarPagoExitoso(apto, valor) {
    apto.deudaPendiente = 0;
    apto.estado = 'al_dia';
    apto.historial.unshift({
        concepto: "Cuota de Administración (Tarjeta)",
        fecha: "Mar 2026",
        valor: `$${valor.toLocaleString()}`,
        estadoPago: "Pagado"
    });

    appData.transaccionesGlobales.unshift({
        id: Date.now(),
        apto: apto.apto,
        tipo: "Pago con Tarjeta",
        valor: `$${valor.toLocaleString()}`,
        fecha: "Hoy, 2026"
    });

    saveDB();
    alert("¡Transacción aprobada por la pasarela de pagos simulada!");
    renderApp();
}

function renderResidentAnuncios() {
    let cards = appData.anuncios.map(an => `
        <div class="announcement-card">
            <h4><i class="fa-solid fa-bullhorn" style="color:var(--primary); margin-right:8px;"></i> ${an.titulo}</h4>
            <p>${an.contenido}</p>
            <span class="date">${an.fecha}</span>
        </div>
    `).join('');
    return `<div>${cards}</div>`;
}

// ==========================================
// NEXPERUS AI ASSISTANT - LÓGICA DE CHAT AVANZADA
// ==========================================
const respuestasNexus = {
    saludos: [
        "¡Hola! Qué gusto saludarte por aquí. Estoy listo para ayudarte con lo que necesites del conjunto: pagos, zonas comunes o dudas rápidas. ¿En qué te echo una mano hoy?",
        "¡Holaa! Qué bueno verte por acá. Cuéntame, ¿qué trámite o consulta tienes pendiente hoy en el conjunto?"
    ],
    pagos: [
        "¡Claro que sí! Esa gestión la haces directo desde la sección de **Pagos** en el menú principal de Nexus, sin filas, sin papeleos y ahorrándote intermediarios. ¿Te guío paso a paso?"
    ],
    reservas: [
        "¡De una! Las reservas de espacios como la piscina o el salón social se gestionan directo desde el módulo de **Zonas Comunes** en la app. ¿Quieres que te indique cómo apartar tu espacio?"
    ],
    ayuda: [
        "Aquí ando, vigilando que todo en el conjunto marche sobre ruedas y listo para asistirte de forma ágil. Cuéntame, ¿qué necesitas consultar o resolver?"
    ]
};

function obtenerRespuestaNexus(mensajeUsuario) {
    const texto = mensajeUsuario.toLowerCase().trim();
    
    if (texto.startsWith("hola") || texto.includes("buenos dias") || texto.includes("buenas tardes") || texto.includes("que tal") || texto.includes("wenas")) {
        const index = Math.floor(Math.random() * respuestasNexus.saludos.length);
        return respuestasNexus.saludos[index];
    }
    
    if (texto.includes("pago") || texto.includes("administracion") || texto.includes("dinero") || texto.includes("pse") || texto.includes("recibo") || texto.includes("saldo") || texto.includes("deuda")) {
        const apto = appData.apartamentos.find(a => a.apto === activeUser);
        if (apto && (texto.includes("saldo") || texto.includes("deuda"))) {
            return apto.deudaPendiente === 0 ? 
                `Tu unidad (${activeUser}) se encuentra al día. Tienes un saldo en billetera de $${apto.billetera.toLocaleString()}.` : 
                `Tienes una deuda pendiente de $${apto.deudaPendiente.toLocaleString()}. Puedes gestionarla desde la sección de Pagos y Billetera.`;
        }
        return respuestasNexus.pagos[0];
    }
    
    if (texto.includes("reserva") || texto.includes("piscina") || texto.includes("salon") || texto.includes("horario")) {
        return respuestasNexus.reservas[0];
    }
    
    if (texto.includes("que haces") || texto.includes("ayuda") || texto.includes("quien eres")) {
        return respuestasNexus.ayuda[0];
    }
    
    return `Entiendo tu consulta sobre "${mensajeUsuario}". Lo puedes gestionar de forma autónoma desde el menú principal de Nexus o consultarlo en los módulos de la app. ¿Te ayudo con algo más?`;
}

function renderResidentBot() {
    return `
        <div class="chat-wrapper">
            <div class="chat-header-box">
                <i class="fa-solid fa-robot" style="font-size:24px; color:var(--primary);"></i>
                <div>
                    <b style="font-size:14px; display:block;">Nexus AI Assistant</b>
                    <span style="font-size:11px; color:var(--success);">● En línea</span>
                </div>
            </div>
            <div class="chat-messages" id="chat-box">
                <div class="message bot"><p>¡Hola! Soy el asistente inteligente de Nexus. Pregúntame sobre pagos, horarios de piscina, salón social o reglas del conjunto.</p></div>
            </div>
            <div class="chat-input-area" style="display:flex; gap:10px; margin-top:10px;">
                <input type="text" id="input-mensaje" placeholder="Escribe tu consulta aquí..." style="flex:1; padding:10px; border:1px solid var(--border); border-radius:8px; outline:none;" onkeypress="handleChatKey(event)">
                <button id="btn-enviar" class="btn-primary" style="width:auto; padding:10px 15px;" onclick="sendChatMessage()"><i class="fa-solid fa-paper-plane"></i></button>
            </div>
        </div>
    `;
}

function sendChatMessage() {
    const inputMensaje = document.querySelector("#input-mensaje");
    if (!inputMensaje) return;
    const textoUsuario = inputMensaje.value.trim();
    if (!textoUsuario) return;

    agregarMensajeUI(textoUsuario, "usuario");
    inputMensaje.value = "";

    setTimeout(() => {
        const respuestaBot = obtenerRespuestaNexus(textoUsuario);
        agregarMensajeUI(respuestaBot, "bot");
    }, 600);
}

function handleChatKey(e) { 
    if (e.key === 'Enter') sendChatMessage(); 
}

function agregarMensajeUI(texto, remitente) {
    const contenedorChat = document.querySelector("#chat-box");
    if (!contenedorChat) return;

    const burbuja = document.createElement("div");
    burbuja.classList.add("message", remitente === "usuario" ? "user" : "bot");
    burbuja.innerHTML = `<p>${texto}</p>`;
    
    contenedorChat.appendChild(burbuja);
    contenedorChat.scrollTop = contenedorChat.scrollHeight;
}

function initChatScroll() {
    const chatMsgs = document.getElementById('chat-box');
    if (chatMsgs) chatMsgs.scrollTop = chatMsgs.scrollHeight;
}

// ==========================================
// VISTAS DE ADMINISTRADOR
// ==========================================
function renderAdminDashboard() {
    const totalAptos = appData.apartamentos.length;
    const enMora = appData.apartamentos.filter(a => a.estado === 'mora').length;
    const alDia = totalAptos - enMora;

    return `
        <div class="card-grid">
            <div class="card">
                <h3>TOTAL APARTAMENTOS</h3>
                <span class="big-value">${totalAptos}</span>
                <p style="margin-top:8px; font-size:12px; color:var(--text-muted);">Torres A, B, C y D</p>
            </div>
            <div class="card">
                <h3>ESTADO DE CARTERA</h3>
                <span class="big-value" style="color:var(--success);">${alDia} Al Día</span>
                <p style="margin-top:8px; font-size:12px; color:var(--danger);"><b>${enMora}</b> en mora</p>
            </div>
            <div class="card">
                <h3>TRANSACCIONES REGISTRADAS</h3>
                <span class="big-value">${appData.transaccionesGlobales.length}</span>
                <p style="margin-top:8px; font-size:12px; color:var(--text-muted);">Pagos y recargas procesadas</p>
            </div>
        </div>
    `;
}

function renderAdminAptos() {
    let rows = appData.apartamentos.map(a => {
        const badge = a.estado === 'al_dia' ? '<span class="status-badge ok">Al Día</span>' : '<span class="status-badge danger">Deuda Pendiente</span>';
        return `
            <tr onclick="seleccionarApartamentoAdmin('${a.apto}')" style="cursor: pointer;" title="Haz clic para ver el expediente completo">
                <td><b>${a.apto}</b></td>
                <td>Torre ${a.apto.charAt(0)}</td>
                <td>${a.propietario}</td>
                <td>${badge}</td>
                <td><b>$${a.deudaPendiente.toLocaleString()}</b></td>
            </tr>
        `;
    }).join('');

    return `
        <div class="table-container">
            <div class="table-header-flex">
                <h3>Directorio General (Haz clic en cualquier apartamento para auditarlo)</h3>
                <div class="search-box">
                    <i class="fa-solid fa-search"></i>
                    <input type="text" id="admin-search-input" placeholder="Buscar apartamento..." onkeyup="filterAdminTable()">
                </div>
            </div>
            <div style="overflow-x: auto;">
                <table class="data-table" id="admin-aptos-table">
                    <thead>
                        <tr>
                            <th>Apartamento</th>
                            <th>Torre</th>
                            <th>Propietario</th>
                            <th>Estado</th>
                            <th>Deuda Pendiente</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>
    `;
}

function seleccionarApartamentoAdmin(aptoNum) {
    selectedApartmentApto = aptoNum;
    activeView = 'admin_detalle_apto';
    renderApp();
}

function renderAdminDetalleApto() {
    const apto = appData.apartamentos.find(a => a.apto === selectedApartmentApto);
    if (!apto) return `<p>Apartamento no encontrado.</p>`;

    let historialRows = apto.historial.map(h => `
        <tr>
            <td>${h.concepto}</td>
            <td>${h.fecha}</td>
            <td>${h.valor}</td>
            <td><span class="status-badge ${h.estadoPago === 'Pagado' ? 'ok' : 'danger'}">${h.estadoPago}</span></td>
        </tr>
    `).join('');

    return `
        <div style="margin-bottom: 20px;">
            <button class="btn-primary" style="width: auto; padding: 8px 16px; background: var(--text-muted);" onclick="switchView('admin_aptos')"><i class="fa-solid fa-arrow-left"></i> Volver al Directorio</button>
        </div>

        <div class="card-grid">
            <div class="card">
                <h3>INFORMACIÓN DE LA UNIDAD</h3>
                <div style="margin-top: 10px; font-size: 13px;">
                    <p style="font-size: 20px; font-weight: bold; margin-bottom: 8px;">Apto ${apto.apto} <span style="font-size:12px; font-weight:normal; color:var(--text-muted);">(Torre ${apto.apto.charAt(0)})</span></p>
                    <p><b>Propietario:</b> ${apto.propietario}</p>
                    <p style="margin-top: 6px;"><b>Fecha de registro:</b> ${apto.fechaCreacion}</p>
                    <p style="margin-top: 6px;"><b>Estado Financiero:</b> ${apto.estado === 'al_dia' ? '<span class="status-badge ok">Al Día</span>' : '<span class="status-badge danger">En Mora</span>'}</p>
                </div>
            </div>

            <div class="card">
                <h3>SALDOS Y ACCIONES DE ADMIN</h3>
                <div style="margin-top: 10px; font-size: 13px;">
                    <p>Deuda Actual: <b style="color:var(--danger); font-size:16px;">$${apto.deudaPendiente.toLocaleString()}</b></p>
                    <p style="margin-top: 6px;">Saldo Billetera: <b style="color:var(--success); font-size:16px;">$${apto.billetera.toLocaleString()}</b></p>
                    <div style="margin-top: 15px; display:flex; gap:10px; flex-wrap:wrap;">
                        <button class="btn-primary" style="width:auto; padding:8px 12px; font-size:12px;" onclick="adminCondonarDeuda('${apto.apto}')">Marcar Paz y Salvo</button>
                        <button class="btn-primary" style="width:auto; padding:8px 12px; font-size:12px; background:var(--danger);" onclick="adminAgregarDeuda('${apto.apto}')">Agregar Cuota Pendiente</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="table-container" style="margin-top: 25px;">
            <div class="table-header-flex">
                <h3>Historial de Recibos y Movimientos del Apto ${apto.apto}</h3>
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Concepto</th>
                        <th>Fecha</th>
                        <th>Valor</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    ${historialRows}
                </tbody>
            </table>
        </div>
    `;
}

function adminCondonarDeuda(aptoNum) {
    const apto = appData.apartamentos.find(a => a.apto === aptoNum);
    if (!apto) return;
    apto.deudaPendiente = 0;
    apto.estado = 'al_dia';
    apto.historial.unshift({
        concepto: "Ajuste / Condonación de Deuda (Admin)",
        fecha: "Mar 2026",
        valor: "$0",
        estadoPago: "Pagado"
    });
    saveDB();
    alert(`¡Apartamento ${aptoNum} actualizado a Paz y Salvo!`);
    renderApp();
}

function adminAgregarDeuda(aptoNum) {
    const apto = appData.apartamentos.find(a => a.apto === aptoNum);
    if (!apto) return;
    apto.deudaPendiente += 180000;
    apto.estado = 'mora';
    apto.historial.unshift({
        concepto: "Cuota de Administración Extra / Pendiente",
        fecha: "Mar 2026",
        valor: "$180,000",
        estadoPago: "Pendiente"
    });
    saveDB();
    alert(`Se ha agregado una cuota pendiente de $180,000 al apartamento ${aptoNum}.`);
    renderApp();
}

function filterAdminTable() {
    const query = document.getElementById('admin-search-input').value.toLowerCase();
    const rows = document.querySelectorAll('#admin-aptos-table tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
    });
}

function renderAdminPagos() {
    let transRows = appData.transaccionesGlobales.length > 0 ? appData.transaccionesGlobales.map(t => `
        <tr>
            <td><b>Apto ${t.apto}</b></td>
            <td>${t.tipo}</td>
            <td><b>${t.valor}</b></td>
            <td>${t.fecha}</td>
            <td><span class="status-badge ok">Aprobado</span></td>
        </tr>
    `).join('') : `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No hay transacciones registradas todavía en esta sesión.</td></tr>`;

    return `
        <div class="table-container">
            <div class="table-header-flex">
                <h3>Auditoría de Recibos y Pagos Recientes</h3>
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Apartamento</th>
                        <th>Tipo de Operación</th>
                        <th>Valor</th>
                        <th>Fecha</th>
                        <th>Estado Pasarela</th>
                    </tr>
                </thead>
                <tbody>
                    ${transRows}
                </tbody>
            </table>
        </div>
    `;
}

function renderAdminAnuncios() {
    return `
        <div class="card" style="max-width:600px; margin-bottom: 25px;">
            <h3>Publicar Nuevo Anuncio Oficial</h3>
            <form onsubmit="handlePostAnnouncement(event)" style="margin-top: 15px;" class="form-grid">
                <div class="input-group">
                    <label>Título del Comunicado</label>
                    <input type="text" id="new-anuncio-title" placeholder="Ej. Suspensión temporal de agua" required>
                </div>
                <div class="input-group">
                    <label>Contenido / Descripción</label>
                    <textarea id="new-anuncio-content" rows="4" placeholder="Escribe los detalles..." style="width:100%; padding:12px; border:1px solid var(--border); border-radius:10px; outline:none; font-size:13px;" required></textarea>
                </div>
                <button type="submit" class="btn-primary">Publicar Anuncio</button>
            </form>
        </div>
    `;
}

function handlePostAnnouncement(e) {
    e.preventDefault();
    const title = document.getElementById('new-anuncio-title').value;
    const content = document.getElementById('new-anuncio-content').value;
    appData.anuncios.unshift({ id: Date.now(), titulo: title, contenido: content, fecha: "Hoy" });
    saveDB();
    alert('¡Anuncio publicado con éxito!');
    document.getElementById('new-anuncio-title').value = '';
    document.getElementById('new-anuncio-content').value = '';
}

// Inicializar la base de datos de los 200 apartamentos al arrancar
initDatabase();