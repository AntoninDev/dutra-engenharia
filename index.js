// ===== MENU LATERAL =====
const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

let menuOpen = false;

function openMenu() {
  menuOpen = true;

  sidebar.classList.add("active");
  overlay.classList.add("active");

  menuBtn.innerHTML = "✕";
  menuBtn.setAttribute("aria-expanded", "true");

  document.body.classList.add("no-scroll");
}

function closeMenu() {
  menuOpen = false;

  sidebar.classList.remove("active");
  overlay.classList.remove("active");

  menuBtn.innerHTML = '<img src="media/icons/menu-bar.svg" alt="Menu">';
  menuBtn.setAttribute("aria-expanded", "false");

  document.body.classList.remove("no-scroll");
}

menuBtn.addEventListener("click", () => {
  if (menuOpen) {
    closeMenu();
  } else {
    openMenu();
  }
});

overlay.addEventListener("click", closeMenu);

// ===== MODAL (EXPANSÃO) =====
const modal = document.getElementById("project-modal");
const modalImg = document.getElementById("project-image");
const modalClose = document.getElementById("project-close");

function openProject(src) {
  if (!modal || !modalImg) return;

  modalImg.src = src;
  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");

  const content = modal.querySelector(".project-modal__content");
  if (content) content.scrollTop = 0;

  setTimeout(() => modalClose?.focus(), 0);
}

function closeProject() {
  if (!modal || !modalImg) return;

  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
  modalImg.src = "";
}

modalClose?.addEventListener("click", closeProject);

modal?.addEventListener("click", (e) => {
  const target = e.target;
  if (target && target.matches("[data-close='true']")) closeProject();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal?.classList.contains("active")) closeProject();
});

// clique nos cards abre modal
function bindCards(scope = document) {
  scope.querySelectorAll(".portfolio-card--click").forEach((card) => {
    card.addEventListener("click", () => {
      const src = card.getAttribute("data-expand");
      if (!src) return;
      openProject(src);
    });
  });
}
bindCards(document);

// ===== PAGINAÇÃO: 2 CARDS POR VEZ (page 0, page 1, ...) =====
document.querySelectorAll(".portfolio-group[data-pager='2']").forEach((group) => {
  const pages = Array.from(group.querySelectorAll(".page"));

  const prevBtns = Array.from(group.querySelectorAll(".pager-prev"));
  const nextBtns = Array.from(group.querySelectorAll(".pager-next"));

  let index = 0;

  function render() {
    pages.forEach((p, i) => p.classList.toggle("active", i === index));

    const isFirst = index === 0;
    const isLast = index === pages.length - 1;

    prevBtns.forEach((btn) => btn.classList.toggle("is-hidden", isFirst));
    nextBtns.forEach((btn) => btn.classList.toggle("is-hidden", isLast));
  }

  prevBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (index > 0) index--;
      render();
    });
  });

  nextBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (index < pages.length - 1) index++;
      render();
    });
  });

  render();
});

// ===== MENU: scroll suave com offset do header (SEM mexer nas funções existentes) =====
(function () {
  const header = document.querySelector(".header");
  const headerH = () => (header ? header.offsetHeight : 0);

  sidebar?.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;

    const href = a.getAttribute("href") || "";
    if (!href.startsWith("#") || href === "#") {
      return;
    }

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();

    closeMenu();

    const y = target.getBoundingClientRect().top + window.pageYOffset - headerH() - 10;
    window.scrollTo({ top: y, behavior: "smooth" });
  });
})();

// ===== MENU: Inicio -> topo / Contato -> abre modal contato =====
(function () {
  const contactModal = document.getElementById("contact-modal");
  const contactClose = document.getElementById("contact-close");

  function openContact() {
    if (!contactModal) return;
    contactModal.classList.add("active");
    contactModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");

    const content = contactModal.querySelector(".project-modal__content");
    if (content) content.scrollTop = 0;
    setTimeout(() => contactClose?.focus(), 0);
  }

  function closeContact() {
    if (!contactModal) return;
    contactModal.classList.remove("active");
    contactModal.setAttribute("aria-hidden", "true");

    const projectModal = document.getElementById("project-modal");
    if (!projectModal?.classList.contains("active")) {
      document.body.classList.remove("no-scroll");
    }
  }

  contactClose?.addEventListener("click", closeContact);

  contactModal?.addEventListener("click", (e) => {
    const t = e.target;
    if (t && t.matches("[data-contact-close='true']")) closeContact();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (contactModal?.classList.contains("active")) closeContact();
  });

  sidebar?.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;

    const nav = a.getAttribute("data-nav");

    // INÍCIO -> topo
    if (nav === "inicio") {
      e.preventDefault();
      closeMenu();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // CONTATO -> abre modal contato
    if (nav === "contato") {
      e.preventDefault();
      closeMenu();

      if (modal?.classList.contains("active")) closeProject();

      openContact();
      return;
    }
  });
})();

