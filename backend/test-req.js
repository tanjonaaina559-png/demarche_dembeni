const axios = require('axios');
axios.post('http://localhost:5000/api/citizen-documents', { documentType: 'Acte de naissance' })
  .then(res => console.log(res.data))
  .catch(err => console.log(err.response?.status, err.response?.data));
