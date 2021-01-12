const express = require('express')
const app = express()
const path = require('path')

app.use(express.static(__dirname + '/public'))
app.use('/build/', express.static(path.join(__dirname, 'node_modules/three/build')));
app.use('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.get("/", (req, res) => {
    res.render('index');
});

app.get("/one", (req, res) => {
    res.render('one');
});

app.listen(3000, () =>
    console.log('Visit http://127.0.0.1:3000')
);