(function () {
  const html = document.documentElement;
  const savedTheme = localStorage.getItem("depto-theme") || "light";
  html.setAttribute("data-theme", savedTheme);

  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      const current = html.getAttribute("data-theme");
      const next = current === "light" ? "dark" : "light";
      html.setAttribute("data-theme", next);
      localStorage.setItem("depto-theme", next);
    });
  }

  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");
  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", function () {
      mainNav.classList.toggle("open");
    });
  }

  function updateCartCount() {
    const badge = document.getElementById("cartCount");
    if (!badge) return;
    const panier = JSON.parse(localStorage.getItem("depto-panier") || "[]");
    const total = panier.reduce(function (sum, item) {
      return sum + Number(item.quantite || 0);
    }, 0);
    badge.textContent = total;
  }

  updateCartCount();
  window.addEventListener("storage", updateCartCount);
  window.updateCartCount = updateCartCount;

  window.addEventListener("load", function () {
    const loader = document.getElementById("depto-loader");
    if (loader) {
      setTimeout(function () {
        loader.classList.add("hidden");
      }, 800);
    }
  });
})();