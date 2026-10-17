(function () {
  const container = document.getElementById("productDetail");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  function formatPrice(value) {
    return Number(value).toFixed(2) + " $";
  }

  function categoryLabel(value) {
    if (value === "vetements") return "Vetements";
    if (value === "electronique") return "Electronique";
    return value;
  }

  function renderProduct(product) {
    container.innerHTML = "";

    const imageWrap = document.createElement("div");
    imageWrap.className = "product-detail-image";
    const img = document.createElement("img");
    img.src = product.photo || "images/placeholder.svg";
    img.alt = product.nom;
    imageWrap.appendChild(img);

    const info = document.createElement("div");
    info.className = "product-detail-info";

    const cat = document.createElement("p");
    cat.className = "product-category";
    cat.textContent = categoryLabel(product.categorie);

    const title = document.createElement("h1");
    title.textContent = product.nom;

    const price = document.createElement("p");
    price.className = "price";
    price.textContent = formatPrice(product.prix);

    const desc = document.createElement("p");
    desc.className = "description";
    desc.textContent =
      product.description || "Aucune description disponible pour cet article.";

    const tailleGroup = document.createElement("div");
    tailleGroup.className = "option-group";
    const tailleLabel = document.createElement("label");
    tailleLabel.textContent = "Taille";
    const taille = document.createElement("select");
    taille.id = "taille";
    ["S", "M", "L", "XL"].forEach(function (t) {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      taille.appendChild(opt);
    });
    tailleGroup.appendChild(tailleLabel);
    tailleGroup.appendChild(taille);

    const couleurGroup = document.createElement("div");
    couleurGroup.className = "option-group";
    const couleurLabel = document.createElement("label");
    couleurLabel.textContent = "Couleur";
    const couleur = document.createElement("input");
    couleur.type = "text";
    couleur.id = "couleur";
    couleur.placeholder = "Ex: noir, blanc, rouge";
    couleurGroup.appendChild(couleurLabel);
    couleurGroup.appendChild(couleur);

    const quantiteGroup = document.createElement("div");
    quantiteGroup.className = "option-group";
    const quantiteLabel = document.createElement("label");
    quantiteLabel.textContent = "Quantite";
    const quantite = document.createElement("input");
    quantite.type = "number";
    quantite.id = "quantite";
    quantite.min = "1";
    quantite.value = "1";
    quantiteGroup.appendChild(quantiteLabel);
    quantiteGroup.appendChild(quantite);

    const btn = document.createElement("button");
    btn.className = "btn btn-primary btn-block";
    btn.textContent = "Ajouter au panier";
    btn.addEventListener("click", function () {
      const panier = JSON.parse(localStorage.getItem("depto-panier") || "[]");
      const existing = panier.find(function (item) {
        return (
          item.id === product.id &&
          item.taille === taille.value &&
          item.couleur === couleur.value.trim()
        );
      });

      if (existing) {
        existing.quantite += Number(quantite.value);
      } else {
        panier.push({
          id: product.id,
          nom: product.nom,
          prix: Number(product.prix),
          photo: product.photo,
          taille: taille.value,
          couleur: couleur.value.trim(),
          quantite: Number(quantite.value),
        });
      }

      localStorage.setItem("depto-panier", JSON.stringify(panier));
      if (window.updateCartCount) window.updateCartCount();
      btn.textContent = "Ajoute au panier";
      setTimeout(function () {
        btn.textContent = "Ajouter au panier";
      }, 1500);
    });

    info.appendChild(cat);
    info.appendChild(title);
    info.appendChild(price);
    info.appendChild(desc);
    if (product.categorie === "vetements") {
      info.appendChild(tailleGroup);
      info.appendChild(couleurGroup);
    }
    info.appendChild(quantiteGroup);
    info.appendChild(btn);

    container.appendChild(imageWrap);
    container.appendChild(info);
  }

  if (!id) {
    container.innerHTML = '<p class="empty-state">Produit introuvable.</p>';
    return;
  }

  fetch("/api/produits/" + encodeURIComponent(id))
    .then(function (res) {
      if (!res.ok) throw new Error("not found");
      return res.json();
    })
    .then(renderProduct)
    .catch(function () {
      container.innerHTML = '<p class="empty-state">Produit introuvable.</p>';
    });
})();