import React from 'react';

function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: 700, margin: 'auto', padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Politique de confidentialité</h1>
      <p>
        Nous attachons une grande importance à la protection de vos données personnelles.
        Cette politique explique quelles informations nous collectons, comment nous les utilisons, et vos droits.
      </p>

      <h2>Informations collectées</h2>
      <p>Nous collectons uniquement les données nécessaires pour fournir nos services, telles que :</p>
      <ul>
        <li>Votre adresse email lors de l'inscription.</li>
        <li>Les données de progression dans le jeu.</li>
      </ul>

      <h2>Utilisation des données</h2>
      <p>Les données collectées servent uniquement à :</p>
      <ul>
        <li>Gérer votre compte utilisateur.</li>
        <li>Améliorer votre expérience de jeu.</li>
      </ul>

      <h2>Partage des données</h2>
      <p>Nous ne partageons pas vos données personnelles avec des tiers sans votre consentement, sauf obligations légales.</p>

      <h2>Vos droits</h2>
      <p>Vous avez le droit de :</p>
      <ul>
        <li>Accéder à vos données.</li>
        <li>Les rectifier ou supprimer.</li>
        <li>Retirer votre consentement à tout moment.</li>
      </ul>

      <h2>Contact</h2>
      <p>Pour toute question concernant vos données personnelles, contactez-nous à : <a href="mailto:support@example.com">support@example.com</a>.</p>
    </div>
  );
}

export default PrivacyPolicy;
