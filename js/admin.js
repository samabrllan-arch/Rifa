/**
 * PANEL DE ADMINISTRACIÓN Y SORTEO EN VIVO
 * Gran Rifa Oficial - Olla Kalley + $200.000 COP
 */

const AdminState = {
  tickets: [],
  config: {},
  filter: 'todos',
  search: '',
  isAuthenticated: false
};

// ==========================================================================
// INICIALIZACIÓN
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  showAdminDashboard();
  setupAdminListeners();
});

function getAppsScriptUrl() {
  return localStorage.getItem('rifa_appscript_url') || '';
}

function setAppsScriptUrl(url) {
  localStorage.setItem('rifa_appscript_url', url.trim());
}

async function showAdminDashboard() {
  await loadAdminData();
  renderMetrics();
  renderAdminTable();
}

// ==========================================================================
// CARGA DE DATOS (APPS SCRIPT -> NODE.JS API -> LOCALSTORAGE)
// ==========================================================================
async function loadAdminData() {
  // Purga proactiva si la caché del navegador tiene datos antiguos de 2 millones o precio anterior
  const rawCache = localStorage.getItem('rifa_kalley_cache');
  if (rawCache && (rawCache.includes('2.000.000') || rawCache.includes("2'000.000") || rawCache.includes('2000000') || rawCache.includes('25000'))) {
    console.log('[Admin] Purgando caché obsoleta detectada en navegador');
    localStorage.removeItem('rifa_kalley_cache');
  }

  const appScriptUrl = getAppsScriptUrl();

  // 1. Google Apps Script
  if (appScriptUrl) {
    try {
      const res = await fetch(`${appScriptUrl}?action=getTickets`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          AdminState.tickets = json.data.tickets || [];
          AdminState.config = json.data.config || {};
          localStorage.setItem('rifa_kalley_cache', JSON.stringify(json.data));
          return;
        }
      }
    } catch (e) {
      console.warn('Apps Script error en admin:', e);
    }
  }

  // 2. Servidor Node.js
  try {
    const res = await fetch('./api/tickets');
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        AdminState.tickets = json.data.tickets || [];
        AdminState.config = json.data.config || {};
        localStorage.setItem('rifa_kalley_cache', JSON.stringify(json.data));
        return;
      }
    }
  } catch (e) {}

  // 3. Fallback LocalStorage
  const cached = localStorage.getItem('rifa_kalley_cache');
  if (cached) {
    try {
      const data = JSON.parse(cached);
      AdminState.tickets = data.tickets || [];
      AdminState.config = data.config || {};
    } catch (e) {}
  }
}

// ==========================================================================
// RENDERIZADO DE MÉTRICAS
// ==========================================================================
function renderMetrics() {
  const total = AdminState.tickets.length;
  const pagados = AdminState.tickets.filter(t => t.status === 'pagado').length;
  const apartados = AdminState.tickets.filter(t => t.status === 'apartado').length;
  const disponibles = AdminState.tickets.filter(t => t.status === 'disponible').length;
  const price = AdminState.config.ticket_price || 15000;

  const recaudado = pagados * price;
  const porCobrar = apartados * price;
  const metaTotal = total * price;

  const elRecaudado = document.getElementById('metricRecaudado');
  const elPorCobrar = document.getElementById('metricPorCobrar');
  const elPagados = document.getElementById('metricPagados');
  const elDisponibles = document.getElementById('metricDisponibles');
  const elMeta = document.getElementById('metricMeta');

  if (elRecaudado) elRecaudado.textContent = formatCOP(recaudado);
  if (elPorCobrar) elPorCobrar.textContent = formatCOP(porCobrar);
  if (elPagados) elPagados.textContent = `${pagados} boletos`;
  if (elDisponibles) elDisponibles.textContent = `${disponibles} boletos`;
  if (elMeta) elMeta.textContent = formatCOP(metaTotal);
}

