import React from 'react';

function DeleteData() {
  return (
    <div style={{ maxWidth: 700, margin: 'auto', padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Suppression des données utilisateur</h1>
      <p>
        Si vous souhaitez supprimer votre compte et toutes les données associées, voici la procédure :
      </p>

      <ol>
        <li>Connectez-vous à votre compte sur notre site.</li>
        <li>Accédez à la page “Paramètres” ou “Mon compte”.</li>
        <li>Cliquez sur le bouton “Supprimer mon compte”.</li>
        <li>Confirmez la suppression lorsque vous y êtes invité.</li>
      </ol>

      <p>
        Une fois votre demande prise en compte, toutes vos données seront supprimées de notre base dans un délai de 30 jours.
      </p>

      <p>
        Si vous rencontrez des difficultés ou souhaitez faire une demande manuelle, contactez-nous à : <a href="mailto:misionespanolimposible@gmail.com">support@example.com</a>.
      </p>
    </div>
  );
}

export default DeleteData;
