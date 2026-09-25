/**
 * APLICACIÓN PRINCIPAL DE LA GRAN RIFA (PWA)
 * Manejo de estado, catálogo interactivo, reservas y comprobantes
 */

const AppState = {
  tickets: [],
  config: {
    title: "Gran Rifa Olla Kalley + $200.000 COP",
    prize_primary: "Olla Multifuncional Kalley Digital (14 funciones)",
    prize_cash: "$200.000 COP en Efectivo",
    ticket_price: 15000,
    total_numbers: 100,
    lottery_name: "Lotería de Boyacá",
    draw_date: "14 de Noviembre",
    daviplata_number: "322 212 7468",
    llave_number: "322 212 7468"
  },
  selectedNumbers: new Set(),
  activeFilter: 'todos',
  searchQuery: '',
  lastPurchasedTicket: null
};

// ==========================================================================
// INICIALIZACIÓN
// ==========================================================================
document.addEventListener('DOMContentLoaded', async () => {
  await loadRaffleData();
  setupEventListeners();
  renderGrid();
  updateProgressUI();
});

// ==========================================================================
// CAPA DE DATOS HÍBRIDA (GOOGLE APPS SCRIPT -> NODE.JS API -> LOCALSTORAGE)
// ==========================================================================
function getAppsScriptUrl() {
  return localStorage.getItem('rifa_appscript_url') || '';
}

async function loadRaffleData() {
  // Purga proactiva si la caché del navegador tiene datos antiguos de 2 millones o precio anterior
  const rawCache = localStorage.getItem('rifa_kalley_cache');
  if (rawCache && (rawCache.includes('2.000.000') || rawCache.includes("2'000.000") || rawCache.includes('2000000') || rawCache.includes('25000'))) {
    console.log('[App] Purgando caché obsoleta detectada en navegador');
    localStorage.removeItem('rifa_kalley_cache');
  }

  const appScriptUrl = getAppsScriptUrl();

  // 1. Intentar con Google Apps Script si el usuario configuró el link
  if (appScriptUrl) {
    try {
      const res = await fetch(`${appScriptUrl}?action=getTickets`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          AppState.config = json.data.config || AppState.config;
          AppState.tickets = json.data.tickets || [];
          localStorage.setItem('rifa_kalley_cache', JSON.stringify(json.data));
          updateConfigUI();
          return;
        }
      }
    } catch (err) {
      console.warn('[App] Error al conectar con Google Apps Script:', err);
    }
  }

  // 2. Intentar con el servidor Node.js local
  try {
    const res = await fetch('./api/tickets');
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        AppState.config = json.data.config || AppState.config;
        AppState.tickets = json.data.tickets || [];
        localStorage.setItem('rifa_kalley_cache', JSON.stringify(json.data));
        updateConfigUI();
        return;
      }
    }
  } catch (err) {
    console.warn('[App] Backend Node.js offline, usando almacenamiento local:', err);
  }

  // Fallback desde LocalStorage
  const cached = localStorage.getItem('rifa_kalley_cache');
  if (cached) {
    try {
      const data = JSON.parse(cached);
      AppState.config = data.config || AppState.config;
      AppState.tickets = data.tickets || [];
      updateConfigUI();
      return;
    } catch (e) {
      console.error('Error parseando caché local:', e);
    }
  }

  // Si no hay datos, inicializar 100 números por defecto
  AppState.tickets = [];
  for (let i = 0; i < 100; i++) {
    const num = String(i).padStart(2, '0');
    AppState.tickets.push({
      id: `TICK-${num}`,
      number: num,
      status: 'disponible',
      buyer: null
    });
  }
  updateConfigUI();
}

function updateConfigUI() {
  const priceElem = document.getElementById('ticketPriceDisplay');
  const lotteryElem = document.getElementById('lotteryDateDisplay');
  const daviElem = document.getElementById('daviNumberDisplay');

  if (priceElem) priceElem.textContent = formatCOP(AppState.config.ticket_price || 15000);
  if (lotteryElem) lotteryElem.textContent = `${AppState.config.lottery_name} • ${AppState.config.draw_date}`;
  if (daviElem) daviElem.textContent = AppState.config.daviplata_number || '322 212 7468';
}

