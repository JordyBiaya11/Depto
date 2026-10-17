(function () {
  const statProduits = document.getElementById("statProduits");
  const statCommandes = document.getElementById("statCommandes");
  const statAttente = document.getElementById("statAttente");
  const statLivrees = document.getElementById("statLivrees");
  const recentOrders = document.getElementById("recentOrders");

  function badgeClass(statut) {
    if (statut === "Livree") return "badge badge-green";
    if (statut === "En attente") return "badge badge-yellow";
    if (statut === "Annulee") return "badge badge-red";
    if (statut === "Expediee") return "badge badge-blue";
    return "badge badge-gray";
  }

  Promise.all([
    adminFetch("/api/produits").then(function (r) { return r.json(); }),
    adminFetch("/api/commandes").then(function (r) { return r.json(); }),
  ])
    .then(function (results) {
      const produits = Array.isArray(results[0]) ? results[0] : [];
      const commandes = Array.isArray(results[1]) ? results[1] : [];

      statProduits.textContent = produits.length;
      statCommandes.textContent = commandes.length;
      statAttente.textContent = commandes.filter(function (c) {
        return c.statut === "En attente";
      }).length;
      statLivrees.textContent = commandes.filter(function (c) {
        return c.statut === "Livree";
      }).length;

      recentOrders.innerHTML = "";

      if (commandes.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 4;
        cell.className = "admin-empty";
        cell.textContent = "Aucune commande pour le moment.";
        row.appendChild(cell);
        recentOrders.appendChild(row);
        return;
      }

      commandes.slice(0, 5).forEach(function (cmd) {
        const row = document.createElement("tr");

        const code = document.createElement("td");
        code.textContent = cmd.code || "-";

        const client = document.createElement("td");
        client.textContent = cmd.client_nom || "-";

        const statut = document.createElement("td");
        const badge = document.createElement("span");
        badge.className = badgeClass(cmd.statut);
        badge.textContent = cmd.statut || "-";
        statut.appendChild(badge);

        const date = document.createElement("td");
        date.textContent = cmd.created_at
          ? new Date(cmd.created_at).toLocaleDateString("fr-FR")
          : "-";

        row.appendChild(code);
        row.appendChild(client);
        row.appendChild(statut);
        row.appendChild(date);
        recentOrders.appendChild(row);
      });
    })
    .catch(function () {
      showToast("Impossible de charger les donnees.", "error");
    });
})();