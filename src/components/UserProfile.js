import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function UserProfile() {
  const user = auth.currentUser;
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [uploading, setUploading] = useState(false);
  const [badges, setBadges] = useState([]);
  const [activeBadge, setActiveBadge] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    async function fetchUserData() {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setBadges(data.badges || []);
          setActiveBadge(data.activeBadge || null);
        }
      } catch (err) {
        setError('Erreur lors du chargement des données utilisateur.');
      }
    }
    fetchUserData();
  }, [user]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    setUploading(true);
    setError(null);

    try {
      const storageRef = ref(storage, `profile_pictures/${user.uid}/${file.name}`);
      await uploadBytes(storageRef, file);

      const url = await getDownloadURL(storageRef);

      await updateProfile(user, { photoURL: url });
      setPhotoURL(url);

      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { photoURL: url }, { merge: true });
    } catch (err) {
      setError('Erreur lors de l\'upload de la photo.');
    } finally {
      setUploading(false);
    }
  };

  const handleDisplayNameChange = async () => {
    if (!user) return;
    setError(null);
    try {
      await updateProfile(user, { displayName });
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { displayName }, { merge: true });
      alert('Pseudo mis à jour !');
    } catch {
      setError('Erreur lors de la mise à jour du pseudo.');
    }
  };

  const handleSelectBadge = async (badgeId) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { activeBadge: badgeId }, { merge: true });
      setActiveBadge(badgeId);
    } catch {
      setError('Erreur lors de la sélection du badge.');
    }
  };

  if (!user) return <p>Connectez-vous pour voir votre profil.</p>;

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20, textAlign: 'center' }}>
      <h2>Profil Utilisateur</h2>

      <div>
        <img
          src={photoURL || 'https://via.placeholder.com/150?text=Profil'}
          alt="Photo de profil"
          style={{ width: 150, height: 150, borderRadius: '50%', objectFit: 'cover', marginBottom: 10 }}
        />
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            disabled={uploading}
          />
          {uploading && <p>Upload en cours...</p>}
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <input
          type="text"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          placeholder="Pseudo"
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        />
        <button onClick={handleDisplayNameChange} style={{ width: '100%' }}>
          Mettre à jour le pseudo
        </button>
      </div>

      <div style={{ marginTop: 30, textAlign: 'left' }}>
        <h3>Badges</h3>
        {badges.length === 0 && <p>Tu n'as pas encore de badges.</p>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {badges.map((badge) => (
            <div
              key={badge.id}
              onClick={() => handleSelectBadge(badge.id)}
              style={{
                cursor: 'pointer',
                padding: 10,
                border: badge.id === activeBadge ? '2px solid blue' : '1px solid #ccc',
                borderRadius: 6,
                textAlign: 'center',
                width: 80,
              }}
              title={badge.name}
            >
              <img
                src={badge.iconURL}
                alt={badge.name}
                style={{ width: 50, height: 50, objectFit: 'contain' }}
              />
              <div style={{ fontSize: 12, marginTop: 5 }}>{badge.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 30 }}>
        <p>Email : <strong>{user.email}</strong></p>
        <button onClick={() => auth.signOut()}>Se déconnecter</button>
      </div>

      {error && <p style={{ color: 'red', marginTop: 20 }}>{error}</p>}
    </div>
  );
}

export default UserProfile;
