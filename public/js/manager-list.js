// Manager List - CRUD Modal Operations
// This file handles all modal interactions and CRUD operations for the manager list page

(function () {
  "use strict";

  const modal = document.getElementById("crudModal");
  const form = document.getElementById("crudForm");
  const csrfInput = document.getElementById("csrfInput"); // ✅ ចាប់យក Element ដែលផ្ទុកទិន្នន័យចាំបាច់

  // ✅ ទាញយកអត្ថបទភាសា (Translations) ចេញពី HTML Data Attributes របស់ csrfInput ផ្ទាល់ (ដោះស្រាយបញ្ហា CSP 100%)
  const translations = {
    addTitle: csrfInput ? csrfInput.dataset.addTitle : "Add New",
    editTitle: csrfInput ? csrfInput.dataset.editTitle : "Edit Record",
    swalSuccess: csrfInput ? csrfInput.dataset.swalSuccess : "Success",
    swalSaved: csrfInput ? csrfInput.dataset.swalSaved : "Saved successfully",
    swalError: csrfInput ? csrfInput.dataset.swalError : "Error",
    swalFailMsg: csrfInput ? csrfInput.dataset.swalFailMsg : "Operation failed",
    swalConfirmTitle: csrfInput ? csrfInput.dataset.swalConfirmTitle : "Confirm Delete?",
    swalConfirmText: csrfInput ? csrfInput.dataset.swalConfirmText : "This action cannot be undone",
    swalConfirmBtn: csrfInput ? csrfInput.dataset.swalConfirmBtn : "Delete",
    swalCancelBtn: csrfInput ? csrfInput.dataset.swalCancelBtn : "Cancel",
    swalDeletedTitle: csrfInput ? csrfInput.dataset.swalDeletedTitle : "Deleted",
    swalDeletedMsg: csrfInput ? csrfInput.dataset.swalDeletedMsg : "Record deleted successfully",
    swalDeleteFail: csrfInput ? csrfInput.dataset.swalDeleteFail : "Delete failed",
  };

  // ✅ មុខងារទាញយក CSRF Token ត្រឹមត្រូវ ច្បាស់លាស់ និងមានសុវត្ថិភាពបំផុតពី Hidden Input
  function getCsrfToken() {
    return csrfInput ? csrfInput.value : "";
  }
  

  // Event listener setup
  const btnAddRecord = document.getElementById("btnAddRecord");
  const btnCloseModal = document.getElementById("btnCloseModal");
  const btnCancelModal = document.getElementById("btnCancelModal");

  if (btnAddRecord) btnAddRecord.addEventListener("click", openCreateModal);
  if (btnCloseModal) btnCloseModal.addEventListener("click", closeModal);
  if (btnCancelModal) btnCancelModal.addEventListener("click", closeModal);

  // Edit button listeners with event delegation
  document.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const id = this.dataset.id;
      const name = this.dataset.name;
      const gender = this.dataset.gender;
      const age = this.dataset.age;
      const phone = this.dataset.phone;
      const place = this.dataset.place;
      openEditModal(id, name, gender, age, phone, place);
    });
  });

  // Delete button listeners
  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      deleteRecord(this.dataset.id);
    });
  });

  // Form submission listener
  if (form) {
    form.addEventListener("submit", handleFormSubmit);
  }

  // Modal Functions
  function openCreateModal() {
    document.getElementById("modalTitle").innerText = translations.addTitle;
    document.getElementById("recordId").value = "";
    form.reset();
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }

  function openEditModal(id, name, gender, age, phone, place) {
    document.getElementById("modalTitle").innerText = translations.editTitle;
    document.getElementById("recordId").value = id;
    document.getElementById("formName").value = name;

    // Convert Khmer gender values to English equivalents
    if (gender === "ប្រុស") gender = "Male";
    if (gender === "ស្រី") gender = "Female";

    document.getElementById("formGender").value = gender;
    document.getElementById("formAge").value = age || "";
    document.getElementById("formPhone").value = phone;
    document.getElementById("formPlace").value = place;
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }

  function closeModal() {
    modal.classList.remove("flex");
    modal.classList.add("hidden");
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("recordId").value;
    const data = {
      name: document.getElementById("formName").value,
      gender: document.getElementById("formGender").value,
      age: document.getElementById("formAge").value,
      phone: document.getElementById("formPhone").value,
      place: document.getElementById("formPlace").value,
    };

    const url = id ? `/manager/update/${id}` : "/manager/create";
    const method = id ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": getCsrfToken(), // ✅ បញ្ជូន Token ទៅក្នុង Header ត្រឹមត្រូវ ១០០%
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        closeModal();
        Swal.fire({
          icon: "success",
          title: translations.swalSuccess,
          text: translations.swalSaved,
          showConfirmButton: false,
          timer: 1500,
        }).then(() => window.location.reload());
      } else {
        Swal.fire({
          icon: "error",
          title: translations.swalError,
          text: translations.swalFailMsg,
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: translations.swalError,
        text: "Network error occurred",
      });
    }
  }

  function deleteRecord(id) {
    Swal.fire({
      title: translations.swalConfirmTitle,
      text: translations.swalConfirmText,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: translations.swalConfirmBtn,
      cancelButtonText: translations.swalCancelBtn,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`/manager/delete/${id}`, {
            method: "DELETE",
            headers: {
              "X-CSRF-Token": getCsrfToken(), // ✅ បញ្ជូន Token ទៅក្នុង Header សម្រាប់ការលុប
            },
          });
          if (response.ok) {
            Swal.fire({
              icon: "success",
              title: translations.swalDeletedTitle,
              text: translations.swalDeletedMsg,
              showConfirmButton: false,
              timer: 1500,
            }).then(() => window.location.reload());
          } else {
            Swal.fire({
              icon: "error",
              title: translations.swalError,
              text: translations.swalDeleteFail,
            });
          }
        } catch (err) {
          console.error(err);
          Swal.fire({
            icon: "error",
            title: translations.swalError,
            text: "Delete operation failed",
          });
        }
      }
    });
  }
})();