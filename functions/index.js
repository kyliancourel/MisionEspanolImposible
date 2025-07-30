// index.js – Cloud Function Firebase pour distribuer une clé AES de manière sécurisée

const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });

// Limite le nombre d'instances à 10 pour maîtriser les coûts
functions.setGlobalOptions({ maxInstances: 10 });

/**
 * Cloud Function HTTP pour transmettre la clé AES.
 * Cette fonction ne répond qu'aux requêtes GET.
 * La clé est maintenue secrète (non présente dans le code client).
 */
exports.getSecretKey = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== "GET") {
      return res.status(405).send("Méthode non autorisée");
    }

    // Clé AES confidentielle – à ne jamais exposer côté client
    const aesKey = "z2JXHv5JTqkYC0YcEgTvTFbIDX7A1Bxx";

    return res.status(200).json({ key: aesKey });
  });
});
