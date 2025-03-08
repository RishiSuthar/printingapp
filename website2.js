// DOM Elements
const fileInput = document.getElementById("fileInput");
const uploadButton = document.getElementById("uploadButton");
const totalCostEl = document.getElementById("totalCost");
const progressContainer = document.getElementById("progressContainer");
const uploadProgress = document.getElementById("uploadProgress");
const progressText = document.getElementById("progressText");
const otpInput = document.getElementById("otpInput");
const submitOtpButton = document.getElementById("submitOtp");
const otpError = document.getElementById("otpError");

// State variables
let selectedFiles = [];
let validOtp = null;

// Initial setup - disable upload functionality until OTP is validated
fileInput.disabled = true;
uploadButton.disabled = true;

// OTP Validation Handler
submitOtpButton.addEventListener("click", async () => {
  const enteredOtp = otpInput.value.trim();
  
  if (!enteredOtp) {
    showOtpError("Please enter OTP");
    return;
  }

  try {
    const response = await fetch("server/validateOTP.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ otp: enteredOtp }),
    });

    const data = await response.json();

    if (data.valid) {
      validOtp = enteredOtp;
      otpError.style.display = "none";
      fileInput.disabled = false;
      uploadButton.disabled = false;
      
      // Show success popup
      showSuccessPopup("OTP verified successfully! 🎉\nYou can now upload files.");
    } else {
      showOtpError("Invalid OTP. Please try again.");
    }
  } catch (error) {
    showOtpError("Error validating OTP. Please try again.");
    console.error("OTP validation error:", error);
  }
});


fileInput.addEventListener("change", () => {
  selectedFiles = Array.from(fileInput.files);
  const fileCount = selectedFiles.length;
  
  // Update both cost and file count
  totalCostEl.textContent = fileCount * 50; // Assuming 50 KSH per file
  document.getElementById("fileCount").textContent = fileCount;
  
  updateImagePreview();
});


function showSuccessPopup(message) {
  const popup = document.createElement("div");
  popup.className = "success-popup";
  popup.innerHTML = `
    <div class="popup-content">
      <p>${message}</p>
      <button onclick="this.parentElement.parentElement.remove()">OK</button>
    </div>
  `;
  
  document.body.appendChild(popup);
}

function showOtpError(message) {
  otpError.textContent = message;
  otpError.style.display = "block";
  fileInput.disabled = true;
  uploadButton.disabled = true;
}



// Upload Handler
uploadButton.addEventListener("click", async () => {
  // Check if OTP is still valid
  if (!validOtp) {
    showOtpError("Session expired. Please re-enter OTP.");
    resetUploadInterface();
    return;
  }

  if (selectedFiles.length === 0) {
    alert("Please select images to upload.");
    return;
  }

  progressContainer.style.display = "block";
  const formData = new FormData();
  
  // Add OTP to the form data
  formData.append("otp", validOtp);
  
  // Add files
  selectedFiles.forEach((file) => {
    formData.append("photos[]", file);
  });

  const xhr = new XMLHttpRequest();
  xhr.open("POST", "server/upload.php", true);

  // Progress Handler
  xhr.upload.addEventListener("progress", (event) => {
    if (event.lengthComputable) {
      const percent = (event.loaded / event.total) * 100;
      uploadProgress.value = percent;
      progressText.textContent = `${Math.round(percent)}%`;
    }
  });

  // Completion Handler
  xhr.onload = function () {
    progressContainer.style.display = "none";
    
    if (xhr.status === 200) {
      try {
        const response = JSON.parse(xhr.responseText);
        if (response.error) {
          handleUploadError(response.error);
        } else {
          alert(`Upload successful! Please pay ${totalCostEl.textContent} KSH.`);
          location.reload();
        }
      } catch (e) {
        handleUploadError("Invalid server response");
      }
    } else {
      handleUploadError(`Upload failed (Status: ${xhr.status})`);
    }
  };

  // Error Handler
  xhr.onerror = function () {
    progressContainer.style.display = "none";
    handleUploadError("Network error. Please check your connection.");
  };

  xhr.send(formData);
});

// Helper Functions
function updateImagePreview() {
  const previewContainer = document.getElementById("imagePreview");
  
  // Clean up existing object URLs
  Array.from(previewContainer.children).forEach(child => {
    const img = child.querySelector('img');
    if (img) URL.revokeObjectURL(img.src);
  });
  previewContainer.innerHTML = "";

  selectedFiles.forEach((file, index) => {
    const container = document.createElement("div");
    container.className = "preview-container";

    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.classList.add("preview-image");

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-image-btn";
    removeBtn.innerHTML = "×";
    removeBtn.addEventListener("click", () => {
      // Remove the corresponding file from the array
      selectedFiles.splice(index, 1);
      // Update the preview and counters
      updateImagePreview();
      document.getElementById("fileCount").textContent = selectedFiles.length;
      totalCostEl.textContent = selectedFiles.length * 50;
    });

    container.appendChild(img);
    container.appendChild(removeBtn);
    previewContainer.appendChild(container);
  });
}

function showOtpError(message) {
  otpError.textContent = message;
  otpError.style.display = "block";
  fileInput.disabled = true;
  uploadButton.disabled = true;
}


function resetUploadInterface() {
  validOtp = null;
  fileInput.value = "";
  selectedFiles = [];
  totalCostEl.textContent = "0";
  document.getElementById("fileCount").textContent = "0";
  document.getElementById("imagePreview").innerHTML = "";
  fileInput.disabled = true;
  uploadButton.disabled = true;
}

function handleUploadError(message) {
  alert(`Error: ${message}`);
  progressContainer.style.display = "none";
  uploadProgress.value = 0;
  progressText.textContent = "0%";
}

document.querySelectorAll('.instruction-header').forEach(header => {
  header.addEventListener('click', () => {
    const content = header.nextElementSibling;
    const button = header.querySelector('.toggle-btn');
    content.classList.toggle('collapsed');
    button.classList.toggle('collapsed');
  });
});

// Always collapse on initial load
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.collapsible-content').forEach(content => {
    content.classList.add('collapsed');
    content.previousElementSibling.querySelector('.toggle-btn').classList.add('collapsed');
  });
  
  // Clear any existing preferences
  localStorage.removeItem('instructionsCollapsed');
});

document.getElementById('fileInput').addEventListener('change', function() {
  const fileCount = this.files.length;
  if(fileCount > 0) {
    this.setAttribute('data-file-count', `${fileCount} file${fileCount > 1 ? 's' : ''} selected`);
  } else {
    this.removeAttribute('data-file-count');
  }
});
