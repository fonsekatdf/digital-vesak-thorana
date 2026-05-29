const container = document.getElementById("thorana-container");
const backgroundMusic = document.getElementById("background-music");
const BUDDHA_DEFAULT_Y_OFFSET = -115;

function setupBackgroundAudio() {
    if (!backgroundMusic) return;
    let playButton = null;

    function removePlayButton() {
        if (playButton && playButton.parentNode) {
            playButton.parentNode.removeChild(playButton);
            playButton = null;
        }
    }

    function createPlayButton() {
        if (playButton) return;
        playButton = document.createElement("button");
        playButton.id = "audio-play-button";
        playButton.type = "button";
        playButton.textContent = "Play Music";
        playButton.addEventListener("click", async () => {
            try {
                await backgroundMusic.play();
                removePlayButton();
            } catch (err) {
                console.warn("Manual audio start failed:", err);
            }
        });
        document.body.appendChild(playButton);
    }

    async function tryPlayAudio() {
        try {
            await backgroundMusic.play();
            removePlayButton();
        } catch (err) {
            createPlayButton();
        }
    }

    const startOnFirstGesture = async () => {
        await tryPlayAudio();
    };

    window.addEventListener("pointerdown", startOnFirstGesture, { once: true });
    window.addEventListener("keydown", startOnFirstGesture, { once: true });
    tryPlayAudio();
}

setupBackgroundAudio();

let centralRingGroups = [];
let allDots = [];
let frameDots = [[], [], [], [], [], [], []];
let outlineDots = [[], [], [], [], [], [], []];
let baseDots = [];

function createDot(x, y, colorClass, parentArray = null) {
    const d = document.createElement("div");
    d.className = `dot ${colorClass}`;
    d.style.left = `${x}px`;
    d.style.top = `${y}px`;
    container.appendChild(d);
    if (parentArray) parentArray.push(d);
    allDots.push(d);
    return d;
}

function drawCircle(cx, cy, r, count, colorClass, parentArray = null) {
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        const dot = createDot(x, y, colorClass, parentArray);
        dot.dataset.angle = angle;
        dot.dataset.idx = i;
    }
}

function drawTexturedCircle(cx, cy, r, count, palette, parentArray = null) {
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        const colorClass = palette[i % palette.length];
        createDot(x, y, colorClass, parentArray);
    }
}

function drawGrid(startX, startY, rows, cols, sx, sy, colorClass, parentArray) {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            createDot(startX + c * sx, startY + r * sy, colorClass, parentArray);
        }
    }
}

let C_X = container.clientWidth / 2;
let C_Y = container.clientHeight / 2;

const CENTER_COLORS = [
    "center-blue",
    "center-yellow",
    "center-red",
    "center-white",
    "center-orange",
];
const CENTER_RADII = [26, 52, 78, 104, 130];
const MIDDLE_CENTER_RING_INDEX = Math.floor(CENTER_RADII.length / 2);
const MIDDLE_CENTER_RING_RADIUS_BOOST = 0;
const CENTER_RING_SPACING = [18, 18, 18, 18, 18];

function dotCountForRadius(radius, spacing = 18) {
    return Math.max(6, Math.round((Math.PI * 2 * radius) / spacing));
}

function buildCenterRings() {
    centralRingGroups = [];
    for (let i = 0; i < CENTER_RADII.length; i++) {
        const r =
            CENTER_RADII[i] +
            (i === MIDDLE_CENTER_RING_INDEX ? MIDDLE_CENTER_RING_RADIUS_BOOST : 0);
        const color = CENTER_COLORS[i % CENTER_COLORS.length];
        const spacing = CENTER_RING_SPACING[i] || 18;
        const count = dotCountForRadius(r, spacing);
        const group = [];
        drawCircle(C_X, C_Y, r, count, color, group);
        centralRingGroups.push(group);
    }
}

