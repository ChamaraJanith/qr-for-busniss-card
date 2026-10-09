document.getElementById('vcard-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
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
    if (photoUrl) vcard += `PHOTO;VALUE=URI:${photoUrl}\n`;
    
    vcard += "END:VCARD";
    
    // Clear previous QR code
    const qrDiv = document.getElementById('qrcode');
    qrDiv.innerHTML = '';
    
    // Generate new QR Code
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
});
