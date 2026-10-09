// Mobile navigation
const toggle = document.querySelector(".nav__toggle");
const links = document.querySelector(".nav__links");
toggle.addEventListener("click", () => {
  const open = toggle.getAttribute("aria-expanded") === "true";
  toggle.setAttribute("aria-expanded", String(!open));
  toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
  links.classList.toggle("is-open", !open);
});
links.addEventListener("click", (e) => {
  if (e.target.closest("a")) {
    toggle.setAttribute("aria-expanded", "false");
    links.classList.remove("is-open");
  }
});

// Nav border on scroll
const nav = document.querySelector(".nav");
addEventListener("scroll", () => nav.classList.toggle("is-scrolled", scrollY > 10), { passive: true });

// Reveal on scroll + count-up numbers
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
function countUp(el) {
  const target = parseFloat(el.dataset.count);
  const decimals = Number(el.dataset.decimals || 0);
  if (reduced) { el.textContent = target.toFixed(decimals); return; }
  const start = performance.now();
  const step = (now) => {
    const t = Math.min((now - start) / 1400, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = (target * eased).toFixed(decimals);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    entry.target.querySelectorAll("[data-count]").forEach(countUp);
    io.unobserve(entry.target);
  });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 80}ms`;
  io.observe(el);
});

// Accessible menu tabs (arrow keys move between tabs)
const tabs = [...document.querySelectorAll('[role="tab"]')];
function selectTab(tab) {
  tabs.forEach((t) => {
    const selected = t === tab;
    t.setAttribute("aria-selected", String(selected));
    t.tabIndex = selected ? 0 : -1;
    document.getElementById(t.getAttribute("aria-controls")).hidden = !selected;
  });
  tab.focus();
}
tabs.forEach((tab, i) => {
  tab.addEventListener("click", () => selectTab(tab));
  tab.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") selectTab(tabs[(i + 1) % tabs.length]);
    if (e.key === "ArrowLeft") selectTab(tabs[(i - 1 + tabs.length) % tabs.length]);
  });
});

// Booking form
const form = document.getElementById("booking");
const dateInput = document.getElementById("date");
dateInput.min = new Date().toISOString().split("T")[0];

let guests = 2;
const guestsOut = document.getElementById("guests");
form.querySelectorAll("[data-step]").forEach((btn) =>
  btn.addEventListener("click", () => {
    guests = Math.min(12, Math.max(1, guests + Number(btn.dataset.step)));
    guestsOut.textContent = guests;
  })
);

const messages = {
  name: "Please tell us your name.",
  phone: "Please enter a valid phone number.",
  date: "Please pick a date from today onwards.",
  time: "Please choose a time.",
};
function validate(input) {
  const field = input.closest(".field");
  const ok = input.checkValidity();
  field.classList.toggle("invalid", !ok);
  field.querySelector(".error").textContent = ok ? "" : messages[input.name];
  input.setAttribute("aria-invalid", String(!ok));
  return ok;
}
const inputs = [...form.querySelectorAll("input[required], select[required]")];
inputs.forEach((input) => input.addEventListener("blur", () => validate(input)));

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const results = inputs.map(validate);
  if (results.includes(false)) {
    inputs[results.indexOf(false)].focus();
    return;
  }
  const success = form.querySelector(".form__success");
  const date = new Date(dateInput.value).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  success.textContent = `Thanks, ${form.name.value.trim()}! A table for ${guests} on ${date} at ${form.time.value} is requested. (Demo: nothing was sent.)`;
  success.hidden = false;
  form.reset();
  guests = 2;
  guestsOut.textContent = guests;
});

// Opening hours: highlight today and show open/closed
const hours = { 0: [7, 16], 1: [7, 16], 2: [7, 16], 3: [7, 16], 4: [7, 16], 5: [7, 14], 6: null };
const now = new Date();
const today = now.getDay();
document.querySelectorAll(".hours tr").forEach((row) => {
  if (row.dataset.days.split(",").map(Number).includes(today)) row.classList.add("today");
});
const status = document.getElementById("open-status");
const h = hours[today];
const hourNow = now.getHours() + now.getMinutes() / 60;
const isOpen = h && hourNow >= h[0] && hourNow < h[1];
status.textContent = isOpen ? `Open now · until ${h[1]}:00` : "Closed now";
status.classList.add(isOpen ? "open" : "closed");

document.getElementById("year").textContent = now.getFullYear();
