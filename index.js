const SELECTORS = {
  menuButton: "#menu-btn",
  sidebar: "#sidebar",
  overlay: "#overlay",
  projectModal: "#project-modal",
  projectImage: "#project-image",
  projectClose: "#project-close",
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

function animateScrollTo(top) {
  const start = window.scrollY;
  const distance = top - start;
  if (Math.abs(distance) < 1) return;

  const duration = Math.min(760, Math.max(300, Math.abs(distance) * 0.35));
  const startTime = performance.now();

  function easeOutCubic(progress) {
    return 1 - Math.pow(1 - progress, 3);
  }

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    window.scrollTo(0, start + distance * easeOutCubic(progress));

    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  }

  window.scrollTo(0, start + distance * 0.08);
  step(startTime + 16);
}

function scrollToTarget(target) {
  const top = target.getBoundingClientRect().top + window.scrollY - getHeaderOffset();
  animateScrollTo(top);
}

function setupHorizontalSwipe(element, onSwipeLeft, onSwipeRight) {
  if (!element) return;

  const minDistance = 45;
  const maxVerticalDrift = 70;
  let startX = 0;
  let startY = 0;
  let pointerId = null;
  let didSwipe = false;

  element.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    startX = event.clientX;
    startY = event.clientY;
    pointerId = event.pointerId;
    didSwipe = false;
  });

  element.addEventListener("pointerup", (event) => {
    if (pointerId !== event.pointerId) return;

    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    pointerId = null;

    if (Math.abs(deltaX) < minDistance || Math.abs(deltaY) > maxVerticalDrift) return;

    didSwipe = true;
    event.preventDefault();

    if (deltaX < 0) {
      onSwipeLeft();
    } else {
      onSwipeRight();
    }
  });

  element.addEventListener("pointercancel", () => {
    pointerId = null;
  });

  element.addEventListener(
    "click",
    (event) => {
      if (!didSwipe) return;

      event.preventDefault();
      event.stopPropagation();
      didSwipe = false;
    },
    true
  );
}

function setupMobileSwipeDown(element, onSwipeDown) {
  if (!element) return;

  const mobileQuery = window.matchMedia("(max-width: 768px)");
  const minDistance = 65;
  const maxHorizontalDrift = 85;
  let startX = 0;
  let startY = 0;
  let pointerId = null;

  element.addEventListener("pointerdown", (event) => {
    if (!mobileQuery.matches) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    startX = event.clientX;
    startY = event.clientY;
    pointerId = event.pointerId;
  });

  element.addEventListener("pointerup", (event) => {
    if (!mobileQuery.matches || pointerId !== event.pointerId) return;

    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    pointerId = null;

    if (deltaY < minDistance || Math.abs(deltaX) > maxHorizontalDrift) return;

    event.preventDefault();
    onSwipeDown();
  });

  element.addEventListener("pointercancel", () => {
    pointerId = null;
  });
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
  animateScrollTo(0);
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

  const modalContent = modal.querySelector(".project-modal__content");
  setupHorizontalSwipe(modalContent, showNextProject, showPreviousProject);
  setupMobileSwipeDown(modalContent, closeProject);

  modal.addEventListener("click", (event) => {
    if (event.target?.matches("[data-close='true']")) {
      closeProject();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!modal.classList.contains("active")) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeProject();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      showNextProject();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPreviousProject();
    }
  });

  window.projectModalControls = { closeProject };
}

function setupPortfolioPagers() {
  document.querySelectorAll("#projetos-3d[data-pager='2']").forEach((group) => {
    const pages = Array.from(group.querySelectorAll(".page"));
    const prevButtons = Array.from(group.querySelectorAll(".pager-prev"));
    const nextButtons = Array.from(group.querySelectorAll(".pager-next"));
    const grid = group.querySelector(".portfolio-grid");

    if (pages.length === 0) return;

    let currentPage = 0;

    function render() {
      pages.forEach((page, index) => {
        page.classList.toggle("active", index === currentPage);
      });

      const hasOnlyOnePage = pages.length === 1;
      prevButtons.forEach((button) => button.classList.toggle("is-hidden", hasOnlyOnePage));
      nextButtons.forEach((button) => button.classList.toggle("is-hidden", hasOnlyOnePage));
    }

    function showPreviousPage() {
      currentPage = (currentPage - 1 + pages.length) % pages.length;
      render();
    }

    function showNextPage() {
      currentPage = (currentPage + 1) % pages.length;
      render();
    }

    prevButtons.forEach((button) => {
      button.addEventListener("click", showPreviousPage);
    });

    nextButtons.forEach((button) => {
      button.addEventListener("click", showNextPage);
    });

    setupHorizontalSwipe(grid, showNextPage, showPreviousPage);
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
      animateScrollTo(0);
      return;
    }

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
setupPortfolioPagers();
setupSidebarNavigation();
