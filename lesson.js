function getParam(param) {
    return new URLSearchParams(window.location.search).get(param);
  }
  
  function getCurrentUser() {
    const userJSON = localStorage.getItem('user');
    return userJSON ? JSON.parse(userJSON) : null;
  }
  
  document.addEventListener('DOMContentLoaded', async () => {
    const sequenceTitle = getParam('sequence');
    const lessonIndex = parseInt(getParam('lesson'), 10);
    const content = document.getElementById('content');
  
    if (!sequenceTitle || isNaN(lessonIndex)) {
      content.textContent = 'Paramètres manquants ou invalides.';
      return;
    }
  
    const user = getCurrentUser();
    if (!user || !user.isValidated) {
      content.textContent = "Vous devez être connecté et avoir validé votre compte pour accéder aux leçons.";
      return;
    }
  
    try {
      const response = await fetch('data/sequences.json');
      if (!response.ok) throw new Error('Erreur lors du chargement des données.');
  
      const data = await response.json();
  
      // Vérifier si la séquence est débloquée pour l'utilisateur
      const isUnlocked = user.progression?.sequences?.some(seq => seq.title === sequenceTitle);
      if (!isUnlocked) {
        content.textContent = "Cette séquence n'est pas encore débloquée pour vous.";
        return;
      }
  
      // Trouver la séquence
      let sequence = null;
      for (const level in data) {
        sequence = data[level].find(seq => seq.title === sequenceTitle);
        if (sequence) break;
      }
      if (!sequence) {
        content.textContent = `Séquence "${sequenceTitle}" introuvable.`;
        return;
      }
  
      if (lessonIndex < 0 || lessonIndex >= sequence.lessons.length) {
        content.textContent = `Leçon ${lessonIndex + 1} introuvable dans la séquence "${sequenceTitle}".`;
        return;
      }
  
      const lesson = sequence.lessons[lessonIndex];
  
      content.innerHTML = `<h2>${sequence.title} - ${lesson.title}</h2>`;
  
      if (!lesson.activities || lesson.activities.length === 0) {
        content.innerHTML += '<p>Aucune activité disponible pour cette leçon.</p>';
        return;
      }
  
      lesson.activities.forEach((activity, idx) => {
        if (activity.type === 'comprehension_orale') {
          content.innerHTML += `
            <div>
              <h3>Compréhension orale</h3>
              <audio controls src="${activity.audio}"></audio>
          `;
          activity.questions.forEach(q => {
            content.innerHTML += `
              <p><strong>${q.question}</strong></p>
              ${q.options.map(opt => `<label><input type="radio" name="q${idx}" value="${opt}"> ${opt}</label><br>`).join('')}
            `;
          });
          content.innerHTML += '</div>';
        }
        else if (activity.type === 'comprehension_ecrite') {
          content.innerHTML += `
            <div>
              <h3>Compréhension écrite</h3>
              <p>${activity.text}</p>
          `;
          activity.questions.forEach(q => {
            content.innerHTML += `
              <p><strong>${q.question}</strong></p>
              ${q.options.map(opt => `<label><input type="radio" name="q${idx}" value="${opt}"> ${opt}</label><br>`).join('')}
            `;
          });
          content.innerHTML += '</div>';
        }
        else if (activity.type === 'expression_ecrite') {
          content.innerHTML += `
            <div>
              <h3>Expression écrite</h3>
              <p>${activity.prompt}</p>
              <textarea rows="5" cols="60" placeholder="Écris ta réponse ici..."></textarea>
            </div>
          `;
        }
      });
  
    } catch (err) {
      content.textContent = `Erreur: ${err.message}`;
    }
  });
  