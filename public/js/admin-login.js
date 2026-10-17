(function () {
  const form = document.getElementById("loginForm");
  const errorBox = document.getElementById("loginError");
  const submitBtn = document.getElementById("loginBtn");

  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    errorBox.hidden = true;
    submitBtn.disabled = true;
    submitBtn.textContent = "Connexion...";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password }),
    })
      .then(function (res) {
        if (!res.ok) throw new Error("invalid");
        return res.json();
      })
      .then(function (data) {
        localStorage.setItem("depto-admin-token", data.token);
        localStorage.setItem("depto-admin-user", JSON.stringify(data.user || {}));
        window.location.replace("dashboard.html");
      })
      .catch(function () {
        errorBox.textContent = "E-mail ou mot de passe incorrect.";
        errorBox.hidden = false;
        submitBtn.disabled = false;
        submitBtn.textContent = "Se connecter";
      });
  });
})();