import { createIcons, icons } from 'lucide';
import confetti from 'canvas-confetti';
import heic2any from 'heic2any';
import QRCode from 'qrcode';

// Initialize Lucide Icons
createIcons({ icons });

// Titles Generator Bank
const TITLES_BY_STACK = {
  'MERN | PYTHON': [
    'Commit Machine',
    'Fullstack Shaman',
    'API Pipeline Warlock',
    'Async Event Loop Demon'
  ],
  'FULL-STACK AKA VIBE CODING FINAL BOSS': [
    'Marathon Surfing Captain',
    'Vibe Coding Final Boss',
    'Zero-Latency Shipping Engine',
    '100x Prompt Engineer'
  ],
  'AI / LLM ENGINEER': [
    'Hyper-Scale Neural Architect',
    'Latent Space Explorer',
    'Synthetic Agent Master',
    'GPU Cluster Whisperer'
  ],
  'SOLANA / RUST DEV': [
    'SVM Kernel Alchemist',
    'High-TPS Block Builder',
    'Zero-Cost Abstraction Purist',
    'Smart Contract Sentinel'
  ],
  'PRODUCT DESIGNER': [
    'Spatial UI & Glass Architect',
    'Pixel-Perfect Delight Engineer',
    'Design System Maestro',
    'Micro-Animation Wizard'
  ],
  'FOUNDER / HACKER': [
    'Zero-to-One Speedrunner',
    'Goa Hackathon Legend',
    'Relentless Builder',
    'Ship From Paradise Operator'
  ]
};

// HH Goa Brand Palette
const BRAND = {
  green: '#0d3b2e',
  greenDark: '#07221a',
  greenCard: '#0a3426',
  cream: '#f7f4e9',
  pink: '#ff007a',
  yellow: '#ffd000',
  textDark: '#0d3b2e',
  textMuted: '#a3c2b8'
};

// Helper: Generate Random Serial ID
function getRandomSerial() {
  return `#HH-GOA-${Math.floor(1000 + Math.random() * 9000)}`;
}

// App State
const state = {
  format: 'formatB',
  mode: 'card', // 'card' | 'pfp'
  activeSurface: 'front', // 'front' | 'back'
  is3D: false,
  userImage: null,
  isImageLoaded: false,
  
  // Transform
  zoom: 1.0,
  panX: 0,
  panY: 0,
  rotation: 0,
  
  // Adjustments & Filters
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  presetFilter: 'none',
  
  // Builder ID Details
  name: '',
  team: '',
  linkedinUrl: '',
  qrImage: null,
  stack: '',
  customRole: '',
  title: '',
  shipping: '',
  beachBagTags: [],
  idNumber: getRandomSerial(), // Readonly random serial
  hashtag: '#HackerHouseGoa2026',
  
  // SynthID AI Watermark
  synthIDEnabled: true,
  synthIDStyle: 'verified',
  
  // Canvas Mouse Dragging
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,
  panStartX: 0,
  panStartY: 0,

  // Active rendered blob for download/preview
  activeBlob: null
};

// DOM Elements
const canvas = document.getElementById('graphicCanvas');
const mainCtx = canvas.getContext('2d');
const canvasContainer = document.getElementById('canvasContainer') || document.querySelector('.canvas-container');

const formatSwitcher = document.getElementById('formatSwitcher');
const quickRolePills = document.getElementById('quickRolePills');
const flipCardBtn = document.getElementById('flipCardBtn');
const flipLabel = document.getElementById('flipLabel');
const toggle3DBtn = document.getElementById('toggle3DBtn');

const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

const photoInput = document.getElementById('photoInput');
const dropZone = document.getElementById('dropZone');
const sliderZoom = document.getElementById('sliderZoom');
const valZoom = document.getElementById('valZoom');
const sliderPanX = document.getElementById('sliderPanX');
const sliderPanY = document.getElementById('sliderPanY');
const rotateBtn = document.getElementById('rotateBtn');
const centerBtn = document.getElementById('centerBtn');
const resetTransformBtn = document.getElementById('resetTransformBtn');

const inputName = document.getElementById('inputName');
const inputTeam = document.getElementById('inputTeam');
const inputLinkedin = document.getElementById('inputLinkedin');
const selectStack = document.getElementById('selectStack');
const customRoleWrapper = document.getElementById('customRoleWrapper');
const inputCustomRole = document.getElementById('inputCustomRole');
const inputTitle = document.getElementById('inputTitle');
const randomizeTitleBtn = document.getElementById('randomizeTitleBtn');
const inputShipping = document.getElementById('inputShipping');
const beachBagTags = document.getElementById('beachBagTags');
const inputIdNumber = document.getElementById('inputIdNumber');
const regenSerialBtn = document.getElementById('regenSerialBtn');

const presetsGrid = document.getElementById('presetsGrid');
const sliderBrightness = document.getElementById('sliderBrightness');
const valBrightness = document.getElementById('valBrightness');
const sliderContrast = document.getElementById('sliderContrast');
const valContrast = document.getElementById('valContrast');
const sliderSaturation = document.getElementById('sliderSaturation');
const valSaturation = document.getElementById('valSaturation');
const sliderBlur = document.getElementById('sliderBlur');
const valBlur = document.getElementById('valBlur');
const resetAdjustmentsBtn = document.getElementById('resetAdjustmentsBtn');

const downloadBtn = document.getElementById('downloadBtn');
const shareXBtn = document.getElementById('shareXBtn');
const copyClipboardBtn = document.getElementById('copyClipboardBtn');

// Download Modal Elements
const downloadModal = document.getElementById('downloadModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalLoadingState = document.getElementById('modalLoadingState');
const modalReadyState = document.getElementById('modalReadyState');
const progressFill = document.getElementById('progressFill');
const modalPreviewImg = document.getElementById('modalPreviewImg');
const modalDirectDownloadBtn = document.getElementById('modalDirectDownloadBtn');
const modalOpenTabBtn = document.getElementById('modalOpenTabBtn');

// Dynamic QR Code Generator
async function generateQRCode(url) {
  if (!url) {
    state.qrImage = null;
    renderCanvas();
    return;
  }
  try {
    const dataUrl = await QRCode.toDataURL(url, {
      margin: 1,
      color: {
        dark: '#0d3b2e',
        light: '#ffffff'
      }
    });
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      state.qrImage = img;
      renderCanvas();
    };
  } catch (err) {
    console.error('QR code generation error:', err);
  }
}

// Initialize App Canvas
function initCanvas() {
  if (inputIdNumber) inputIdNumber.value = state.idNumber;
  renderCanvas();
}

// Master Render Router
function renderCanvas() {
  if (state.mode === 'pfp') {
    canvas.width = 1000;
    canvas.height = 1000;
    canvasContainer.classList.remove('aspect-card');
    canvasContainer.classList.add('square-aspect');
  } else {
    canvas.width = 1000;
    canvas.height = 1580;
    canvasContainer.classList.remove('square-aspect');
    canvasContainer.classList.add('aspect-card');
  }

  const W = canvas.width;
  const H = canvas.height;
  mainCtx.clearRect(0, 0, W, H);

  if (state.mode === 'pfp') {
    renderPFPFrame(mainCtx, W, H);
  } else if (state.activeSurface === 'back') {
    renderCardBack(mainCtx, W, H);
  } else {
    renderFormatB_BuilderID(mainCtx, W, H);
  }
}

