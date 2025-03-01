const imageList = document.getElementById("imageList");
const totalCostEl = document.getElementById("totalCost");
const checkPaymentButton = document.getElementById("checkPayment");
const printButton = document.getElementById("printButton");
const endButton = document.getElementById("endButton");

let images = [];
let totalCost = 0;

// Fetch uploaded images from the server (simulate with a JSON file)
async function fetchUploadedImages() {
  try {
    // Show the loading spinner
    document.getElementById("loadingSpinner").style.display = "flex";

    const response = await fetch("server/uploads.json");
    if (!response.ok) throw new Error("Uploads file not found");
    const newImages = await response.json();

    // Check if the new images are different from the current images
    if (JSON.stringify(newImages) !== JSON.stringify(images)) {
      images = newImages; // Update the images array
      updateUI(); // Only update the UI if there are changes
    }
  } catch (error) {
    console.error("Error fetching uploaded images:", error);
  } finally {
    // Hide the loading spinner
    document.getElementById("loadingSpinner").style.display = "none";
  }
}
// Crop image to 4x6 or 6x4 based on orientation
function cropImageTo4x6(img) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const targetAspectRatio = 4 / 6; // Aspect ratio for 4x6 (portrait)
    const imgAspectRatio = img.naturalWidth / img.naturalHeight;

    let cropWidth, cropHeight, offsetX, offsetY;

    // Determine if the image is better suited for portrait or landscape
    if (imgAspectRatio > targetAspectRatio) {
      // Image is wider than 4x6 (landscape)
      cropHeight = img.naturalHeight;
      cropWidth = cropHeight * (6 / 4); // Crop to 6x4 aspect ratio
      offsetX = (img.naturalWidth - cropWidth) / 2;
      offsetY = 0;
    } else {
      // Image is taller than 4x6 (portrait)
      cropWidth = img.naturalWidth;
      cropHeight = cropWidth * (6 / 4); // Crop to 4x6 aspect ratio
      offsetX = 0;
      offsetY = (img.naturalHeight - cropHeight) / 2;
    }

    // Set canvas dimensions to the cropped size
    canvas.width = cropWidth;
    canvas.height = cropHeight;

    // Draw the cropped image on the canvas
    ctx.drawImage(
      img,
      offsetX,
      offsetY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    // Convert the canvas to a data URL
    const croppedImageUrl = canvas.toDataURL("image/jpeg");
    resolve(croppedImageUrl);
  });
}

// Update the UI with cropped images
async function updateUI() {
  imageList.innerHTML = "";
  totalCost = images.length * 50;
  totalCostEl.textContent = totalCost;

  for (const image of images) {
    const img = document.createElement("img");
    img.src = image.url;

    // Wait for the image to load
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    // Crop the image to 4x6 or 6x4
    const croppedImageUrl = await cropImageTo4x6(img);

    // Create a new image element with the cropped version
    const croppedImg = document.createElement("img");
    croppedImg.src = croppedImageUrl;
    croppedImg.classList.add("uploaded-image");
    imageList.appendChild(croppedImg);
  }
}

// Simulate checking the M-Pesa payment status
checkPaymentButton.addEventListener("click", () => {
  fetch("server/payment.json")
    .then((response) => response.json())
    .then((data) => {
      if (data.paid) {
        alert("Payment received! You can now print.");
        printButton.disabled = false;
      } else {
        alert("Payment not received yet.");
      }
    })
    .catch((error) => console.error("Error checking payment:", error));
});

printButton.addEventListener("click", () => {
  // Create a new window for printing
  const printWindow = window.open("", "", "height=600,width=800");

  // Array to track loaded images
  const loadedImages = [];

  // Function to build the HTML content for the print window
  function buildPrintContent() {
    let printContent = `
      <html>
        <head>
          <title>Print Uploaded Images</title>
          <style>
            .print-image {
              object-fit: cover; /* Ensure cropping */
              margin-bottom: 20px;
              display: block;
              margin: 20px auto;
              page-break-after: always;
            }
          </style>
        </head>
        <body>
    `;

    // Loop through the images and add the cropped versions to the print content
    images.forEach((image, index) => {
      const tempImg = document.createElement("img");
      tempImg.src = image.url;

      tempImg.onload = async () => {
        // Crop the image to 4x6 or 6x4
        const croppedImageUrl = await cropImageTo4x6(tempImg);

        // Determine if the image is portrait or landscape
        const isPortrait = tempImg.naturalHeight > tempImg.naturalWidth;

        // Set dimensions based on orientation
        const width = isPortrait ? "4in" : "6in";
        const height = isPortrait ? "6in" : "4in";

        // Add the cropped image to the print content
        printContent += `
          <img src="${croppedImageUrl}" class="print-image" style="width: ${width}; height: ${height};" />
        `;

        // Track that this image has been loaded
        loadedImages[index] = true;

        // Check if all images are loaded
        if (loadedImages.length === images.length && loadedImages.every(Boolean)) {
          // Close the HTML content
          printContent += `</body></html>`;

          // Write the entire content to the print window
          printWindow.document.write(printContent);
          printWindow.document.close();

          // Wait for the content to be fully rendered
          printWindow.onload = function () {
            // Add a 5-second delay before opening the print dialog
            setTimeout(() => {
              printWindow.print();
            }, 1000); // 5000 milliseconds = 5 seconds
          };
        }
      };
    });
  }

  // Start building the print content
  buildPrintContent();
});

// Refresh the image list periodically
setInterval(fetchUploadedImages, 5000);

// End Session Button Logic
endButton.addEventListener("click", async () => {
  const confirmation = confirm("Are you sure you want to end this session? This will delete all uploaded files.");
  if (confirmation) {
    try {
      const response = await fetch("server/endSession.php", {
        method: "POST",
      });
      const data = await response.json();
      if (data.status === "success") {
        alert("Session ended successfully. All files have been deleted.");
        // Optionally, you could reload the page or reset UI
        location.reload();
      } else {
        alert("Error ending the session.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while ending the session.");
    }
  }
});

// Initial fetch of uploaded images
fetchUploadedImages();