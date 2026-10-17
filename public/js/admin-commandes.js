(function () {
  const table = document.getElementById("orderTable");

  const STATUTS = [
    "En attente",
    "Avance payee",
    "Paiement complet",
    "Inspectee",
    "Expediee",
    "Arrivee Kinshasa",
    "Livree",
    "Annulee",
  ];

  function badgeClass(statut) {
    if (statut === "Livree" || statut === "Paiement complet") return "badge badge-green";
    if (statut === "En attente") return "badge badge-yellow";
    if (statut === "Annulee") return "badge badge-red";
    if (statut === "Avance payee" || statut === "Expediee" || statut === "Arrivee Kinshasa") return "badge badge-blue";
    return "badge badge-gray";
  }

  function renderRow(commande) {
    const row = document.createElement("tr");

    const code = document.createElement("td");
    code.textContent = commande.code || "-";

    const client = document.createElement("td");
    client.textContent = commande.client_nom || "-";

    const total = document.createElement("td");
    total.textContent = Number(commande.total || 0).toFixed(2) + " $";

    const paye = document.createElement("td");
    paye.textContent = Number(commande.montant_paye || 0).toFixed(2) + " $";

    const reste = document.createElement("td");
    const resteVal = Number(commande.total || 0) - Number(commande.montant_paye || 0);
    reste.textContent = resteVal.toFixed(2) + " $";
    reste.style.color = resteVal > 0 ? "#c62828" : "#2e7d32";
    reste.style.fontWeight = "bold";

    const statut = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = badgeClass(commande.statut);
    badge.textContent = commande.statut || "-";
    statut.appendChild(badge);

    const actions = document.createElement("td");
    const actionsWrap = document.createElement("div");
    actionsWrap.className = "table-actions";
    actionsWrap.style.flexDirection = "column";
    actionsWrap.style.gap = "8px";

    const payeInput = document.createElement("input");
    payeInput.type = "number";
    payeInput.placeholder = "Montant paye";
    payeInput.value = commande.montant_paye || "";
    payeInput.style.height = "30px";
    payeInput.style.padding = "0 6px";
    payeInput.style.borderRadius = "4px";
    payeInput.style.border = "1px solid var(--border)";
    payeInput.style.width = "100px";
    
    payeInput.addEventListener("change", function () {
      const nouveauMontant = Number(payeInput.value);
      if (nouveauMontant < 0 || nouveauMontant > commande.total) {
        alert("Le montant doit etre entre 0 et " + commande.total);
        return;
      }
      
      let nouveauStatut = commande.statut;
      if (nouveauMontant === 0) nouveauStatut = "En attente";
      else if (nouveauMontant < commande.total) nouveauStatut = "Avance payee";
      else if (nouveauMontant === commande.total) nouveauStatut = "Paiement complet";

      updateCommande(commande.id, nouveauStatut, nouveauMontant);
    });

    const select = document.createElement("select");
    select.style.height = "30px";
    select.style.padding = "0 6px";
    select.style.borderRadius = "4px";
    select.style.border = "1px solid var(--border)";
    select.style.background = "var(--bg-secondary)";
    select.style.color = "var(--text-primary)";
    select.style.fontSize = "12px";

    STATUTS.forEach(function (s) {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      if (s === commande.statut) opt.selected = true;
      select.appendChild(opt);
    });

    select.addEventListener("change", function () {
      let nouveauMontant = Number(commande.montant_paye);
      const nouveauStatut = select.value;
      
      if (nouveauStatut === "Paiement complet") nouveauMontant = commande.total;
      if (nouveauStatut === "En attente") nouveauMontant = 0;

      updateCommande(commande.id, nouveauStatut, nouveauMontant);
    });

    actionsWrap.appendChild(payeInput);
    actionsWrap.appendChild(select);
    actions.appendChild(actionsWrap);

    row.appendChild(code);
    row.appendChild(client);
    row.appendChild(total);
    row.appendChild(paye);
    row.appendChild(reste);
    row.appendChild(statut);
    row.appendChild(actions);

    return row;
  }

  function updateCommande(id, statut, montantPaye) {
    adminFetch("/api/commandes/" + id + "/statut", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: statut, montant_paye: montantPaye }),
    })
      .then(function (res) {
        if (!res.ok) throw new Error("update");
        showToast("Commande mise a jour.", "success");
        loadOrders();
      })
      .catch(function () {
        showToast("Mise a jour impossible.", "error");
      });
  }

  function loadOrders() {
    adminFetch("/api/commandes")
      .then(function (res) { return res.json(); })
      .then(function (data) {
        const commandes = Array.isArray(data) ? data : [];
        table.innerHTML = "";

        if (commandes.length === 0) {
          const row = document.createElement("tr");
          const cell = document.createElement("td");
          cell.colSpan = 7;
          cell.className = "admin-empty";
          cell.textContent = "Aucune commande pour le moment.";
          row.appendChild(cell);
          table.appendChild(row);
          return;
        }

        commandes.forEach(function (c) {
          table.appendChild(renderRow(c));
        });
      })
      .catch(function () {
        showToast("Impossible de charger les commandes.", "error");
      });
  }

  loadOrders();
})();