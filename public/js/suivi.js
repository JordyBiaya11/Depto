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

        const details = document.createElement("p");
        details.textContent =
          "Client: " +
          commande.client_nom +
          " | Date: " +
          new Date(commande.created_at).toLocaleDateString("fr-FR");

        card.appendChild(title);
        card.appendChild(status);
        card.appendChild(details);
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