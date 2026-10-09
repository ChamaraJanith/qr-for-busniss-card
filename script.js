document.getElementById('vcard-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const generateBtn = document.querySelector('.generate-btn');
    generateBtn.textContent = 'Generating...';
    generateBtn.disabled = true;

    // Get values
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const company = document.getElementById('company').value.trim();
    const jobTitle = document.getElementById('jobTitle').value.trim();
    const photoUrl = document.getElementById('photoUrl').value.trim();
    
    // Construct vCard format
    let vcard = "BEGIN:VCARD\nVERSION:3.0\n";
    vcard += `N:${lastName};${firstName};;;\n`;
    vcard += `FN:${firstName} ${lastName}\n`;
    vcard += `TEL;TYPE=CELL:${phone}\n`;
    
    if (email) vcard += `EMAIL;TYPE=WORK,INTERNET:${email}\n`;
    if (company) vcard += `ORG:${company}\n`;
    if (jobTitle) vcard += `TITLE:${jobTitle}\n`;

    // Process image if URL is provided
    if (photoUrl) {
        try {
            const base64Image = await getBase64ImageFromUrl(photoUrl);
            if (base64Image) {
                // Remove the data:image/jpeg;base64, part
                const b64Data = base64Image.split(',')[1];
                vcard += `PHOTO;ENCODING=b;TYPE=JPEG:${b64Data}\n`;
            }
        } catch (error) {
            console.error('Error loading image:', error);
            alert('Could not load the image from the URL. Please make sure the URL is correct and allows cross-origin requests (CORS).');
        }
    }
    
    vcard += "END:VCARD";
    
    // Clear previous QR code
    const qrDiv = document.getElementById('qrcode');
    qrDiv.innerHTML = '';
    
    // Generate new QR Code
    try {
        new QRCode(qrDiv, {
            text: vcard,
            width: 350,
            height: 350,
            colorDark: "#0f172a",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.L
        });
        
        // Show QR container with animation
        const qrContainer = document.getElementById('qr-container');
        qrContainer.classList.remove('hidden');
        
        // Smooth scroll to QR
        setTimeout(() => {
            qrContainer.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    } catch (err) {
        alert("The QR code data is too large! Please use a smaller image or leave the photo URL blank.");
    }

    generateBtn.textContent = 'Generate QR Code';
    generateBtn.disabled = false;
});

// Function to fetch image, resize it (so QR code doesn't break), and convert to Base64
function getBase64ImageFromUrl(imageUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous'; // Crucial for fetching from GitHub/external URLs
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Resize to a very small thumbnail (e.g., 64x64) to fit in QR code limits
            const maxSize = 64; 
            let width = img.width;
            let height = img.height;
            
            if (width > height) {
                if (width > maxSize) {
                    height *= maxSize / width;
                    width = maxSize;
                }
            } else {
                if (height > maxSize) {
                    width *= maxSize / height;
                    height = maxSize;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Draw image on canvas
            ctx.drawImage(img, 0, 0, width, height);
            
            // Get base64 string (JPEG format with high compression)
            const dataURL = canvas.toDataURL('image/jpeg', 0.5);
            resolve(dataURL);
        };
        img.onerror = (error) => {
            reject(error);
        };
        img.src = imageUrl;
    });
}
