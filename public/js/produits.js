(function () {
  const grid = document.getElementById("productGrid");
  const featured = document.getElementById("produitsVedettes");
  const emptyState = document.getElementById("emptyState");
  const filterButtons = document.querySelectorAll(".filter-btn");

  let allProducts = [];
  let currentFilter = "all";

  function formatPrice(value) {
    return Number(value).toFixed(2) + " $";
  }

  function categoryLabel(value) {
    if (value === "vetements") return "Vetements";
    if (value === "electronique") return "Electronique";
    return value;
  }

  function createCard(product) {
    const card = document.createElement("a");
    card.href = "produit.html?id=" + encodeURIComponent(product.id);
    card.className = "product-card";

    const img = document.createElement("img");
    img.src = product.photo || "images/placeholder.svg";
    img.alt = product.nom;
    img.loading = "lazy";

    const body = document.createElement("div");
    body.className = "product-body";

    const cat = document.createElement("span");
    cat.className = "product-category";
    cat.textContent = categoryLabel(product.categorie);

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
    const target = grid || featured;
    if (!target) return;

    const list =
      currentFilter === "all"
        ? allProducts
        : allProducts.filter(function (p) {
            return p.categorie === currentFilter;
          });

    target.innerHTML = "";

    if (list.length === 0) {
      if (emptyState) emptyState.hidden = false;
      return;
    }

    if (emptyState) emptyState.hidden = true;
    list.forEach(function (product) {
      target.appendChild(createCard(product));
    });
  }

  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterButtons.forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      currentFilter = btn.getAttribute("data-filter");
      render();
    });
  });

  fetch("/api/produits")
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      allProducts = Array.isArray(data) ? data : [];
      render();
    })
    .catch(function () {
      allProducts = [];
      render();
    });
})();