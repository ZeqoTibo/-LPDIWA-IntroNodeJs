const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

const TODO_LIST = [
    { id: uuidv4(), content: 'a first entry', limitDate: new Date("2020-11-01"), extraInfo: null },
    {
        id: uuidv4(),
        content: 'a second entry',
        limitDate: new Date("2020-09-08"),
        extraInfo: "Des infos en plus"
    },
].reduce((acc, current) => ({ ...acc, [current.id]: current }), {});

function createError(errorMessage) {
    return {
        error: errorMessage,
    };
}

function parseEntryBody(requestBody) {
    let { content, limitDate, extraInfo } = requestBody;
    content = content ? content.toString() : null;
    limitDate = limitDate ? new Date(limitDate) : null;
    extraInfo = typeof(extraInfo) === 'undefined' ? null : extraInfo.toString();
    if (!content || !limitDate || isNaN(limitDate)) {
        throw new Error('Mauvais format ou contenu ou date limite manquante');
    }
    return { content, limitDate, extraInfo };
}

app.get('/todolist', (req, res) => {
    const entries = Object.values(TODO_LIST)
        .sort((e1, e2) => e1.limitDate - e2.limitDate)
        .map(entry => ({
            id: entry.id,
            content: entry.content,
        }));
    res.json(entries);
});

app.post('/todolist', (req, res) => {
    try {
        const { content, limitDate, extraInfo } = parseEntryBody(req.body);
        const entry = {
            id: uuidv4(),
            content,
            limitDate,
            extraInfo,
        }
        TODO_LIST[entry.id] = entry;
        res.json(entry);
    } catch (e) {
        res.status(400).json(createError(e.message));
    }
});

app.get('/todolist/:entryId', (req, res) => {
    const entryId = req.params.entryId;
    const entry = TODO_LIST[entryId];
    if (!entry) {
        res.status(404).json(createError('EntrÃ©e introuvable'));
    } else {
        res.json(entry);
    }
});

app.put('/todolist/:entryId', (req, res) => {
    const entryId = req.params.entryId;
    const entry = TODO_LIST[entryId];
    if (!entry) {
        res.status(404).json(createError('EntrÃ©e introuvable'));
        return;
    }
    try {
        const { content, limitDate, extraInfo } = parseEntryBody(req.body);
        TODO_LIST[entry.id] = { ...TODO_LIST[entryId], content, limitDate, extraInfo };
        res.json(TODO_LIST[entryId]);
    } catch (e) {
        res.status(400).json(createError(e.message));
    }
});

app.delete('/todolist/:entryId', (req, res) => {
    const entryId = req.params.entryId;
    if (!TODO_LIST[entryId]) {
        res.status(404).json(createError('EntrÃ©e introuvable'));
        return;
    }
    delete TODO_LIST[entryId];
    res.status(204).end();
});

app.listen(5000);