// -------------------------------------------------------------
// FRONT SURFACE: DARK TROPICAL PALM BUILDER ID
// -------------------------------------------------------------
function renderFormatB_BuilderID(c, W, H) {
  // 1. Dark Tropical Forest Green Background
  c.fillStyle = BRAND.greenDark;
  c.fillRect(0, 0, W, H);

  // Subtle Background Radial Glow
  const grad = c.createRadialGradient(W / 2, H / 3, 50, W / 2, H / 3, 650);
  grad.addColorStop(0, 'rgba(13, 59, 46, 0.9)');
  grad.addColorStop(1, 'rgba(7, 34, 26, 1)');
  c.fillStyle = grad;
  c.fillRect(0, 0, W, H);

  // Render Arching Tropical Palm Tree Borders along the 4 edges
  drawPalmBorderFrame(c, W, H);

  // 2. Top Header Banner: HACKER [गोवा] HOUSE
  const topY = 45;
  c.textAlign = 'center';

  // "HACKER HOUSE" Condensed Golden Serif Logo
  c.fillStyle = BRAND.yellow;
  c.font = '900 52px "Playfair Display", serif';
  c.fillText('HACKER', W / 2 - 170, topY + 45);

  // Devanagari Goa Badge
  c.fillStyle = BRAND.pink;
  c.strokeStyle = BRAND.yellow;
  c.lineWidth = 3;
  drawRoundedRect(c, W / 2 - 50, topY + 8, 100, 52, 26);
  c.fill(); c.stroke();

  c.fillStyle = BRAND.yellow;
  c.font = '800 28px "Inter", sans-serif';
  c.fillText('गोवा', W / 2, topY + 44);

  c.fillStyle = BRAND.yellow;
  c.font = '900 52px "Playfair Display", serif';
  c.fillText('HOUSE', W / 2 + 170, topY + 45);

  // Subtitle Metadata
  c.fillStyle = BRAND.cream;
  c.font = '700 15px "Space Grotesk", monospace';
  c.fillText('GOA, INDIA   •   28 – 31 OCT 2026', W / 2 - 120, topY + 82);

  c.fillStyle = BRAND.pink;
  c.font = '700 13px "Space Grotesk", monospace';
  c.fillText('2:47 PM STUDIO', W / 2 + 230, topY + 82);

  // Title Callout Header
  c.fillStyle = BRAND.cream;
  c.font = '900 38px "Outfit", sans-serif';
  c.fillText('HH GOA 2026', W / 2, topY + 135);

  c.fillStyle = BRAND.pink;
  c.font = '700 16px "Space Grotesk", monospace';
  c.fillText('ONE FRAME, WHOLE CREW', W / 2, topY + 162);

  // 3. Center Main Card Container (Inner Green Frame)
  const cX = 75;
  const cY = topY + 185;
  const cW = W - 150;
  const cH = 1200;
  const cR = 28;

  // Outer Yellow & Pink Border Lines
  c.fillStyle = BRAND.greenCard;
  c.strokeStyle = BRAND.pink;
  c.lineWidth = 4;
  drawRoundedRect(c, cX, cY, cW, cH, cR);
  c.fill(); c.stroke();

  c.strokeStyle = BRAND.yellow;
  c.lineWidth = 2;
  drawRoundedRect(c, cX - 4, cY - 4, cW + 8, cH + 8, cR + 4);
  c.stroke();

  // PERFECT SQUARE Photo Frame (520px x 520px ID Badge Style)
  const photoDim = 520;
  const photoX = W / 2 - photoDim / 2;
  const photoY = cY + 24;

  c.save();
  drawRoundedRect(c, photoX, photoY, photoDim, photoDim, 24);
  c.clip();

  if (state.isImageLoaded && state.userImage) {
    drawTransformedImageSquare(c, photoX + photoDim / 2, photoY + photoDim / 2, photoDim);
  } else {
    c.fillStyle = BRAND.greenDark;
    c.fillRect(photoX, photoY, photoDim, photoDim);
    c.fillStyle = BRAND.yellow;
    c.font = '800 64px sans-serif';
    c.fillText('📷', photoX + photoDim / 2, photoY + photoDim / 2 - 30);
    c.font = '700 20px "Outfit", sans-serif';
    c.fillText('UPLOAD SQUARE PHOTO', photoX + photoDim / 2, photoY + photoDim / 2 + 25);
    c.fillStyle = BRAND.cream;
    c.font = '500 13px "Inter", sans-serif';
    c.fillText('JPG, PNG, WebP or iPhone HEIC (1:1 ID Badge)', photoX + photoDim / 2, photoY + photoDim / 2 + 54);
  }
  c.restore();

  // Double Border Lines around Square Photo Frame
  c.lineWidth = 4;
  c.strokeStyle = BRAND.yellow;
  drawRoundedRect(c, photoX, photoY, photoDim, photoDim, 24);
  c.stroke();

  c.lineWidth = 2;
  c.strokeStyle = BRAND.pink;
  drawRoundedRect(c, photoX - 4, photoY - 4, photoDim + 8, photoDim + 8, 28);
  c.stroke();

  // 4. Details Fields Section
  let detailY = photoY + photoDim + 24;

  // Highlighted Pink Team Callout Banner (1st Line: TEAM, 2nd Line: Team Name in Pink)
  const teamText = state.team ? state.team.toUpperCase() : 'GENESIS OF DISRUPTION';
  const teamW = cW - 40;
  const teamH = 74;

  c.save();
  c.fillStyle = BRAND.greenDark;
  c.strokeStyle = BRAND.pink;
  c.lineWidth = 3;
  drawRoundedRect(c, cX + 20, detailY, teamW, teamH, 16);
  c.fill(); c.stroke();

  // 1st Line: TEAM
  c.fillStyle = BRAND.yellow;
  c.font = '800 13px "Space Grotesk", monospace';
  c.textAlign = 'center';
  c.fillText('TEAM', W / 2, detailY + 24);

  // 2nd Line: TEAM NAME (Highlighted in Pink)
  c.fillStyle = BRAND.pink;
  c.font = '900 26px "Outfit", sans-serif';
  c.fillText(teamText, W / 2, detailY + 56);
  c.restore();

  detailY += 88;
  const colW = (cW - 60) / 2;

  drawBadgeField(c, cX + 20, detailY, colW, 72, 'FULL NAME', state.name ? state.name.toUpperCase() : 'YOUR FULL NAME');
  drawBadgeField(c, cX + 40 + colW, detailY, colW, 72, 'STACK / ROLE', (state.stack === 'Custom' ? state.customRole : state.stack) || 'SELECT YOUR STACK');

  detailY += 88;
  drawBadgeField(c, cX + 20, detailY, colW, 72, 'BUILDER CLASS', state.title || 'YOUR BUILDER TITLE');
  drawBadgeField(c, cX + 40 + colW, detailY, colW, 72, 'BUILDER ID', state.idNumber);

  // Currently Shipping Bar
  detailY += 92;
  c.fillStyle = BRAND.greenDark;
  c.strokeStyle = BRAND.yellow;
  c.lineWidth = 2;
  drawRoundedRect(c, cX + 20, detailY, cW - 40, 75, 16);
  c.fill(); c.stroke();

  c.fillStyle = BRAND.yellow;
  c.font = '700 13px "Space Grotesk", monospace';
  c.textAlign = 'center';
  c.fillText('✦ CURRENTLY SHIPPING ✦', W / 2, detailY + 26);

  c.fillStyle = '#ffffff';
  c.font = '800 22px "Outfit", sans-serif';
  c.fillText(state.shipping ? state.shipping.toUpperCase() : 'WHAT ARE YOU SHIPPING?', W / 2, detailY + 56);

  // Beach Bag Tags
  detailY += 95;
  c.fillStyle = BRAND.yellow;
  c.font = '700 13px "Space Grotesk", monospace';
  c.fillText('✦ BEACH BAG TAGS ✦', W / 2, detailY);

  const tags = state.beachBagTags && state.beachBagTags.length > 0 ? state.beachBagTags : ['🌊 BEACH VIBES', '⚡ SIDE PROJECT', '🎯 SHIP IT'];
  const tagW = 190;
  const totalTagsW = tags.length * (tagW + 15) - 15;
  let tagStartX = W / 2 - totalTagsW / 2;

  tags.forEach((tag, idx) => {
    drawTagPill(c, tagStartX + idx * (tagW + 15), detailY + 12, tagW, 40, tag);
  });

  // 5. Ticket Stub / Footer Details Section
  const stubY = detailY + 70;

  // Dashed Cut Line
  c.strokeStyle = BRAND.pink;
  c.lineWidth = 2;
  c.setLineDash([10, 6]);
  c.beginPath();
  c.moveTo(cX + 20, stubY);
  c.lineTo(cX + cW - 20, stubY);
  c.stroke();
  c.setLineDash([]);

  // Ticket Stub Left: LinkedIn QR Code Box
  drawQRCodeBox(c, cX + 20, stubY + 20, 160, 160, 'LINKEDIN');

  // Ticket Stub Right: Barcode & Admit Details
  const stubBoxX = cX + 200;
  const stubBoxW = cW - 220;
  c.fillStyle = BRAND.cream;
  c.strokeStyle = BRAND.green;
  c.lineWidth = 2;
  drawRoundedRect(c, stubBoxX, stubY + 20, stubBoxW, 160, 16);
  c.fill(); c.stroke();

  c.fillStyle = BRAND.green;
  c.font = '700 13px "Space Grotesk", monospace';
  c.textAlign = 'center';
  c.fillText('ADMIT ONE BUILDER • HH GOA 2026', stubBoxX + stubBoxW / 2, stubY + 52);

  c.font = '900 28px "Playfair Display", serif';
  c.fillText(state.name ? state.name.toUpperCase() : 'YOUR NAME', stubBoxX + stubBoxW / 2, stubY + 92);

  drawBarcode(c, stubBoxX + 35, stubY + 108, stubBoxW - 70, 22);
  c.font = '700 12px "Space Grotesk", monospace';
  c.fillText('BUILD  •  SHIP  •  REPEAT', stubBoxX + stubBoxW / 2, stubY + 150);

  // SynthID AI Stamp
  if (state.synthIDEnabled) {
    drawSynthIDBadge(c, cX + cW - 210, stubY + 30, state.synthIDStyle);
  }

  // 6. Bottom Social Handles & Footer Meta
  const footerY = H - 85;

  c.fillStyle = BRAND.yellow;
  c.font = '700 13px "Space Grotesk", monospace';
  c.textAlign = 'center';
  c.fillText('𝕏 @247PMSTUDIO   •   ✈️ @TWOFOURTYSEVENPM   •   📧 SATAPATHYPRAYASU@GMAIL.COM', W / 2, footerY);

  c.fillStyle = BRAND.textMuted;
  c.font = '600 12px "Inter", sans-serif';
  c.fillText('BRAND KIT   •   TERMS & CONDITIONS   •   © 2026 HH-GOA. ALL RIGHTS RESERVED.', W / 2, footerY + 25);

  // Ribbon Hashtag at the absolute bottom
  drawRibbon(c, W / 2, H - 28, 480, 48, '#HackerHouseGoa2026');
}

