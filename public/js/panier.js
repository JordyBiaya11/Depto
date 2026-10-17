(function () {
  const itemsContainer = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  const btnValider = document.getElementById("btnValider");
  const btnVider = document.getElementById("btnVider");

  const WHATSAPP_NUMBER = "243979748898";

  function getPanier() {
    return JSON.parse(localStorage.getItem("depto-panier") || "[]");
  }

  function savePanier(panier) {
    localStorage.setItem("depto-panier", JSON.stringify(panier));
    if (window.updateCartCount) window.updateCartCount();
  }

  function formatPrice(value) {
    return Number(value).toFixed(2) + " $";
  }

  function render() {
    const panier = getPanier();
    itemsContainer.innerHTML = "";

    if (panier.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "Votre panier est vide.";
      itemsContainer.appendChild(empty);
      totalEl.textContent = "0 $";
      return;
    }

    let total = 0;

    panier.forEach(function (item, index) {
      total += Number(item.prix) * Number(item.quantite);

      const row = document.createElement("div");
      row.className = "cart-item";

      const img = document.createElement("img");
      img.src = item.photo || "images/placeholder.svg";
      img.alt = item.nom;

      const info = document.createElement("div");
      info.className = "cart-item-info";
      const name = document.createElement("h3");
      name.textContent = item.nom;
      const meta = document.createElement("p");
      meta.textContent =
        "Taille: " +
        (item.taille || "-") +
        " | Couleur: " +
        (item.couleur || "-") +
        " | Quantite: " +
        item.quantite;
      info.appendChild(name);
      info.appendChild(meta);

      const actions = document.createElement("div");
      actions.className = "cart-item-actions";
      const price = document.createElement("span");
      price.className = "cart-item-price";
      price.textContent = formatPrice(item.prix * item.quantite);
      const remove = document.createElement("button");
      remove.className = "remove-btn";
      remove.textContent = "Retirer";
      remove.addEventListener("click", function () {
        const updated = getPanier();
        updated.splice(index, 1);
        savePanier(updated);
        render();
      });
      actions.appendChild(price);
      actions.appendChild(remove);

      row.appendChild(img);
      row.appendChild(info);
      row.appendChild(actions);
      itemsContainer.appendChild(row);
    });

    totalEl.textContent = formatPrice(total);
  }

  function validerCommande() {
    const panier = getPanier();

    if (panier.length === 0) {
      alert("Votre panier est vide.");
      return;
    }

    btnValider.textContent = "Création de la facture...";
    btnValider.disabled = true;

    let total = 0;
    const items = panier.map(function (item) {
      total += Number(item.prix) * Number(item.quantite);
      return {
        produit_id: item.id,
        nom: item.nom,
        prix: item.prix,
        quantite: item.quantite,
        taille: item.taille,
        couleur: item.couleur,
      };
    });

    fetch("/api/commandes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_nom: "Client Web",
        client_telephone: "",
        items: items,
      }),
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Erreur serveur");
        return res.json();
      })
      .then(function (commande) {
        savePanier([]);
        
        let message = "Nouvelle commande DEPTO\n\n";
        message += "Facture N° : " + commande.code + "\n\n";
        
        panier.forEach(function (item, i) {
          const sousTotal = Number(item.prix) * Number(item.quantite);
          message += (i + 1) + ". " + item.nom + "\n";
          message += "   Taille: " + (item.taille || "-") + " | Couleur: " + (item.couleur || "-") + "\n";
          message += "   Quantite: " + item.quantite + " x " + item.prix + "$ = " + sousTotal + "$\n\n";
        });

        message += "TOTAL A PAYER : " + total + "$\n\n";
        message += "Merci de confirmer ma precommande et d'indiquer le mode de paiement (Avance ou Total).";

        const url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
        
        // Affiche l'animation
        const loader = document.getElementById("depto-loader");
        if (loader) {
          loader.classList.remove("hidden");
          const loaderText = loader.querySelector(".loader-text");
          if (loaderText) loaderText.textContent = "Redirection vers WhatsApp...";
        }

        // Attend 1.8 secondes puis ouvre WhatsApp et redirige
        setTimeout(function () {
          window.open(url, "_blank");
          alert("Votre facture " + commande.code + " a été créée. Vous allez être redirigé vers WhatsApp.");
          window.location.href = "index.html";
        }, 1800);
      })
      .catch(function () {
        alert("Erreur lors de la création de la commande. Veuillez réessayer.");
        btnValider.textContent = "Valider la commande";
        btnValider.disabled = false;
      });
  }

  btnValider.addEventListener("click", validerCommande);

  btnVider.addEventListener("click", function () {
    if (confirm("Vider le panier ?")) {
      savePanier([]);
      render();
    }
  });

  render();
})();