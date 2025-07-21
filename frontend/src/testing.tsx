import React, { useState } from 'react';

function VideoUploader() {
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
    } else {
      alert('Please upload a valid video file');
    }
  };

  const handleUpload = async () => {
    if (!videoFile) return;

    setUploading(true);

    const formData = new FormData();
    formData.append('video', videoFile);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      alert('Upload successful: ' + result.url);
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4">
      <input type="file" accept="video/*" onChange={handleFileChange} />
      {videoFile && (
        <div className="mt-4">
          <video src={URL.createObjectURL(videoFile)} controls width="400" />
        </div>
      )}
      <button
        onClick={handleUpload}
        disabled={!videoFile || uploading}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        {uploading ? 'Uploading...' : 'Upload Video'}
      </button>
    </div>
  );
}

export default VideoUploader;