// -------------------------------------------------------------
// BACK SURFACE: DARK TROPICAL PALM VERIFIED CREDENTIALS & RULES
// -------------------------------------------------------------
function renderCardBack(c, W, H) {
  // 1. Dark Tropical Forest Green Background
  c.fillStyle = BRAND.greenDark;
  c.fillRect(0, 0, W, H);

  const grad = c.createRadialGradient(W / 2, H / 3, 50, W / 2, H / 3, 650);
  grad.addColorStop(0, 'rgba(13, 59, 46, 0.95)');
  grad.addColorStop(1, 'rgba(7, 34, 26, 1)');
  c.fillStyle = grad;
  c.fillRect(0, 0, W, H);

  drawPalmBorderFrame(c, W, H);

  // 2. Top Header Banner
  const topY = 45;
  c.textAlign = 'center';

  c.fillStyle = BRAND.yellow;
  c.font = '900 52px "Playfair Display", serif';
  c.fillText('HACKER', W / 2 - 170, topY + 45);

  c.fillStyle = BRAND.pink;
  c.strokeStyle = BRAND.yellow;
  c.lineWidth = 3;
  drawRoundedRect(c, W / 2 - 50, topY + 8, 100, 52, 26);
  c.fill(); c.stroke();

  c.fillStyle = BRAND.yellow;
  c.font = '800 28px "Inter", sans-serif';
  c.fillText('गोवा', W / 2, topY + 44);

  c.fillStyle = BRAND.yellow;
  c.font = '900 52px "Playfair Display", serif';
  c.fillText('HOUSE', W / 2 + 170, topY + 45);

  c.fillStyle = BRAND.cream;
  c.font = '700 15px "Space Grotesk", monospace';
  c.fillText('GOA, INDIA   •   28 – 31 OCT 2026', W / 2 - 120, topY + 82);

  c.fillStyle = BRAND.pink;
  c.font = '700 13px "Space Grotesk", monospace';
  c.fillText('2:47 PM STUDIO', W / 2 + 230, topY + 82);

  c.fillStyle = BRAND.cream;
  c.font = '900 38px "Outfit", sans-serif';
  c.fillText('BUILDER PASS • BACK SIDE', W / 2, topY + 135);

  c.fillStyle = BRAND.yellow;
  c.font = '700 16px "Space Grotesk", monospace';
  c.fillText('OFFICIAL CREDENTIALS & EVENT RULES', W / 2, topY + 162);

  // 3. Center Main Card Container
  const cX = 75;
  const cY = topY + 185;
  const cW = W - 150;
  const cH = 1200;
  const cR = 28;

  c.fillStyle = BRAND.greenCard;
  c.strokeStyle = BRAND.yellow;
  c.lineWidth = 4;
  drawRoundedRect(c, cX, cY, cW, cH, cR);
  c.fill(); c.stroke();

  c.strokeStyle = BRAND.pink;
  c.lineWidth = 2;
  drawRoundedRect(c, cX - 4, cY - 4, cW + 8, cH + 8, cR + 4);
  c.stroke();

  // LEFT SIDE: QR Code & Builder Profile Info
  const leftX = cX + 30;
  const leftY = cY + 30;
  const qrBoxSize = 340;

  drawQRCodeBox(c, leftX, leftY, qrBoxSize, qrBoxSize, 'SCAN TO CONNECT');

  // Builder Details Text below QR
  let leftTextY = leftY + qrBoxSize + 28;
  c.textAlign = 'left';

  c.fillStyle = BRAND.cream;
  c.font = '900 26px "Playfair Display", serif';
  c.fillText(state.name ? state.name.toUpperCase() : 'YOUR FULL NAME', leftX, leftTextY);

  leftTextY += 32;
  c.fillStyle = BRAND.yellow;
  c.font = '800 12px "Space Grotesk", monospace';
  c.fillText('TEAM', leftX, leftTextY);

  leftTextY += 26;
  c.fillStyle = BRAND.pink;
  c.font = '900 22px "Outfit", sans-serif';
  c.fillText(state.team ? state.team.toUpperCase() : 'GENESIS OF DISRUPTION', leftX, leftTextY);

  leftTextY += 32;
  c.fillStyle = BRAND.pink;
  c.font = '700 13px "Space Grotesk", monospace';
  c.fillText(`ID: ${state.idNumber}`, leftX, leftTextY);

  leftTextY += 24;
  c.fillStyle = BRAND.textMuted;
  c.font = '600 12px "Space Grotesk", monospace';
  c.fillText(`ROLE: ${state.stack || 'BUILDER / HACKER'}`, leftX, leftTextY);

  // RIGHT SIDE: Official Event Rules & Code of Conduct Box with Icons
  const rulesX = cX + 390;
  const rulesY = cY + 30;
  const rulesW = cW - 420;
  const rulesH = 500;

  drawEventRulesBox(c, rulesX, rulesY, rulesW, rulesH);

  // BOTTOM METADATA TABLE & TICKET STUB CUT LINE
  const stubY = cY + 560;
  c.strokeStyle = BRAND.pink;
  c.lineWidth = 2;
  c.setLineDash([10, 6]);
  c.beginPath();
  c.moveTo(cX + 20, stubY);
  c.lineTo(cX + cW - 20, stubY);
  c.stroke();
  c.setLineDash([]);

  // Pass Credentials Table
  const infoX = cX + 30;
  const infoY = stubY + 25;
  const infoW = cW - 60;
  c.fillStyle = BRAND.greenDark;
  c.strokeStyle = BRAND.yellow;
  c.lineWidth = 2;
  drawRoundedRect(c, infoX, infoY, infoW, 110, 16);
  c.fill(); c.stroke();

  c.textAlign = 'center';
  c.fillStyle = BRAND.yellow;
  c.font = '800 15px "Space Grotesk", monospace';
  c.fillText(`ADMIT ONE BUILDER  •  HACKER HOUSE GOA 2026`, W / 2, infoY + 35);

  c.fillStyle = BRAND.cream;
  c.font = '700 14px "Space Grotesk", monospace';
  c.fillText(`GOA, INDIA   •   28–31 OCT 2026   •   BUILD • SHIP • REPEAT`, W / 2, infoY + 72);

  // Barcode & SynthID AI Verified Stamp
  const barcodeY = infoY + 130;
  drawBarcode(c, W / 2 - 200, barcodeY, 400, 30);

  c.fillStyle = BRAND.cream;
  c.font = '700 12px "Space Grotesk", monospace';
  c.fillText('OFFICIAL SYNTHID AI VERIFIED CREDENTIALS', W / 2, barcodeY + 54);

  if (state.synthIDEnabled) {
    drawSynthIDBadge(c, W / 2 - 87, barcodeY + 70, state.synthIDStyle);
  }

  // Bottom Social Handles & Footer Meta
  const footerY = H - 85;
  c.fillStyle = BRAND.yellow;
  c.font = '700 13px "Space Grotesk", monospace';
  c.fillText('𝕏 @247PMSTUDIO   •   ✈️ @TWOFOURTYSEVENPM   •   📧 SATAPATHYPRAYASU@GMAIL.COM', W / 2, footerY);

  c.fillStyle = BRAND.textMuted;
  c.font = '600 12px "Inter", sans-serif';
  c.fillText('BRAND KIT   •   TERMS & CONDITIONS   •   © 2026 HH-GOA. ALL RIGHTS RESERVED.', W / 2, footerY + 25);

  drawRibbon(c, W / 2, H - 28, 480, 48, '#HackerHouseGoa2026');
}

