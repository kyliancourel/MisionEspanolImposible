function getParam(param) {
    return new URLSearchParams(window.location.search).get(param);
  }
  
  function getCurrentUser() {
    const userJSON = localStorage.getItem('user');
    return userJSON ? JSON.parse(userJSON) : null;
  }
  
  function saveCurrentUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
  
  async function loadEvaluation() {
    const sequenceTitle = getParam('sequence');
    const content = document.getElementById('content');
  
    if (!sequenceTitle) {
      content.textContent = 'Paramètre "sequence" manquant dans l\'URL.';
      return;
    }
  
    const user = getCurrentUser();
    if (!user || !user.isValidated) {
      content.textContent = "Vous devez être connecté et avoir validé votre compte pour accéder à l'évaluation.";
      return;
    }
  
    // Vérifier si la séquence est débloquée pour l'utilisateur
    const isUnlocked = user.progression?.sequences?.some(seq => seq.title === sequenceTitle);
    if (!isUnlocked) {
      content.textContent = "Cette séquence n'est pas encore débloquée pour vous.";
      return;
    }
  
    try {
      const response = await fetch('data/sequences.json');
      if (!response.ok) throw new Error('Erreur lors du chargement des données.');
  
      const data = await response.json();
  
      let sequence = null;
      for (const level in data) {
        sequence = data[level].find(seq => seq.title === sequenceTitle);
        if (sequence) break;
      }
  
      if (!sequence) {
        content.textContent = `Séquence "${sequenceTitle}" introuvable.`;
        return;
      }
  
      const evaluation = sequence.evaluation;
      if (!evaluation || !evaluation.questions || evaluation.questions.length === 0) {
        content.textContent = 'Aucune évaluation disponible pour cette séquence.';
        return;
      }
  
      let html = `<h2>Évaluation finale : ${sequence.title}</h2><form id="evaluation-form">`;
  
      evaluation.questions.forEach((q, idx) => {
        html += `<fieldset><legend>${idx + 1}. ${q.question}</legend>`;
        q.options.forEach(opt => {
          html += `<label><input type="radio" name="q${idx}" value="${opt}" required> ${opt}</label><br>`;
        });
        html += `</fieldset>`;
      });
  
      html += `<button type="submit">Soumettre</button></form>`;
      content.innerHTML = html;
  
      document.getElementById('evaluation-form').addEventListener('submit', event => {
        event.preventDefault();
  
        let score = 0;
        for (let i = 0; i < evaluation.questions.length; i++) {
          const selected = document.querySelector(`input[name="q${i}"]:checked`);
          if (!selected) {
            alert('Merci de répondre à toutes les questions.');
            return;
          }
          if (selected.value === evaluation.questions[i].correctAnswer) {
            score++;
          }
        }
  
        // Sauvegarder le résultat
        if (!user.progression.evaluations) user.progression.evaluations = [];
        const existingEvalIndex = user.progression.evaluations.findIndex(ev => ev.sequence === sequenceTitle);
        if (existingEvalIndex !== -1) {
          user.progression.evaluations[existingEvalIndex].score = score;
          user.progression.evaluations[existingEvalIndex].total = evaluation.questions.length;
          user.progression.evaluations[existingEvalIndex].date = new Date().toISOString();
        } else {
          user.progression.evaluations.push({
            sequence: sequenceTitle,
            score: score,
            total: evaluation.questions.length,
            date: new Date().toISOString()
          });
        }
  
        saveCurrentUser(user);
        alert(`Votre score : ${score} / ${evaluation.questions.length}`);
  
        // Redirection après validation
        window.location.href = 'index.html';
      });
  
    } catch (err) {
      content.textContent = `Erreur: ${err.message}`;
    }
  }
  
  document.addEventListener('DOMContentLoaded', loadEvaluation);
  