function buildFilledDotCircle(cx, cy, radius, colors, spacing, parentArray) {
    for (let i = 0; i < colors.length; i++) {
        const layerR = Math.max(6, radius - (colors.length - 1 - i) * 14);
        const count = dotCountForRadius(layerR, spacing);
        drawCircle(cx, cy, layerR, count, colors[i], parentArray);
    }
}

const FRAME_RADIUS = 350;
const FRAME_CIRCLE_R = 104;
const OUTER_PALETTE = [
    "color-blue",
    "color-yellow",
    "color-red",
    "color-white",
    "color-orange",
    "color-neon",
];
const OUTER_CIRCLE_RADIUS_BOOST = 18;
const OUTER_CIRCLE_DOT_SPACING = 18;

for (let i = 0; i < 7; i++) {
    if (i === 0) continue;
    const angle = (i / 7) * Math.PI * 2 - Math.PI / 2;
    const fx = C_X + Math.cos(angle) * FRAME_RADIUS;
    const fy = C_Y + Math.sin(angle) * FRAME_RADIUS;
    const group = [];
    buildFilledDotCircle(
        fx,
        fy,
        FRAME_CIRCLE_R + OUTER_CIRCLE_RADIUS_BOOST,
        OUTER_PALETTE,
        OUTER_CIRCLE_DOT_SPACING,
        group,
    );
    frameDots[i] = group;

    const outlineR = FRAME_CIRCLE_R + OUTER_CIRCLE_RADIUS_BOOST + 18;
    const outlineCount = dotCountForRadius(outlineR, 14);
    const outlineGroup = [];
    drawTexturedCircle(
        fx,
        fy,
        outlineR,
        outlineCount,
        OUTER_PALETTE,
        outlineGroup,
    );
    outlineDots[i] = outlineGroup;
}

function addCenterBuddha(
    src = "images/buddha.png",
    size = 180,
    yOffset = 0,
    xOffset = 0,
) {
    let img = document.getElementById("center-buddha");
    if (!img) {
        img = document.createElement("img");
        img.id = "center-buddha";
        img.src = src;
        img.alt = "Buddha";
        container.appendChild(img);
    }
    img.style.width = `${size}px`;
    img.style.left = `${C_X}px`;
    img.style.top = `${C_Y + yOffset}px`;
    img.style.transform = "translate(-50%, -50%) rotate(180deg)";
    img.style.zIndex = 60;
    img.dataset.yOffset = String(yOffset);
    img.dataset.xOffset = String(xOffset);
    window.centerBuddhaImage = img;
}

buildCenterRings();
addCenterBuddha("images/buddha.png", 240, BUDDHA_DEFAULT_Y_OFFSET, 0);

function repositionBuddha() {
    C_X = container.clientWidth / 2;
    C_Y = container.clientHeight / 2;
    if (window.centerBuddhaImage) {
        const cur = window.centerBuddhaImage;
        const yOffset = Number(cur.dataset.yOffset || 0);
        const xOffset = Number(cur.dataset.xOffset || 0);
        cur.style.left = `${C_X + xOffset}px`;
        cur.style.top = `${C_Y + yOffset}px`;
    }
}

function saveBuddhaState() {
    if (!window.centerBuddhaImage) return;
    const img = window.centerBuddhaImage;
    const state = {
        xOffset: Number(img.dataset.xOffset || 0),
        yOffset: Number(img.dataset.yOffset || 0),
        width: parseInt(img.style.width || 180, 10) || 180,
    };
    try {
        localStorage.setItem("buddhaState", JSON.stringify(state));
    } catch (e) {
        console.warn("Could not save buddhaState", e);
    }
}