// -------------------------------------------------------------
// EVENT RULES BOX WITH ICONS
// -------------------------------------------------------------
function drawEventRulesBox(c, x, y, w, h) {
  c.save();
  c.fillStyle = BRAND.greenDark;
  c.strokeStyle = BRAND.yellow;
  c.lineWidth = 2;
  drawRoundedRect(c, x, y, w, h, 20);
  c.fill(); c.stroke();

  // Header Callout Banner
  const headerH = 42;
  c.fillStyle = BRAND.pink;
  c.strokeStyle = BRAND.yellow;
  c.lineWidth = 2;
  drawRoundedRect(c, x + 12, y + 12, w - 24, headerH, 12);
  c.fill(); c.stroke();

  c.fillStyle = BRAND.yellow;
  c.font = '800 13px "Space Grotesk", monospace';
  c.textAlign = 'center';
  c.fillText('✦ EVENT RULES & CODE OF CONDUCT ✦', x + w / 2, y + 38);

  // 5 Rule Items
  const rules = [
    { icon: '🪪', title: '1. VISIBLE BADGE', desc: 'Wear Builder ID at all times on venue premises.' },
    { icon: '💻', title: '2. BUILD & SHIP', desc: 'Commit original code during hackathon hours.' },
    { icon: '🌴', title: '3. RESPECT THE VIBE', desc: 'Maintain sportsmanship & respect fellow hackers.' },
    { icon: '☕', title: '4. 24/7 REFUEL', desc: 'Free coconut water, coffee & snacks at lounge.' },
    { icon: '⚡', title: '5. ORIGINAL WORK', desc: 'Open-source & AI tools permitted with disclosure.' }
  ];

  let itemY = y + 66;
  const itemH = 82;

  rules.forEach((rule) => {
    c.fillStyle = 'rgba(10, 52, 38, 0.7)';
    c.strokeStyle = 'rgba(255, 208, 0, 0.2)';
    c.lineWidth = 1;
    drawRoundedRect(c, x + 12, itemY, w - 24, itemH - 8, 12);
    c.fill(); c.stroke();

    // Icon Circle Badge
    c.fillStyle = BRAND.pink;
    c.beginPath();
    c.arc(x + 36, itemY + (itemH - 8) / 2, 17, 0, Math.PI * 2);
    c.fill();

    c.font = '15px sans-serif';
    c.textAlign = 'center';
    c.fillText(rule.icon, x + 36, itemY + (itemH - 8) / 2 + 5);

    // Rule Title
    c.fillStyle = BRAND.yellow;
    c.font = '800 13px "Outfit", sans-serif';
    c.textAlign = 'left';
    c.fillText(rule.title, x + 64, itemY + 24);

    // Rule Description
    c.fillStyle = BRAND.cream;
    c.font = '500 11px "Inter", sans-serif';
    c.fillText(rule.desc, x + 64, itemY + 46);

    itemY += itemH - 4;
  });

  c.restore();
}

// -------------------------------------------------------------
// PFP FRAME SURFACE: 1:1 SQUARE PROFILE PICTURE OVERLAY
// -------------------------------------------------------------
function renderPFPFrame(c, W, H) {
  // 1. Dark Tropical Forest Green Background
  c.fillStyle = BRAND.greenDark;
  c.fillRect(0, 0, W, H);

  const grad = c.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, 500);
  grad.addColorStop(0, 'rgba(13, 59, 46, 0.95)');
  grad.addColorStop(1, 'rgba(7, 34, 26, 1)');
  c.fillStyle = grad;
  c.fillRect(0, 0, W, H);

  // 2. Large Photo Box (Center 760px x 760px)
  const boxSize = 760;
  const boxX = W / 2 - boxSize / 2;
  const boxY = H / 2 - boxSize / 2;

  c.save();
  drawRoundedRect(c, boxX, boxY, boxSize, boxSize, 36);
  c.clip();

  if (state.isImageLoaded && state.userImage) {
    drawTransformedImageSquare(c, boxX + boxSize / 2, boxY + boxSize / 2, boxSize);
  } else {
    c.fillStyle = BRAND.greenCard;
    c.fillRect(boxX, boxY, boxSize, boxSize);
    c.fillStyle = BRAND.yellow;
    c.font = '800 80px sans-serif';
    c.textAlign = 'center';
    c.fillText('📷', boxX + boxSize / 2, boxY + boxSize / 2 - 30);
    c.font = '700 24px "Outfit", sans-serif';
    c.fillText('UPLOAD PFP PHOTO', boxX + boxSize / 2, boxY + boxSize / 2 + 35);
  }
  c.restore();

  // Double Frame Border
  c.lineWidth = 6;
  c.strokeStyle = BRAND.yellow;
  drawRoundedRect(c, boxX, boxY, boxSize, boxSize, 36);
  c.stroke();

  c.lineWidth = 3;
  c.strokeStyle = BRAND.pink;
  drawRoundedRect(c, boxX - 6, boxY - 6, boxSize + 12, boxSize + 12, 42);
  c.stroke();

  // Tropical Palm Accents in 4 corners
  drawPalmBorderFrame(c, W, H);

  // Top Logo Header
  c.textAlign = 'center';
  c.fillStyle = BRAND.yellow;
  c.font = '900 36px "Playfair Display", serif';
  c.fillText('HACKER', W / 2 - 130, 70);

  c.fillStyle = BRAND.pink;
  c.strokeStyle = BRAND.yellow;
  c.lineWidth = 2;
  drawRoundedRect(c, W / 2 - 40, 36, 80, 44, 22);
  c.fill(); c.stroke();

  c.fillStyle = BRAND.yellow;
  c.font = '800 22px "Inter", sans-serif';
  c.fillText('गोवा', W / 2, 66);

  c.fillStyle = BRAND.yellow;
  c.font = '900 36px "Playfair Display", serif';
  c.fillText('HOUSE', W / 2 + 130, 70);

  // SynthID AI Verified Stamp Top-Right
  if (state.synthIDEnabled) {
    drawSynthIDBadge(c, boxX + boxSize - 180, boxY + 20, state.synthIDStyle);
  }

  // Name & Team Badge at bottom of PFP Frame
  const nameText = state.name ? state.name.toUpperCase() : 'HH GOA BUILDER';
  c.fillStyle = BRAND.pink;
  c.strokeStyle = BRAND.yellow;
  c.lineWidth = 3;
  drawRoundedRect(c, W / 2 - 280, H - 125, 560, 56, 28);
  c.fill(); c.stroke();

  c.fillStyle = BRAND.yellow;
  c.font = '900 24px "Outfit", sans-serif';
  c.fillText(nameText, W / 2, H - 89);

  // Bottom Hashtag Ribbon
  drawRibbon(c, W / 2, H - 35, 460, 42, '#HackerHouseGoa2026');
}

