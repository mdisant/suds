import { useState } from "react";
import { auth, db, storage } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function PostForm() {
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("You need to pick a beer pic, bro!");
      return;
    }

    try {
      setLoading(true);
      
      // Create a unique file path
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
      setPreview(null);
      setCaption("");
      alert("Brew posted, dude! 🍻");
    } catch (err) {
      console.error(err);
      alert("Upload failed—try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-xl font-semibold mb-4">Post Your Brew</h2>
      
      <div className="mb-4">
        {!preview ? (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-amber-300 bg-amber-50 rounded-lg cursor-pointer hover:bg-amber-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-10 h-10 text-amber-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <p className="text-sm text-amber-700">Click to upload your beer pic</p>
            </div>
            <input 
              id="dropzone-file" 
              type="file" 
              accept="image/*"
              className="hidden" 
              onChange={handleFileChange}
            />
          </label>
        ) : (
          <div className="relative">
            <img src={preview} alt="Preview" className="w-full rounded-lg" style={{ maxHeight: "300px", objectFit: "contain" }} />
            <button 
              onClick={() => {
                setFile(null);
                setPreview(null);
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        )}
      </div>
      
      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="What's your brew?"
        className="w-full p-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        rows="2"
      />
      
      <button
        onClick={handleUpload}
        disabled={loading}
        className="mt-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg transition w-full disabled:opacity-50"
      >
        {loading ? "Posting..." : "Post Your Brew 🍺"}
      </button>
    </div>
  );
}

export default PostForm;