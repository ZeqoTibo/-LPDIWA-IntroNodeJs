const express = require('express');
const bodyParser = require('body-parser');
const {v4: uuidv4} = require('uuid');
const MongoClient = require("mongodb").MongoClient;

var url = "mongodb://localhost:27017/";

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

function createError(errorMessage) {
    return {
        error: errorMessage,
    };
}

function parseEntryBody(requestBody) {
    let {content, limitDate, extraInfo} = requestBody;
    content = content ? content.toString() : null;
    limitDate = limitDate ? new Date(limitDate) : null;
    extraInfo = typeof (extraInfo) === 'undefined' ? null : extraInfo.toString();
    if (!content || !limitDate || isNaN(limitDate)) {
        throw new Error('Mauvais format ou contenu ou date limite manquante');
    }
    return {content, limitDate, extraInfo};
}

/**
 * Methode permettant de récuperer toutes les entités de la table
 */
app.get('/todolist', (req, res) => {
    MongoClient.connect(url, async function (err, db) {
            if (err) throw err;
            var dbo = db.db("mydb");
            var data = await dbo.collection('TODOS').find({}).toArray()
            console.log("Get all done ! Contains : " + data.length);
            res.json(data)
            db.close();
        }
    )
    ;
});

/**
 * Méthode permettant de récuperer une entité avec son ID
 * @entryId - Id de l'entité
 */
app.get('/todolist/:entryId', async (req, res) => {
    try {
        const entryId = req.params.entryId;
        try {
            await MongoClient.connect(url, async function (err, db) {
                var dbo = db.db("mydb");
                var data = await dbo.collection('TODOS').find({_id: entryId}).toArray()
                db.close();
                if (data.length > 0) {
                    console.log("Get with id done ! For id : " + entryId);
                    res.json(data)
                } else {
                    console.log("Id unknown");
                    res.status(400).json(err.name);
                }
            });
        } catch (err) {
        }
    } catch (e) {
        res.status(400).json(createError(e.message));
        console.log('eref')
    }
});

/**
 * Méthode permettant de créer une nouvelle entité
 */
app.post('/todolist', (req, res) => {
    MongoClient.connect(url, function (err, db) {
        const {content, limitDate, extraInfo} = parseEntryBody(req.body);
        var dbo = db.db("mydb");
        const entry = {
            _id: uuidv4(),
            content: content,
            limitDate: limitDate,
            extraInfo: extraInfo,
        }
        dbo.collection('TODOS').insertOne(entry, function (err) {
            if (err) throw err;
            console.log('Post effectué, id: ' + entry._id)
            db.close();
            res.json(entry);
        })
    });
});

/**
 * Méthode permettant de modifier une entité avec son ID
 * @entryId - Id de l'entité
 */
app.put('/todolist/:entryId', (req, res) => {
    MongoClient.connect(url, async function (err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        const entryId = req.params.entryId;
        if (!entryId) {
            res.status(404).json('Entrée introuvable');
            return;
        }
        try {
            const {content, limitDate, extraInfo} = req.body;
            const collection = await dbo.collection('TODOS').replaceOne({_id: entryId}, {content, limitDate, extraInfo})
            if (collection.modifiedCount > 0) {
                console.log('Put done ! For id : ' + entryId)
                res.status(200).json(collection);
            } else {
                console.log(err.name)
                res.status(400).json(err.name);
            }

        } catch (e) {
            res.status(400).json(e.message);
        }
        db.close();
    });
});

/**
 * Méthode permettant de supprimer une entité avec son ID
 * @entryId - Id de l'entité
 */
app.delete('/todolist/:entryId', (req, res) => {
    MongoClient.connect(url, async function (err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        try {
            const entryId = req.params.entryId;
            if (!entryId) {
                res.status(404).json('Entrée introuvable');
                return;
            }
            const collection = await dbo.collection('TODOS').deleteOne({_id: entryId})
            db.close();
            if ( collection.deletedCount > 0) {
                console.log('Delete done! ' + collection.deletedCount + ' was deleted')
                res.status(204).end();
            } else {
                res.status(400).json(err.name)
            }
        } catch (err) {
            console.log(err);
            throw err
        }
    });
});

app.listen(5000);
