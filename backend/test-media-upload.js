require('dotenv').config();
const http = require('http');

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhM2MxMjljYjliZWZiNjRkZTVhOTZiYiIsImlhdCI6MTc4MjcwMTkzNCwiZXhwIjoxNzg1MjkzOTM0fQ.HxQ3o0UomhVU7bkmHB8gxmeBBADcOGx9tDnj69tMUkc';

const PNG_DATA = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFElEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
);

const boundary = 'TestBoundary' + Date.now();

function textPart(name, value) {
  return Buffer.from('--' + boundary + '\r\nContent-Disposition: form-data; name="' + name + '"\r\n\r\n' + value + '\r\n');
}

function filePart(name, filename, mimeType, data) {
  const header = Buffer.from('--' + boundary + '\r\nContent-Disposition: form-data; name="' + name + '"; filename="' + filename + '"\r\nContent-Type: ' + mimeType + '\r\n\r\n');
  const footer = Buffer.from('\r\n');
  return Buffer.concat([header, data, footer]);
}

const parts = [
  textPart('category', 'cms'),
  filePart('file', 'test-home-image.png', 'image/png', PNG_DATA),
  Buffer.from('--' + boundary + '--\r\n'),
];

const body = Buffer.concat(parts);

const req = http.request({
  hostname: 'localhost', port: 5000,
  path: '/api/cms/media', method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + TOKEN,
    'Content-Type': 'multipart/form-data; boundary=' + boundary,
    'Content-Length': body.length,
  }
}, (res) => {
  let responseBody = '';
  res.on('data', chunk => responseBody += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', responseBody);
  });
});

req.on('error', e => console.error('Error:', e.message));
req.write(body);
req.end();
