// email.js
// Charger la librairie EmailJS (à inclure dans ton HTML)
// <script src="https://cdn.emailjs.com/dist/email.min.js"></script>

// Initialiser EmailJS avec ta clé publique
emailjs.init('IV4ynVqfhK2_3r-_W');

/**
 * Envoie un email avec le code de validation via EmailJS
 * @param {string} prenom - prénom de l'utilisateur
 * @param {string} email - adresse email de l'utilisateur
 * @param {string} code - code à 6 chiffres à envoyer
 * @returns {Promise} - Promise qui se résout si envoi réussi
 */
function sendValidationEmail(prenom, email, code) {
  return emailjs.send('service_htipgeg', 'template_ahp970p', {
    prenom: prenom,
    email: email,
    code: code,
  });
}
