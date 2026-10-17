(function () {
  const token = localStorage.getItem("depto-admin-token");
  if (!token) {
    window.location.replace("login.html");
    return;
  }

  const html = document.documentElement;
  const savedTheme = localStorage.getItem("depto-theme") || "light";
  html.setAttribute("data-theme", savedTheme);

  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      const current = html.getAttribute("data-theme");
      const next = current === "light" ? "dark" : "light";
      html.setAttribute("data-theme", next);
      localStorage.setItem("depto-theme", next);
    });
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      localStorage.removeItem("depto-admin-token");
      localStorage.removeItem("depto-admin-user");
      window.location.replace("login.html");
    });
  }

  window.adminFetch = function (url, options) {
    options = options || {};
    options.headers = Object.assign({}, options.headers, {
      Authorization: "Bearer " + token,
    });
    return fetch(url, options).then(function (res) {
      if (res.status === 401) {
        localStorage.removeItem("depto-admin-token");
        window.location.replace("login.html");
        throw new Error("unauthorized");
      }
      return res;
    });
  };

  window.showToast = function (message, type) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.className = "toast visible " + (type || "");
    setTimeout(function () {
      toast.className = "toast";
    }, 2800);
  };
})();