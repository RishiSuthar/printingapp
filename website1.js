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
    const response = await fetch("/printingapp/server/uploads.json");
    if (!response.ok) throw new Error("Uploads file not found");
    images = await response.json();
    updateUI();
  } catch (error) {
    console.error("Error fetching uploaded images:", error);
  }
}

function updateUI() {
  imageList.innerHTML = "";
  totalCost = images.length * 50;
  totalCostEl.textContent = totalCost;

  images.forEach(image => {
    const img = document.createElement("img");
    // Assuming each image object has a 'url' property
    img.src = image.url;
    imageList.appendChild(img);
  });
}

// Simulate checking the M-Pesa payment status
checkPaymentButton.addEventListener("click", () => {
  fetch("server/payment.json")
    .then(response => response.json())
    .then(data => {
      if (data.paid) {
        alert("Payment received! You can now print.");
        printButton.disabled = false;
      } else {
        alert("Payment not received yet.");
      }
    })
    .catch(error => console.error("Error checking payment:", error));
});

// Simulate sending a print command
printButton.addEventListener("click", () => {
    // Create a new window for printing
    const printWindow = window.open('', '', 'height=600,width=800');
  
    // Add the images to the new print window
    printWindow.document.write('<html><head><title>Print Uploaded Images</title></head><body>');

    printWindow.document.write(`
        <style>
          body {
            text-align: center;
            margin: 0;
          }
          img {
            width: 4in;
            height: 6in;
            margin-bottom: 20px;
            display: inline-block;
            page-break-after: always;
          }
        </style>
      `);
    
  
    images.forEach(image => {
      // Assuming the 'url' property contains the image path
      printWindow.document.write(`
        <img src="${image.url}" style="width: 4in; height: 6in; margin-bottom: 20px;" />
      `);
    });
  
    printWindow.document.write('</body></html>');
    printWindow.document.close();
  
    // Wait for the content to be loaded and then open the print dialog
    printWindow.onload = function() {
      printWindow.print();
    };
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
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json().catch(() => {
        throw new Error("Invalid JSON response from server.");
      });

      if (data.status === "success") {
        alert("Session ended successfully. All files have been deleted.");
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