// -------------------------------------------------------------
// COMBINED VERTICAL TOP-TO-BOTTOM HIGH DEFINITION RENDERER
// -------------------------------------------------------------
function renderCombinedVertical(exportCtx, baseW, baseH) {
  // baseW = 1000, baseH = 1580. Combined height = 3160px
  exportCtx.fillStyle = BRAND.greenDark;
  exportCtx.fillRect(0, 0, baseW, baseH * 2);

  // Render Front Side on upper half
  exportCtx.save();
  renderFormatB_BuilderID(exportCtx, baseW, baseH);
  exportCtx.restore();

  // Render Back Side on lower half
  exportCtx.save();
  exportCtx.translate(0, baseH);
  renderCardBack(exportCtx, baseW, baseH);
  exportCtx.restore();

  // Divider Line between Front and Back
  exportCtx.save();
  exportCtx.strokeStyle = BRAND.pink;
  exportCtx.lineWidth = 4;
  exportCtx.setLineDash([16, 10]);
  exportCtx.beginPath();
  exportCtx.moveTo(40, baseH);
  exportCtx.lineTo(baseW - 40, baseH);
  exportCtx.stroke();
  exportCtx.restore();
}

// -------------------------------------------------------------
// PALM TREE BORDER GRAPHICS UTILITIES
// -------------------------------------------------------------
function drawPalmBorderFrame(c, W, H) {
  c.save();
  c.strokeStyle = 'rgba(40, 140, 90, 0.4)';
  c.lineWidth = 3;

  drawPalmBranch(c, 20, 20, -30, 1.2);
  drawPalmBranch(c, W - 20, 20, 120, 1.2);
  drawPalmBranch(c, 20, H - 20, -120, 1.2);
  drawPalmBranch(c, W - 20, H - 20, 30, 1.2);

  drawPalmBranch(c, 10, H / 2 - 250, 0, 0.9);
  drawPalmBranch(c, W - 10, H / 2 - 250, 180, 0.9);
  drawPalmBranch(c, 10, H / 2 + 250, 0, 0.9);
  drawPalmBranch(c, W - 10, H / 2 + 250, 180, 0.9);

  c.restore();
}

function drawPalmBranch(c, x, y, angleDeg, scale) {
  c.save();
  c.translate(x, y);
  c.rotate((angleDeg * Math.PI) / 180);
  c.scale(scale, scale);

  c.beginPath();
  c.moveTo(0, 0);
  c.quadraticCurveTo(80, 40, 160, 120);
  c.strokeStyle = '#1b634c';
  c.lineWidth = 4;
  c.stroke();

  c.fillStyle = '#248566';
  for (let i = 20; i < 150; i += 15) {
    const t = i / 160;
    const px = t * 160;
    const py = t * t * 120;

    c.beginPath();
    c.moveTo(px, py);
    c.quadraticCurveTo(px - 35, py + 15, px - 50, py + 45);
    c.quadraticCurveTo(px - 20, py + 25, px, py);
    c.fill();

    c.beginPath();
    c.moveTo(px, py);
    c.quadraticCurveTo(px + 35, py - 15, px + 50, py - 45);
    c.quadraticCurveTo(px + 20, py - 25, px, py);
    c.fill();
  }

  c.restore();
}

// -------------------------------------------------------------
// GRAPHICS HELPER UTILITIES
// -------------------------------------------------------------
function drawTransformedImageSquare(c, targetCx, targetCy, targetDim) {
  if (!state.userImage) return;

  const img = state.userImage;
  c.save();
  c.translate(targetCx + state.panX, targetCy + state.panY);
  c.rotate((state.rotation * Math.PI) / 180);
  c.scale(state.zoom, state.zoom);

  let filterStr = `brightness(${state.brightness}%) contrast(${state.contrast}%) saturate(${state.saturation}%) blur(${state.blur}px)`;
  if (state.presetFilter === 'sunset') {
    filterStr += ' sepia(40%) hue-rotate(-20deg) saturate(160%)';
  } else if (state.presetFilter === 'vivid') {
    filterStr += ' saturate(210%) contrast(115%)';
  } else if (state.presetFilter === 'monochrome') {
    filterStr += ' grayscale(100%) contrast(140%)';
  } else if (state.presetFilter === 'vintage') {
    filterStr += ' sepia(60%) contrast(90%) brightness(105%)';
  } else if (state.presetFilter === 'cyber') {
    filterStr += ' hue-rotate(140deg) saturate(180%)';
  }

  c.filter = filterStr;
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  
  const scale = targetDim / Math.min(iw, ih);
  const dw = iw * scale;
  const dh = ih * scale;

  c.drawImage(img, -dw / 2, -dh / 2, dw, dh);
  c.restore();
}

function drawBadgeField(c, x, y, w, h, label, val) {
  c.fillStyle = BRAND.cream;
  c.strokeStyle = BRAND.green;
  c.lineWidth = 2;
  drawRoundedRect(c, x, y, w, h, 14);
  c.fill(); c.stroke();

  c.fillStyle = BRAND.green;
  c.font = '700 12px "Space Grotesk", monospace';
  c.textAlign = 'left';
  c.fillText(label, x + 16, y + 24);

  c.font = '800 19px "Outfit", sans-serif';
  c.fillText(val, x + 16, y + 54);
}

function drawTagPill(c, x, y, w, h, text) {
  c.fillStyle = BRAND.cream;
  c.strokeStyle = BRAND.pink;
  c.lineWidth = 2;
  drawRoundedRect(c, x, y, w, h, 20);
  c.fill(); c.stroke();

  c.fillStyle = BRAND.pink;
  c.font = '700 13px "Outfit", sans-serif';
  c.textAlign = 'center';
  c.fillText(text, x + w / 2, y + h / 2 + 5);
}

function drawRibbon(c, x, y, w, h, text) {
  c.save();
  const rx = x - w / 2;
  const ry = y - h / 2;

  c.fillStyle = BRAND.pink;
  c.strokeStyle = BRAND.yellow;
  c.lineWidth = 3;
  drawRoundedRect(c, rx, ry, w, h, 12);
  c.fill(); c.stroke();

  c.fillStyle = BRAND.yellow;
  c.font = '900 22px "Space Grotesk", monospace';
  c.textAlign = 'center';
  c.fillText(`✦ ${text} ✦`, x, y + 7);
  c.restore();
}