function loadBuddhaState() {
    if (!window.centerBuddhaImage) return;
    const raw = localStorage.getItem("buddhaState");
    if (!raw) return;
    try {
        const s = JSON.parse(raw);
        const img = window.centerBuddhaImage;
        img.dataset.xOffset = String(s.xOffset || 0);
        img.dataset.yOffset = String(s.yOffset || 0);
        img.style.width = (s.width || 180) + "px";
        C_X = container.clientWidth / 2;
        C_Y = container.clientHeight / 2;
        img.style.left = `${C_X + Number(img.dataset.xOffset)}px`;
        img.style.top = `${C_Y + Number(img.dataset.yOffset)}px`;
    } catch (e) {
        console.error("Failed to parse buddhaState", e);
    }
}

function initBuddhaControls() {
    const scale = document.getElementById("buddha-scale");
    const x = document.getElementById("buddha-x");
    const y = document.getElementById("buddha-y");
    const reset = document.getElementById("buddha-reset");
    const leftBtn = document.getElementById("buddha-left");
    const rightBtn = document.getElementById("buddha-right");
    const leftFine = document.getElementById("buddha-left-fine");
    const rightFine = document.getElementById("buddha-right-fine");

    if (!window.centerBuddhaImage) return;
    const img = window.centerBuddhaImage;

    let initialYOffset = 0;
    let initialXOffset = 0;
    if (img.style.top)
        initialYOffset = Math.round(parseFloat(img.style.top) - C_Y);
    if (img.style.left)
        initialXOffset = Math.round(parseFloat(img.style.left) - C_X);

    img.dataset.yOffset = initialYOffset;
    img.dataset.xOffset = initialXOffset;
    y.value = initialYOffset;
    x.value = initialXOffset;
    scale.value = parseInt(img.style.width || 180, 10) || 180;

    function applyY(val) {
        img.dataset.yOffset = val;
        img.style.top = `${C_Y + Number(val)}px`;
    }

    function applyX(val) {
        img.dataset.xOffset = val;
        img.style.left = `${C_X + Number(val)}px`;
    }

    scale.addEventListener("input", (e) => {
        img.style.width = `${e.target.value}px`;
    });
    x.addEventListener("input", (e) => {
        applyX(e.target.value);
    });
    y.addEventListener("input", (e) => {
        applyY(e.target.value);
    });

    if (leftBtn)
        leftBtn.addEventListener("click", () => {
            const cur = Number(img.dataset.xOffset || 0);
            const next = cur - 5;
            x.value = String(next);
            applyX(next);
        });

    if (rightBtn)
        rightBtn.addEventListener("click", () => {
            const cur = Number(img.dataset.xOffset || 0);
            const next = cur + 5;
            x.value = String(next);
            applyX(next);
        });

    if (leftFine)
        leftFine.addEventListener("click", () => {
            const cur = Number(img.dataset.xOffset || 0);
            const next = cur - 1;
            x.value = String(next);
            applyX(next);
        });

    if (rightFine)
        rightFine.addEventListener("click", () => {
            const cur = Number(img.dataset.xOffset || 0);
            const next = cur + 1;
            x.value = String(next);
            applyX(next);
        });

    reset.addEventListener("click", () => {
        scale.value = 240;
        x.value = 0;
        y.value = BUDDHA_DEFAULT_Y_OFFSET;
        img.style.width = "240px";
        applyX(0);
        applyY(BUDDHA_DEFAULT_Y_OFFSET);
    });

    window.addEventListener("resize", () => {
        repositionBuddha();
    });
}

setTimeout(() => {
    loadBuddhaState();
    repositionBuddha();
    if (localStorage.getItem("buddhaControlsRemoved")) {
        const controls = document.getElementById("buddha-controls");
        if (controls && controls.parentNode)
            controls.parentNode.removeChild(controls);
    } else {
        initBuddhaControls();
    }
}, 50);

let pulseStep = 0;
let centerWaveStep = 0;
let outerWaveStep = 0;
let outlineStep = 0;

const OUTER_WAVE_SPEED = 0.22;
const OUTER_WAVE_WIDTH = 0.55;
const OUTER_MODES = ["multi-peak", "single-peak", "chase"];
let outerModeIndex = 0;
let OUTER_ANIM_MODE = OUTER_MODES[outerModeIndex];

