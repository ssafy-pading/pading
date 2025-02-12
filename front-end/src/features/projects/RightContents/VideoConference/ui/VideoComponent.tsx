import { useRef, useEffect } from 'react';
import { VideoComponentProps } from '../type/VideoConferenceTypes';


const VideoComponent = ({ videoTrack, participantIdentity, muted=false }: VideoComponentProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoTrack.attach(videoRef.current);
    }
    return () => {
      videoTrack.detach();
    };
  }, [videoTrack]);

  return (
    <div id={"camera-" + participantIdentity} className="video-container rounded-md overflow-hidden">
      <video ref={videoRef} autoPlay playsInline muted={muted}id={videoTrack?.sid} style={{ transform: "scaleX(-1)" }} className="w-full h-full object-cover"></video>
    </div>
  );
};

export default VideoComponent;