// ==========================================================================
// RENDERIZADO DEL CATÁLOGO DE NÚMEROS
// ==========================================================================
function renderGrid() {
  const container = document.getElementById('numbersGrid');
  if (!container) return;

  const filtered = AppState.tickets.filter((ticket) => {
    // Filtro por Estado
    if (AppState.activeFilter === 'disponibles' && ticket.status !== 'disponible') return false;
    if (AppState.activeFilter === 'apartados' && ticket.status !== 'apartado') return false;
    if (AppState.activeFilter === 'pagados' && ticket.status !== 'pagado') return false;
    if (AppState.activeFilter === 'mis-numeros') {
      const myPhones = getStoredMyPhones();
      if (!ticket.buyer || !myPhones.includes(ticket.buyer.phone)) return false;
    }

    // Filtro por Búsqueda (Número o Comprador)
    if (AppState.searchQuery) {
      const q = AppState.searchQuery.toLowerCase();
      const matchNum = ticket.number.includes(q);
      const matchBuyer = ticket.buyer?.name?.toLowerCase().includes(q) || false;
      const matchPhone = ticket.buyer?.phone?.includes(q) || false;
      if (!matchNum && !matchBuyer && !matchPhone) return false;
    }

    return true;
  });

  // Actualizar conteos en tabs
  updateTabCounts();

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; color: #94a3b8;">
        <span style="font-size: 2.5rem; display: block; margin-bottom: 0.5rem;">🔍</span>
        <p style="font-weight: 600;">No se encontraron números con los filtros actuales.</p>
        <button onclick="resetFilters()" style="margin-top: 1rem; background: rgba(245,158,11,0.2); border: 1px solid #f59e0b; color: #fbbf24; padding: 0.4rem 1rem; border-radius: 9999px; cursor: pointer;">
          Mostrar todos los números
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map((ticket) => {
    const isSelected = AppState.selectedNumbers.has(ticket.number);
    let statusLabel = 'Libre';
    if (ticket.status === 'apartado') statusLabel = 'Apartado';
    if (ticket.status === 'pagado') statusLabel = 'Pagado';
    if (isSelected) statusLabel = 'Elegido';

    return `
      <div class="number-card ${ticket.status} ${isSelected ? 'selected' : ''}" 
           data-number="${ticket.number}"
           onclick="handleNumberTap('${ticket.number}')"
           role="button"
           tabindex="0"
           aria-label="Número ${ticket.number}, Estado: ${statusLabel}">
        <span class="digit">${ticket.number}</span>
        <span class="status-pill">${statusLabel}</span>
      </div>
    `;
  }).join('');
}

// ==========================================================================
// INTERACCIÓN Y SELECCIÓN INTELIGENTE DE NÚMEROS
// ==========================================================================
function handleNumberTap(number) {
  const ticket = AppState.tickets.find(t => t.number === number);
  if (!ticket) return;

  // 1. Si el número está APARTADO o PAGADO: abrir gestión directa (confirmar, liberar, boleto, WA)
  if (ticket.status === 'apartado' || ticket.status === 'pagado') {
    openNumberActionModal(ticket);
    return;
  }

  // 2. Si el número está LIBRE: permitir seleccionarlo / deseleccionarlo (o múltiples números)
  if (AppState.selectedNumbers.has(number)) {
    AppState.selectedNumbers.delete(number);
  } else {
    AppState.selectedNumbers.add(number);
  }

  updateStickyBuyBar();
  renderGrid();
}

