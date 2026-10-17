(function () {
  const table = document.getElementById("productTable");
  const formCard = document.getElementById("formCard");
  const form = document.getElementById("productForm");
  const formTitle = document.getElementById("formTitle");
  const btnNew = document.getElementById("btnNewProduct");
  const btnCancel = document.getElementById("btnCancel");
  const submitBtn = document.getElementById("submitBtn");
  const fileDrop = document.getElementById("fileDrop");
  const fileInput = document.getElementById("photo");
  const filePreview = document.getElementById("filePreview");
  const previewImg = document.getElementById("previewImg");

  let currentPhotoUrl = null;

  function resetForm() {
    form.reset();
    document.getElementById("productId").value = "";
    formTitle.textContent = "Ajouter un produit";
    submitBtn.textContent = "Enregistrer";
    currentPhotoUrl = null;
    filePreview.hidden = true;
    previewImg.src = "";
  }

  function openForm(product) {
    formCard.hidden = false;
    resetForm();
    if (product) {
      formTitle.textContent = "Modifier le produit";
      submitBtn.textContent = "Mettre a jour";
      document.getElementById("productId").value = product.id;
      document.getElementById("nom").value = product.nom || "";
      document.getElementById("prix").value = product.prix || "";
      document.getElementById("categorie").value = product.categorie || "vetements";
      document.getElementById("tailles").value = product.tailles || "";
      document.getElementById("description").value = product.description || "";
      if (product.photo) {
        currentPhotoUrl = product.photo;
        previewImg.src = product.photo;
        filePreview.hidden = false;
      }
    }
    formCard.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function closeForm() {
    formCard.hidden = true;
    resetForm();
  }

  function renderRow(product) {
    const row = document.createElement("tr");

    const photoCell = document.createElement("td");
    const img = document.createElement("img");
    img.className = "table-thumb";
    img.src = product.photo || "../images/placeholder.svg";
    img.alt = product.nom;
    photoCell.appendChild(img);

    const nomCell = document.createElement("td");
    nomCell.textContent = product.nom;

    const catCell = document.createElement("td");
    catCell.textContent =
      product.categorie === "vetements" ? "Vetements" : "Electronique";

    const prixCell = document.createElement("td");
    prixCell.textContent = Number(product.prix).toFixed(2) + " $";

    const actionsCell = document.createElement("td");
    const actions = document.createElement("div");
    actions.className = "table-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-ghost btn-sm";
    editBtn.textContent = "Modifier";
    editBtn.addEventListener("click", function () {
      openForm(product);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-danger btn-sm";
    deleteBtn.textContent = "Supprimer";
    deleteBtn.addEventListener("click", function () {
      if (!confirm("Supprimer ce produit ?")) return;
      adminFetch("/api/produits/" + product.id, { method: "DELETE" })
        .then(function (res) {
          if (!res.ok) throw new Error("delete");
          showToast("Produit supprime.", "success");
          loadProducts();
        })
        .catch(function () {
          showToast("Suppression impossible.", "error");
        });
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    actionsCell.appendChild(actions);

    row.appendChild(photoCell);
    row.appendChild(nomCell);
    row.appendChild(catCell);
    row.appendChild(prixCell);
    row.appendChild(actionsCell);

    return row;
  }

  function loadProducts() {
    adminFetch("/api/produits")
      .then(function (res) { return res.json(); })
      .then(function (data) {
        const produits = Array.isArray(data) ? data : [];
        table.innerHTML = "";

        if (produits.length === 0) {
          const row = document.createElement("tr");
          const cell = document.createElement("td");
          cell.colSpan = 5;
          cell.className = "admin-empty";
          cell.textContent = "Aucun produit pour le moment.";
          row.appendChild(cell);
          table.appendChild(row);
          return;
        }

        produits.forEach(function (p) {
          table.appendChild(renderRow(p));
        });
      })
      .catch(function () {
        showToast("Impossible de charger les produits.", "error");
      });
  }

  btnNew.addEventListener("click", function () {
    openForm(null);
  });

  btnCancel.addEventListener("click", closeForm);

  fileDrop.addEventListener("dragover", function (e) {
    e.preventDefault();
    fileDrop.classList.add("dragover");
  });

  fileDrop.addEventListener("dragleave", function () {
    fileDrop.classList.remove("dragover");
  });

  fileDrop.addEventListener("drop", function (e) {
    e.preventDefault();
    fileDrop.classList.remove("dragover");
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      fileInput.files = e.dataTransfer.files;
      showPreview(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener("change", function () {
    if (fileInput.files && fileInput.files[0]) {
      showPreview(fileInput.files[0]);
    }
  });

  function showPreview(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      previewImg.src = e.target.result;
      filePreview.hidden = false;
    };
    reader.readAsDataURL(file);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const id = document.getElementById("productId").value;
    const nom = document.getElementById("nom").value.trim();
    const prix = document.getElementById("prix").value;
    const categorie = document.getElementById("categorie").value;
    const tailles = document.getElementById("tailles").value.trim();
    const description = document.getElementById("description").value.trim();
    const photoFile = fileInput.files[0];

    if (!id && !photoFile && !currentPhotoUrl) {
      showToast("Veuillez selectionner une photo.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("nom", nom);
    formData.append("prix", prix);
    formData.append("categorie", categorie);
    formData.append("tailles", tailles);
    formData.append("description", description);
    if (photoFile) formData.append("photo", photoFile);

    submitBtn.disabled = true;
    submitBtn.textContent = "Enregistrement...";

    const url = id ? "/api/produits/" + id : "/api/produits";
    const method = id ? "PUT" : "POST";

    adminFetch(url, { method: method, body: formData })
      .then(function (res) {
        if (!res.ok) throw new Error("save");
        return res.json();
      })
      .then(function () {
        showToast(id ? "Produit mis a jour." : "Produit ajoute.", "success");
        closeForm();
        loadProducts();
      })
      .catch(function () {
        showToast("Enregistrement impossible.", "error");
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = id ? "Mettre a jour" : "Enregistrer";
      });
  });

  loadProducts();
})();