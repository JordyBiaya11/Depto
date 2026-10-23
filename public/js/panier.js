(function () {
  const itemsContainer = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  const acompteEl = document.getElementById("cartAcompte");
  const soldeEl = document.getElementById("cartSolde");
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
      acompteEl.textContent = "0 $";
      soldeEl.textContent = "0 $";
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
        "Taille: " + (item.taille || "-") +
        " | Couleur: " + (item.couleur || "-") +
        " | Quantite: " + item.quantite;
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

    const acompte = total * 0.60;
    const solde = total * 0.40;

    totalEl.textContent = formatPrice(total);
    acompteEl.textContent = formatPrice(acompte);
    soldeEl.textContent = formatPrice(solde);
  }

  function validerCommande() {
    const panier = getPanier();
    const nom = document.getElementById("clientNom").value.trim();
    const tel = document.getElementById("clientTel").value.trim();

    if (panier.length === 0) {
      alert("Votre panier est vide.");
      return;
    }

    if (!nom || !tel) {
      alert("Veuillez renseigner votre nom et votre numéro de téléphone.");
      return;
    }

    // --- ALERTE DE CHOIX DE PAIEMENT ---
    let total = 0;
    panier.forEach(item => { total += Number(item.prix) * Number(item.quantite); });
    const acompte = total * 0.60;
    
    const choixPaiement = confirm(
      "Comment souhaitez-vous payer votre commande ?\n\n" +
      "Cliquez sur OK pour payer UNIQUEMENT L'AVANCE (60%).\n" +
      "Cliquez sur Annuler pour payer L'INTÉGRALITÉ (100%)."
    );

    btnValider.textContent = "Création de la facture...";
    btnValider.disabled = true;

    const items = panier.map(function (item) {
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
        client_nom: nom,
        client_telephone: tel,
        items: items,
      }),
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Erreur serveur");
        return res.json();
      })
      .then(function (commande) {
        savePanier([]);
        
        let message = "*NOUVELLE COMMANDE DEPTO*\n\n";
        message += "*Facture N° :* " + commande.code + "\n";
        message += "*Client :* " + nom + " (" + tel + ")\n\n";
        
        panier.forEach(function (item, i) {
          const sousTotal = Number(item.prix) * Number(item.quantite);
          message += (i + 1) + ". " + item.nom + "\n";
          message += "   Taille: " + (item.taille || "-") + " | Couleur: " + (item.couleur || "-") + "\n";
          message += "   Quantite: " + item.quantite + " x " + item.prix + "$ = " + sousTotal + "$\n\n";
        });

        message += "*TOTAL DU PANIER : " + total.toFixed(2) + "$*\n\n";
        
        // --- MESSAGE WHATSAPP ADAPTÉ AU CHOIX DU CLIENT ---
        if (choixPaiement) {
          message += "*MODE DE PAIEMENT CHOISI :* Avance de 60%\n";
          message += "-> Montant à verser maintenant : *" + acompte.toFixed(2) + "$*\n";
          message += "-> Reste à payer à l'arrivée : " + (total - acompte).toFixed(2) + "$\n\n";
        } else {
          message += "*MODE DE PAIEMENT CHOISI :* Totalité (100%)\n";
          message += "-> Montant à verser maintenant : *" + total.toFixed(2) + "$*\n\n";
        }
        
        message += "*INFORMATIONS IMPORTANTES :*\n";
        message += "- Pour les vêtements, chaussures et accessoires, les frais de port sont inclus.\n";
        message += "- Pour les autres articles, le tarif au kilo vous sera communiqué sous 48h.\n\n";

        message += "Merci de confirmer ma commande.";

        const url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
        
        const loader = document.getElementById("depto-loader");
        if (loader) {
          loader.classList.remove("hidden");
          const loaderText = loader.querySelector(".loader-text");
          if (loaderText) loaderText.textContent = "Redirection vers WhatsApp...";
        }

        setTimeout(function () {
          window.open(url, "_blank");
          alert("Votre facture " + commande.code + " a été créée.");
          window.location.href = "index.html";
        }, 1800);
      })
      .catch(function () {
        alert("Erreur lors de la création de la commande. Veuillez réessayer.");
        btnValider.textContent = "Valider la commande (60%)";
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