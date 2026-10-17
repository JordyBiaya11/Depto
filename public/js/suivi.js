(function () {
  const form = document.getElementById("trackForm");
  const input = document.getElementById("trackInput");
  const result = document.getElementById("trackResult");

  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const code = input.value.trim().toUpperCase();

    if (!code) return;

    result.innerHTML = "";

    fetch("/api/commandes/suivi/" + encodeURIComponent(code))
      .then(function (res) {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then(function (commande) {
        const card = document.createElement("div");
        card.className = "track-card";

        const title = document.createElement("h3");
        title.textContent = "Commande " + commande.code;

        const status = document.createElement("span");
        status.className = "track-status";
        status.textContent = commande.statut;

        const infoClient = document.createElement("p");
        infoClient.innerHTML = "<strong>Client :</strong> " + commande.client_nom + " (" + (commande.client_telephone || "-") + ")";

        const infoDate = document.createElement("p");
        infoDate.innerHTML = "<strong>Date :</strong> " + new Date(commande.created_at).toLocaleDateString("fr-FR");

        const infoTotal = document.createElement("p");
        infoTotal.innerHTML = "<strong>Total :</strong> " + Number(commande.total).toFixed(2) + " $";

        const infoPaye = document.createElement("p");
        infoPaye.innerHTML = "<strong>Déjà payé :</strong> " + Number(commande.montant_paye || 0).toFixed(2) + " $";

        const reste = Number(commande.total) - Number(commande.montant_paye || 0);
        const infoReste = document.createElement("p");
        infoReste.innerHTML = "<strong>Reste à payer :</strong> <span style='color: " + (reste > 0 ? "#c62828" : "#2e7d32") + "; font-weight: bold;'>" + reste.toFixed(2) + " $</span>";

        card.appendChild(title);
        card.appendChild(status);
        card.appendChild(infoClient);
        card.appendChild(infoDate);
        card.appendChild(infoTotal);
        card.appendChild(infoPaye);
        card.appendChild(infoReste);
        
        result.appendChild(card);
      })
      .catch(function () {
        const card = document.createElement("div");
        card.className = "track-card";
        const msg = document.createElement("p");
        msg.textContent =
          "Aucune commande trouvee pour ce code. Verifiez le numero et reessayez.";
        card.appendChild(msg);
        result.appendChild(card);
      });
  });
})();