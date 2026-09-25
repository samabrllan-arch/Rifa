/**
 * GENERADOR GRÁFICO MODERNO DE BOLETOS Y TABLA 10x10 PARA ESTADOS DE WHATSAPP
 * Gran Rifa: Olla Multifuncional Kalley + $200.000 COP en Efectivo
 * Lotería de Boyacá - 14 de Noviembre | Boleta: $15.000 | Daviplata/Llave: 322 212 7468
 */

class TicketGenerator {
  constructor() {
    this.potImage = new Image();
    this.potImage.crossOrigin = 'anonymous';
    this.potImage.src = './img/olla-kalley.png';
    this.isImageLoaded = false;

    this.potImage.onload = () => {
      this.isImageLoaded = true;
    };
  }

  async ensureImageLoaded() {
    if (this.isImageLoaded && this.potImage.complete) return true;
    return new Promise((resolve) => {
      this.potImage.onload = () => {
        this.isImageLoaded = true;
        resolve(true);
      };
      this.potImage.onerror = () => {
        console.warn('No se pudo cargar la imagen de la olla');
        resolve(false);
      };
    });
  }

  // ==========================================================================
  // 1. BOLETO INDIVIDUAL VIP (ULTRA MODERNO Y COOL)
  // ==========================================================================
  async generateCanvas(ticketData) {
    await this.ensureImageLoaded();

    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1420;
    const ctx = canvas.getContext('2d');

    const {
      numbers = ['00'],
      buyer = { name: 'Participante Oficial', phone: '3222127468' },
      status = 'PAGADO',
      folio = 'FOLIO-' + Date.now().toString(36).toUpperCase(),
      lottery = 'Lotería de Boyacá (14 de Noviembre)',
      date = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
    } = ticketData;

    // 1. Fondo Midnight Obsidian con aura dorada y violeta
    const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bg.addColorStop(0, '#0a0e17');
    bg.addColorStop(0.3, '#0e172a');
    bg.addColorStop(0.7, '#111c33');
    bg.addColorStop(1, '#080c14');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Círculos de luz ambiental (Glow moderno)
    this.drawGlowCircle(ctx, 200, 200, 350, 'rgba(245, 158, 11, 0.12)');
    this.drawGlowCircle(ctx, 800, 700, 400, 'rgba(56, 189, 248, 0.08)');
    this.drawGlowCircle(ctx, 500, 1200, 450, 'rgba(245, 158, 11, 0.1)');

    // 2. Marco VIP Moderno con Bordes Pulidos
    ctx.save();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 3;
    this.roundRect(ctx, 35, 35, canvas.width - 70, canvas.height - 70, 28, false, true);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    this.roundRect(ctx, 45, 45, canvas.width - 90, canvas.height - 90, 22, false, true);
    ctx.restore();

    // 3. Encabezado de Lujo
    ctx.textAlign = 'center';
    
    // Tag superior
    ctx.fillStyle = '#f59e0b';
    ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText('✦ CERTIFICADO OFICIAL DE PARTICIPACIÓN ✦', canvas.width / 2, 95);
    ctx.letterSpacing = '0px'; // Reset inmediato

    // Título Principal
    const titleGrad = ctx.createLinearGradient(150, 110, 850, 150);
    titleGrad.addColorStop(0, '#ffffff');
    titleGrad.addColorStop(0.5, '#fbbf24');
    titleGrad.addColorStop(1, '#f59e0b');
    ctx.fillStyle = titleGrad;
    ctx.font = '900 48px "Outfit", sans-serif';
    ctx.fillText('GRAN RIFA OFICIAL', canvas.width / 2, 152);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`JUEGA CON: ${lottery.toUpperCase()}`, canvas.width / 2, 195);