function openNumberActionModal(ticket) {
  const modal = document.getElementById('numberActionModal');
  const numElem = document.getElementById('actionModalNumber');
  const badgeElem = document.getElementById('actionModalStatusBadge');
  const contentElem = document.getElementById('actionModalContent');

  if (!modal || !numElem || !badgeElem || !contentElem) return;

  numElem.textContent = `#${ticket.number}`;

  // Configuración de Badge según estado
  if (ticket.status === 'disponible') {
    badgeElem.textContent = 'LIBRE';
    badgeElem.style.background = 'rgba(255, 255, 255, 0.1)';
    badgeElem.style.color = '#cbd5e1';
    badgeElem.style.border = '1px solid #64748b';
  } else if (ticket.status === 'apartado') {
    badgeElem.textContent = 'APARTADO';
    badgeElem.style.background = 'rgba(249, 115, 22, 0.2)';
    badgeElem.style.color = '#fb923c';
    badgeElem.style.border = '1px solid #f97316';
  } else if (ticket.status === 'pagado') {
    badgeElem.textContent = 'PAGADO';
    badgeElem.style.background = 'rgba(16, 185, 129, 0.2)';
    badgeElem.style.color = '#34d399';
    badgeElem.style.border = '1px solid #10b981';
  }

  // Generar contenido del modal según el estado
  if (ticket.status === 'disponible') {
    contentElem.innerHTML = `
      <div class="direct-action-info-box">
        <div class="direct-info-row">
          <span>Valor Boleta:</span>
          <strong>${formatCOP(AppState.config.ticket_price || 15000)}</strong>
        </div>
        <div class="direct-info-row">
          <span>Sorteo Oficial:</span>
          <strong>${AppState.config.lottery_name} (${AppState.config.draw_date})</strong>
        </div>
      </div>

      <form id="directActionForm" onsubmit="event.preventDefault();">
        <div class="form-group" style="margin-top: 0.5rem;">
          <label for="directBuyerName">Nombre del Comprador *</label>
          <input type="text" id="directBuyerName" value="" placeholder="Ej. Camila López" autocomplete="off" required>
        </div>

        <div class="form-group">
          <label for="directBuyerPhone">WhatsApp / Teléfono *</label>
          <input type="tel" id="directBuyerPhone" value="" placeholder="Ej. 3001234567" autocomplete="off" required>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; margin-top: 1rem;">
          <button type="button" class="btn-action-apartar" onclick="saveDirectNumberAction('${ticket.number}', 'apartado')">
            <span>🟠</span> <strong>Apartar</strong>
          </button>
          <button type="button" class="btn-action-pagar" onclick="saveDirectNumberAction('${ticket.number}', 'pagado')">
            <span>🟢</span> <strong>Registrar Pago</strong>
          </button>
        </div>
      </form>
    `;
  } else if (ticket.status === 'apartado') {
    const buyerName = ticket.buyer?.name || 'No especificado';
    const buyerPhone = ticket.buyer?.phone || 'Sin registrar';
    const folio = ticket.folio || ticket.buyer?.folio || `FOLIO-${ticket.number}`;

    contentElem.innerHTML = `
      <div class="direct-action-card">
        <div class="direct-field-row">
          <span class="field-label">COMPRADOR:</span>
          <span class="field-value">${buyerName.toUpperCase()}</span>
        </div>
        <div class="direct-field-row">
          <span class="field-label">TELÉFONO:</span>
          <span class="field-value phone-val">📲 ${buyerPhone}</span>
        </div>
        <div class="direct-field-row">
          <span class="field-label">VALOR:</span>
          <span class="field-value" style="color: #fb923c;">${formatCOP(AppState.config.ticket_price || 15000)} (Apartado)</span>
        </div>
        <div class="direct-field-row">
          <span class="field-label">MEDIO PAGO:</span>
          <span class="field-value">Daviplata / Llave (322 212 7468)</span>
        </div>
        <div class="direct-field-row">
          <span class="field-label">FOLIO:</span>
          <span class="field-value folio-val">${folio}</span>
        </div>
      </div>

      <div class="direct-buttons-grid">
        <button class="btn-action-confirm" onclick="confirmPaymentDirect('${ticket.number}')">
          <span>✓</span> <strong>Confirmar</strong>
        </button>
        <button class="btn-action-release" onclick="releaseTicketDirect('${ticket.number}')">
          <span>✕</span> <strong>Liberar</strong>
        </button>
        <button class="btn-action-ticket" onclick="viewTicketDirect('${ticket.number}')">
          <span>🎟️</span> <strong>Boleto</strong>
        </button>
        <button class="btn-action-wa" onclick="sendWhatsAppDirect('${ticket.number}')">
          <span>📲</span> <strong>WA</strong>
        </button>
      </div>
    `;
  } else if (ticket.status === 'pagado') {
    const buyerName = ticket.buyer?.name || 'No especificado';
    const buyerPhone = ticket.buyer?.phone || 'Sin registrar';
    const folio = ticket.folio || ticket.buyer?.folio || `FOLIO-${ticket.number}`;

    contentElem.innerHTML = `
      <div class="direct-action-card">
        <div class="direct-field-row">
          <span class="field-label">COMPRADOR:</span>
          <span class="field-value">${buyerName.toUpperCase()}</span>
        </div>
        <div class="direct-field-row">
          <span class="field-label">TELÉFONO:</span>
          <span class="field-value phone-val">📲 ${buyerPhone}</span>
        </div>
        <div class="direct-field-row">
          <span class="field-label">ESTADO:</span>
          <span class="field-value" style="color: #34d399; font-weight: 800;">✓ PAGADO Y CONFIRMADO</span>
        </div>
        <div class="direct-field-row">
          <span class="field-label">VALOR:</span>
          <span class="field-value" style="color: #34d399;">${formatCOP(AppState.config.ticket_price || 15000)}</span>
        </div>
        <div class="direct-field-row">
          <span class="field-label">FOLIO:</span>
          <span class="field-value folio-val">${folio}</span>
        </div>
      </div>

      <div class="direct-buttons-grid">
        <button class="btn-action-ticket" onclick="viewTicketDirect('${ticket.number}')">
          <span>🎟️</span> <strong>Ver Boleto</strong>
        </button>
        <button class="btn-action-wa" onclick="sendWhatsAppDirect('${ticket.number}')">
          <span>📲</span> <strong>Reenviar WA</strong>
        </button>
        <button class="btn-action-release" style="grid-column: 1 / -1;" onclick="releaseTicketDirect('${ticket.number}')">
          <span>✕</span> <strong>Revertir / Liberar Número</strong>
        </button>
      </div>
    `;
  }

  modal.classList.add('active');
}

