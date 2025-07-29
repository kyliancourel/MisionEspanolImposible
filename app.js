// app.js
import { auth, db } from './libs/firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Afficher prénom et bouton déconnexion ou masquer la section user-info
function setupUserInfo(userData) {
  const userInfoSection = document.getElementById('user-info');
  const userNameSpan = document.getElementById('user-name');
  const logoutBtn = document.getElementById('btn-logout');

  if (userData && userData.isValidated) {
    userInfoSection.style.display = 'block';
    userNameSpan.textContent = userData.prenom || 'Utilisateur';

    logoutBtn.addEventListener('click', async () => {
      await signOut(auth);
      window.location.reload();
    });

    document.getElementById('user-access').style.display = 'none';
  } else {
    userInfoSection.style.display = 'none';
    document.getElementById('user-access').style.display = 'block';
  }
}

// Charger et afficher les séquences débloquées avec état validé/non validé
async function loadUnlockedSequences(userData) {
  try {
    const response = await fetch('data/sequences.json');
    if (!response.ok) throw new Error('Erreur lors du chargement du fichier JSON');
    const data = await response.json();

    const content = document.getElementById('content');
    content.innerHTML = '';

    if (!userData || !userData.isValidated) {
      content.innerHTML = '<p>Vous devez être connecté et avoir validé votre compte pour accéder aux séquences.</p>';
      return;
    }

    if (!userData.progression || !userData.progression.sequences || userData.progression.sequences.length === 0) {
      content.innerHTML = '<p>Aucune séquence débloquée pour le moment.</p>';
      return;
    }

    // Organiser les séquences par niveau
    const sequencesByLevel = {};
    userData.progression.sequences.forEach(seqProgress => {
      for (const level in data) {
        const sequence = data[level].find(s => s.title === seqProgress.title);
        if (sequence) {
          if (!sequencesByLevel[level]) sequencesByLevel[level] = [];
          sequencesByLevel[level].push({ ...sequence, validated: seqProgress.validated });
          break;
        }
      }
    });

    for (const level in sequencesByLevel) {
      const levelSequences = sequencesByLevel[level];
      if (levelSequences.length === 0) continue;

      const h2 = document.createElement('h2');
      h2.textContent = level;
      content.appendChild(h2);

      levelSequences.forEach(sequence => {
        const divSeq = document.createElement('div');
        divSeq.style.marginBottom = '20px';

        const h3 = document.createElement('h3');
        h3.textContent = sequence.title + (sequence.validated ? ' ✅' : ' ❌');
        divSeq.appendChild(h3);

        const ulLessons = document.createElement('ul');
        sequence.lessons.forEach((lesson, lessonIndex) => {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = `lesson.html?level=${encodeURIComponent(level)}&sequence=${encodeURIComponent(sequence.title)}&lesson=${lessonIndex}`;
          a.textContent = `${lesson.title} (${lesson.type})`;
          li.appendChild(a);
          ulLessons.appendChild(li);
        });
        divSeq.appendChild(ulLessons);

        const evalDiv = document.createElement('div');
        evalDiv.style.fontStyle = 'italic';
        evalDiv.textContent = `Évaluation : ${sequence.evaluation.title}`;
        divSeq.appendChild(evalDiv);

        if (userData.progression.evaluations) {
          const evalResult = userData.progression.evaluations.find(ev => ev.sequence === sequence.title);
          if (evalResult) {
            const scoreSpan = document.createElement('span');
            scoreSpan.textContent = `Score : ${evalResult.score} / ${evalResult.total} (le ${new Date(evalResult.date).toLocaleDateString()})`;
            scoreSpan.style.marginLeft = '10px';
            scoreSpan.style.fontWeight = 'bold';
            divSeq.appendChild(scoreSpan);

            const reviewBtn = document.createElement('button');
            reviewBtn.textContent = 'Revoir l’évaluation';
            reviewBtn.style.marginLeft = '15px';
            reviewBtn.addEventListener('click', () => {
              window.location.href = `evaluation.html?sequence=${encodeURIComponent(sequence.title)}`;
            });
            divSeq.appendChild(reviewBtn);
          }
        }

        if (!sequence.validated) {
          const btnValidate = document.createElement('button');
          btnValidate.textContent = 'Valider cette séquence';
          btnValidate.addEventListener('click', () => {
            validateSequence(userData.uid, sequence.title);
          });
          divSeq.appendChild(btnValidate);

          const btnEval = document.createElement('button');
          btnEval.textContent = 'Passer l’évaluation finale';
          btnEval.style.marginLeft = '10px';
          btnEval.addEventListener('click', () => {
            window.location.href = `evaluation.html?sequence=${encodeURIComponent(sequence.title)}`;
          });
          divSeq.appendChild(btnEval);

        } else {
          const validatedLabel = document.createElement('span');
          validatedLabel.style.color = 'green';
          validatedLabel.textContent = 'Séquence validée';
          divSeq.appendChild(validatedLabel);
        }

        content.appendChild(divSeq);
      });
    }

  } catch (error) {
    console.error('Erreur:', error);
  }
}