// ==========================================================================
// TABLA ADMINISTRATIVA DE TICKETS
// ==========================================================================
function renderAdminTable() {
  const tbody = document.getElementById('adminTableBody');
  if (!tbody) return;

  const filtered = AdminState.tickets.filter((t) => {
    if (AdminState.filter === 'disponibles' && t.status !== 'disponible') return false;
    if (AdminState.filter === 'apartados' && t.status !== 'apartado') return false;
    if (AdminState.filter === 'pagados' && t.status !== 'pagado') return false;

    if (AdminState.search) {
      const q = AdminState.search.toLowerCase();
      const matchNum = t.number.includes(q);
      const matchName = t.buyer?.name?.toLowerCase().includes(q) || false;
      const matchPhone = t.buyer?.phone?.includes(q) || false;
      if (!matchNum && !matchName && !matchPhone) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2rem; color: #94a3b8;">
          No se encontraron boletos con el filtro seleccionado.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map((t) => {
    const buyerName = t.buyer?.name || '<span style="color: #64748b;">(Sin asignar)</span>';
    const buyerPhone = t.buyer?.phone ? `<a href="https://wa.me/57${t.buyer.phone.replace(/\D/g,'')}" target="_blank" style="color: #34d399; text-decoration: none;">📲 ${t.buyer.phone}</a>` : '-';
    const method = t.buyer?.paymentMethod || '-';

    let actionButtons = '';
    if (t.status === 'apartado') {
      actionButtons += `
        <button class="btn-table-action confirm" onclick="adminConfirmPayment('${t.number}')" title="Confirmar Pago">
          ✓ Confirmar
        </button>
        <button class="btn-table-action release" onclick="adminReleaseTicket('${t.number}')" title="Liberar">
          ✕ Liberar
        </button>
      `;
    } else if (t.status === 'pagado') {
      actionButtons += `
        <button class="btn-table-action release" onclick="adminReleaseTicket('${t.number}')" title="Revertir">
          ↺ Liberar
        </button>
      `;
    }

    if (t.buyer) {
      actionButtons += `
        <button class="btn-table-action view-ticket" onclick="adminViewTicket('${t.number}')" title="Ver Boleto Oficial">
          🎟️ Boleto
        </button>
        <button class="btn-table-action confirm" onclick="adminSendWhatsApp('${t.number}')" title="Reenviar a WhatsApp">
          📲 WA
        </button>
      `;
    }

    return `
      <tr>
        <td data-label="Boleto"><span class="ticket-number-badge">#${t.number}</span></td>
        <td data-label="Estado"><span class="status-badge ${t.status}">${t.status.toUpperCase()}</span></td>
        <td data-label="Comprador"><strong>${buyerName}</strong></td>
        <td data-label="Teléfono">${buyerPhone}</td>
        <td data-label="Medio Pago">${method}</td>
        <td data-label="Folio" style="font-family: monospace; font-size: 0.75rem; color: #94a3b8;">${t.buyer?.folio || '-'}</td>
        <td data-label="Acciones"><div class="table-actions">${actionButtons}</div></td>
      </tr>
    `;
  }).join('');
}

// ==========================================================================
// ACCIONES ADMINISTRATIVAS: CONFIRMAR, LIBERAR, RE-ENVIAR
// ==========================================================================
async function adminConfirmPayment(number) {
  if (!confirm(`¿Confirmar el pago del número #${number}?`)) return;

  const appScriptUrl = getAppsScriptUrl();
  let done = false;

  if (appScriptUrl) {
    try {
      const res = await fetch(appScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'confirm', number: number })
      });
      const json = await res.json();
      if (json.success) done = true;
    } catch (e) {}
  }

  if (!done) {
    try {
      const res = await fetch(`./api/tickets/${number}/confirm`, { method: 'PUT' });
      const json = await res.json();
      if (json.success) done = true;
    } catch (e) {}
  }

  // Actualizar en memoria y caché
  const ticket = AdminState.tickets.find(t => t.number === number);
  if (ticket) {
    ticket.status = 'pagado';
    ticket.paidAt = new Date().toISOString();
  }
  saveAdminCache();
  renderMetrics();
  renderAdminTable();
  alert(`¡Pago del número #${number} confirmado con éxito!`);
}

async function adminReleaseTicket(number) {
  if (!confirm(`¿Estás seguro de liberar el número #${number}? Volverá a estar disponible para compra.`)) return;

  const appScriptUrl = getAppsScriptUrl();
  let done = false;

  if (appScriptUrl) {
    try {
      const res = await fetch(appScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'release', number: number })
      });
      const json = await res.json();
      if (json.success) done = true;
    } catch (e) {}
  }

  if (!done) {
    try {
      const res = await fetch(`./api/tickets/${number}/release`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) done = true;
    } catch (e) {}
  }

  const ticket = AdminState.tickets.find(t => t.number === number);
  if (ticket) {
    ticket.status = 'disponible';
    ticket.buyer = null;
    ticket.reservedAt = null;
    ticket.paidAt = null;
  }
  saveAdminCache();
  renderMetrics();
  renderAdminTable();
}

