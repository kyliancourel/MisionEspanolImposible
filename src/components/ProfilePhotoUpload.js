import React, { useState, useEffect } from "react";
import { storage, db, auth } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";

function ProfilePhotoUpload() {
  const [photoURL, setPhotoURL] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    // Charger photo actuelle depuis Firestore
    async function fetchPhoto() {
      if (!user) return;
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await userDocRef.get();
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        if (data.photoURL) setPhotoURL(data.photoURL);
      }
    }
    fetchPhoto();
  }, [user]);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;
    setUploading(true);
    try {
      // Stocker la photo sous users/{uid}/profile.jpg
      const storageRef = ref(storage, `users/${user.uid}/profile.jpg`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Mettre à jour Firestore
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { photoURL: downloadURL });

      setPhotoURL(downloadURL);
      setFile(null);
    } catch (error) {
      console.error("Erreur upload photo :", error);
      alert("Erreur lors de l'upload de la photo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: 320, margin: "auto", textAlign: "center" }}>
      <h3>Photo de profil</h3>
      {photoURL ? (
        <img
          src={photoURL}
          alt="Profil"
          style={{ width: 150, height: 150, borderRadius: "50%", objectFit: "cover" }}
        />
      ) : (
        <p>Aucune photo de profil</p>
      )}
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file || uploading} style={{ marginTop: 10 }}>
        {uploading ? "Upload en cours..." : "Uploader la photo"}
      </button>
    </div>
  );
}

export default ProfilePhotoUpload;
