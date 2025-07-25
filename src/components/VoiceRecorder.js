import React, { useState, useRef } from 'react';

function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("Impossible d'accéder au micro : " + err.message);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  return (
    <div style={{ marginTop: 20 }}>
      {!isRecording && (
        <button onClick={startRecording}>🎙️ Démarrer l'enregistrement</button>
      )}
      {isRecording && (
        <button onClick={stopRecording} style={{ backgroundColor: 'red', color: 'white' }}>
          ⏹️ Arrêter l'enregistrement
        </button>
      )}

      {audioURL && (
        <div style={{ marginTop: 15 }}>
          <audio src={audioURL} controls />
          {/* Ici tu peux ajouter un bouton pour uploader le fichier, sauvegarder etc. */}
        </div>
      )}
    </div>
  );
}

export default VoiceRecorder;
