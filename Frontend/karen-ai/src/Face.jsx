import { useEffect, useRef } from "react";
import {useSpeechSynthesis} from 'react-speech-kit';
import "./Face.css";

function Face() {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioSourceRef = useRef(null);
  const analyserRef = useRef(null);
  const animationIdRef = useRef(null);
  const { speak, voices } = useSpeechSynthesis();

  useEffect(() => {
   async function fetchPrompt() {
      try {
        const res = await fetch(`http://127.0.0.1:8001/generate?prompt="hi"`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
        console.log("generate response:",  res);
        // set state here if needed, e.g. setTodos(data);

          const canvas = canvasRef.current;
    const audio = audioRef.current;

    if (canvas && audio) {
      audio.src = audioUrl;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    
      } catch (err) {
        console.error("fetch /generate failed:", err);
      }
    }
    fetchPrompt();
  

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
        audioSourceRef.current = null;
        analyserRef.current = null;
      }
      cancelAnimationFrame(animationIdRef.current);
    };
  }, []);

  const visualiseSpeech = async () => {
    console.log("Visualising speech...");
   
    const canvas = canvasRef.current;
    const audio = audioRef.current;
    const canvasContext = canvas.getContext("2d");
    audio.play();
    if (!audioContextRef.current) {
      //To extract data from audio source, we need an AnalyserNode
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();

     // Create media element source directly from audio element
      audioSourceRef.current = audioContextRef.current.createMediaElementSource(audio);
      
      // Connect the source to analyser and destination
      audioSourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
      //The analyser node captures audio using Fast Fourier Transform (FFT),
      // in a certain frequency domain, depending on what you specify as the AnalyserNode.fftSize property value
      // (if no value is specified, the default is 2048.)
      analyserRef.current.fftSize = 64;
    }

    const analyser = analyserRef.current;
    if (!analyser) {
      console.error("Analyser not initialized.");
      return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    function animate() {
      analyser.getByteTimeDomainData(dataArray);
      canvasContext.fillStyle = "black";
      canvasContext.fillRect(0, 0, canvas.width, canvas.height);
      canvasContext.lineWidth = 2;
      canvasContext.strokeStyle = "lime";
      canvasContext.beginPath();
      const sliceWidth = canvas.width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * (canvas.height / 2);
        if (i === 0) {
          canvasContext.moveTo(x, y);
        } else {
          canvasContext.lineTo(x, y);
        }
        x += sliceWidth;
      }
      canvasContext.lineTo(canvas.width, canvas.height / 2);
      canvasContext.stroke();

      requestAnimationFrame(animate);
    }

    animate();
  };

  return (
    <div className="karen-screen">
      <div className="face">
        <div className="mood-analyser">
            <h1>Hi Palesa</h1>
            <p>Your mood: Happy</p>
        </div>

        <div className="mouth">
          <canvas
            id="mouth-canvas"
            ref={canvasRef}
            onClick={visualiseSpeech}
          ></canvas>
          <audio id="mouth-audio" ref={audioRef} controls></audio>
        </div>
      </div>
    </div>
  );
}

export default Face;
