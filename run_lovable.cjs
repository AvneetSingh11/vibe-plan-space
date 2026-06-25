const express = require('express');
const path = require('path');

const app = express();
const port = 3001;

app.use(express.static(path.join(__dirname, 'public-lovable')));

app.listen(port, () => {
  console.log(`Lovable URL clone running at http://localhost:${port}`);
});
