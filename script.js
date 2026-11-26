const els = {
  bgFile: document.getElementById("bgFile"),
  showGuide: document.getElementById("showGuide"),
  titleVal: document.getElementById("titleVal"),
  titleFontSize: document.getElementById("titleFontSize"),
  titleSpacing: document.getElementById("titleSpacing"),
  titleOffsetX: document.getElementById("titleOffsetX"),
  titleOffsetY: document.getElementById("titleOffsetY"),
  noVal: document.getElementById("noVal"),
  sceneVal: document.getElementById("sceneVal"),
  cutVal: document.getElementById("cutVal"),
  framesVal: document.getElementById("framesVal"),
  fpsVal: document.getElementById("fpsVal"),
  fontFamily: document.getElementById("fontFamily"),
  fontWeight: document.getElementById("fontWeight"),
  fontSize: document.getElementById("fontSize"),
  inkColor: document.getElementById("inkColor"),
  offsetX: document.getElementById("offsetX"),
  offsetY: document.getElementById("offsetY"),
  downloadBtn: document.getElementById("downloadBtn"),
  resetBtn: document.getElementById("resetBtn"),
  previewCanvas: document.getElementById("previewCanvas"),
  infoReadout: document.getElementById("infoReadout")
};

const pCtx = els.previewCanvas.getContext("2d");
let templateImg = null;

let targetW = 2360;
let targetH = 1666;

const autoImg = new Image();
autoImg.onload = () => {
  templateImg = autoImg;
  targetW = autoImg.naturalWidth || 2360;
  targetH = autoImg.naturalHeight || 1666;
  renderPreview();
};
autoImg.src = "LO_200dpi personal project.png";

els.bgFile.addEventListener("change", (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      templateImg = img;
      targetW = img.naturalWidth;
      targetH = img.naturalHeight;
      renderPreview();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

function getTimeParts() {
  const totalFrames = Math.max(0, parseInt(els.framesVal.value, 10) || 0);
  const fps = Math.max(1, parseInt(els.fpsVal.value, 10) || 24);
  const sec = Math.floor(totalFrames / fps);
  const rem = String(totalFrames % fps).padStart(2, "0");
  return { sec: String(sec), rem };
}

function drawTrackedText(ctx, text, x, y, trackingPx) {
  const chars = Array.from(text);
  if (chars.length === 0) return;

  const scaleFactor = ctx.canvas.width / 2360;
  const spacing = (parseFloat(trackingPx) || 0) * scaleFactor;

  let cursorX = x;
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    ctx.fillText(ch, cursorX, y);
    const w = ctx.measureText(ch).width;
    cursorX += w + (i < chars.length - 1 ? spacing : 0);
  }
}

function drawTextOnly(ctx, w, h) {
  ctx.clearRect(0, 0, w, h);

  const dx = ((parseFloat(els.offsetX.value) || 0) / 100) * w;
  const dy = ((parseFloat(els.offsetY.value) || 0) / 100) * h;
  const titleDx = ((parseFloat(els.titleOffsetX.value) || 0) / 100) * w;
  const titleDy = ((parseFloat(els.titleOffsetY.value) || 0) / 100) * h;

  const basePxSize = Math.max(12, ((parseFloat(els.fontSize.value) || 4) / 100) * h);
  const titlePxSize = Math.max(12, ((parseFloat(els.titleFontSize.value) || 4) / 100) * h);
  const weight = els.fontWeight.value || "600";

  const rowY = h * 0.111 + dy;
  const { sec, rem } = getTimeParts();

  ctx.save();
  ctx.fillStyle = els.inkColor.value;
  ctx.textBaseline = "alphabetic";

  ctx.font = `${weight} ${Math.round(titlePxSize)}px ${els.fontFamily.value}`;
  ctx.textAlign = "left";
  drawTrackedText(
    ctx,
    els.titleVal.value.trim(),
    w * 0.095 + dx + titleDx,
    rowY + titleDy,
    els.titleSpacing.value
  );

  ctx.font = `${weight} ${Math.round(basePxSize)}px ${els.fontFamily.value}`;
  ctx.textAlign = "left";
  ctx.fillText(els.noVal.value.trim(), w * 0.360 + dx, rowY);
  ctx.fillText(els.sceneVal.value.trim(), w * 0.518 + dx, rowY);
  ctx.fillText(els.cutVal.value.trim(), w * 0.606 + dx, rowY);

  ctx.textAlign = "center";
  ctx.fillText(sec, w * 0.772 + dx, rowY);
  ctx.fillText(rem, w * 0.815 + dx, rowY);

  ctx.restore();
}

function drawFallbackGuide(ctx, w, h) {
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);

  const y = h * 0.111;
  ctx.fillStyle = "#444";
  ctx.font = `500 ${Math.round(h * 0.02)}px "Segoe UI", sans-serif`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText("TITLE.", w * 0.032, y);
  ctx.fillText("NO.", w * 0.322, y);
  ctx.fillText("S.", w * 0.495, y);
  ctx.fillText("C.", w * 0.582, y);
  ctx.fillText("TIME  (       +       )", w * 0.710, y);

  ctx.strokeStyle = "#888";
  ctx.lineWidth = Math.max(1, w * 0.0008);
  ctx.strokeRect(w * 0.032, h * 0.128, w * 0.936, h * 0.742);
  ctx.restore();
}

function renderPreview() {
  els.previewCanvas.width = targetW;
  els.previewCanvas.height = targetH;

  pCtx.clearRect(0, 0, targetW, targetH);

  if (els.showGuide.checked) {
    if (templateImg) {
      pCtx.drawImage(templateImg, 0, 0, targetW, targetH);
    } else {
      drawFallbackGuide(pCtx, targetW, targetH);
    }
  }

  const textLayer = document.createElement("canvas");
  textLayer.width = targetW;
  textLayer.height = targetH;
  drawTextOnly(textLayer.getContext("2d"), targetW, targetH);
  pCtx.drawImage(textLayer, 0, 0);

  const { sec, rem } = getTimeParts();
  els.infoReadout.textContent = `TIME ( ${sec} + ${rem} ) | Ukuran Export: ${targetW} x ${targetH} px`;
}

els.downloadBtn.addEventListener("click", () => {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = targetW;
  exportCanvas.height = targetH;
  drawTextOnly(exportCanvas.getContext("2d"), targetW, targetH);

  const s = (els.sceneVal.value || "01").trim().replace(/\s+/g, "_");
  const c = (els.cutVal.value || "01").trim().replace(/\s+/g, "_");
  const link = document.createElement("a");
  link.download = `slate_S${s}_C${c}.png`;
  link.href = exportCanvas.toDataURL("image/png");
  link.click();
});

els.resetBtn.addEventListener("click", () => {
  els.offsetX.value = 0;
  els.offsetY.value = 0.8;
  els.titleOffsetX.value = 0;
  els.titleOffsetY.value = 0;
  els.titleFontSize.value = 4;
  els.titleSpacing.value = 0;
  renderPreview();
});

document.querySelectorAll("input, select").forEach((el) => {
  if (el.id === "bgFile") return;
  el.addEventListener("input", renderPreview);
  el.addEventListener("change", renderPreview);
});

renderPreview();