function closeNumberActionModal() {
  const modal = document.getElementById('numberActionModal');
  if (modal) modal.classList.remove('active');
}

async function saveDirectNumberAction(number, actionType = 'apartado') {
  const name = document.getElementById('directBuyerName')?.value.trim();
  const phone = document.getElementById('directBuyerPhone')?.value.trim();

  if (!name || name.length < 2) {
    alert('Por favor escribe el nombre completo del comprador.');
    return;
  }
  if (!phone || phone.replace(/\D/g, '').length < 7) {
    alert('Por favor escribe un número de teléfono o WhatsApp válido.');
    return;
  }

  localStorage.removeItem('rifa_user_name');
  localStorage.removeItem('rifa_user_phone');
  storeMyPhone(phone);

  const payload = {
    numbers: [number],
    buyerName: name,
    buyerPhone: phone,
    buyerCity: 'Colombia',
    paymentMethod: 'Daviplata / Llave (322 212 7468)',
    status: actionType
  };

  const appScriptUrl = getAppsScriptUrl();
  let savedFolio = `FOLIO-${Date.now().toString(36).toUpperCase()}-${number}`;

  // 1. Google Apps Script
  if (appScriptUrl) {
    try {
      fetch(appScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'reserve', ...payload })
      }).catch(e => console.warn('[App] Apps Script background save:', e));
    } catch (e) {}
  }

  // 2. Node Backend
  try {
    const res = await fetch('./api/tickets/reserve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.folio) savedFolio = json.data.folio;
    }
  } catch (err) {
    console.warn('[App] Backend offline, guardando localmente:', err);
  }

  // Actualizar en memoria local
  const ticket = AppState.tickets.find(t => t.number === number);
  if (ticket) {
    ticket.status = actionType;
    ticket.folio = savedFolio;
    ticket.buyer = {
      name,
      phone,
      folio: savedFolio,
      paymentMethod: payload.paymentMethod
    };
  }

  localStorage.setItem('rifa_kalley_cache', JSON.stringify({
    config: AppState.config,
    tickets: AppState.tickets
  }));

  closeNumberActionModal();
  renderGrid();
  updateProgressUI();

  showToast(actionType === 'pagado' ? `✅ Número #${number} registrado como PAGADO` : `🟠 Número #${number} guardado como APARTADO`);

  // Abrir boleto generado inmediatamente
  AppState.lastPurchasedTicket = {
    numbers: [number],
    buyer: ticket.buyer,
    status: actionType.toUpperCase(),
    folio: savedFolio,
    lottery: `${AppState.config.lottery_name} (${AppState.config.draw_date})`
  };
  openTicketModal(AppState.lastPurchasedTicket);
}

