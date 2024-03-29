// > node server.js 1234
var port = 8888;
if (process.argv.length > 2) port = parseInt(process.argv[2]);

const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static('./')); //Tells the app to serve static files from ./

app.listen(port, () => console.log('Listening on port '+port));
