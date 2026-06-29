import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

function Face() {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioSourceRef = useRef(null);
  const analyserRef = useRef(null);
  const socketRef = useRef(null);
  const [lastAudio, setLastAudio] = useState(null);

  useEffect(() => {
    socketRef.current = io("http://127.0.0.1:5000", {
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to Karen!", socketRef.current.id);
      socketRef.current.emit("send_to_frontend");
    });

    socketRef.current.on("audio", (data) => {
      console.log("Received audio from Karen", data);
      setLastAudio(data);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    visualiseSpeech();
  }, [lastAudio]);

  const visualiseSpeech = async () => {
    if (!lastAudio) return;

    const audioData = lastAudio.audio;

    if (!audioData) return;
    const blob = new Blob([new Uint8Array(audioData)], { type: "audio/wav" });
    const audioUrl = URL.createObjectURL(blob);

    const canvas = canvasRef.current;
    const audio = audioRef.current;

    if (canvas && audio) {
      audio.src = audioUrl;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      await audio.play();
      const canvasContext = canvas.getContext("2d");
      if (audio) {
        audio.play();
      }

      if (!audioContextRef.current) {
        //To extract data from audio source, we need an AnalyserNode
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();

        // Create media element source directly from audio element
        audioSourceRef.current =
          audioContextRef.current.createMediaElementSource(audio);

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
        canvasContext.lineWidth = 5;
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
    }
    console.log("Visualising speech...");
  };

  return (
    <div className="karen-screen">
      <div className="face">
        <div className="mouth">
          <canvas id="mouth-canvas" ref={canvasRef}></canvas>
          <audio id="mouth-audio" ref={audioRef} controls></audio>
        </div>
      </div>
    </div>
  );
}

export default Face;