// Valider la séquence actuelle et débloquer la suivante dans Firestore
async function validateSequence(uid, currentTitle) {
  try {
    if (!uid) {
      alert("Vous devez être connecté.");
      return;
    }

    const response = await fetch('data/sequences.json');
    if (!response.ok) {
      alert("Erreur lors du chargement des données.");
      return;
    }
    const data = await response.json();

    let allSequencesFlat = [];
    for (const level in data) {
      allSequencesFlat = allSequencesFlat.concat(data[level]);
    }

    const currentIndex = allSequencesFlat.findIndex(seq => seq.title === currentTitle);
    if (currentIndex === -1) {
      alert("Séquence introuvable.");
      return;
    }

    // Charger userData depuis Firestore
    const userDocRef = doc(db, "users", uid);
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) {
      alert("Profil utilisateur introuvable.");
      return;
    }
    const userData = userSnap.data();

    // Modifier progression en mémoire
    const seqProgIndex = userData.progression.sequences.findIndex(s => s.title === currentTitle);
    if (seqProgIndex !== -1) {
      userData.progression.sequences[seqProgIndex].validated = true;
    } else {
      userData.progression.sequences.push({ title: currentTitle, validated: true });
    }

    // Débloquer la suivante
    const nextSequence = allSequencesFlat[currentIndex + 1];
    if (nextSequence) {
      const alreadyUnlocked = userData.progression.sequences.some(s => s.title === nextSequence.title);
      if (!alreadyUnlocked) {
        userData.progression.sequences.push({ title: nextSequence.title, validated: false });
        alert(`Bravo ! La séquence suivante "${nextSequence.title}" a été débloquée.`);
      } else {
        alert("Vous avez validé cette séquence.");
      }
    } else {
      alert("Vous avez validé la dernière séquence disponible.");
    }

    await updateDoc(userDocRef, { progression: userData.progression });
    loadUnlockedSequences(userData);

  } catch (err) {
    alert("Erreur lors de la validation : " + err.message);
  }
}

// Configuration des boutons "Créer un compte", "Se connecter" et accès libre à la première séquence
function setupButtons() {
  const btnCreate = document.getElementById('btn-create-account');
  if (btnCreate) {
    btnCreate.addEventListener('click', () => {
      window.location.href = 'signup.html';
    });
  }

  const btnLogin = document.getElementById('btn-login');
  if (btnLogin) {
    btnLogin.addEventListener('click', () => {
      window.location.href = 'login.html';
    });
  }

  const btnFree = document.getElementById('start-free-sequence');
  if (btnFree) {
    btnFree.addEventListener('click', async () => {
      try {
        const response = await fetch('data/sequences.json');
        if (!response.ok) throw new Error('Erreur chargement JSON');
        const data = await response.json();

        // Première séquence du niveau Débutant (index 0)
        const firstSequence = data['Débutant']?.[0];
        if (!firstSequence) {
          alert("Aucune séquence débutant disponible.");
          return;
        }

        // Redirection vers la première leçon de cette séquence
        window.location.href = `lesson.html?level=Débutant&sequence=${encodeURIComponent(firstSequence.title)}&lesson=0`;

      } catch (error) {
        alert("Erreur : " + error.message);
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  onAuthStateChanged(auth, async user => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);
      const userData = userSnap.exists() ? userSnap.data() : null;
      if (!userData) {
        alert("Profil utilisateur introuvable.");
        await signOut(auth);
        window.location.reload();
        return;
      }
      setupUserInfo(userData);
      loadUnlockedSequences(userData);
    } else {
      setupUserInfo(null);
      const content = document.getElementById('content');
      content.innerHTML = '<p>Veuillez vous connecter pour accéder aux séquences.</p>';
    }
  });
  setupButtons();
});
