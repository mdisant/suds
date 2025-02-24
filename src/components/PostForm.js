import { useState } from "react";
import { auth, db, storage } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function PostForm() {
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      alert("Pick a pic, bro!");
      return;
    }

    try {
      // Create a unique file path (e.g., userId/timestamp.jpg)
      const fileRef = ref(storage, `${auth.currentUser.uid}/${Date.now()}.jpg`);
      await uploadBytes(fileRef, file);
      const imageUrl = await getDownloadURL(fileRef);

      await addDoc(collection(db, "posts"), {
        userId: auth.currentUser.uid,
        username: auth.currentUser.email.split("@")[0],
        imageUrl,
        caption,
        timestamp: new Date().toISOString(),
      });

      setFile(null);
      setCaption("");
      alert("Brew posted, dude!");
    } catch (err) {
      console.error(err);
      alert("Upload failed—try again!");
    }
  };

  return (
    <div style={{ padding: "20px", background: "#333", color: "#FFF" }}>
      <h2>Post a Brew</h2>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
        style={{ margin: "10px 0" }}
      />
      <input
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="What’s your brew?"
        style={{ display: "block", margin: "10px 0", padding: "5px", width: "200px" }}
      />
      <button
        onClick={handleUpload}
        style={{ background: "#FFC107", padding: "10px", border: "none" }}
      >
        Post Your Brew
      </button>
    </div>
  );
}

export default PostForm;