async function confirmPaymentDirect(number) {
  const ticket = AppState.tickets.find(t => t.number === number);
  if (!ticket) return;

  const appScriptUrl = getAppsScriptUrl();
  if (appScriptUrl) {
    try {
      fetch(appScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'confirmPayment', number })
      }).catch(e => console.warn(e));
    } catch (e) {}
  }

  try {
    await fetch(`./api/tickets/${number}/confirm`, { method: 'PUT' });
  } catch (err) {
    console.warn('[App] Backend offline al confirmar:', err);
  }

  ticket.status = 'pagado';
  localStorage.setItem('rifa_kalley_cache', JSON.stringify({
    config: AppState.config,
    tickets: AppState.tickets
  }));

  closeNumberActionModal();
  renderGrid();
  updateProgressUI();
  showToast(`✅ ¡Número #${number} confirmado como PAGADO!`);
}

async function releaseTicketDirect(number) {
  const ticket = AppState.tickets.find(t => t.number === number);
  if (!ticket) return;

  if (!confirm(`¿Estás seguro de liberar el número #${number}? Quedará libre nuevamente en el sistema.`)) {
    return;
  }

  const appScriptUrl = getAppsScriptUrl();
  if (appScriptUrl) {
    try {
      fetch(appScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'releaseTicket', number })
      }).catch(e => console.warn(e));
    } catch (e) {}
  }

  try {
    await fetch(`./api/tickets/${number}/release`, { method: 'DELETE' });
  } catch (err) {
    console.warn('[App] Backend offline al liberar:', err);
  }

  ticket.status = 'disponible';
  ticket.buyer = null;
  ticket.folio = null;
  AppState.selectedNumbers.delete(number);

  localStorage.setItem('rifa_kalley_cache', JSON.stringify({
    config: AppState.config,
    tickets: AppState.tickets
  }));

  closeNumberActionModal();
  renderGrid();
  updateProgressUI();
  showToast(`⚪ Número #${number} liberado exitosamente.`);
}

function viewTicketDirect(number) {
  const ticket = AppState.tickets.find(t => t.number === number);
  if (!ticket) return;

  const ticketData = {
    numbers: [number],
    buyer: ticket.buyer || { name: 'Participante Oficial', phone: '322 212 7468' },
    status: (ticket.status || 'pagado').toUpperCase(),
    folio: ticket.folio || ticket.buyer?.folio || `FOLIO-${ticket.number}`,
    lottery: `${AppState.config.lottery_name} (${AppState.config.draw_date})`
  };

  AppState.lastPurchasedTicket = ticketData;
  closeNumberActionModal();
  openTicketModal(ticketData);
}

async function sendWhatsAppDirect(number) {
  const ticket = AppState.tickets.find(t => t.number === number);
  if (!ticket) return;

  const ticketData = {
    numbers: [number],
    buyer: ticket.buyer || { name: 'Participante Oficial', phone: '322 212 7468' },
    status: (ticket.status || 'apartado').toUpperCase(),
    folio: ticket.folio || ticket.buyer?.folio || `FOLIO-${ticket.number}`,
    lottery: `${AppState.config.lottery_name} (${AppState.config.draw_date})`
  };

  AppState.lastPurchasedTicket = ticketData;
  showToast('📲 Preparando envío a WhatsApp...');
  await window.ticketGenerator.shareWhatsApp(ticketData);
}

function updateStickyBuyBar() {
  const bar = document.getElementById('stickyBuyBar');
  const countElem = document.getElementById('selectedCountDisplay');
  const listElem = document.getElementById('selectedListDisplay');
  const totalElem = document.getElementById('selectedTotalDisplay');

  if (!bar) return;

  const count = AppState.selectedNumbers.size;
  if (count > 0) {
    bar.classList.add('visible');
    const sorted = Array.from(AppState.selectedNumbers).sort();
    
    if (countElem) countElem.textContent = `${count} ${count === 1 ? 'número seleccionado' : 'números seleccionados'}`;
    if (listElem) {
      listElem.innerHTML = sorted.map(n => `<span class="selected-badge">#${n}</span>`).join('');
    }
    const total = count * (AppState.config.ticket_price || 15000);
    if (totalElem) totalElem.textContent = formatCOP(total);
  } else {
    bar.classList.remove('visible');
  }
}

