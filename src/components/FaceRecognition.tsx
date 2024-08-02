import React, { useRef, useEffect, useState } from "react";
import "./FaceRecogntiion.css";

declare global {
  interface Window {
    JEELIZFACEFILTER: any;
  }
}

const FaceRecognition: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const ref = useRef<HTMLVideoElement>(null);
  const videoRef = ref as React.MutableRefObject<HTMLVideoElement>;

  const [instructions, setInstructions] = useState<string>(
    "Please position your face in front of the camera"
  );

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error("Error accessing webcam: ", err);
      });
    const initFaceFilter = () => {
      window.JEELIZFACEFILTER.init({
        canvasId: "faceFilterCanvas",
        NNCPath: "/dist/neuralNets/NN_DEFAULT.json",
        callbackReady: (errCode: any) => {
          if (errCode) {
            console.error("Error initializing FaceFilter:", errCode);
            return;
          }
          console.log("FaceFilter initialized successfully");
        },
        callbackTrack: (detectState: any) => {
          if (detectState.detected > 0.6) {
            handleFaceTracking(detectState);
          }
        },
      });
    };

    initFaceFilter();
  }, []);

  const handleFaceTracking = (detectState: any) => {
    const pitch = detectState.rx;
    const yaw = detectState.ry;

    let newInstructions = instructions;

    if (yaw > 0.3) {
      newInstructions = "Please turn your head to the right";
    } else if (yaw < -0.3) {
      newInstructions = "Please turn your head to the left";
    } else if (pitch > 0.3) {
      newInstructions = "Please tilt your head up";
    } else if (pitch < -0.3) {
      newInstructions = "Please tilt your head down";
    } else {
      newInstructions = "Please look straight";
    }

    setInstructions(newInstructions);
  };

  return (
    <div className="face-recognition-container">
      <video ref={videoRef} autoPlay>
        <canvas ref={canvasRef} id="faceFilterCanvas"></canvas>
      </video>
      <div className="instructions">{instructions}</div>
    </div>
  );
};

export default FaceRecognition;
