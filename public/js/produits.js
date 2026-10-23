(function () {
  const grid = document.getElementById("productGrid");
  const emptyState = document.getElementById("emptyState");
  const filterButtons = document.querySelectorAll(".filter-btn");
  if (!grid) return;

  let allProducts = [];
  let currentFilter = "all";

  // Détecte sur quelle page on est pour filtrer par genre
  const path = window.location.pathname;
  let currentGenre = "all";
  if (path.includes("femme.html")) currentGenre = "femme";
  if (path.includes("homme.html")) currentGenre = "homme";
  if (path.includes("autres.html")) currentGenre = "autres";

  function formatPrice(value) {
    return Number(value).toFixed(2) + " $";
  }

  function createCard(product) {
    const card = document.createElement("a");
    card.href = "produit.html?id=" + encodeURIComponent(product.id);
    card.className = "product-card";

    const img = document.createElement("img");
    img.src = product.photo || "images/placeholder.svg";
    img.alt = product.nom;

    const body = document.createElement("div");
    body.className = "product-body";

    const cat = document.createElement("span");
    cat.className = "product-category";
    cat.textContent = product.sous_categorie || product.categorie;

    const name = document.createElement("h3");
    name.className = "product-name";
    name.textContent = product.nom;

    const price = document.createElement("span");
    price.className = "product-price";
    price.textContent = formatPrice(product.prix);

    body.appendChild(cat);
    body.appendChild(name);
    body.appendChild(price);
    card.appendChild(img);
    card.appendChild(body);

    return card;
  }

  function render() {
    let list = allProducts;

    // Filtre par page (Genre)
    if (currentGenre !== "all") {
      list = list.filter(p => p.genre === currentGenre);
    }

    // Filtre par bouton (Sous-catégorie)
    if (currentFilter !== "all") {
      list = list.filter(p => p.sous_categorie === currentFilter || p.categorie === currentFilter);
    }

    grid.innerHTML = "";

    if (list.length === 0) {
      if (emptyState) emptyState.hidden = false;
      return;
    }

    if (emptyState) emptyState.hidden = true;
    list.forEach(product => grid.appendChild(createCard(product)));
  }

  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.getAttribute("data-filter");
      render();
    });
  });

  fetch("/api/produits")
    .then(res => res.json())
    .then(data => {
      allProducts = Array.isArray(data) ? data : [];
      render();
    })
    .catch(() => {
      allProducts = [];
      render();
    });
})();