// "Número de la Suerte" (Lucky Random Pick)
function pickLuckyNumber() {
  const availables = AppState.tickets.filter(t => t.status === 'disponible' && !AppState.selectedNumbers.has(t.number));
  if (availables.length === 0) {
    showToast('¡No hay más números libres disponibles!');
    return;
  }

  const lucky = availables[Math.floor(Math.random() * availables.length)];
  AppState.selectedNumbers.add(lucky.number);
  updateStickyBuyBar();
  renderGrid();
  showToast(`🎲 ¡Número de la suerte #${lucky.number} seleccionado!`);

  // Scroll al elemento y efecto de pulso dorado
  setTimeout(() => {
    const el = document.querySelector(`[data-number="${lucky.number}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('lucky-pulse');
      setTimeout(() => el.classList.remove('lucky-pulse'), 1600);
    }
  }, 100);
}

// ==========================================================================
// MODAL DE CHECKOUT Y COMPRA
// ==========================================================================
function openCheckoutModal() {
  if (AppState.selectedNumbers.size === 0) {
    showToast('Selecciona al menos un número para continuar.');
    return;
  }

  const modal = document.getElementById('checkoutModal');
  const numbersSpan = document.getElementById('modalSelectedNumbers');
  const totalSpan = document.getElementById('modalTotalPrice');

  const sorted = Array.from(AppState.selectedNumbers).sort();
  if (numbersSpan) numbersSpan.textContent = sorted.map(n => `#${n}`).join(', ');
  const total = sorted.length * (AppState.config.ticket_price || 15000);
  if (totalSpan) totalSpan.textContent = formatCOP(total);

  // SIEMPRE LIMPIAR POR DEFECTO: cada comprador es una persona diferente
  const inputPhone = document.getElementById('inputPhone');
  const inputName = document.getElementById('inputName');
  if (inputPhone) inputPhone.value = '';
  if (inputName) inputName.value = '';

  modal.classList.add('active');
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkoutModal');
  if (modal) modal.classList.remove('active');

  const inputPhone = document.getElementById('inputPhone');
  const inputName = document.getElementById('inputName');
  if (inputPhone) inputPhone.value = '';
  if (inputName) inputName.value = '';
}

// Enviar Reserva / Compra
async function submitReservation(actionType = 'apartado') {
  const name = document.getElementById('inputName')?.value.trim();
  const phone = document.getElementById('inputPhone')?.value.trim();
  const city = document.getElementById('inputCity')?.value.trim() || 'Colombia';
  const paymentMethod = document.getElementById('selectPaymentMethod')?.value || 'Nequi';

  if (!name || name.length < 2) {
    alert('Por favor escribe tu nombre completo.');
    return;
  }

  if (!phone || phone.replace(/\D/g, '').length < 7) {
    alert('Por favor ingresa un número de teléfono o WhatsApp válido.');
    return;
  }

  const numbers = Array.from(AppState.selectedNumbers);

  const payload = {
    numbers,
    buyerName: name,
    buyerPhone: phone,
    buyerCity: city,
    paymentMethod,
    status: actionType // 'apartado' o 'pagado'
  };

  // Limpiar memoria residual para que la próxima compra esté vacía
  localStorage.removeItem('rifa_user_name');
  localStorage.removeItem('rifa_user_phone');
  storeMyPhone(phone);

  let reservationSuccess = false;
  let responseData = null;
  const appScriptUrl = getAppsScriptUrl();

  // 1. Si hay Google Apps Script configurado
  if (appScriptUrl) {
    try {
      const res = await fetch(appScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'reserve', ...payload })
      });
      const json = await res.json();
      if (json.success) {
        reservationSuccess = true;
        responseData = json.data;
      }
    } catch (e) {
      console.warn('[App] Error enviando a Apps Script, probando backend alterno:', e);
    }
  }

  // 2. Si no hay Apps Script o falló, enviar al servidor Node.js
  if (!reservationSuccess) {
    try {
      const res = await fetch('./api/tickets/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (res.ok && json.success) {
        reservationSuccess = true;
        responseData = json.data;
      } else if (!appScriptUrl) {
        alert(json.error || 'Hubo un inconveniente al procesar la reserva.');
        return;
      }
    } catch (err) {
      console.warn('[App] Error de red en backend, procesando localmente:', err);
    }
  }

  // 3. Fallback Offline garantizado
  if (!reservationSuccess) {
    reservationSuccess = true;
    responseData = {
      folio: `FOLIO-OFFLINE-${Date.now().toString(36).toUpperCase()}`,
      status: actionType,
      numbers,
      buyer: { name, phone, city, paymentMethod },
      unitPrice: AppState.config.ticket_price,
      totalAmount: numbers.length * AppState.config.ticket_price,
      createdAt: new Date().toISOString()
    };
  }

  if (reservationSuccess) {
    // Actualizar estado en memoria
    for (const num of numbers) {
      const t = AppState.tickets.find(x => x.number === num);
      if (t) {
        t.status = actionType;
        t.buyer = responseData.buyer;
      }
    }

    // Actualizar cache local
    localStorage.setItem('rifa_kalley_cache', JSON.stringify({
      config: AppState.config,
      tickets: AppState.tickets
    }));

    // Limpiar selección y formulario
    AppState.selectedNumbers.clear();
    updateStickyBuyBar();
    renderGrid();
    updateProgressUI();
    closeCheckoutModal();

    const inputPhone = document.getElementById('inputPhone');
    const inputName = document.getElementById('inputName');
    if (inputPhone) inputPhone.value = '';
    if (inputName) inputName.value = '';

    // Guardar para el modal de boleto
    AppState.lastPurchasedTicket = {
      numbers: responseData.numbers,
      buyer: responseData.buyer,
      status: responseData.status === 'pagado' ? 'PAGADO' : 'APARTADO',
      folio: responseData.folio,
      lottery: `${AppState.config.lottery_name} (${AppState.config.draw_date})`
    };

    // Mostrar modal con el boleto generado
    openTicketModal(AppState.lastPurchasedTicket);
  }
}

