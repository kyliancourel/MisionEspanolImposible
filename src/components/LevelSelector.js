import React from 'react';

function LevelSelector({ onSelectLevel }) {
  const levels = ["Débutant", "Intermédiaire", "Avancé"];

  return (
    <div style={{ marginBottom: '20px' }}>
      <h2>Choisis ton niveau</h2>
      {levels.map((level) => (
        <button
          key={level}
          onClick={() => onSelectLevel(level)}
          style={{
            margin: '5px',
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          {level}
        </button>
      ))}
    </div>
  );
}

export default LevelSelector;
