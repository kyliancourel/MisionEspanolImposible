// sequence.js

// Fonction pour récupérer le paramètre "title" dans l'URL
function getSequenceTitleFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('title');
}

document.addEventListener('DOMContentLoaded', async () => {
  const title = getSequenceTitleFromURL();
  console.log("Séquence demandée :", title);

  const sequenceTitleEl = document.getElementById('sequence-title');
  const lessonListEl = document.getElementById('lesson-list');
  const startLessonBtn = document.getElementById('start-lesson-btn');
  const evaluationBtn = document.getElementById('go-to-evaluation');

  if (!title) {
    sequenceTitleEl.textContent = "Séquence non spécifiée";
    lessonListEl.innerHTML = "<p>Erreur : aucune séquence sélectionnée.</p>";
    return;
  }

  try {
    const response = await fetch('data/sequences.json');
    if (!response.ok) throw new Error('Erreur de chargement du fichier JSON');
    const data = await response.json();

    let sequence = null;
    for (const level in data) {
      sequence = data[level].find(seq => seq.title === title);
      if (sequence) break;
    }

    if (!sequence) {
      sequenceTitleEl.textContent = "Séquence non trouvée";
      lessonListEl.innerHTML = `<p>La séquence "${title}" est introuvable.</p>`;
      return;
    }

    sequenceTitleEl.textContent = sequence.title;

    lessonListEl.innerHTML = '<ul>' + 
      (sequence.lessons || []).map(lesson => 
        `<li>${lesson.title} (${lesson.type})</li>`
      ).join('') + 
      '</ul>';

    startLessonBtn.style.display = 'inline-block';
    evaluationBtn.style.display = 'inline-block';

    startLessonBtn.onclick = () => {
      const firstLessonIndex = 0;
      const encodedSeq = encodeURIComponent(sequence.title);
      window.location.href = `lesson.html?sequence=${encodedSeq}&lesson=${firstLessonIndex}`;
    };

    evaluationBtn.onclick = () => {
      const encodedSeq = encodeURIComponent(sequence.title);
      window.location.href = `evaluation.html?sequence=${encodedSeq}`;
    };

  } catch (error) {
    sequenceTitleEl.textContent = "Erreur";
    lessonListEl.innerHTML = `<p>Erreur lors du chargement des données : ${error.message}</p>`;
  }
});
