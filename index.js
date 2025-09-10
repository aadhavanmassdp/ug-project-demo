<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Secure Data Embed</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 30px; }
    .container { max-width: 700px; margin: auto; border: 1px solid #ddd; padding: 30px; border-radius: 8px; box-shadow: 2px 3px 12px #aaa; }
    .menu { background: #2980b9; color: #fff; padding: 15px; margin-bottom: 20px; border-radius: 6px; }
    .section { margin-bottom: 30px; }
    input[type=file], select, button { margin-top:10px; display:block; }
    label { font-weight: bold; margin-top: 16px; }
    #output { white-space: pre-wrap; background: #eee; padding: 10px; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="menu">
      Secure Data Embed System – Demo
    </div>
    <div class="section">
      <label for="inputFile">Input Data/File</label>
      <input type="file" id="inputFile" accept=".txt,.jpg,.jpeg,.bmp,.gif,.avi,.flv,.wmv,.pdf,.doc,.docx,.png" />
    </div>
    <div class="section">
      <button onclick="encryptData()">Encrypt</button>
      <button onclick="decryptData()">Decrypt</button>
      <button onclick="generateCRC()">Generate CRC</button>
      <button onclick="compressData()">Compress</button>
      <button onclick="decompressData()">Decompress</button>
      <button onclick="embedData()">Embed in Image</button>
      <button onclick="deembedData()">De-Embed from Image</button>
    </div>
    <div id="output"></div>
    <div class="section">
      <label for="imageFile">Image for Embedding (.bmp/.jpeg)</label>
      <input type="file" id="imageFile" accept=".bmp,.jpg,.jpeg,.png" />
      <canvas id="previewCanvas" width="300" height="200" style="display:none; border:1px solid #555; margin-top:10px;"></canvas>
    </div>
  </div>
  <script>
    let fileData = null;
    document.getElementById("inputFile").addEventListener('change', function(e) {
      const reader = new FileReader();
      reader.onload = function() {
        fileData = reader.result;
        document.getElementById('output').textContent = "File Loaded:\n" + (typeof fileData === 'string' ? fileData.slice(0, 70) + '...' : '[Binary Data]');
      };
      reader.readAsArrayBuffer(this.files[0]);
    });

    function encryptData() {
      if (!fileData) return alert('Please upload a file first.');
      let text = arrayBufferToText(fileData);
      // Simple XOR cipher demo (do not use for real encryption)
      let key = 123;
      let encrypted = Array.from(text).map(c => String.fromCharCode(c.charCodeAt(0) ^ key)).join('');
      document.getElementById('output').textContent = "Encrypted Data:\n" + encrypted.slice(0,70) + '...';
      fileData = encrypted;
    }

    function decryptData() {
      if (!fileData) return alert('Please upload/encrypt a file first.');
      let key = 123;
      let decrypted = Array.from(fileData).map(c => String.fromCharCode(c.charCodeAt(0) ^ key)).join('');
      document.getElementById('output').textContent = "Decrypted Data:\n" + decrypted.slice(0,70) + '...';
      fileData = decrypted;
    }

    function generateCRC() {
      if (!fileData) return alert('Please upload a file first.');
      let text = arrayBufferToText(fileData);
      let crc = crc32(text).toString(16).toUpperCase();
      document.getElementById('output').textContent = "CRC32:\n" + crc;
    }

    function compressData() {
      if (!fileData) return alert('Please upload a file first.');
      let text = arrayBufferToText(fileData);
      // Simulate compression by removing all vowels
      let compressed = text.replace(/[aeiou]/gi, '');
      document.getElementById('output').textContent =
        "Compressed Data:\n" + compressed.slice(0,70) +
        `...\nCompression Ratio: ${((1-compressed.length/text.length)*100).toFixed(2)}%`;
      fileData = compressed;
    }

    function decompressData() {
      // Demo only: cannot restore vowels, so just echo back what was compressed
      document.getElementById('output').textContent = "Decompressed Data:\n" + arrayBufferToText(fileData).slice(0,70) + '...';
    }

    function embedData() {
      let imgFile = document.getElementById('imageFile').files[0];
      if (!imgFile || !fileData) return alert('Upload both an image and data file.');
      let reader = new FileReader();
      reader.onload = function() {
        let img = new Image();
        img.onload = function() {
          let canvas = document.getElementById('previewCanvas');
          canvas.style.display = 'block';
          canvas.width = img.width; canvas.height = img.height;
          let ctx = canvas.getContext('2d');
          ctx.drawImage(img,0,0);
          // Simple LSB steganography: Write data length in first red channel pixel
          let imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
          imageData.data[0] = fileData.length % 256; // Only demo: real code embeds per bit
          ctx.putImageData(imageData, 0, 0);
          document.getElementById('output').textContent = "Data embedded in image (demo only)";
        }
        img.src = reader.result;
      };
      reader.readAsDataURL(imgFile);
    }

    function deembedData() {
      let canvas = document.getElementById('previewCanvas');
      if (canvas.style.display !== 'block') return alert('Embed data first.');
      let ctx = canvas.getContext('2d');
      let imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
      let len = imageData.data[0]; // Only demo: real code would decode hidden bits
      document.getElementById('output').textContent =
        `Extracted Data length (demo): ${len} bytes\nData preview: ${(typeof fileData === 'string') ? fileData.slice(0, len) : '[Binary Data]'}`;
    }

    // Helpers
    function arrayBufferToText(buf) {
      if (typeof buf === 'string') return buf;
      try { return new TextDecoder().decode(buf); }
      catch { return ''; }
    }

    // CRC32 JavaScript implementation
    function crc32(str) {
      let crc = 0xFFFFFFFF;
      for (let i = 0; i < str.length; i++) {
        crc ^= str.charCodeAt(i);
        for (let j = 0; j < 8; j++)
          crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1));
      }
      return (crc ^ 0xFFFFFFFF) >>> 0;
    }
  </script>
</body>
</html>
