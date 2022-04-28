const moduleHttp = require('http');

const serveur = moduleHttp.createServer((requete, reponse) => {
    const url = requete.url.slice(1).split('/')
    const page =
        `<!DOCTYPE html>
    <html lang="fr">
    <head>
    <meta charset="utf-8">
        <title> Bonjour </title>
</head>
    <body>
    <h1>  ${url[0] ? 'bonjour '+url[0] : `T ki ?`}</h1>
    </body>
</html>`;
    reponse.setHeader('Content-Type', 'text/html');
    reponse.end(page)
});

const interfaceEcoutee = '127.0.0.1';
const portEcoute = 5000;
serveur.listen(portEcoute, interfaceEcoutee, () => {
    console.log(`Le serveur est maintenant disponible à l'adresse http://${interfaceEcoutee}:${portEcoute}`);
});