function adminViewTicket(number) {
  const ticket = AdminState.tickets.find(t => t.number === number);
  if (!ticket || !ticket.buyer) return;

  const modal = document.getElementById('ticketModal');
  const container = document.getElementById('ticketCanvasContainer');
  if (!modal || !container) return;

  container.innerHTML = '<p style="color: #fbbf24; padding: 2rem;">Generando boleto oficial...</p>';
  modal.classList.add('active');

  const ticketData = {
    numbers: [ticket.number],
    buyer: ticket.buyer,
    status: ticket.status.toUpperCase(),
    folio: ticket.buyer.folio || `FOLIO-${ticket.number}`,
    lottery: `${AdminState.config.lottery_name || 'Lotería de Boyacá'} (${AdminState.config.draw_date || '14 de Noviembre'})`
  };

  window.AdminCurrentTicket = ticketData;

  window.ticketGenerator.generateCanvas(ticketData).then((canvas) => {
    canvas.className = 'ticket-canvas';
    container.innerHTML = '';
    container.appendChild(canvas);
  });
}

async function adminSendWhatsApp(number) {
  const ticket = AdminState.tickets.find(t => t.number === number);
  if (!ticket || !ticket.buyer) return;

  const ticketData = {
    numbers: [ticket.number],
    buyer: ticket.buyer,
    status: ticket.status.toUpperCase(),
    folio: ticket.buyer.folio || `FOLIO-${ticket.number}`,
    lottery: `${AdminState.config.lottery_name || 'Lotería de Boyacá'} (${AdminState.config.draw_date || '14 de Noviembre'})`
  };

  await window.ticketGenerator.shareWhatsApp(ticketData);
}

// Modal de Tabla 10x10 para Estados en Admin
async function openAdminStatusGridModal() {
  const modal = document.getElementById('adminStatusGridModal');
  const container = document.getElementById('adminStatusGridCanvasContainer');
  if (!modal || !container) return;

  container.innerHTML = '<p style="color: #fbbf24; padding: 2rem; text-align: center;">Generando tabla 10x10 de números...</p>';
  modal.classList.add('active');

  const canvas = await window.ticketGenerator.generateStatusGridCanvas(AdminState.tickets, AdminState.config);
  canvas.className = 'ticket-canvas';
  canvas.style.maxHeight = '70vh';
  container.innerHTML = '';
  container.appendChild(canvas);
}

async function adminShareStatusGrid() {
  await window.ticketGenerator.shareStatusGrid(AdminState.tickets, AdminState.config);
}

async function adminDownloadStatusGrid() {
  await window.ticketGenerator.downloadStatusGrid(AdminState.tickets, AdminState.config);
}

// ==========================================================================
// SORTEO EN VIVO / RULETA ANIMADA CON CONFETI
// ==========================================================================
function openLiveDrawModal() {
  const modal = document.getElementById('liveDrawModal');
  const paidTickets = AdminState.tickets.filter(t => t.status === 'pagado');

  const countElem = document.getElementById('drawPaidCount');
  if (countElem) countElem.textContent = `${paidTickets.length} boletos pagados listos para el sorteo`;

  if (modal) modal.classList.add('active');
}

function closeLiveDrawModal() {
  const modal = document.getElementById('liveDrawModal');
  if (modal) modal.classList.remove('active');
}

let isSpinning = false;
function startDrawRoulette() {
  if (isSpinning) return;
  const paidTickets = AdminState.tickets.filter(t => t.status === 'pagado');

  if (paidTickets.length === 0) {
    alert('No hay números con estado "PAGADO" todavía para realizar el sorteo.');
    return;
  }

  isSpinning = true;
  const numberDisplay = document.getElementById('rouletteNumber');
  const buyerDisplay = document.getElementById('rouletteBuyerName');
  const btnStart = document.getElementById('btnStartDraw');
  if (btnStart) btnStart.disabled = true;

  // Ruleta: rotación rápida que se desacelera
  let speed = 40;
  let counter = 0;
  const totalTicks = 60 + Math.floor(Math.random() * 20);

  // Elegir ganador de antemano
  const winnerIndex = Math.floor(Math.random() * paidTickets.length);
  const winnerTicket = paidTickets[winnerIndex];

  function tick() {
    counter++;
    const randomTicket = paidTickets[Math.floor(Math.random() * paidTickets.length)];
    if (numberDisplay) numberDisplay.textContent = randomTicket.number;
    if (buyerDisplay) buyerDisplay.textContent = randomTicket.buyer?.name || 'Participante';

    // Reproducir un sonido de clic suave si se desea
    playTickSound();

    if (counter < totalTicks) {
      if (counter > totalTicks - 25) speed += 15;
      setTimeout(tick, speed);
    } else {
      // Detener en el ganador oficial
      if (numberDisplay) numberDisplay.textContent = winnerTicket.number;
      if (buyerDisplay) buyerDisplay.innerHTML = `🏆 ¡GANADOR(A)!: <strong style="color: #fbbf24;">${winnerTicket.buyer?.name?.toUpperCase()}</strong> (${winnerTicket.buyer?.phone})`;
      isSpinning = false;
      if (btnStart) btnStart.disabled = false;

      // Lanzar confeti y sonido de victoria
      launchConfetti();
      playWinSound();
    }
  }

  tick();
}

function playTickSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {}
}

function playWinSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.4);
    });
  } catch (e) {}
}

function launchConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#f59e0b', '#fbbf24', '#10b981', '#34d399', '#ffffff', '#6366f1'];

  for (let i = 0; i < 180; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 0.7) * 22,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10
    });
  }

  let frames = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // Gravedad
      p.rotation += p.vRot;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    });

    frames++;
    if (frames < 240) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  animate();
}

// ==========================================================================
// EXPORTACIÓN A EXCEL (CSV)
// ==========================================================================
function exportTicketsToExcel() {
  const headers = ['Numero', 'Estado', 'Comprador', 'Telefono', 'Ciudad', 'MetodoPago', 'Folio', 'FechaRegistro', 'FechaPago'];
  const rows = AdminState.tickets.map(t => [
    `"${t.number}"`,
    `"${t.status}"`,
    `"${t.buyer?.name || ''}"`,
    `"${t.buyer?.phone || ''}"`,
    `"${t.buyer?.city || ''}"`,
    `"${t.buyer?.paymentMethod || ''}"`,
    `"${t.buyer?.folio || ''}"`,
    `"${t.reservedAt || ''}"`,
    `"${t.paidAt || ''}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Gran_Rifa_Kalley_Boletos_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ==========================================================================
// CONFIGURACIÓN Y APPS SCRIPT LINK
// ==========================================================================
function populateSettingsForm() {
  const inputAppScript = document.getElementById('inputAppsScriptUrl');
  const inputPrice = document.getElementById('inputTicketPrice');
  const inputLottery = document.getElementById('inputLotteryName');
  const inputNequi = document.getElementById('inputNequi');
  const inputDavi = document.getElementById('inputDaviplata');
  const inputBanco = document.getElementById('inputBancolombia');
  const inputPin = document.getElementById('inputAdminPin');

  if (inputAppScript) inputAppScript.value = getAppsScriptUrl();
  if (inputPrice) inputPrice.value = AdminState.config.ticket_price || 25000;
  if (inputLottery) inputLottery.value = AdminState.config.lottery_name || 'Lotería de Medellín';
  if (inputNequi) inputNequi.value = AdminState.config.nequi_number || '';
  if (inputDavi) inputDavi.value = AdminState.config.daviplata_number || '';
  if (inputBanco) inputBanco.value = AdminState.config.bancolombia_acc || '';
  if (inputPin) inputPin.value = AdminState.config.admin_pin || '1234';
}

async function saveAdminSettings() {
  const appScriptUrl = document.getElementById('inputAppsScriptUrl')?.value.trim() || '';
  const price = Number(document.getElementById('inputTicketPrice')?.value) || 25000;
  const lottery = document.getElementById('inputLotteryName')?.value.trim() || 'Lotería de Medellín';
  const nequi = document.getElementById('inputNequi')?.value.trim() || '';
  const davi = document.getElementById('inputDaviplata')?.value.trim() || '';
  const banco = document.getElementById('inputBancolombia')?.value.trim() || '';
  const pin = document.getElementById('inputAdminPin')?.value.trim() || '1234';

  setAppsScriptUrl(appScriptUrl);

  AdminState.config.ticket_price = price;
  AdminState.config.lottery_name = lottery;
  AdminState.config.nequi_number = nequi;
  AdminState.config.daviplata_number = davi;
  AdminState.config.bancolombia_acc = banco;
  AdminState.config.admin_pin = pin;

  // Enviar a Apps Script si está conectado
  if (appScriptUrl) {
    try {
      await fetch(appScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'updateConfig',
          ticket_price: price,
          lottery_name: lottery,
          nequi_number: nequi,
          daviplata_number: davi,
          bancolombia_acc: banco,
          admin_pin: pin
        })
      });
    } catch (e) {}
  }

  // Enviar a Node.js API si está activo
  try {
    await fetch('./api/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(AdminState.config)
    });
  } catch (e) {}

  saveAdminCache();
  renderMetrics();
  alert('¡Configuración guardada exitosamente!');
}

function saveAdminCache() {
  localStorage.setItem('rifa_kalley_cache', JSON.stringify({
    config: AdminState.config,
    tickets: AdminState.tickets
  }));
}

function setupAdminListeners() {
  // Búsqueda
  const searchInput = document.getElementById('adminSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      AdminState.search = e.target.value.trim();
      renderAdminTable();
    });
  }

  // Filtros de tabla
  document.querySelectorAll('.filter-pill').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
      const target = e.currentTarget;
      target.classList.add('active');
      AdminState.filter = target.dataset.filter;
      renderAdminTable();
    });
  });
}

function formatCOP(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(amount);
}