    // Línea de brillo
    const lineGrad = ctx.createLinearGradient(150, 0, 850, 0);
    lineGrad.addColorStop(0, 'rgba(245, 158, 11, 0)');
    lineGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.6)');
    lineGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(150, 220);
    ctx.lineTo(850, 220);
    ctx.stroke();

    // 4. PREMIO PRINCIPAL CON LA FOTO DE LA OLLA KALLEY (DISEÑO ULTRA VIP)
    if (this.isImageLoaded) {
      const centerX = canvas.width / 2;
      const haloY = 405;

      // Halo de luz cinematográfica dual (Oro + Cyan metálico)
      const haloGrad = ctx.createRadialGradient(centerX, haloY, 20, centerX, haloY, 230);
      haloGrad.addColorStop(0, 'rgba(245, 158, 11, 0.38)');
      haloGrad.addColorStop(0.45, 'rgba(217, 119, 6, 0.18)');
      haloGrad.addColorStop(0.75, 'rgba(56, 189, 248, 0.12)');
      haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(centerX, haloY, 230, 0, Math.PI * 2);
      ctx.fill();

      // Pedestal 3D de exhibición VIP
      this.drawPodium(ctx, centerX, 550, 420, 52);

      // Destellos y brillos dorados flotantes alrededor de la olla
      this.drawSparkle(ctx, centerX - 190, 310, 16, '#fde68a');
      this.drawSparkle(ctx, centerX + 195, 290, 18, '#fbbf24');
      this.drawSparkle(ctx, centerX - 180, 475, 13, '#ffffff');
      this.drawSparkle(ctx, centerX + 185, 465, 15, '#fde68a');

      // Imagen de la olla con sombra realista
      const imgWidth = 360;
      const imgHeight = 360;
      const imgX = (canvas.width - imgWidth) / 2;
      const imgY = 225;

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 38;
      ctx.shadowOffsetY = 14;
      ctx.drawImage(this.potImage, imgX, imgY, imgWidth, imgHeight);
      ctx.restore();

      // Mini badge de especificaciones técnicas
      const techBadgeW = 340;
      const techBadgeH = 26;
      const techBadgeX = (canvas.width - techBadgeW) / 2;
      const techBadgeY = 560;
      ctx.fillStyle = 'rgba(10, 15, 29, 0.9)';
      this.roundRect(ctx, techBadgeX, techBadgeY, techBadgeW, techBadgeH, 13, true, false);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)';
      ctx.lineWidth = 1.2;
      this.roundRect(ctx, techBadgeX, techBadgeY, techBadgeW, techBadgeH, 13, false, true);

      ctx.fillStyle = '#fde68a';
      ctx.font = '800 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('✦ 14 FUNCIONES DIGITALES • ACERO INOXIDABLE ✦', canvas.width / 2, techBadgeY + 17);
    }

    // 5. BADGE DESTACADO: "+ $200.000 COP EN EFECTIVO"
    const badgeW = 760;
    const badgeH = 68;
    const badgeX = (canvas.width - badgeW) / 2;
    const badgeY = 605;

    // Fondo del badge con gradiente oro brillante
    const badgeGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeW, badgeY + badgeH);
    badgeGrad.addColorStop(0, '#f59e0b');
    badgeGrad.addColorStop(0.3, '#fde68a');
    badgeGrad.addColorStop(0.7, '#fbbf24');
    badgeGrad.addColorStop(1, '#d97706');
    ctx.fillStyle = badgeGrad;
    this.roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 34, true, false);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    this.roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 34, false, true);

    ctx.fillStyle = '#0a0f1d';
    ctx.font = '900 28px "Outfit", sans-serif';
    ctx.fillText('OLLA KALLEY + $200.000 EN EFECTIVO', canvas.width / 2, badgeY + 44);

    // 6. CAJA DE NÚMEROS ASIGNADOS
    const numBoxW = 860;
    const numBoxH = 220;
    const numBoxX = (canvas.width - numBoxW) / 2;
    const numBoxY = 705;

    // Fondo glassmorphic
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    this.roundRect(ctx, numBoxX, numBoxY, numBoxW, numBoxH, 22, true, false);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
    ctx.lineWidth = 2.5;
    this.roundRect(ctx, numBoxX, numBoxY, numBoxW, numBoxH, 22, false, true);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 21px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('TU NÚMERO ASIGNADO EN LA RIFA:', canvas.width / 2, numBoxY + 44);

    // Número(s) gigante(s) estilo metálico dorado 3D
    const numbersStr = Array.isArray(numbers) ? numbers.join('  •  ') : String(numbers);
    const numGrad = ctx.createLinearGradient(0, numBoxY + 60, 0, numBoxY + 160);
    numGrad.addColorStop(0, '#ffffff');
    numGrad.addColorStop(0.4, '#fde047');
    numGrad.addColorStop(1, '#f59e0b');
    ctx.fillStyle = numGrad;
    
    const fontSize = numbers.length > 4 ? 54 : (numbers.length > 2 ? 70 : 92);
    ctx.font = `900 ${fontSize}px "Outfit", monospace`;
    ctx.save();
    ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
    ctx.shadowBlur = 25;
    ctx.fillText(numbersStr, canvas.width / 2, numBoxY + 140);
    ctx.restore();

    ctx.fillStyle = status === 'pagado' || status === 'PAGADO' ? '#34d399' : '#fbbf24';
    ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`✓ ESTADO: ${status.toUpperCase()} (REGISTRADO EN SISTEMA)`, canvas.width / 2, numBoxY + 196);

    // 7. DATOS DEL COMPRADOR Y PAGO
    const infoY = 950;
    ctx.textAlign = 'left';

    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    this.roundRect(ctx, numBoxX, infoY, numBoxW, 255, 18, true, false);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    this.roundRect(ctx, numBoxX, infoY, numBoxW, 255, 18, false, true);

    const leftCol = numBoxX + 45;
    const rightCol = numBoxX + 460;
    // Fila 1: Titular
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('PARTICIPANTE TITULAR:', leftCol, infoY + 45);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px "Outfit", sans-serif';
    ctx.fillText(buyer.name.toUpperCase(), leftCol, infoY + 85);

    // Fila 2: WhatsApp & Pago
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('TELÉFONO / WHATSAPP:', leftCol, infoY + 140);
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(buyer.phone, leftCol, infoY + 172);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('MEDIO AUTORIZADO:', rightCol, infoY + 140);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Daviplata / Llave (322 212 7468)', rightCol, infoY + 172);

    // Fila 3: Estado
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 17px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('🔒 COMPROBANTE OFICIAL CERTIFICADO', leftCol, infoY + 225);

    // 8. PIE DEL BOLETO (sin código de barras)
    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748b';
    ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Conserva este boleto digital. El ganador se verifica con documento de identidad.', canvas.width / 2, 1265);

    return canvas;
  }

  // ==========================================================================
  // 2. TABLA 10x10 PARA ESTADOS DE WHATSAPP (1080 x 1920 PORTRAIT)
  // ==========================================================================
  async generateStatusGridCanvas(tickets = [], config = {}) {
    await this.ensureImageLoaded();

    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920; // 9:16 vertical ratio ideal para WhatsApp Status y Stories
    const ctx = canvas.getContext('2d');

    // 1. Fondo Midnight Luxury con aura
    const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bg.addColorStop(0, '#080d1a');
    bg.addColorStop(0.25, '#0f172a');
    bg.addColorStop(0.7, '#0b1120');
    bg.addColorStop(1, '#05070d');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Auras de iluminación
    this.drawGlowCircle(ctx, 540, 300, 450, 'rgba(245, 158, 11, 0.15)');
    this.drawGlowCircle(ctx, 200, 1100, 500, 'rgba(56, 189, 248, 0.08)');
    this.drawGlowCircle(ctx, 880, 1100, 500, 'rgba(245, 158, 11, 0.1)');

    // Marco exterior con bordes dorados
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    this.roundRect(ctx, 30, 30, canvas.width - 60, canvas.height - 60, 32, false, true);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, 42, 42, canvas.width - 84, canvas.height - 84, 24, false, true);

    // 2. Encabezado de la Rifa
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f59e0b';
    ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '5px';
    ctx.fillText('✦ GRAN RIFA OFICIAL ✦', canvas.width / 2, 95);
    ctx.letterSpacing = '0px'; // Reset inmediato obligatorio

    // Título Principal
    const titleGrad = ctx.createLinearGradient(100, 110, 980, 110);
    titleGrad.addColorStop(0, '#ffffff');
    titleGrad.addColorStop(0.5, '#fbbf24');
    titleGrad.addColorStop(1, '#f59e0b');
    ctx.fillStyle = titleGrad;
    ctx.font = '900 52px "Outfit", sans-serif';
    ctx.fillText('OLLA MULTIFUNCIONAL KALLEY', canvas.width / 2, 160);

    // 3. Mini visual con la Olla, Pedestal 3D y el Badge de 200K
    if (this.isImageLoaded) {
      const centerX = canvas.width / 2;

      // Halo de luz cinematográfica
      const haloGrad = ctx.createRadialGradient(centerX, 280, 20, centerX, 280, 210);
      haloGrad.addColorStop(0, 'rgba(245, 158, 11, 0.4)');
      haloGrad.addColorStop(0.5, 'rgba(217, 119, 6, 0.18)');
      haloGrad.addColorStop(0.75, 'rgba(56, 189, 248, 0.1)');
      haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(centerX, 280, 210, 0, Math.PI * 2);
      ctx.fill();

      // Pedestal 3D de exhibición VIP
      this.drawPodium(ctx, centerX, 375, 310, 42);

      // Destellos dorados flotantes alrededor de la olla
      this.drawSparkle(ctx, centerX - 140, 230, 15, '#fde68a');
      this.drawSparkle(ctx, centerX + 145, 215, 16, '#fbbf24');
      this.drawSparkle(ctx, centerX - 130, 345, 11, '#ffffff');
      this.drawSparkle(ctx, centerX + 135, 335, 13, '#fde68a');

      const potW = 220;
      const potH = 220;
      const potX = (canvas.width - potW) / 2;
      const potY = 175;

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.92)';
      ctx.shadowBlur = 32;
      ctx.shadowOffsetY = 12;
      ctx.drawImage(this.potImage, potX, potY, potW, potH);
      ctx.restore();
    }

    // Badge "+ $200.000 COP EN EFECTIVO"
    const badgeW = 760;
    const badgeH = 68;
    const badgeX = (canvas.width - badgeW) / 2;
    const badgeY = 410;

    const bGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeW, badgeY + badgeH);
    bGrad.addColorStop(0, '#f59e0b');
    bGrad.addColorStop(0.3, '#fde68a');
    bGrad.addColorStop(1, '#d97706');
    ctx.fillStyle = bGrad;
    this.roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 34, true, false);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    this.roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 34, false, true);

    ctx.fillStyle = '#0a0f1d';
    ctx.font = '900 32px "Outfit", sans-serif';
    ctx.fillText('💰 + $200.000 COP EN EFECTIVO 💰', canvas.width / 2, badgeY + 46);

    // Datos del Sorteo
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Lotería de Boyacá • 14 de Noviembre • Boleta: $15.000', canvas.width / 2, 515);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('📲 PAGA POR DAVIPLATA O LLAVE AL: 322 212 7468', canvas.width / 2, 555);

    // 4. Barra de Conteo (Libres vs Vendidos)
    const ticketsMap = new Map();
    tickets.forEach(t => ticketsMap.set(String(t.number).padStart(2, '0'), t));

    let libresCount = 0;
    let ocupadosCount = 0;
    for (let i = 0; i < 100; i++) {
      const numStr = String(i).padStart(2, '0');
      const t = ticketsMap.get(numStr);
      if (t && (t.status === 'pagado' || t.status === 'apartado')) {
        ocupadosCount++;
      } else {
        libresCount++;
      }
    }

    const statBoxY = 595;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    this.roundRect(ctx, 100, statBoxY, 880, 52, 26, true, false);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    this.roundRect(ctx, 100, statBoxY, 880, 52, 26, false, true);

    ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`⚪ NÚMEROS LIBRES: ${libresCount}`, 320, statBoxY + 34);
    ctx.fillStyle = '#ef4444';
    ctx.fillText(`🔴 NÚMEROS OCUPADOS (X): ${ocupadosCount}`, 740, statBoxY + 34);

    // 5. CUADRÍCULA 10x10 DE NÚMEROS (00 a 99) - CON X ROJITA Y YA
    const gridStartX = 90;
    const gridStartY = 675;
    const cellSize = 84;
    const cellGap = 7;

    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const numIndex = row * 10 + col;
        const numStr = String(numIndex).padStart(2, '0');
        const x = gridStartX + col * (cellSize + cellGap);
        const y = gridStartY + row * (cellSize + cellGap);

        const ticket = ticketsMap.get(numStr);
        const isOccupied = ticket && (ticket.status === 'pagado' || ticket.status === 'apartado');

        if (isOccupied) {
          // OCUPADO: FONDO OSCURO + NÚMERO + X ROJITA Y YA (SIN TEXTOS DE APARTADO)
          ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
          this.roundRect(ctx, x, y, cellSize, cellSize, 12, true, false);
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.lineWidth = 1.5;
          this.roundRect(ctx, x, y, cellSize, cellSize, 12, false, true);

          ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
          ctx.font = '800 28px "Outfit", monospace';
          ctx.fillText(numStr, x + cellSize / 2, y + cellSize / 2 + 10);

          // X ROJITA VIBRANTE Y GRUESA
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(x + 18, y + 18);
          ctx.lineTo(x + cellSize - 18, y + cellSize - 18);
          ctx.moveTo(x + cellSize - 18, y + 18);
          ctx.lineTo(x + 18, y + cellSize - 18);
          ctx.stroke();
        } else {
          // LIBRE: FONDO ELEGANTE NEUTRO Y LIMPIO
          ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
          this.roundRect(ctx, x, y, cellSize, cellSize, 12, true, false);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = 1;
          this.roundRect(ctx, x, y, cellSize, cellSize, 12, false, true);

          ctx.fillStyle = '#ffffff';
          ctx.font = '800 28px "Outfit", monospace';
          ctx.fillText(numStr, x + cellSize / 2, y + cellSize / 2 + 10);
        }
      }
    }

    // 6. PIE DEL ESTADO DE WHATSAPP (CON CONTENCIÓN EXACTA DENTRO DEL CUADRITO)
    const footY = 1630;
    ctx.textAlign = 'center';
    ctx.letterSpacing = '0px';

    // Banner de llamado a la acción centrado y amplio
    const boxW = 920;
    const boxH = 140;
    const boxX = (canvas.width - boxW) / 2;
    ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
    this.roundRect(ctx, boxX, footY, boxW, boxH, 20, true, false);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    this.roundRect(ctx, boxX, footY, boxW, boxH, 20, false, true);

    // Ajuste dinámico de tamaño para que NUNCA desborde el marco
    const bannerPhrase = '¡ELIGE TU NÚMERO ANTES DE QUE SE AGOTEN!';
    let bSize = 27;
    ctx.font = `900 ${bSize}px "Outfit", sans-serif`;
    while (ctx.measureText(bannerPhrase).width > 830 && bSize > 16) {
      bSize -= 1;
      ctx.font = `900 ${bSize}px "Outfit", sans-serif`;
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillText(bannerPhrase, canvas.width / 2, footY + 52);

    ctx.fillStyle = '#fbbf24';
    ctx.font = '800 27px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('📲 Escríbeme o Llama al: 322 212 7468', canvas.width / 2, footY + 102);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Tu boleto oficial se te envía inmediatamente por WhatsApp', canvas.width / 2, 1830);

    return canvas;
  }

  // ==========================================================================
  // HELPERS DE COMPARTIR Y DESCARGAR
  // ==========================================================================
  drawGlowCircle(ctx, x, y, radius, color) {
    ctx.save();
    const g = ctx.createRadialGradient(x, y, 10, x, y, radius);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawBarcode(ctx, x, y, width, height) {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    let curX = x;
    const barWidths = [2, 4, 1, 3, 5, 2, 3, 1, 4, 2, 5, 1, 3, 2, 4, 1, 3, 5];
    let i = 0;
    while (curX < x + width) {
      const w = barWidths[i % barWidths.length];
      if (i % 2 === 0) {
        ctx.fillRect(curX, y, w, height);
      }
      curX += w + 2;
      i++;
    }
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('* KALLEY-200K-BOYACA-2026 *', x + width / 2, y + height + 18);
    ctx.restore();
  }

  drawSecurityStamp(ctx, x, y, radius) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, radius - 6, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 12px "Outfit", sans-serif';
    ctx.fillText('ORIGINAL', x, y - 10);
    ctx.font = '900 17px "Outfit", sans-serif';
    ctx.fillText('★ 100% ★', x, y + 8);
    ctx.font = 'bold 10px "Outfit", sans-serif';
    ctx.fillText('VERIFICADO', x, y + 25);
    ctx.restore();
  }

  // Destellos estelares dorados de lujo
  drawSparkle(ctx, x, y, size, color = '#fde68a') {
    ctx.save();
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.quadraticCurveTo(x, y, x + size, y);
    ctx.quadraticCurveTo(x, y, x, y + size);
    ctx.quadraticCurveTo(x, y, x - size, y);
    ctx.quadraticCurveTo(x, y, x, y - size);
    ctx.fill();
    ctx.restore();
  }

  // Pedestal 3D iluminado de exhibición para la Olla
  drawPodium(ctx, centerX, centerY, width, height) {
    ctx.save();
    // 1. Sombra bajo el pedestal
    const shadowGrad = ctx.createRadialGradient(centerX, centerY + 8, 10, centerX, centerY + 8, width * 0.65);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
    shadowGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.55)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 8, width * 0.65, height * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Base elíptica de exhibición con gradiente metálico
    const baseGrad = ctx.createLinearGradient(centerX - width / 2, centerY, centerX + width / 2, centerY);
    baseGrad.addColorStop(0, 'rgba(217, 119, 6, 0.3)');
    baseGrad.addColorStop(0.3, 'rgba(251, 191, 36, 0.65)');
    baseGrad.addColorStop(0.5, 'rgba(254, 240, 138, 0.9)');
    baseGrad.addColorStop(0.7, 'rgba(251, 191, 36, 0.65)');
    baseGrad.addColorStop(1, 'rgba(217, 119, 6, 0.3)');

    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, width / 2, height / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Borde de luz oro
    ctx.strokeStyle = baseGrad;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Anillo de brillo interno
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, width * 0.38, height * 0.38, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  async getCanvasBlob(canvas) {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png', 0.98);
    });
  }

  async triggerFileDownload(canvas, fileName) {
    try {
      const dataUrl = canvas.toDataURL('image/png', 0.98);

      // 1. Método Principal (100% infalible en Microsoft Edge y Chromium):
      // POST a /api/download-image con iframe invisible para forzar
      // Content-Disposition: attachment; filename="nombre.png"
      let iframe = document.getElementById('rifa_download_iframe');
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'rifa_download_iframe';
        iframe.name = 'rifa_download_iframe';
        iframe.style.position = 'fixed';
        iframe.style.top = '-9999px';
        iframe.style.left = '-9999px';
        iframe.style.width = '1px';
        iframe.style.height = '1px';
        iframe.style.opacity = '0';
        iframe.style.pointerEvents = 'none';
        document.body.appendChild(iframe);
      }

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '/api/download-image';
      form.target = 'rifa_download_iframe';
      form.style.display = 'none';

      const fileInput = document.createElement('input');
      fileInput.type = 'hidden';
      fileInput.name = 'fileName';
      fileInput.value = fileName;
      form.appendChild(fileInput);

      const dataInput = document.createElement('input');
      dataInput.type = 'hidden';
      dataInput.name = 'imageBase64';
      dataInput.value = dataUrl;
      form.appendChild(dataInput);

      document.body.appendChild(form);
      form.submit();

      setTimeout(() => {
        if (form.parentNode) form.parentNode.removeChild(form);
      }, 3000);
      return;
    } catch (serverErr) {
      console.warn('Descarga por endpoint falló, recurriendo a File/Blob:', serverErr);
    }

    // 2. Fallback offline: File object con nombre explícito
    try {
      const blob = await this.getCanvasBlob(canvas);
      const file = new File([blob], fileName, { type: 'image/png' });
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.download = fileName;
      a.href = url;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (a.parentNode) document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 60000);
    } catch (blobErr) {
      console.error('Error total al descargar imagen:', blobErr);
    }
  }

  async downloadTicket(ticketData) {
    const canvas = await this.generateCanvas(ticketData);
    const numbersTag = Array.isArray(ticketData.numbers) ? ticketData.numbers.join('-') : (ticketData.numbers || '00');
    const fileName = `Boleto-Gran-Rifa-Kalley-${numbersTag}.png`;
    await this.triggerFileDownload(canvas, fileName);
  }

  async shareWhatsApp(ticketData) {
    const canvas = await this.generateCanvas(ticketData);
    const blob = await this.getCanvasBlob(canvas);
    const numbersStr = Array.isArray(ticketData.numbers) ? ticketData.numbers.join(', ') : ticketData.numbers;
    const buyerName = ticketData.buyer?.name || 'Amigo(a)';
    const cleanPhone = (ticketData.buyer?.phone || '').replace(/\D/g, '');
    const phoneWithCode = cleanPhone.startsWith('57') ? cleanPhone : `57${cleanPhone}`;

    const textMessage = 
`🎉 *¡HOLA ${buyerName.toUpperCase()}!* 🎉
Aquí tienes tu Boleto Oficial de la *Gran Rifa*:

🥘 *PREMIO:* Espectacular *Olla Multifuncional Kalley Digital*
💰 *MÁS:* *$200.000 COP EN EFECTIVO*

🎟️ *TU NÚMERO ASIGNADO:* *[ ${numbersStr} ]*
📅 *Sorteo:* Lotería de Boyacá - 14 de Noviembre
💰 *Valor:* $15.000 COP
📲 *Pago Daviplata / Llave:* 322 212 7468
✅ *Estado:* ${ticketData.status ? ticketData.status.toUpperCase() : 'CONFIRMADO'}
📋 *Folio:* ${ticketData.folio || 'FOLIO-OFICIAL'}

¡Mucha suerte! 🍀✨`;

    const fileName = `Boleto-Gran-Rifa-Kalley-${numbersStr.replace(/,\s*/g, '_')}.png`;
    const file = new File([blob], fileName, { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Boleto Gran Rifa Kalley + 200k',
          text: textMessage
        });
        return { success: true };
      } catch (err) {
        if (err.name === 'AbortError') return { success: true };
      }
    }

    // Fallback: descargar imagen y abrir WhatsApp
    this.downloadTicket(ticketData);
    const encodedText = encodeURIComponent(textMessage);
    const waUrl = cleanPhone.length >= 7 
      ? `https://api.whatsapp.com/send?phone=${phoneWithCode}&text=${encodedText}`
      : `https://api.whatsapp.com/send?text=${encodedText}`;

    window.open(waUrl, '_blank');
    return { success: true };
  }

  // Descargar y compartir la tabla 10x10 para Estados
  async downloadStatusGrid(tickets, config) {
    const canvas = await this.generateStatusGridCanvas(tickets, config);
    const fileName = `Tabla-10x10-Rifa-Kalley-Estados.png`;
    await this.triggerFileDownload(canvas, fileName);
  }

  async shareStatusGrid(tickets, config) {
    const canvas = await this.generateStatusGridCanvas(tickets, config);
    const blob = await this.getCanvasBlob(canvas);
    const file = new File([blob], 'Tabla-10x10-Rifa-Kalley.png', { type: 'image/png' });

    const shareText = 
`🥘 *GRAN RIFA: OLLA KALLEY + $200.000 EN EFECTIVO* 💰
📅 Juega con la Lotería de Boyacá - 14 de Noviembre
🎟️ Valor Boleta: $15.000 COP
📲 Daviplata o Llave al: 322 212 7468

¡Mira en la imagen los números que quedan libres y aparta el tuyo ya mismo! 🍀`;

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Tabla de Números - Gran Rifa Kalley',
          text: shareText
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    // Fallback: descargar y abrir WhatsApp
    this.downloadStatusGrid(tickets, config);
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank');
  }
}

window.ticketGenerator = new TicketGenerator();
