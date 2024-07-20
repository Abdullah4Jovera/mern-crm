import React, { useState } from 'react';

const VideoUpload = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!file) {
            setUploadError('Please select a file to upload.');
            return;
        }

        setUploading(true);
        setUploadError('');
        setUploadSuccess('');

        const formData = new FormData();
        formData.append('video', file);

        try {
            const response = await fetch('/api/videos/upload-video', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to upload video');
            }

            const data = await response.json();
            console.log('Video uploaded successfully:', data);
            setUploadSuccess('Video uploaded successfully!');
        } catch (error) {
            console.error('Upload Error:', error);
            setUploadError('Failed to upload video. Please try again later.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <h2>Upload Video</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="video">Choose Video:</label>
                    <input type="file" id="video" onChange={handleFileChange} />
                </div>
                {uploadError && <p style={{ color: 'red' }}>{uploadError}</p>}
                {uploadSuccess && <p style={{ color: 'green' }}>{uploadSuccess}</p>}
                <button type="submit" disabled={uploading}>Upload</button>
            </form>
        </div>
    );
};

export default VideoUpload;
