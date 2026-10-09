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
    
    // Construct vCard format (CRLF \r\n is standard for vCard)
    let vcard = "BEGIN:VCARD\r\nVERSION:3.0\r\n";
    vcard += `N:${lastName};${firstName};;;\r\n`;
    vcard += `FN:${firstName} ${lastName}\r\n`;
    vcard += `TEL;TYPE=CELL:${phone}\r\n`;
    
    if (email) vcard += `EMAIL;TYPE=WORK,INTERNET:${email}\r\n`;
    if (company) vcard += `ORG:${company}\r\n`;
    if (jobTitle) vcard += `TITLE:${jobTitle}\r\n`;

    // Add photo directly via URL (much better for QR scanning)
    if (photoUrl) {
        vcard += `PHOTO;TYPE=JPEG;VALUE=URI:${photoUrl}\r\n`;
    }
    
    vcard += "END:VCARD";
    
    // Clear previous QR code
    const qrDiv = document.getElementById('qrcode');
    qrDiv.innerHTML = '';
    
    // Generate new QR Code
    try {
        new QRCode(qrDiv, {
            text: vcard,
            width: 250,
            height: 250,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.M
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

// Download .vcf functionality
document.getElementById('download-vcf-btn').addEventListener('click', async function() {
    const btn = this;
    const originalText = btn.textContent;
    btn.textContent = 'Downloading...';
    btn.disabled = true;

    // Get values
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const company = document.getElementById('company').value.trim();
    const jobTitle = document.getElementById('jobTitle').value.trim();
    const photoUrl = document.getElementById('photoUrl').value.trim();
    
    // Construct vCard format
    let vcard = "BEGIN:VCARD\r\nVERSION:3.0\r\n";
    vcard += `N:${lastName};${firstName};;;\r\n`;
    vcard += `FN:${firstName} ${lastName}\r\n`;
    vcard += `TEL;TYPE=CELL:${phone}\r\n`;
    
    if (email) vcard += `EMAIL;TYPE=WORK,INTERNET:${email}\r\n`;
    if (company) vcard += `ORG:${company}\r\n`;
    if (jobTitle) vcard += `TITLE:${jobTitle}\r\n`;

    // Process image if URL is provided
    if (photoUrl) {
        try {
            // For file download, we can use a higher quality and size
            const base64Image = await getBase64ImageFromUrl(photoUrl, 200, 0.8);
            if (base64Image) {
                const b64Data = base64Image.split(',')[1];
                vcard += `PHOTO;ENCODING=b;TYPE=JPEG:${b64Data}\r\n`;
            }
        } catch (error) {
            console.error('Error loading image:', error);
            alert('Could not load the image from the URL.');
        }
    }
    
    vcard += "END:VCARD\r\n";

    // Trigger download
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${firstName || 'contact'}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    btn.textContent = originalText;
    btn.disabled = false;
});


// Function to fetch image, resize it (so QR code doesn't break), and convert to Base64
// Function to fetch image, resize it, and convert to Base64
function getBase64ImageFromUrl(imageUrl, maxSize = 48, quality = 0.3) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous'; // Crucial for fetching from GitHub/external URLs
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
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
            
            // Get base64 string
            const dataURL = canvas.toDataURL('image/jpeg', quality);
            resolve(dataURL);
        };
        img.onerror = (error) => {
            reject(error);
        };
        img.src = imageUrl;
    });
}