setInterval(() => {
    outerModeIndex = (outerModeIndex + 1) % OUTER_MODES.length;
    OUTER_ANIM_MODE = OUTER_MODES[outerModeIndex];
}, 6000);

const MIDDLE_RING_MODES = ["wavePulse", "orbitChase", "breath", "sparkle"];
let middleRingModeIndex = 0;
let MIDDLE_RING_ANIM_MODE = MIDDLE_RING_MODES[middleRingModeIndex];

setInterval(() => {
    middleRingModeIndex = (middleRingModeIndex + 1) % MIDDLE_RING_MODES.length;
    MIDDLE_RING_ANIM_MODE = MIDDLE_RING_MODES[middleRingModeIndex];
}, 4200);

const ACTIVE_OUTLINE_MODES = ["circularWave", "sineSweep", "rotatingGradient"];

function normalizeAngle(a) {
    const full = Math.PI * 2;
    return ((a % full) + full) % full;
}

function circularAngleDistance(a, b) {
    const full = Math.PI * 2;
    const d = Math.abs(normalizeAngle(a) - normalizeAngle(b));
    return Math.min(d, full - d);
}

function resetDotVisualState(dot) {
    dot.classList.remove("highlight");
    dot.classList.add("off");
    dot.style.opacity = "";
    dot.style.filter = "";
    dot.style.transform = "translate(-50%, -50%)";
}

function applyMiddleRingAnimation(group, mode, step) {
    if (!group || !group.length) return;
    const count = group.length;
    group.forEach((dot) => {
        resetDotVisualState(dot);
    });

    if (mode === "wavePulse") {
        const pulse = 0.5 + 0.5 * Math.sin(step * 0.18);
        group.forEach((dot) => {
            const angle = Number(dot.dataset.angle || 0);
            const waveCenter = normalizeAngle(step * 0.22);
            const distance = circularAngleDistance(angle, waveCenter);
            const ringWave = Math.max(0, 1 - distance / 1.1);
            const strength = Math.max(0, pulse * Math.pow(ringWave, 1.7));
            if (strength > 0.02) {
                const scale = 1 + 0.22 * strength;
                dot.style.opacity = (0.2 + 0.8 * strength).toFixed(3);
                dot.style.filter = `brightness(${1 + 0.95 * strength}) saturate(${1 + 0.2 * strength})`;
                dot.style.transform = `translate(-50%, -50%) scale(${scale})`;
                dot.classList.add("highlight");
                dot.classList.remove("off");
            }
        });
        return;
    }

    if (mode === "orbitChase") {
        const chaseCenter = Math.floor(step * 0.95 * count) % count;
        const width = Math.max(3, Math.round(count * 0.18));
        group.forEach((dot) => {
            const idx = Number(dot.dataset.idx || 0) % count;
            const dist = Math.min(
                Math.abs(idx - chaseCenter),
                count - Math.abs(idx - chaseCenter),
            );
            const strength = Math.pow(Math.max(0, 1 - dist / width), 1.7);
            if (strength > 0.02) {
                const scale = 1 + 0.28 * strength;
                dot.style.opacity = (0.16 + 0.84 * strength).toFixed(3);
                dot.style.filter = `brightness(${1 + 1.1 * strength}) saturate(${1 + 0.3 * strength})`;
                dot.style.transform = `translate(-50%, -50%) scale(${scale})`;
                dot.classList.add("highlight");
                dot.classList.remove("off");
            }
        });
        return;
    }

    if (mode === "breath") {
        const breath = 0.42 + 0.58 * Math.sin(step * 0.1);
        group.forEach((dot) => {
            const angle = Number(dot.dataset.angle || 0);
            const angularGlow = 0.72 + 0.28 * Math.cos(angle * 3 - step * 0.14);
            const strength = Math.max(0, breath * angularGlow);
            if (strength > 0.02) {
                const scale = 1 + 0.18 * strength;
                dot.style.opacity = (0.22 + 0.78 * strength).toFixed(3);
                dot.style.filter = `brightness(${1 + 0.8 * strength}) saturate(${1 + 0.16 * strength})`;
                dot.style.transform = `translate(-50%, -50%) scale(${scale})`;
                dot.classList.add("highlight");
                dot.classList.remove("off");
            }
        });
        return;
    }

    const waveCenter = normalizeAngle(step * 0.28);
    group.forEach((dot) => {
        const angle = Number(dot.dataset.angle || 0);
        const d = circularAngleDistance(angle, waveCenter);
        const sparkleSeed = Number(dot.dataset.idx || 0) * 0.9 + step * 0.35;
        const sparkle = 0.55 + 0.45 * Math.sin(sparkleSeed * 1.7);
        const strength = Math.pow(Math.max(0, 1 - d / 1.05), 1.35) * sparkle;
        if (strength > 0.02) {
            const scale = 1 + 0.16 * strength;
            dot.style.opacity = (0.16 + 0.84 * strength).toFixed(3);
            dot.style.filter = `brightness(${1 + 1.05 * strength}) saturate(${1 + 0.22 * strength})`;
            dot.style.transform = `translate(-50%, -50%) scale(${scale})`;
            dot.classList.add("highlight");
            dot.classList.remove("off");
        }
    });
}

