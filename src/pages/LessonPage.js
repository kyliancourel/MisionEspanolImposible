import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LessonActivities from '../components/LessonActivities';
import supports from '../data/supports.json';

function LessonPage() {
  const { level, missionKey, lessonKey } = useParams();
  const navigate = useNavigate();

  const [lessons, setLessons] = useState([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(null);

  useEffect(() => {
    if (!level || !missionKey || !supports?.[level]?.[missionKey]) {
      return;
    }

    const availableLessons = Object.keys(supports[level][missionKey]);
    setLessons(availableLessons);

    const index = availableLessons.indexOf(lessonKey);
    if (index >= 0) {
      setCurrentLessonIndex(index);
    } else {
      // Redirige vers la première leçon si lessonKey invalide
      if (availableLessons.length > 0) {
        navigate(`/lesson/${level}/${missionKey}/${availableLessons[0]}`, { replace: true });
      }
    }
  }, [level, missionKey, lessonKey, navigate]);

  useEffect(() => {
    if (
      currentLessonIndex !== null &&
      lessons.length > 0 &&
      lessons[currentLessonIndex] !== lessonKey
    ) {
      navigate(`/lesson/${level}/${missionKey}/${lessons[currentLessonIndex]}`, { replace: true });
    }
  }, [currentLessonIndex, lessons, level, missionKey, lessonKey, navigate]);

  const handleNext = () => {
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  if (!level || !missionKey || lessons.length === 0 || currentLessonIndex === null) {
    return <p>❌ Leçon introuvable.</p>;
  }

  const currentLessonKey = lessons[currentLessonIndex];

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>{level} → {missionKey}</h1>
      <h2>📚 Leçon {currentLessonIndex + 1} : {currentLessonKey}</h2>

      <LessonActivities
        level={level}
        missionKey={missionKey}
        lessonKey={currentLessonKey}
      />

      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={handlePrev} disabled={currentLessonIndex === 0}>
          ← Leçon précédente
        </button>
        <button
          onClick={handleNext}
          disabled={currentLessonIndex === lessons.length - 1}
        >
          Leçon suivante →
        </button>
      </div>
    </div>
  );
}

export default LessonPage;
