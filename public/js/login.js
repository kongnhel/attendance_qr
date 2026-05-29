document.getElementById("togglePass").addEventListener("click", function () {
  var input = document.getElementById("passInput");
  var icon = document.getElementById("eyeIcon");
  if (input.type === "password") {
    input.type = "text";
    icon.classList.replace("fa-eye", "fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.replace("fa-eye-slash", "fa-eye");
  }
});