// ==========================================================================
// MODAL DE VISUALIZACIÓN DEL BOLETO GENERADO (CANVAS)
// ==========================================================================
async function openTicketModal(ticketData) {
  const modal = document.getElementById('ticketModal');
  const container = document.getElementById('ticketCanvasContainer');
  if (!modal || !container) return;

  container.innerHTML = `
    <div style="text-align: center; padding: 2rem; color: #fbbf24;">
      <span style="display: block; font-size: 2rem; animation: spin 1s infinite linear;">⏳</span>
      <p style="margin-top: 0.5rem; font-weight: 700;">Generando tu boleto oficial con foto...</p>
    </div>
  `;
  modal.classList.add('active');

  const canvas = await window.ticketGenerator.generateCanvas(ticketData);
  canvas.className = 'ticket-canvas';
  canvas.style.maxHeight = '42vh';
  canvas.style.maxWidth = '100%';
  canvas.style.objectFit = 'contain';
  canvas.style.display = 'block';
  container.innerHTML = '';
  container.appendChild(canvas);
}

function closeTicketModal() {
  const modal = document.getElementById('ticketModal');
  if (modal) modal.classList.remove('active');
}

// Enviar el boleto por WhatsApp
async function handleSendWhatsApp() {
  if (!AppState.lastPurchasedTicket) return;
  showToast('📲 Preparando envío a WhatsApp...');
  await window.ticketGenerator.shareWhatsApp(AppState.lastPurchasedTicket);
}

// Descargar el boleto
async function handleDownloadTicket() {
  if (!AppState.lastPurchasedTicket) return;
  showToast('📥 Descargando boleto oficial...');
  await window.ticketGenerator.downloadTicket(AppState.lastPurchasedTicket);
}

// ==========================================================================
// MODAL DE TABLA 10x10 PARA ESTADOS DE WHATSAPP
// ==========================================================================
async function openStatusGridModal() {
  const modal = document.getElementById('statusGridModal');
  const container = document.getElementById('statusGridCanvasContainer');
  if (!modal || !container) return;

  container.innerHTML = `
    <div style="text-align: center; padding: 2.5rem; color: #fbbf24;">
      <span style="font-size: 2.5rem; display: block;">⏳</span>
      <p style="margin-top: 0.5rem; font-weight: 700;">Generando tabla 10x10 de números para tu Estado...</p>
    </div>
  `;
  modal.classList.add('active');

  const canvas = await window.ticketGenerator.generateStatusGridCanvas(AppState.tickets, AppState.config);
  canvas.className = 'ticket-canvas';
  canvas.style.maxHeight = '42vh';
  canvas.style.maxWidth = '100%';
  canvas.style.objectFit = 'contain';
  canvas.style.display = 'block';
  container.innerHTML = '';
  container.appendChild(canvas);
}

function closeStatusGridModal() {
  const modal = document.getElementById('statusGridModal');
  if (modal) modal.classList.remove('active');
}