function drawQRCodeBox(c, x, y, w, h, label) {
  c.save();
  c.fillStyle = BRAND.cream;
  c.strokeStyle = BRAND.green;
  c.lineWidth = 2;
  drawRoundedRect(c, x, y, w, h, 14);
  c.fill(); c.stroke();

  if (state.qrImage) {
    const qrMargin = 10;
    const qrW = w - qrMargin * 2;
    const qrH = h - qrMargin * 2 - (label ? 16 : 0);
    c.drawImage(state.qrImage, x + qrMargin, y + qrMargin, qrW, qrH);
  } else {
    const size = 12;
    const startX = x + 25;
    const startY = y + 25;
    c.fillStyle = BRAND.green;

    for (let r = 0; r < 10; r++) {
      for (let col = 0; col < 10; col++) {
        if ((r + col) % 2 === 0 || (r === 0 || r === 9 || col === 0 || col === 9)) {
          c.fillRect(startX + col * size * 1.4, startY + r * size * 1.4, size, size);
        }
      }
    }
  }

  if (label) {
    const badgeW = w - 16;
    const badgeH = 24;
    const badgeX = x + 8;
    const badgeY = y + h - 13;

    c.fillStyle = BRAND.pink;
    c.strokeStyle = BRAND.yellow;
    c.lineWidth = 2;
    drawRoundedRect(c, badgeX, badgeY, badgeW, badgeH, 12);
    c.fill(); c.stroke();

    c.fillStyle = BRAND.yellow;
    c.font = '800 11px "Space Grotesk", monospace';
    c.textAlign = 'center';
    c.fillText(label.toUpperCase(), badgeX + badgeW / 2, badgeY + 16);
  }
  c.restore();
}

function drawBarcode(c, x, y, w, h) {
  c.save();
  c.fillStyle = BRAND.green;
  let currX = x;
  const bars = [3, 1, 4, 2, 1, 3, 5, 2, 1, 4, 2, 3, 1, 4, 2, 5, 2, 1, 3, 4, 2];
  bars.forEach((barW, i) => {
    if (i % 2 === 0) {
      c.fillRect(currX, y, barW * 2, h);
    }
    currX += barW * 2 + 3;
  });
  c.restore();
}

function drawSynthIDBadge(c, x, y, style) {
  c.save();
  c.fillStyle = BRAND.pink;
  c.strokeStyle = BRAND.yellow;
  c.lineWidth = 2;
  drawRoundedRect(c, x, y, 175, 34, 17);
  c.fill(); c.stroke();

  c.fillStyle = BRAND.yellow;
  c.font = '800 11px "Space Grotesk", monospace';
  c.textAlign = 'center';
  c.fillText('⚡ SynthID AI VERIFIED', x + 87, y + 21);
  c.restore();
}

function drawRoundedRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.lineTo(x + w - r, y);
  c.quadraticCurveTo(x + w, y, x + w, y + r);
  c.lineTo(x + w, y + h - r);
  c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  c.lineTo(x + r, y + h);
  c.quadraticCurveTo(x, y + h, x, y + h - r);
  c.lineTo(x, y + r);
  c.quadraticCurveTo(x, y, x + r, y);
  c.closePath();
}

// Sanitize text input to prevent HTML injection/XSS
function sanitizeText(val) {
  if (!val) return '';
  return val.replace(/<[^>]*>/g, '').trim();
}

// Display validation error message under input elements
function showInputError(inputEl, msg) {
  const parent = inputEl.closest('.input-field') || inputEl.closest('.upload-box');
  if (!parent) return;
  parent.classList.add('invalid');
}

// Clear validation error message
function clearInputError(inputEl) {
  const parent = inputEl.closest('.input-field') || inputEl.closest('.upload-box');
  if (!parent) return;
  parent.classList.remove('invalid');
}

// Check validity of all required fields and toggle button state
function checkValidation() {
  let isValid = true;

  if (!state.isImageLoaded || !state.userImage) {
    showInputError(photoInput, 'Please upload a valid builder photo');
    isValid = false;
  } else {
    clearInputError(photoInput);
  }

  const nameVal = sanitizeText(inputName.value);
  if (!nameVal || nameVal.length < 2) {
    showInputError(inputName, 'Full name is required');
    isValid = false;
  } else {
    clearInputError(inputName);
  }

  const teamVal = sanitizeText(inputTeam.value);
  if (!teamVal) {
    showInputError(inputTeam, 'Team name is required');
    isValid = false;
  } else {
    clearInputError(inputTeam);
  }

  const linkedinVal = sanitizeText(inputLinkedin.value);
  let isValidUrl = false;
  try {
    const urlToTest = linkedinVal.includes('://') ? linkedinVal : `https://${linkedinVal}`;
    const parsedUrl = new URL(urlToTest);
    isValidUrl = parsedUrl.hostname.includes('.') && parsedUrl.hostname.split('.').pop().length >= 2;
  } catch (e) {
    isValidUrl = false;
  }

  if (!linkedinVal || !isValidUrl) {
    showInputError(inputLinkedin, 'Valid URL is required');
    isValid = false;
  } else {
    clearInputError(inputLinkedin);
  }

  if (!selectStack.value) {
    showInputError(selectStack, 'Please select your stack');
    isValid = false;
  } else if (selectStack.value === 'Custom' && !sanitizeText(inputCustomRole.value)) {
    showInputError(inputCustomRole, 'Custom role is required');
    isValid = false;
    clearInputError(selectStack);
  } else {
    clearInputError(selectStack);
    clearInputError(inputCustomRole);
  }

  if (!sanitizeText(inputTitle.value)) {
    showInputError(inputTitle, 'Builder title is required');
    isValid = false;
  } else {
    clearInputError(inputTitle);
  }

  if (!sanitizeText(inputShipping.value)) {
    showInputError(inputShipping, 'Shipping detail is required');
    isValid = false;
  } else {
    clearInputError(inputShipping);
  }

  downloadBtn.disabled = !isValid;
  shareXBtn.disabled = !isValid;
  copyClipboardBtn.disabled = !isValid;

  return isValid;
}

