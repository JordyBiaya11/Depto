(function () {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const data = new FormData(form);
    const nom = data.get("nom");
    const email = data.get("email");
    const message = data.get("message");

    const texte =
      "Message depuis le site DEPTO\n\n" +
      "Nom: " +
      nom +
      "\nE-mail: " +
      email +
      "\n\nMessage:\n" +
      message;

    const url =
      "https://wa.me/243979748898?text=" + encodeURIComponent(texte);

    window.open(url, "_blank");
    form.reset();
  });
})();