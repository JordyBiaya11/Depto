(function () {
  const form = document.getElementById("avisForm");
  const liste = document.getElementById("listeAvis");
  if (!form || !liste) return;

  function getAvis() {
    return JSON.parse(localStorage.getItem("depto-avis") || "[]");
  }

  function saveAvis(avis) {
    localStorage.setItem("depto-avis", JSON.stringify(avis));
  }

  function renderAvis() {
    const avis = getAvis();
    liste.innerHTML = "";
    
    if (avis.length === 0) {
      liste.innerHTML = "<p class='empty-state'>Aucun avis pour le moment. Soyez le premier !</p>";
      return;
    }

    avis.forEach(a => {
      const card = document.createElement("div");
      card.style.background = "var(--card-bg)";
      card.style.padding = "20px";
      card.style.borderRadius = "12px";
      card.style.border = "1px solid var(--border)";
      
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <strong>${a.nom}</strong>
          <span style="color: var(--accent-dark);">${"★".repeat(a.note)}${"☆".repeat(5 - a.note)}</span>
        </div>
        <p style="color: var(--text-secondary); font-size: 15px;">${a.message}</p>
        <small style="color: var(--text-secondary); font-size: 12px; margin-top: 10px; display: block;">${a.date}</small>
      `;
      liste.appendChild(card);
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const nom = document.getElementById("avisNom").value.trim();
    const note = Number(document.getElementById("avisNote").value);
    const message = document.getElementById("avisMessage").value.trim();

    if (!nom || !message) return;

    const newAvis = {
      nom: nom,
      note: note,
      message: message,
      date: new Date().toLocaleDateString("fr-FR")
    };

    const avis = getAvis();
    avis.unshift(newAvis);
    saveAvis(avis);
    
    form.reset();
    renderAvis();
    alert("Merci ! Votre avis a bien été publié.");
  });

  renderAvis();
})();