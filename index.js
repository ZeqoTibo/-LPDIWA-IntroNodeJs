const express = require('express');
const bodyParser = require("express");
const app = express();

app.use(express.static('public'));
app.use(bodyParser.json());

const VALUES = { test : 'un test'};

app.get('/values/:name', (req, res)=> {
    const valueName = req.params.name;
    if(!(valueName in VALUES)) {
        res.status(404).json({error: `Valeur ${valueName} inconnue.`});
        return
    }
    res.json({value : VALUES[valueName]});
})
// app.get('/', (req, res) => {
//     res.send('hello word');
// });

// app.get('/toto', (req, res) => {
//     res.send('Hello toto');
// });

app.listen(5000);
