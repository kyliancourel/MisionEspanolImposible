import React from 'react';

function Mission({ title, onStart, disabled = false }) {
  return (
    <div
      style={{
        border: '1px solid #ccc',
        borderRadius: '12px',
        padding: '15px',
        marginBottom: '15px',
        backgroundColor: disabled ? '#eee' : '#f9f9f9',
        textAlign: 'left',
        maxWidth: '500px',
        margin: '15px auto',
        color: disabled ? '#999' : 'inherit',
        cursor: disabled ? 'not-allowed' : 'pointer',
        userSelect: disabled ? 'none' : 'auto',
      }}
    >
      <h3>{title}</h3>
      <button
        onClick={onStart}
        disabled={disabled}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
      >
        🚀 Démarrer
      </button>
    </div>
  );
}

export default Mission;
