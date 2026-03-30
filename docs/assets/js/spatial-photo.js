<script>
const card = document.getElementById('card');

const MAX_TILT  = 12;   // degrees
const MAX_SHIFT = 18;   // px image parallax

// ── State: mouse and scroll contribute independently ──────────────────────
let mouse = { x: 0.5, y: 0.5, active: false };
let scroll = { rx: 0 };   // scroll only tilts on X axis (vertical scroll → forward/back lean)

function apply() {
  // When mouse is active it drives both axes fully.
  // When not, scroll drives rx and mouse.x (last known) drives ry — or 0 if never hovered.
  const x = mouse.x;
  const y = mouse.active ? mouse.y : 0.5;

  const mouseRx = -(y - 0.5) * 2 * MAX_TILT;
  const mouseRy =  (x - 0.5) * 2 * MAX_TILT;

  // Blend: mouse overrides scroll when hovered, scroll blends in when not
  const rx = mouse.active ? mouseRx : scroll.rx;
  const ry = mouseRy;

  const tx = -(x - 0.5) * 2 * MAX_SHIFT;
  const ty = mouse.active
    ? -(y - 0.5) * 2 * MAX_SHIFT
    : -(scroll.rx / MAX_TILT) * MAX_SHIFT * 0.5;

  const shineX = x * 100;
  const shineY = mouse.active ? y * 100 : 50 + (scroll.rx / MAX_TILT) * 30;

  card.style.setProperty('--rx', `${rx}deg`);
  card.style.setProperty('--ry', `${ry}deg`);
  card.style.setProperty('--tx', `${tx}px`);
  card.style.setProperty('--ty', `${ty}px`);
  card.style.setProperty('--shine-x', `${shineX}%`);
  card.style.setProperty('--shine-y', `${shineY}%`);
}

// ── Mouse ─────────────────────────────────────────────────────────────────
card.addEventListener('mousemove', e => {
  card.classList.remove('resetting');
  const { left, top, width, height } = card.getBoundingClientRect();
  mouse.x = (e.clientX - left) / width;
  mouse.y = (e.clientY - top)  / height;
  mouse.active = true;
  apply();
});

card.addEventListener('mouseleave', () => {
  mouse.active = false;
  card.classList.add('resetting');
  apply();
});

// ── Scroll ────────────────────────────────────────────────────────────────
// Maps how far the card's centre is from the viewport centre → tilt angle.
// Card centred in viewport = 0°. Card near top/bottom edge = ±MAX_TILT°.
function updateScroll() {
  const { top, bottom, height } = card.getBoundingClientRect();
  const cardCentreY   = top + height / 2;
  const viewportCentreY = window.innerHeight / 2;

  // Normalise: -1 (card above centre) → 0 (centred) → +1 (below centre)
  const offset = (cardCentreY - viewportCentreY) / (window.innerHeight / 2);
  const clamped = Math.max(-1, Math.min(1, offset));

  // Tilt: card above viewport centre → lean forward (positive rx = top toward viewer)
  scroll.rx = -clamped * MAX_TILT;

  if (!mouse.active) {
    card.classList.remove('resetting');
    apply();
  }
}

window.addEventListener('scroll', updateScroll, { passive: true });
// Run once on load so the card already has the right tilt if not centred
updateScroll();

// ── Touch ─────────────────────────────────────────────────────────────────
card.addEventListener('touchmove', e => {
  e.preventDefault();
  const touch = e.touches[0];
  card.dispatchEvent(new MouseEvent('mousemove', {
    clientX: touch.clientX, clientY: touch.clientY
  }));
}, { passive: false });

card.addEventListener('touchend', () => {
  card.dispatchEvent(new MouseEvent('mouseleave'));
});
</script>