// Manager QR - QR Download and Share Operations
// This file handles QR code generation, downloading, and sharing

(function () {
  "use strict";

  const btnDownloadQR = document.getElementById("btnDownloadQR");
  const btnShareQR = document.getElementById("btnShareQR");
  const btnPrintQR = document.getElementById("btnPrintQR");

  if (btnDownloadQR) btnDownloadQR.addEventListener("click", downloadHQ_QR);
  if (btnShareQR) btnShareQR.addEventListener("click", shareHQ_QR);
  if (btnPrintQR) btnPrintQR.addEventListener("click", printQR);

  // Get translated text from data attributes on body
  function getTranslations() {
    const body = document.body;
    return {
      title: body.dataset.qrTitle || "Attendance QR Code",
      instruction: body.dataset.qrInstruction || "Scan this code to check in",
    };
  }

  // Generate high-quality QR code image with text labels (4x scale)
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
      const t = getTranslations();

      const img = new Image();
      img.src = qrImg.src;

      img.onload = function () {
        const scaleFactor = 4;

        // QR image dimensions
        const qrW = img.width * scaleFactor;
        const qrH = img.height * scaleFactor;

        // Layout config
        const padding = 48 * scaleFactor;
        const gapAfterQR = 24 * scaleFactor;
        const titleFontSize = 18 * scaleFactor;
        const instrFontSize = 12 * scaleFactor;
        const gapAfterTitle = 10 * scaleFactor;
        const borderWidth = 2 * scaleFactor;

        // Measure text
        ctx.font = `bold ${titleFontSize}px "Plus Jakarta Sans", "Hanuman", sans-serif`;
        const titleMetrics = ctx.measureText(t.title);
        ctx.font = `${instrFontSize}px "Plus Jakarta Sans", "Hanuman", sans-serif`;
        const instrMetrics = ctx.measureText(t.instruction);

        // Canvas dimensions
        const contentWidth = Math.max(qrW, titleMetrics.width, instrMetrics.width);
        const canvasW = contentWidth + padding * 2;
        const titleBlockH = titleFontSize + gapAfterTitle + instrFontSize;
        const canvasH = padding + qrH + gapAfterQR + titleBlockH + padding;

        canvas.width = canvasW;
        canvas.height = canvasH;

        // Draw white background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvasW, canvasH);

        // Draw border
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = borderWidth;
        const radius = 16 * scaleFactor;
        roundRect(ctx, 0, 0, canvasW, canvasH, radius);
        ctx.stroke();

        // Draw QR code centered
        const qrX = (canvasW - qrW) / 2;
        const qrY = padding;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, qrX, qrY, qrW, qrH);

        // Draw title text
        const textX = canvasW / 2;
        let textY = qrY + qrH + gapAfterQR + titleFontSize;

        ctx.fillStyle = "#0f172a";
        ctx.font = `bold ${titleFontSize}px "Plus Jakarta Sans", "Hanuman", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        ctx.fillText(t.title, textX, textY);

        // Draw instruction text
        textY += gapAfterTitle + instrFontSize;
        ctx.fillStyle = "#64748b";
        ctx.font = `${instrFontSize}px "Plus Jakarta Sans", "Hanuman", sans-serif`;
        ctx.fillText(t.instruction, textX, textY);

        // Convert canvas to blob (PNG)
        canvas.toBlob(
          function (blob) {
            resolve(blob);
          },
          "image/png",
          1.0,
        );
      };

      img.onerror = function () {
        console.error("Failed to load QR image");
        resolve(null);
      };
    });
  }

  // Helper: draw rounded rectangle path
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  // Download QR code as high-quality image with labels
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

      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  }

  // Convert blob to base64 data URL
  function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Print QR code with labels
  async function printQR() {
    try {
      const blob = await generateHQ_Blob();
      if (!blob) {
        console.error("Failed to generate QR image");
        return;
      }

      const dataURL = await blobToDataURL(blob);
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Please allow pop-ups to print the QR code.");
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Print QR Code</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: "Segoe UI", Arial, sans-serif;
              display: flex; flex-direction: column;
              align-items: center; justify-content: center;
              min-height: 100vh; background: #fff; padding: 20px;
            }
            img { max-width: 100%; height: auto; border-radius: 8px; }
            .print-btn {
              margin-top: 20px; padding: 12px 32px; font-size: 16px;
              font-weight: 600; color: #fff; border: none; border-radius: 8px;
              background: linear-gradient(135deg, #3b82f6, #2563eb);
              cursor: pointer; box-shadow: 0 4px 12px rgba(59,130,246,0.3);
            }
            .print-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(59,130,246,0.4); }
            @media print {
              .print-btn { display: none !important; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <img src="${dataURL}" />
          <button class="print-btn" onclick="window.print()">🖨️ Print</button>
        </body>
        </html>
      `);
      printWindow.document.close();
    } catch (error) {
      console.error("Print failed:", error);
    }
  }

  // Share QR code via system share or fallback to download
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

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Attendance QR Code",
          text: "Scan this high-quality QR Code to check in!",
        });
      } else {
        await navigator.share({
          title: "Attendance System",
          text: "Scan QR code to sign in: " + window.location.origin + "/scan",
        });
      }
    } catch (error) {
      console.log("Sharing failed or cancelled:", error);
      downloadHQ_QR();
    }
  }
})();
