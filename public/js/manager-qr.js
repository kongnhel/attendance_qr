// Manager QR - QR Download and Share Operations
// This file handles QR code generation, downloading, and sharing

(function () {
  "use strict";

  const btnDownloadQR = document.getElementById("btnDownloadQR");
  const btnShareQR = document.getElementById("btnShareQR");

  if (btnDownloadQR) btnDownloadQR.addEventListener("click", downloadHQ_QR);
  if (btnShareQR) btnShareQR.addEventListener("click", shareHQ_QR);

  // Generate high-quality QR code image (4x scale)
  // មុខងារទាញយករូបភាពទំហំធំ ច្បាស់ល្អ (High Quality 4x Scale)
  function generateHQ_Blob() {
    return new Promise((resolve) => {
      const qrImg = document.getElementById("qrImage");
      if (!qrImg) {
        console.error("QR image element not found");
        resolve(null);
        return;
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const img = new Image();
      img.src = qrImg.src;

      img.onload = function () {
        // Create 4x larger canvas to avoid pixelation
        // បង្កើតទំហំ Canvas ធំជាងមុន ៤ ដង ដើម្បីកុំឱ្យបែករូបភាព
        const scaleFactor = 4;
        canvas.width = img.width * scaleFactor;
        canvas.height = img.height * scaleFactor;

        // Disable image smoothing for crisp QR code edges
        // បិទការធ្វើឱ្យរូបភាពព្រិល (Disable Image Smoothing) ជួយឱ្យគែមត្រង់នៃ QR Code ដាច់ច្បាស់ល្អ
        ctx.imageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;

        // Draw image into new canvas
        // គូររូបភាពចូលទៅក្នុង Canvas ថ្មី
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convert canvas to blob (PNG)
        // បម្លែង Canvas ទៅជា Blob (PNG) រួចបោះតម្លៃត្រឡប់ទៅវិញ
        canvas.toBlob(
          function (blob) {
            resolve(blob);
          },
          "image/png",
          1.0,
        ); // 1.0 is maximum quality / គឺគុណភាពអតិបរមា
      };

      img.onerror = function () {
        console.error("Failed to load QR image");
        resolve(null);
      };
    });
  }

  // Download QR code as high-quality image
  // ចាប់ផ្តើមទាញយកពេលចុចប៊ូតុង Download
  async function downloadHQ_QR() {
    try {
      const blob = await generateHQ_Blob();
      if (!blob) {
        console.error("Failed to generate QR image");
        return;
      }

      const blobUrl = URL.createObjectURL(blob);

      const downloadLink = document.createElement("a");
      downloadLink.href = blobUrl;
      downloadLink.download = "attendance-qr-hd.png";
      document.body.appendChild(downloadLink);
      downloadLink.click();

      // Clean up memory after download
      // សម្អាត memory ក្រោយពេលដោនឡូតរួច
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  }

  // Share QR code via system share or fallback to download
  // ចាប់ផ្តើម Share ពេលចុចប៊ូតុង Share រូបភាពកម្រិតច្បាស់ HD
  async function shareHQ_QR() {
    try {
      const blob = await generateHQ_Blob();
      if (!blob) {
        console.error("Failed to generate QR image");
        return;
      }

      const file = new File([blob], "attendance-qr-hd.png", {
        type: "image/png",
      });

      // Check if system supports file sharing
      // ពិនិត្យមើលមុខងារ Share លើទូរស័ព្ទ
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Attendance QR Code",
          text: "Scan this high-quality QR Code to check in!",
        });
      } else {
        // Fallback: share URL instead of file
        // ករណីមិនគាំទ្រ Share ហ្វាយ វានឹង Share ជាតំណភ្ជាប់ជំនួស
        await navigator.share({
          title: "Attendance System",
          text: "Scan QR code to sign in: " + window.location.origin + "/scan",
        });
      }
    } catch (error) {
      console.log("Sharing failed or cancelled:", error);
      // Fallback: download the QR code on desktop or cancelled share
      // បើបើកលើ Desktop Browser ដែលគ្មានមុខងារ Share វានឹងដោនឡូតឱ្យស្វ័យប្រវត្តិតែម្តង
      downloadHQ_QR();
    }
  }
})();
