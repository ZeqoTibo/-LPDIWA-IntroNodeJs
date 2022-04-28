const express = require("express");
const bodyParser = require("body-parser");
var MongoClient = require('mongodb').MongoClient;
//url en local, sinon vous pouvez utiliser la solution cloud de MongoDB Atlas
var url = "mongodb://localhost:27017/";
//var url = "mongodb+srv://admin:admin@cluster0.jovjl.mongodb.net/testBDD?retryWrites=true&w=majority";

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/todolist', (req, res) => {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        var data = dbo.collection('TODOS').find({}).toArray()
        console.log("Get effectué");
        res.json(data)
        db.close();
    });
});

app.get('/todolist/:entryId', (req, res) => {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        const entryId = req.params.entryId;
        try {
            const docs = dbo.collection('TODOS').findOne({entryId})
            res.status(200).json(docs);
        } catch (err) {
            console.log(err)
            throw err
        }
        db.close();
    });
});

app.post('/todolist', async (req, res) => {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        try {
            const todolistData = req.body;
            const todolist = db.collection('TODOS').insertOne(todolistData)
            res.status(200).json(todolist);
        } catch (e) {
            res.status(400).json(createError(e.message));
            throw e
        }
        db.close();
    });
});

app.put('/todolist/:entryId', (req, res) => {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        const entryId = req.params.entryId;
        if (!entryId) {
            res.status(404).json('Entrée introuvable');
            return;
        }
        try {
            const {content, limitDate, extraInfo} = req.body;
            const collection = db.collection('TODOS').replaceOne({entryId}, {content, limitDate, extraInfo})
            res.status(200).json(collection);
        } catch (e) {
            res.status(400).json(e.message);
        }
        db.close();
    });
});

app.delete('/todolist/:entryId', (req, res) => {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        try {
            const entryId = req.params.entryId;
            if (!entryId) {
                res.status(404).json('Entrée introuvable');
                return;
            }
            const collection = db.collection('TODOS').deleteOne({entryId})
            res.status(200).json(collection);
        } catch (err) {
            console.log(err);
            throw err
        }
        db.close();
    });
});
