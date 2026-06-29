require('dotenv').config();
const http = require('http');

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhM2MxMjljYjliZWZiNjRkZTVhOTZiYiIsImlhdCI6MTc4MjcwMTkzNCwiZXhwIjoxNzg1MjkzOTM0fQ.HxQ3o0UomhVU7bkmHB8gxmeBBADcOGx9tDnj69tMUkc';

// A minimal valid 10x10 PNG file in base64
const PNG_DATA = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFElEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
);

const boundary = 'TestBoundary' + Date.now();

// Build text part
function textPart(name, value) {
  return Buffer.from(
    '--' + boundary + '\r\n' +
    'Content-Disposition: form-data; name="' + name + '"\r\n\r\n' +
    value + '\r\n'
  );
}

// Build file part
function filePart(name, filename, mimeType, data) {
  const header = Buffer.from(
    '--' + boundary + '\r\n' +
    'Content-Disposition: form-data; name="' + name + '"; filename="' + filename + '"\r\n' +
    'Content-Type: ' + mimeType + '\r\n\r\n'
  );
  const footer = Buffer.from('\r\n');
  return Buffer.concat([header, data, footer]);
}

const slug = 'test-upload-proc-' + Date.now();

const parts = [
  textPart('title', 'Test Upload Procedure'),
  textPart('slug', slug),
  textPart('category', 'civil'),
  textPart('description', 'Test procedure for upload debugging'),
  textPart('detailedDescription', ''),
  textPart('duration', ''),
  textPart('price', 'Gratuit'),
  textPart('status', 'active'),
  textPart('buttonText', 'Faire la demande'),
  textPart('buttonLink', ''),
  textPart('isActive', 'true'),
  textPart('icon', 'fas fa-file-alt'),
  textPart('statistics', '[]'),
  textPart('features', '[]'),
  textPart('documents', '[]'),
  textPart('requiredFields', '[]'),
  textPart('steps', '[]'),
  textPart('pdfFields', '{}'),
  filePart('image', 'test-image.png', 'image/png', PNG_DATA),
  Buffer.from('--' + boundary + '--\r\n'),
];

const body = Buffer.concat(parts);

console.log('=== UPLOAD TEST ===');
console.log('Body size:', body.length, 'bytes');
console.log('Content-Type:', 'multipart/form-data; boundary=' + boundary);
console.log('Sending POST /api/admin/procedures...\n');

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/admin/procedures',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + TOKEN,
    'Content-Type': 'multipart/form-data; boundary=' + boundary,
    'Content-Length': body.length,
  }
}, (res) => {
  let responseBody = '';
  res.on('data', chunk => responseBody += chunk);
  res.on('end', () => {
    console.log('\n=== RESPONSE ===');
    console.log('Status:', res.statusCode);
    try {
      const parsed = JSON.parse(responseBody);
      console.log(JSON.stringify(parsed, null, 2));
      if (parsed.procedure) {
        console.log('\n=== IMAGE FIELDS ===');
        console.log('procedure.image:', parsed.procedure.image);
        console.log('procedure.imageUrl:', parsed.procedure.imageUrl);
      }
    } catch(e) {
      console.log('Raw response:', responseBody.substring(0, 2000));
    }
  });
});

req.on('error', e => {
  console.error('Request error:', e.message);
});

req.write(body);
req.end();
