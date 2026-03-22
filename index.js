// ===== MENU LATERAL =====
const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

let menuOpen = false;

menuBtn?.addEventListener("click", () => {
  menuOpen = !menuOpen;

  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");

  menuBtn.innerHTML = menuOpen
    ? "✕"
    : '<img src="media/icons/menu-bar.svg" alt="Menu">';

  menuBtn.setAttribute("aria-expanded", String(menuOpen));
});

overlay?.addEventListener("click", () => {
  sidebar.classList.remove("active");
  overlay.classList.remove("active");

  menuBtn.innerHTML = '<img src="media/icons/menu.svg" alt="Menu">';
  menuBtn.setAttribute("aria-expanded", "false");

  menuOpen = false;
});

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
// Agora os botões podem existir no topo e/ou nas laterais.
// Como existem 2 pares de botões no mesmo grupo (top + side), a gente liga todos.
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
      // comportamento padrão (não quebra)
      return;
    }

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();

    // fecha o menu do jeito que você já faz
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    menuBtn.textContent = "☰";
    menuBtn.setAttribute("aria-expanded", "false");
    menuOpen = false;

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

    // se o modal de projeto NÃO estiver aberto, libera scroll
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

  // ESC fecha o contato primeiro (se estiver aberto)
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (contactModal?.classList.contains("active")) closeContact();
  });

  // clique nos links do menu
  sidebar?.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;

    const nav = a.getAttribute("data-nav");

    // INÍCIO -> topo
    if (nav === "inicio") {
      e.preventDefault();

      // fecha menu do jeito que você já faz
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
      menuBtn.textContent = "☰";
      menuBtn.setAttribute("aria-expanded", "false");
      menuOpen = false;

      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // CONTATO -> abre modal contato
    if (nav === "contato") {
      e.preventDefault();

      // fecha menu
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
      menuBtn.textContent = "☰";
      menuBtn.setAttribute("aria-expanded", "false");
      menuOpen = false;

      // se o modal de projeto estiver aberto, fecha ele antes (evita empilhar)
      if (modal?.classList.contains("active")) closeProject();

      openContact();
      return;
    }
  });
})();