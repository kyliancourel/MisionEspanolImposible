import React from 'react';
import Mission from './Mission';

const missionsByLevel = {
  "Débutant": [
    "Portrait, autoportrait",
    "Le quotidien : lieux, rythmes, saisons",
    "École et loisirs",
    "Le réel et l'imaginaire",
    "Des langues, des lieux, des histoires",
    "Le Mexique : partons à la découverte de ce pays fascinant !",
    "Sport et société",
    "Voyages et exploration",
    "Villes, villages, quartiers",
    "Inventer, innover, créer",
    "Langages et messages artistiques",
    "L'Andalousie, terre de merveilles",
    "À la rencontre de l'autre",
    "Travailler hier, aujourd'hui, demain",
    "Voyages et migrations",
    "Langages et médias",
    "Formes de l'engagement",
    '1492, l\'année "admirable" ?',
  ],
  "Intermédiaire": [
    "Représentation de soi et rapport à autrui",
    "Vivre entre générations",
    "Le passé dans le présent",
    "Défis et transitions",
    "Créer et recréer",
    "L'espagne au-delà des clichés",
    "Identités et échanges",
    "Diversité et inclusion",
    "Art et pouvoir",
    "Innovations scientifiques et responsabilité",
    "L'être humain et la nature",
    "L'espace andin, la colonne vertébralede l'Amérique du Sud",
    "Espace privé et espace public",
    "Territoire et mémoire",
    "Fictions et réalités",
    "Enjeux et formes de la communication",
    "Citoyenneté et mondes virtuels",
    "La richesse des métissages dans le monde hispanique",
  ],
  "Avancé": [
    "Littérature Espagnole",
    "Littérature Latino-Américaine",
    "Civilisation Espagnole",
    "Civilisation Latino-Américaine",
    "Thème : Du français à l'espagnol",
    "Version : De l'espagnol au français",
    "Grammaire et vocabulaire avancés",
  ]
};

// Fonction utilitaire pour obtenir nombre de missions (utile pour App.js)
MissionList.getMissionCount = function(level) {
  return (missionsByLevel[level] || []).length;
};

function MissionList({ level, isLoggedIn, unlockedMissionIndex = 0, onUnlockNext }) {
  const missions = missionsByLevel[level] || [];

  const handleStartMission = (index, mission) => {
    alert(`Tu as lancé la mission : ${mission}`);

    // Débloquer la mission suivante si c’est la dernière débloquée et qu'il en reste
    if (isLoggedIn && index === unlockedMissionIndex && unlockedMissionIndex < missions.length - 1) {
      onUnlockNext();
    }
  };

  return (
    <div>
      <h2>Missions pour le niveau {level}</h2>
      {missions.map((mission, index) => {
        const isUnlocked = isLoggedIn ? index <= unlockedMissionIndex : index === 0;
        return (
          <Mission
            key={index}
            title={mission}
            onStart={() => isUnlocked && handleStartMission(index, mission)}
            disabled={!isUnlocked}
          />
        );
      })}
    </div>
  );
}

export default MissionList;