function runAnimations() {
    allDots.forEach((d) => d.classList.add("off"));

    const activeCenter = centerWaveStep % centralRingGroups.length;
    centralRingGroups.forEach((g, idx) => {
        if (idx <= activeCenter)
            g.forEach((d) => {
                d.classList.remove("off");
                d.classList.add("highlight");
            });
        else g.forEach((d) => d.classList.remove("highlight"));
    });

    const middleRing = centralRingGroups[MIDDLE_CENTER_RING_INDEX];
    applyMiddleRingAnimation(middleRing, MIDDLE_RING_ANIM_MODE, centerWaveStep);

    outerWaveStep += OUTER_WAVE_SPEED;
    outlineStep += 0.18;

    for (let fi = 1; fi < frameDots.length; fi++) {
        const ring = frameDots[fi];
        if (!ring || !ring.length) continue;
        const wavePhase = normalizeAngle(outerWaveStep + fi * 0.85);

        ring.forEach((dot) => {
            dot.classList.remove("highlight");
            dot.classList.add("off");
            dot.style.opacity = "";
            dot.style.filter = "";
        });

        if (OUTER_ANIM_MODE === "chase") {
            const len = ring.length;
            const chaseCenter = Math.floor(outerWaveStep * 0.6 * len + fi * 3) % len;
            const width = 5;
            ring.forEach((dot) => {
                const idx = Number(dot.dataset.idx || 0) % len;
                const d = Math.abs(idx - chaseCenter);
                const dist = Math.min(d, len - d);
                const t = Math.max(0, 1 - dist / width);
                const strength = Math.pow(t, 1.8);
                if (strength > 0.02) {
                    dot.style.opacity = (0.18 + 0.82 * strength).toFixed(3);
                    dot.style.filter = `brightness(${1 + 0.9 * strength})`;
                    dot.classList.add("highlight");
                    dot.classList.remove("off");
                } else dot.style.opacity = "0.18";
            });
        } else if (OUTER_ANIM_MODE === "single-peak") {
            ring.forEach((dot) => {
                const ang = Number(dot.dataset.angle || 0);
                const best = circularAngleDistance(ang, wavePhase);
                const t = Math.max(0, 1 - best / OUTER_WAVE_WIDTH);
                const s = Math.pow(t, 1.8);
                if (s > 0.02) {
                    dot.style.opacity = (0.18 + 0.82 * s).toFixed(3);
                    dot.style.filter = `brightness(${1 + 0.9 * s})`;
                    dot.classList.add("highlight");
                    dot.classList.remove("off");
                } else dot.style.opacity = "0.18";
            });
        } else {
            ring.forEach((dot) => {
                const ang = Number(dot.dataset.angle || 0);
                let bestDist = Infinity;
                for (let k = 0; k < 3; k++) {
                    const peak = normalizeAngle(wavePhase + (k * Math.PI * 2) / 3);
                    const d = circularAngleDistance(ang, peak);
                    if (d < bestDist) bestDist = d;
                }
                const t = Math.max(0, 1 - bestDist / OUTER_WAVE_WIDTH);
                const s = Math.pow(t, 1.8);
                if (s > 0.02) {
                    dot.style.opacity = (0.18 + 0.82 * s).toFixed(3);
                    dot.style.filter = `brightness(${1 + 0.9 * s})`;
                    dot.classList.add("highlight");
                    dot.classList.remove("off");
                } else dot.style.opacity = "0.18";
            });
        }
    }

    for (let fi = 1; fi < outlineDots.length; fi++) {
        const ring = outlineDots[fi];
        if (!ring || !ring.length) continue;
        const mode = ACTIVE_OUTLINE_MODES[(fi - 1) % ACTIVE_OUTLINE_MODES.length];
        const base = outlineStep;

        if (mode === "circularWave") {
            const wavePhase = base * 0.9 + fi * 0.45;
            ring.forEach((dot) => {
                const a = Number(dot.dataset.angle || 0);
                const d = circularAngleDistance(a, normalizeAngle(wavePhase));
                const wave = 0.5 + 0.5 * Math.cos(d * 6 - base * 0.6);
                const s = Math.pow(Math.max(0, wave), 2.0);
                dot.style.opacity = (0.18 + 0.82 * s).toFixed(3);
                if (s > 0.03) {
                    dot.classList.add("highlight");
                    dot.classList.remove("off");
                    dot.style.filter = `brightness(${1 + 1.0 * s})`;
                } else {
                    dot.classList.remove("highlight");
                    dot.style.filter = "";
                }
            });
        } else if (mode === "sineSweep") {
            const phase = base * 0.6 + fi * 0.35;
            ring.forEach((dot) => {
                const a = Number(dot.dataset.angle || 0);
                const ang = normalizeAngle(a - phase);
                const wave = 0.5 + 0.5 * Math.sin(ang * 4 + base * 0.4);
                const s = Math.pow(Math.max(0, wave), 1.8);
                dot.style.opacity = (0.18 + 0.82 * s).toFixed(3);
                if (s > 0.03) {
                    dot.classList.add("highlight");
                    dot.classList.remove("off");
                    dot.style.filter = `brightness(${1 + 1.05 * s})`;
                } else {
                    dot.classList.remove("highlight");
                    dot.style.filter = "";
                }
            });
        } else if (mode === "rotatingGradient") {
            const phase = normalizeAngle(base * 0.5 + fi * 0.25);
            ring.forEach((dot) => {
                const a = Number(dot.dataset.angle || 0);
                const d = circularAngleDistance(a, phase);
                const s = Math.max(0, 1 - d / 1.2);
                dot.style.opacity = (0.12 + 0.88 * Math.pow(s, 1.6)).toFixed(3);
                if (s > 0.02) {
                    dot.classList.add("highlight");
                    dot.classList.remove("off");
                    dot.style.filter = `brightness(${1 + 0.9 * s})`;
                } else {
                    dot.classList.remove("highlight");
                    dot.style.filter = "";
                }
            });
        }
    }

    baseDots.forEach((d, idx) => {
        if ((idx + pulseStep) % 2 === 0) d.classList.remove("off");
    });

    pulseStep++;
    centerWaveStep++;
}

setInterval(runAnimations, 120);
runAnimations();
