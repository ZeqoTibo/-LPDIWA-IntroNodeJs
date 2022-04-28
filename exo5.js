const express = require('express');
const bodyParser = require('body-parser');

//CrÃ©ation d'une "application" express
const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

const VALUES = {
    test: "Un test"
};

app.get('/values/:name', (req, res) => {
    const valueName = req.params.name;
    if (!(valueName in VALUES)) {
        res.status(404).json({ error: `Valeur ${valueName} inconnue.` });
        return;
    }
    res.json({ value: VALUES[valueName] });
});

app.put('/values/:name', (req, res) => {
    const valueName = req.params.name;
    console.log(req.body);
    if (!req.body ||
        (req.body.value !== null && !req.body.value)) {
        res.status(400).json({ error: "DonnÃ©es incorrectes." });
        return;
    }

    VALUES[valueName] = req.body.value;
    res.json({ value: VALUES[valueName] });
});


//Mise en Ã©coute de l'application sur le port 5000 de n'importe quelle interface de la machine
app.listen(3000);
