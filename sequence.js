// sequence.js

// Fonction pour récupérer le paramètre "title" dans l'URL
function getSequenceTitleFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('title');
  }
  
  document.addEventListener('DOMContentLoaded', async () => {
    const title = getSequenceTitleFromURL();
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
  
      // Chercher la séquence dans toutes les catégories (Débutant, Intermédiaire, Avancé)
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
  
      // Afficher le titre
      sequenceTitleEl.textContent = sequence.title;
  
      // Afficher la liste des leçons avec leur type
      lessonListEl.innerHTML = '<ul>' + 
        sequence.lessons.map(lesson => 
          `<li>${lesson.title} (${lesson.type})</li>`
        ).join('') + 
        '</ul>';
  
      // Afficher les boutons
      startLessonBtn.style.display = 'inline-block';
      evaluationBtn.style.display = 'inline-block';
  
      // Bouton commencer la première leçon
      startLessonBtn.onclick = () => {
        // Rediriger vers la page de la première leçon (à créer plus tard)
        // Par exemple : lesson.html?sequence=Portrait, autoportrait&lesson=1
        const firstLessonIndex = 0;
        const encodedSeq = encodeURIComponent(sequence.title);
        window.location.href = `lesson.html?sequence=${encodedSeq}&lesson=${firstLessonIndex}`;
      };
  
      // Bouton évaluation
      evaluationBtn.onclick = () => {
        // Rediriger vers la page d'évaluation (à créer plus tard)
        const encodedSeq = encodeURIComponent(sequence.title);
        window.location.href = `evaluation.html?sequence=${encodedSeq}`;
      };
  
    } catch (error) {
      sequenceTitleEl.textContent = "Erreur";
      lessonListEl.innerHTML = `<p>Erreur lors du chargement des données : ${error.message}</p>`;
    }
  });
  