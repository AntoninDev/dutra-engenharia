const SELECTORS = {
  menuButton: "#menu-btn",
  sidebar: "#sidebar",
  overlay: "#overlay",
  projectModal: "#project-modal",
  projectImage: "#project-image",
  projectClose: "#project-close",
  contactModal: "#contact-modal",
  contactClose: "#contact-close",
};

const menuButton = document.querySelector(SELECTORS.menuButton);
const sidebar = document.querySelector(SELECTORS.sidebar);
const overlay = document.querySelector(SELECTORS.overlay);
const header = document.querySelector(".header");

let isMenuOpen = false;

function lockPageScroll() {
  document.body.classList.add("no-scroll");
}

function unlockPageScroll() {
  const hasOpenModal = document.querySelector(".project-modal.active");
  if (!isMenuOpen && !hasOpenModal) {
    document.body.classList.remove("no-scroll");
  }
}

function setMenuButtonIcon(open) {
  if (!menuButton) return;

  menuButton.innerHTML = open
    ? '<span aria-hidden="true">×</span>'
    : '<img src="media/icons/menu-bar.svg" alt="" />';
  menuButton.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  menuButton.setAttribute("aria-expanded", String(open));
}

function openMenu() {
  if (!sidebar || !overlay) return;

  isMenuOpen = true;
  sidebar.classList.add("active");
  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
  setMenuButtonIcon(true);
  lockPageScroll();
}

function closeMenu() {
  if (!sidebar || !overlay) return;

  isMenuOpen = false;
  sidebar.classList.remove("active");
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
  setMenuButtonIcon(false);
  unlockPageScroll();
}

function getHeaderOffset() {
  return (header?.offsetHeight || 0) + 10;
}

function scrollToTarget(target) {
  const top = target.getBoundingClientRect().top + window.scrollY - getHeaderOffset();
  window.scrollTo({ top, behavior: "smooth" });
}

menuButton?.addEventListener("click", () => {
  if (isMenuOpen) {
    closeMenu();
  } else {
    openMenu();
  }
});

overlay?.addEventListener("click", closeMenu);

document.querySelector(".logo-link")?.addEventListener("click", (event) => {
  event.preventDefault();
  closeMenu();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

function setupProjectModal() {
  const modal = document.querySelector(SELECTORS.projectModal);
  const modalImage = document.querySelector(SELECTORS.projectImage);
  const modalClose = document.querySelector(SELECTORS.projectClose);
  const modalPrev = document.querySelector(".modal-prev");
  const modalNext = document.querySelector(".modal-next");
  const projectCards = Array.from(document.querySelectorAll(".portfolio-card--click"));
  const projectImages = projectCards
    .map((card) => card.getAttribute("data-expand"))
    .filter(Boolean);

  if (!modal || !modalImage || projectImages.length === 0) return;

  let currentIndex = 0;

  function renderProject() {
    modalImage.src = projectImages[currentIndex];
  }

  function openProject(index) {
    currentIndex = index;
    renderProject();
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    lockPageScroll();

    const content = modal.querySelector(".project-modal__content");
    if (content) content.scrollTop = 0;

    window.setTimeout(() => modalClose?.focus(), 0);
  }

  function closeProject() {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    modalImage.removeAttribute("src");
    unlockPageScroll();
  }

  function showNextProject() {
    currentIndex = (currentIndex + 1) % projectImages.length;
    renderProject();
  }

  function showPreviousProject() {
    currentIndex = (currentIndex - 1 + projectImages.length) % projectImages.length;
    renderProject();
  }

  projectCards.forEach((card, index) => {
    card.addEventListener("click", () => openProject(index));
  });

  modalNext?.addEventListener("click", showNextProject);
  modalPrev?.addEventListener("click", showPreviousProject);
  modalClose?.addEventListener("click", closeProject);

  modal.addEventListener("click", (event) => {
    if (event.target?.matches("[data-close='true']")) {
      closeProject();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!modal.classList.contains("active")) return;

    if (event.key === "Escape") closeProject();
    if (event.key === "ArrowRight") showNextProject();
    if (event.key === "ArrowLeft") showPreviousProject();
  });

  window.projectModalControls = { closeProject };
}

function setupContactModal() {
  const contactModal = document.querySelector(SELECTORS.contactModal);
  const contactClose = document.querySelector(SELECTORS.contactClose);
  if (!contactModal) return;

  function openContact() {
    contactModal.classList.add("active");
    contactModal.setAttribute("aria-hidden", "false");
    lockPageScroll();

    const content = contactModal.querySelector(".project-modal__content");
    if (content) content.scrollTop = 0;

    window.setTimeout(() => contactClose?.focus(), 0);
  }

  function closeContact() {
    contactModal.classList.remove("active");
    contactModal.setAttribute("aria-hidden", "true");
    unlockPageScroll();
  }

  contactClose?.addEventListener("click", closeContact);

  contactModal.addEventListener("click", (event) => {
    if (event.target?.matches("[data-contact-close='true']")) {
      closeContact();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && contactModal.classList.contains("active")) {
      closeContact();
    }
  });

  sidebar?.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (link?.dataset.nav !== "contato") return;

    event.preventDefault();
    closeMenu();
    window.projectModalControls?.closeProject?.();
    openContact();
  });
}

function setupPortfolioPagers() {
  document.querySelectorAll(".portfolio-group[data-pager='2']").forEach((group) => {
    const pages = Array.from(group.querySelectorAll(".page"));
    const prevButtons = Array.from(group.querySelectorAll(".pager-prev"));
    const nextButtons = Array.from(group.querySelectorAll(".pager-next"));

    if (pages.length === 0) return;

    let currentPage = 0;

    function render() {
      pages.forEach((page, index) => {
        page.classList.toggle("active", index === currentPage);
      });

      const isFirstPage = currentPage === 0;
      const isLastPage = currentPage === pages.length - 1;

      prevButtons.forEach((button) => button.classList.toggle("is-hidden", isFirstPage));
      nextButtons.forEach((button) => button.classList.toggle("is-hidden", isLastPage));
    }

    prevButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (currentPage > 0) currentPage -= 1;
        render();
      });
    });

    nextButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (currentPage < pages.length - 1) currentPage += 1;
        render();
      });
    });

    render();
  });
}

function setupSidebarNavigation() {
  sidebar?.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;

    if (link.dataset.nav === "inicio") {
      event.preventDefault();
      closeMenu();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (link.dataset.nav === "contato") return;

    const href = link.getAttribute("href") || "";
    if (!href.startsWith("#")) return;

    const target = document.querySelector(href);
    if (!target) return;

    event.preventDefault();
    closeMenu();
    scrollToTarget(target);
  });
}

setupProjectModal();
setupContactModal();
setupPortfolioPagers();
setupSidebarNavigation();