async function handleShareStatusGrid() {
  showToast('📲 Abriendo WhatsApp para compartir estado...');
  await window.ticketGenerator.shareStatusGrid(AppState.tickets, AppState.config);
}

async function handleDownloadStatusGrid() {
  showToast('📥 Descargando imagen 10x10 para Estados...');
  await window.ticketGenerator.downloadStatusGrid(AppState.tickets, AppState.config);
}

// ==========================================================================
// UTILIDADES Y FILTROS
// ==========================================================================
function setupEventListeners() {
  // Filtros por tab
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      const target = e.currentTarget;
      target.classList.add('active');
      AppState.activeFilter = target.dataset.filter;
      renderGrid();
    });
  });

  // Búsqueda
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      AppState.searchQuery = e.target.value.trim();
      renderGrid();
    });
  }

  // Copiar cuentas bancarias con feedback visual inmediato
  document.querySelectorAll('.btn-copy-num').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const currentBtn = e.currentTarget;
      const num = currentBtn.dataset.number;
      if (num) {
        navigator.clipboard.writeText(num.replace(/\s+/g, ''));
        const originalHtml = currentBtn.innerHTML;
        currentBtn.innerHTML = '<span>✓</span> <span>¡Copiado!</span>';
        currentBtn.style.background = 'rgba(16, 185, 129, 0.3)';
        currentBtn.style.borderColor = '#10b981';
        currentBtn.style.color = '#34d399';
        showToast(`📲 Número Daviplata/Llave ${num} copiado al portapapeles`);
        setTimeout(() => {
          currentBtn.innerHTML = originalHtml;
          currentBtn.style.background = '';
          currentBtn.style.borderColor = '';
          currentBtn.style.color = '';
        }, 2200);
      }
    });
  });
}

function updateTabCounts() {
  const total = AppState.tickets.length;
  const disp = AppState.tickets.filter(t => t.status === 'disponible').length;
  const apart = AppState.tickets.filter(t => t.status === 'apartado').length;
  const pag = AppState.tickets.filter(t => t.status === 'pagado').length;
  
  const myPhones = getStoredMyPhones();
  const mis = AppState.tickets.filter(t => t.buyer && myPhones.includes(t.buyer.phone)).length;

  const countAll = document.getElementById('countAll');
  const countDisp = document.getElementById('countAvailable');
  const countApart = document.getElementById('countReserved');
  const countPag = document.getElementById('countSold');
  const countMis = document.getElementById('countMine');

  if (countAll) countAll.textContent = total;
  if (countDisp) countDisp.textContent = disp;
  if (countApart) countApart.textContent = apart;
  if (countPag) countPag.textContent = pag;
  if (countMis) countMis.textContent = mis;
}

function updateProgressUI() {
  const total = AppState.tickets.length;
  const pag = AppState.tickets.filter(t => t.status === 'pagado').length;
  const apart = AppState.tickets.filter(t => t.status === 'apartado').length;
  const libres = AppState.tickets.filter(t => t.status === 'disponible').length;
  const pct = total > 0 ? Math.round((pag / total) * 100) : 0;

  const fill = document.getElementById('progressFill');
  const text = document.getElementById('progressText');
  if (fill) fill.style.width = `${pct}%`;
  if (text) text.textContent = `${pct}% Vendido (${pag}/${total})`;

  const statLibres = document.getElementById('statLibres');
  const statApartados = document.getElementById('statApartados');
  const statPagados = document.getElementById('statPagados');
  if (statLibres) statLibres.textContent = libres;
  if (statApartados) statApartados.textContent = apart;
  if (statPagados) statPagados.textContent = pag;
}

function resetFilters() {
  AppState.activeFilter = 'todos';
  AppState.searchQuery = '';
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.filter === 'todos');
  });
  renderGrid();
}

function formatCOP(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(amount);
}

function showToast(message) {
  const toast = document.getElementById('appToast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 3200);
}

function getStoredMyPhones() {
  const stored = localStorage.getItem('rifa_user_phones');
  return stored ? JSON.parse(stored) : [];
}

function storeMyPhone(phone) {
  const phones = getStoredMyPhones();
  if (!phones.includes(phone)) {
    phones.push(phone);
    localStorage.setItem('rifa_user_phones', JSON.stringify(phones));
  }
}

