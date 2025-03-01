const fileInput = document.getElementById("fileInput");
const uploadButton = document.getElementById("uploadButton");
const totalCostEl = document.getElementById("totalCost");
const progressContainer = document.getElementById("progressContainer");
const uploadProgress = document.getElementById("uploadProgress");
const progressText = document.getElementById("progressText");

let selectedFiles = [];

// Update the cost when files are selected
fileInput.addEventListener("change", () => {
  selectedFiles = Array.from(fileInput.files);
  totalCostEl.textContent = selectedFiles.length * 50;
  updateImagePreview();
});

// Update image preview when files are selected
function updateImagePreview() {
  const previewContainer = document.getElementById('imagePreview');
  previewContainer.innerHTML = ''; // Clear previous previews

  selectedFiles.forEach(file => {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.style.maxWidth = '100px';
    img.style.marginRight = '10px';
    previewContainer.appendChild(img);
  });
}

// Upload images to the server
uploadButton.addEventListener("click", async () => {
  if (selectedFiles.length === 0) {
    alert("Please select images to upload.");
    return;
  }

  // Show the progress bar container
  progressContainer.style.display = 'block';

  const formData = new FormData();
  selectedFiles.forEach(file => formData.append("photos[]", file));

  const xhr = new XMLHttpRequest();
  xhr.open("POST", "server/upload.php", true);

  // Set up progress event listener
  xhr.upload.addEventListener("progress", (event) => {
    if (event.lengthComputable) {
      const percent = (event.loaded / event.total) * 100;
      uploadProgress.value = percent;
      progressText.textContent = `${Math.round(percent)}%`;
    }
  });

  // Handle the response after upload
  xhr.onload = function() {
    if (xhr.status === 200) {
      alert("Upload successful! Please pay " + totalCostEl.textContent + " KSH.");
      location.reload(); // Refresh the page after successful upload
    } else {
      alert("Upload failed.");
    }
    progressContainer.style.display = 'none'; // Hide progress bar after completion
  };

  // Handle any error during the upload
  xhr.onerror = function() {
    alert("An error occurred while uploading the files.");
    progressContainer.style.display = 'none'; // Hide progress bar on error
  };

  xhr.send(formData); // Send the form data to the server
});
