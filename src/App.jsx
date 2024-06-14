import React, { useState, useEffect, useRef } from 'react';
import Confetti from 'react-confetti';
import hbdAudio from '../src/audio/hbd.mp3';
import birthdayVideo from '../src/video/happy.mp4';
import './App.css';

function App() {
  const [candlesBlown, setCandlesBlown] = useState(false);
  const [flamesBlownOut, setFlamesBlownOut] = useState(0);
  const [microphoneStopped, setMicrophoneStopped] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const flameCount = 4;
  const audioContext = useRef(null);
  const mediaStream = useRef(null);
  const bdMsgEl = useRef(null);
  const videoRef = useRef(null);
  const audioRef = useRef(new Audio(hbdAudio));

  const flameRefs = Array.from({ length: flameCount }, () => useRef(null));

  useEffect(() => {
    if (!candlesBlown) {
      getMicrophoneAccess();
    }
  }, [candlesBlown]);

  const getMicrophoneAccess = async () => {
    try {
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStream.current = stream;
      const source = audioContext.current.createMediaStreamSource(stream);
      const scriptNode = audioContext.current.createScriptProcessor(2048, 1, 1);
      source.connect(scriptNode);
      scriptNode.connect(audioContext.current.destination);

      scriptNode.onaudioprocess = function (event) {
        if (!microphoneStopped) {
          const inputData = event.inputBuffer.getChannelData(0);
          let sum = 0;
          for (let i = 0; i < inputData.length; i++) {
            sum += Math.abs(inputData[i]);
          }
          const average = sum / inputData.length;
          const amp = Math.round(average * 10000);
          if (amp > 850) {
            const randomFlameIndex = Math.floor(Math.random() * flameCount);
            const flame = flameRefs[randomFlameIndex].current;
            if (flame && flame.style.display !== "none") {
              flame.style.display = "none";
              setFlamesBlownOut((prev) => {
                const newCount = prev + 1;
                if (newCount === flameCount) {
                  let nameT = decodeURI(window.location.pathname);
                  nameT = nameT.charAt(1).toUpperCase() + nameT.slice(2);
                  if (bdMsgEl.current) {
                    bdMsgEl.current.innerHTML = `Happy Birthday <br> ${nameT}`;
                    bdMsgEl.current.classList.add("changeColor");
                    bdMsgEl.current.style.fontFamily = "allura";
                  }
                  audioRef.current.play();
                  stopMicrophone();
                  setShowConfetti(true);
                  setTimeout(() => {
                    setCandlesBlown(true);
                    videoRef.current?.play(); // Play the video after 6 seconds
                  }, 6000); // Delay showing video and confetti for 6 seconds
                }
                return newCount;
              });
            }
          }
        }
      };
    } catch (err) {
      console.error("Error accessing the microphone:", err);
    }
  };

  const stopMicrophone = () => {
    if (mediaStream.current) {
      mediaStream.current.getTracks()[0].stop();
      setMicrophoneStopped(true);
      console.log("Microphone access revoked.");
    }
  };

  return (
    <div className="container">
      {!candlesBlown ? (
        <>
          {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
          <div className="cake">
            <div className="plate"></div>
            <div className="layer layer-bottom"></div>
            <div className="layer layer-middle"></div>
            <div className="layer layer-top"></div>
            <div className="icing"></div>
            <div className="drip drip1"></div>
            <div className="drip drip2"></div>
            <div className="drip drip3"></div>
            
            {flameRefs.map((flameRef, index) => (
              <div key={index} className="candle">
                <div className="flame" ref={flameRef}></div>
              </div>
            ))}
          </div>
          <p id="instruction">Blow out the candles!</p>
        </>
      ) : (
        <div id="video-container">
          <video id="birthday-video" controls ref={videoRef}>
            <source src={birthdayVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
      <div id="bdMsg" ref={bdMsgEl}></div>
      {!microphoneStopped && (
        <button id="micAccessBtn" onClick={getMicrophoneAccess}>Allow Microphone Access</button>
      )}
    </div>
  );
}

export default App;
