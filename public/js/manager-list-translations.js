// Store translations in window for manager-list.js to access
window.managerListTranslations = {
  addTitle:
    document.querySelector("html").getAttribute("data-trans-add-title") ||
    "Add New",
  editTitle:
    document.querySelector("html").getAttribute("data-trans-edit-title") ||
    "Edit Record",
  swalSuccess:
    document.querySelector("html").getAttribute("data-trans-swal-success") ||
    "Success",
  swalSaved:
    document.querySelector("html").getAttribute("data-trans-swal-saved") ||
    "Saved successfully",
  swalError:
    document.querySelector("html").getAttribute("data-trans-swal-error") ||
    "Error",
  swalFailMsg:
    document.querySelector("html").getAttribute("data-trans-swal-fail-msg") ||
    "Operation failed",
  swalConfirmTitle:
    document
      .querySelector("html")
      .getAttribute("data-trans-swal-confirm-title") || "Confirm Delete?",
  swalConfirmText:
    document
      .querySelector("html")
      .getAttribute("data-trans-swal-confirm-text") ||
    "This action cannot be undone",
  swalConfirmBtn:
    document
      .querySelector("html")
      .getAttribute("data-trans-swal-confirm-btn") || "Delete",
  swalCancelBtn:
    document.querySelector("html").getAttribute("data-trans-swal-cancel-btn") ||
    "Cancel",
  swalDeletedTitle:
    document
      .querySelector("html")
      .getAttribute("data-trans-swal-deleted-title") || "Deleted",
  swalDeletedMsg:
    document
      .querySelector("html")
      .getAttribute("data-trans-swal-deleted-msg") ||
    "Record deleted successfully",
  swalDeleteFail:
    document
      .querySelector("html")
      .getAttribute("data-trans-swal-delete-fail") || "Delete failed",
};
