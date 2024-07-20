import React, { useState, useEffect } from 'react';

const Video = () => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const accessToken = 'EAAG1PMj3pBsBO76Da4AWdLTGQ2vWijiyfFSxDXKrWKVu5GfoHMzp0JEOcD6siUkVhz4TpF6a9YFX83ViyEnIKNe7CmHJY7ed4oZC8c79CBzA9lUsyotyvTM6NfMkHNorZCW3K8czmxPgVXkVPuV2fag4mH7mrEx3PKtQBXx3RSZC1xEWvGH9LX6ZCdSiWmshYjnRuux8NcOwWGNa2HwM6Di53fng7ZBOEwgpBKSuzkZCYzJn3NWsFXc56O0yW3';
        const response = await fetch(`https://graph.facebook.com/me/videos?access_token=${accessToken}`);
        const data = await response.json();
        if (data && data.data) {
          setVideos(data.data);
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div>
      {videos.length > 0 ? (
        videos.map((video, index) => (
          <div key={index}>
            <video controls style={{ width: '300px', height: '200px' }}>
              <source src={video.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        ))
      ) : (
        <p>No videos available</p>
      )}
    </div>
  );
};

export default Video;