// -------------------------------------------------------------
// EVENT LISTENERS
// -------------------------------------------------------------
function setupEventListeners() {
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });

  // Format Switcher (Card vs PFP)
  if (formatSwitcher) {
    formatSwitcher.addEventListener('click', (e) => {
      const btn = e.target.closest('.format-tab-btn');
      if (!btn) return;
      formatSwitcher.querySelectorAll('.format-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.mode = btn.dataset.mode;
      renderCanvas();
    });
  }

  // Quick Role Pills
  if (quickRolePills) {
    quickRolePills.addEventListener('click', (e) => {
      const btn = e.target.closest('.role-pill');
      if (!btn) return;
      const roleVal = btn.dataset.role;
      state.stack = roleVal;
      selectStack.value = roleVal;
      
      const titles = TITLES_BY_STACK[roleVal] || TITLES_BY_STACK['MERN | PYTHON'];
      if (titles) {
        state.title = titles[Math.floor(Math.random() * titles.length)];
        inputTitle.value = state.title;
      }
      checkValidation();
      renderCanvas();
    });
  }

  // Flip Card Button (Button ONLY flips the card)
  if (flipCardBtn) {
    flipCardBtn.addEventListener('click', () => {
      state.activeSurface = state.activeSurface === 'front' ? 'back' : 'front';
      if (flipLabel) {
        flipLabel.textContent = state.activeSurface === 'front' ? 'Flip to Back' : 'Flip to Front';
      }
      renderCanvas();
    });
  }

  // Toggle 3D Tilt Effect & 360 Interactive Cursor Tracking
  const previewCardArea = document.querySelector('.preview-card');
  if (previewCardArea) {
    previewCardArea.addEventListener('mousemove', (e) => {
      if (!state.is3D || !canvasContainer) return;
      const rect = previewCardArea.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Map horizontal cursor position to 360-degree rotation (-180deg to +180deg)
      const rotateY = ((x - centerX) / centerX) * 180;
      // Map vertical cursor position to 3D perspective tilt (-35deg to +35deg)
      const rotateX = -((y - centerY) / centerY) * 35;

      const isBackSide = Math.abs(rotateY) > 90;
      const targetSurface = isBackSide ? 'back' : 'front';

      // Dynamically switch surface rendering when passing the 90deg threshold
      if (state.mode === 'card' && state.activeSurface !== targetSurface) {
        state.activeSurface = targetSurface;
        if (flipLabel) {
          flipLabel.textContent = state.activeSurface === 'front' ? 'Flip to Back' : 'Flip to Front';
        }
        renderCanvas();
      }

      // Display angle calculation:
      // When showing Back side, adjust angle by 180deg so back text is upright & unmirrored!
      let displayY = rotateY;
      if (isBackSide && state.mode === 'card') {
        displayY = rotateY > 0 ? rotateY - 180 : rotateY + 180;
      }

      canvasContainer.style.transform = `rotateY(${displayY.toFixed(1)}deg) rotateX(${rotateX.toFixed(1)}deg) scale(1.03)`;
    });

    previewCardArea.addEventListener('mouseleave', () => {
      if (!canvasContainer) return;
      canvasContainer.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1)';
    });
  }

  if (toggle3DBtn) {
    toggle3DBtn.addEventListener('click', () => {
      state.is3D = !state.is3D;
      toggle3DBtn.classList.toggle('active', state.is3D);
      if (canvasContainer) {
        canvasContainer.classList.toggle('has-3d', state.is3D);
        if (!state.is3D) {
          canvasContainer.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1)';
        }
      }
    });
  }

  photoInput.addEventListener('change', handleFileSelect);
  dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  });

  sliderZoom.addEventListener('input', (e) => {
    state.zoom = parseFloat(e.target.value) / 100;
    valZoom.textContent = `${e.target.value}%`;
    renderCanvas();
  });

  sliderPanX.addEventListener('input', (e) => { state.panX = parseFloat(e.target.value); renderCanvas(); });
  sliderPanY.addEventListener('input', (e) => { state.panY = parseFloat(e.target.value); renderCanvas(); });

  rotateBtn.addEventListener('click', () => { state.rotation = (state.rotation + 90) % 360; renderCanvas(); });
  centerBtn.addEventListener('click', () => {
    state.panX = 0; state.panY = 0;
    sliderPanX.value = 0; sliderPanY.value = 0;
    renderCanvas();
  });

  resetTransformBtn.addEventListener('click', () => {
    state.zoom = 1.0; state.panX = 0; state.panY = 0; state.rotation = 0;
    sliderZoom.value = 100; valZoom.textContent = '100%';
    sliderPanX.value = 0; sliderPanY.value = 0;
    renderCanvas();
  });

  // Builder Details Inputs
  inputName.addEventListener('input', (e) => { 
    state.name = sanitizeText(e.target.value); 
    checkValidation();
    renderCanvas(); 
  });
  
  if (inputTeam) {
    inputTeam.addEventListener('input', (e) => { 
      state.team = sanitizeText(e.target.value); 
      checkValidation();
      renderCanvas(); 
    });
  }

  inputLinkedin.addEventListener('input', (e) => {
    state.linkedinUrl = sanitizeText(e.target.value);
    checkValidation();
    generateQRCode(state.linkedinUrl);
  });

  selectStack.addEventListener('change', (e) => {
    state.stack = e.target.value;
    if (state.stack === 'Custom') {
      customRoleWrapper.style.display = 'flex';
    } else {
      customRoleWrapper.style.display = 'none';
      const titles = TITLES_BY_STACK[state.stack];
      if (titles) {
        state.title = titles[Math.floor(Math.random() * titles.length)];
        inputTitle.value = state.title;
      }
    }
    checkValidation();
    renderCanvas();
  });

  inputCustomRole.addEventListener('input', (e) => { 
    state.customRole = sanitizeText(e.target.value); 
    checkValidation();
    renderCanvas(); 
  });
  
  inputTitle.addEventListener('input', (e) => { 
    state.title = sanitizeText(e.target.value); 
    checkValidation();
    renderCanvas(); 
  });

  randomizeTitleBtn.addEventListener('click', () => {
    const titles = TITLES_BY_STACK[state.stack] || TITLES_BY_STACK['MERN | PYTHON'];
    state.title = titles[Math.floor(Math.random() * titles.length)];
    inputTitle.value = state.title;
    checkValidation();
    renderCanvas();
  });

  inputShipping.addEventListener('input', (e) => { 
    state.shipping = sanitizeText(e.target.value); 
    checkValidation();
    renderCanvas(); 
  });
  
  if (regenSerialBtn) {
    regenSerialBtn.addEventListener('click', () => {
      state.idNumber = getRandomSerial();
      if (inputIdNumber) inputIdNumber.value = state.idNumber;
      renderCanvas();
    });
  }

  beachBagTags.addEventListener('click', (e) => {
    const pill = e.target.closest('.tag-pill');
    if (!pill) return;
    pill.classList.toggle('active');

    const activePills = Array.from(document.querySelectorAll('.tag-pill.active')).map(p => p.dataset.tag);
    state.beachBagTags = activePills;
    renderCanvas();
  });

  presetsGrid.addEventListener('click', (e) => {
    if (!e.target.classList.contains('preset-btn')) return;
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    state.presetFilter = e.target.dataset.preset;
    renderCanvas();
  });

  sliderBrightness.addEventListener('input', (e) => { state.brightness = parseInt(e.target.value); valBrightness.textContent = `${state.brightness}%`; renderCanvas(); });
  sliderContrast.addEventListener('input', (e) => { state.contrast = parseInt(e.target.value); valContrast.textContent = `${state.contrast}%`; renderCanvas(); });
  sliderSaturation.addEventListener('input', (e) => { state.saturation = parseInt(e.target.value); valSaturation.textContent = `${state.saturation}%`; renderCanvas(); });
  sliderBlur.addEventListener('input', (e) => { state.blur = parseInt(e.target.value); valBlur.textContent = `${state.blur}px`; renderCanvas(); });

  resetAdjustmentsBtn.addEventListener('click', () => {
    state.brightness = 100; state.contrast = 100; state.saturation = 100; state.blur = 0; state.presetFilter = 'none';
    sliderBrightness.value = 100; valBrightness.textContent = '100%';
    sliderContrast.value = 100; valContrast.textContent = '100%';
    sliderSaturation.value = 100; valSaturation.textContent = '100%';
    sliderBlur.value = 0; valBlur.textContent = '0px';
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.preset-btn[data-preset="none"]').classList.add('active');
    renderCanvas();
  });

  function isInsidePhotoFrame(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const cx = (clientX - rect.left) * (canvas.width / rect.width);
    const cy = (clientY - rect.top) * (canvas.height / rect.height);
    
    if (state.mode === 'pfp') {
      const pfpSize = 760;
      const pfpX = canvas.width / 2 - pfpSize / 2;
      const pfpY = canvas.height / 2 - pfpSize / 2;
      return cx >= pfpX && cx <= pfpX + pfpSize && cy >= pfpY && cy <= pfpY + pfpSize;
    }

    const photoDim = 520;
    const photoX = canvas.width / 2 - photoDim / 2;
    const photoY = 45 + 185 + 24;
    return cx >= photoX && cx <= photoX + photoDim && cy >= photoY && cy <= photoY + photoDim;
  }

  canvas.addEventListener('mousemove', (e) => {
    if (state.isDragging) {
      canvas.style.cursor = 'grabbing';
    } else {
      canvas.style.cursor = isInsidePhotoFrame(e.clientX, e.clientY) ? 'grab' : 'default';
    }
  });

  canvas.addEventListener('mousedown', (e) => {
    if (isInsidePhotoFrame(e.clientX, e.clientY)) {
      state.isDragging = true;
      state.dragStartX = e.clientX;
      state.dragStartY = e.clientY;
      state.panStartX = state.panX;
      state.panStartY = state.panY;
      canvas.style.cursor = 'grabbing';
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (!state.isDragging) return;
    const dx = e.clientX - state.dragStartX;
    const dy = e.clientY - state.dragStartY;
    state.panX = state.panStartX + dx * 1.5;
    state.panY = state.panStartY + dy * 1.5;
    sliderPanX.value = state.panX;
    sliderPanY.value = state.panY;
    renderCanvas();
  });

  window.addEventListener('mouseup', () => {
    state.isDragging = false;
    canvas.style.cursor = 'default';
  });

  downloadBtn.addEventListener('click', handleDownload);
  shareXBtn.addEventListener('click', handleShareX);
  copyClipboardBtn.addEventListener('click', handleCopyClipboard);

  closeModalBtn.addEventListener('click', closeModal);
  downloadModal.addEventListener('click', (e) => {
    if (e.target === downloadModal) closeModal();
  });

  if (modalOpenTabBtn) {
    modalOpenTabBtn.addEventListener('click', () => {
      if (state.activeBlob) {
        const url = URL.createObjectURL(state.activeBlob);
        window.open(url, '_blank');
      }
    });
  }

  if (modalDirectDownloadBtn) {
    modalDirectDownloadBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (state.activeBlob) {
        const nameSlug = state.name ? state.name.trim().replace(/\s+/g, '_') : 'Builder';
        const fileSuffix = state.mode === 'pfp' ? 'PFP' : 'BothSides_HD';
        saveJpegBlob(state.activeBlob, `HHGoa2026_${fileSuffix}_${nameSlug}.jpg`);
      }
    });
  }
}

function closeModal() {
  downloadModal.classList.remove('active');
}

// File Reader + HEIC
async function handleFileSelect(e) {
  if (e.target.files && e.target.files[0]) {
    await processFile(e.target.files[0]);
  }
}

async function processFile(file) {
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/heic', 'image/heif'];
  const ext = file.name.split('.').pop().toLowerCase();
  const isTypeValid = validTypes.includes(file.type) || ['png', 'jpg', 'jpeg', 'webp', 'heic', 'heif'].includes(ext);
  
  if (!isTypeValid) {
    alert('Invalid file format. Please upload PNG, JPG, WebP, HEIC, or HEIF image files.');
    state.userImage = null;
    state.isImageLoaded = false;
    checkValidation();
    renderCanvas();
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    alert('File size exceeds the 10MB limit. Please upload a smaller image.');
    state.userImage = null;
    state.isImageLoaded = false;
    checkValidation();
    renderCanvas();
    return;
  }

  let fileToLoad = file;
  if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
    try {
      const convertedBlob = await heic2any({ blob: file, toType: 'image/jpeg' });
      fileToLoad = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
    } catch (err) {
      console.error('HEIC conversion error:', err);
    }
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.src = event.target.result;
    img.onload = () => {
      state.userImage = img;
      state.isImageLoaded = true;
      state.panX = 0; state.panY = 0; state.zoom = 1.0;
      sliderPanX.value = 0; sliderPanY.value = 0; sliderZoom.value = 100;
      valZoom.textContent = '100%';
      checkValidation();
      renderCanvas();
    };
  };
  reader.readAsDataURL(fileToLoad);
}

// Native Save As Dialog Helper
async function saveJpegBlob(blob, fileName) {
  if (typeof window.showSaveFilePicker === 'function') {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [{
          description: 'JPEG Image',
          accept: { 'image/jpeg': ['.jpg', '.jpeg'] }
        }]
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 40000);
}

// HD Export: Single Combined Vertical Both-Sides Download
function handleDownload() {
  modalLoadingState.style.display = 'flex';
  modalReadyState.style.display = 'none';
  progressFill.style.width = '30%';
  downloadModal.classList.add('active');

  setTimeout(() => {
    progressFill.style.width = '70%';

    const scaleMultiplier = 2;
    const exportCanvas = document.createElement('canvas');
    
    if (state.mode === 'pfp') {
      const baseDim = 1000;
      exportCanvas.width = baseDim * scaleMultiplier;
      exportCanvas.height = baseDim * scaleMultiplier;
      const exportCtx = exportCanvas.getContext('2d');
      exportCtx.scale(scaleMultiplier, scaleMultiplier);
      renderPFPFrame(exportCtx, baseDim, baseDim);
    } else {
      const baseW = 1000;
      const baseH = 1580;
      exportCanvas.width = baseW * scaleMultiplier;
      exportCanvas.height = (baseH * 2) * scaleMultiplier; // Combined top-to-bottom height 3160
      const exportCtx = exportCanvas.getContext('2d');
      exportCtx.scale(scaleMultiplier, scaleMultiplier);
      renderCombinedVertical(exportCtx, baseW, baseH);
    }

    const nameSlug = state.name ? state.name.trim().replace(/\s+/g, '_') : 'Builder';
    const fileSuffix = state.mode === 'pfp' ? 'PFP' : 'BuilderID_BothSides';
    const fileName = `HHGoa2026_${fileSuffix}_${nameSlug}.jpg`;

    exportCanvas.toBlob(async (blob) => {
      progressFill.style.width = '100%';
      if (!blob) {
        alert('Could not render image. Please try again.');
        closeModal();
        return;
      }

      state.activeBlob = blob;
      const previewUrl = URL.createObjectURL(blob);
      modalPreviewImg.src = previewUrl;

      setTimeout(async () => {
        modalLoadingState.style.display = 'none';
        modalReadyState.style.display = 'flex';

        await saveJpegBlob(blob, fileName);
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.7 } });
      }, 250);
    }, 'image/jpeg', 0.92);

  }, 150);
}

// X Sharing with Clipboard Image Attachment Integration
async function handleShareX() {
  const hashtag = 'HackerHouseGoa2026';
  const nameText = state.name ? state.name : 'Builder';
  const roleText = state.title ? `${state.title} (${state.stack})` : 'HH Goa Builder';
  const text = `Just generated my official @HHGoa Builder ID badge: ${roleText}! 🌴🚀\n\nBuild yours and join the squad at HH Goa 2026!`;

  try {
    // Generate blob to copy to clipboard for direct pasting in tweet
    const exportCanvas = document.createElement('canvas');
    if (state.mode === 'pfp') {
      exportCanvas.width = 1000;
      exportCanvas.height = 1000;
      const ctx = exportCanvas.getContext('2d');
      renderPFPFrame(ctx, 1000, 1000);
    } else {
      exportCanvas.width = 1000;
      exportCanvas.height = 1580;
      const ctx = exportCanvas.getContext('2d');
      renderFormatB_BuilderID(ctx, 1000, 1580);
    }

    exportCanvas.toBlob(async (blob) => {
      if (blob && navigator.clipboard && navigator.clipboard.write) {
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/jpeg': blob })]);
        } catch (clipErr) {
          console.warn('Clipboard write error:', clipErr);
        }
      }
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&hashtags=${encodeURIComponent(hashtag)}`;
      window.open(twitterUrl, '_blank');
      alert('Your Builder ID graphic has been copied to clipboard! Paste (Ctrl+V / Cmd+V) directly into your X post.');
    }, 'image/jpeg', 0.95);
  } catch (err) {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&hashtags=${encodeURIComponent(hashtag)}`;
    window.open(twitterUrl, '_blank');
  }
}

async function handleCopyClipboard() {
  try {
    const exportCanvas = document.createElement('canvas');
    if (state.mode === 'pfp') {
      exportCanvas.width = 1000;
      exportCanvas.height = 1000;
      const ctx = exportCanvas.getContext('2d');
      renderPFPFrame(ctx, 1000, 1000);
    } else {
      exportCanvas.width = 1000;
      exportCanvas.height = 1580;
      const ctx = exportCanvas.getContext('2d');
      renderFormatB_BuilderID(ctx, 1000, 1580);
    }

    exportCanvas.toBlob(async (blob) => {
      await navigator.clipboard.write([new ClipboardItem({ 'image/jpeg': blob })], { type: 'image/jpeg' });
      alert('Graphic copied to clipboard! You can paste it directly into X (Twitter).');
    }, 'image/jpeg', 0.95);
  } catch (err) {
    alert('Copying image directly is not supported in this browser. Please use the Download button.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  initCanvas();
  checkValidation();
});
