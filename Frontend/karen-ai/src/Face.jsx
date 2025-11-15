import { useEffect, useRef, useState } from "react";
import "./Face.css";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
function Face() {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioSourceRef = useRef(null);
  const analyserRef = useRef(null);
  const animationIdRef = useRef(null);
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const [lastTranscript, setLastTranscript] = useState("");
  const [isTriggerWordDetected, setTriggerWordDetected] = useState(false);
  const triggerWord = "test";
  const timeoutRef = useRef(null);

  useEffect(() => {
    SpeechRecognition.startListening({ continuous: true });

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
        audioSourceRef.current = null;
        analyserRef.current = null;
      }
      cancelAnimationFrame(animationIdRef.current);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  useEffect(() => {
    if (!transcript) return;

    // Clear any previous timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // When trigger word not yet detected
    if (!isTriggerWordDetected) {
      if (transcript.toLowerCase().includes(triggerWord)) {
        setTriggerWordDetected(true);
        console.log("Trigger word detected! Listening for command...");
      }
      return;
    }

    // When trigger word is detected, wait for user to stop talking
    timeoutRef.current = setTimeout(async () => {
      // Only act if the transcript changed from the last one
      if (transcript !== lastTranscript) {
        console.log("Final transcript:", transcript);
        setLastTranscript(transcript);

        try {
          const res = await fetch(
            `http://127.0.0.1:8001/generate?prompt=${transcript}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            }
          );
          if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
          const blob = await res.blob();
          const audioUrl = URL.createObjectURL(blob);

          const canvas = canvasRef.current;
          const audio = audioRef.current;

          if (canvas && audio) {
            audio.src = audioUrl;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            console.log("audio", audio);
          //  visualiseSpeech();
          }

          // Reset state
          resetTranscript();
          setTriggerWordDetected(false);
          setLastTranscript("");
        } catch (err) {
          console.error("fetch /generate failed:", err);
        }
      }
    }, 1500); // Wait 1.5 seconds of silence
  }, [transcript, lastTranscript, isTriggerWordDetected]);

  // useEffect(() => {
  //   if (!transcript) return;
  //   console.log("Transcript updated:", transcript);
  //   // Clear any existing timeout
  //   if (timeoutRef.current) {
  //     clearTimeout(timeoutRef.current);
  //   }

  //   if (!isTriggerWordDetected) {
  //     if (transcript.toLowerCase().includes(triggerWord)) {
  //       setTriggerWordDetected(true);
  //       console.log("Trigger word detected! Listening for command...");
  //     }
  //     return;
  //   }

  //   console.log("Processing command transcript:", transcript);
  //   // Only send request if transcript has changed and is different from last sent transcript
  //   if (transcript !== lastTranscript) {
  //     // Wait for 1.5 seconds of silence before sending the request

  //       console.log("Sending transcript:", transcript);
  //       setLastTranscript(transcript);
  //       try {
  //         const res =  fetch(
  //           `http://127.0.0.1:8001/generate?prompt=${transcript}`,
  //           {
  //             method: "POST",
  //             headers: { "Content-Type": "application/json" },
  //           }
  //         );
  //         if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  //         const blob =  res.blob();
  //         const audioUrl = URL.createObjectURL(blob);

  //         const canvas = canvasRef.current;
  //         const audio = audioRef.current;

  //         if (canvas && audio) {
  //           audio.src = audioUrl;
  //           canvas.width = window.innerWidth;
  //           canvas.height = window.innerHeight;
  //           visualiseSpeech();
  //         }

  //         // Reset transcript after processing
  //         resetTranscript();
  //         setTriggerWordDetected(false);
  //       } catch (err) {
  //         console.error("fetch /generate failed:", err);
  //       }

  //   }
  // }, [transcript, lastTranscript]);

  const visualiseSpeech = async () => {
    console.log("Visualising speech...");

    const canvas = canvasRef.current;
    const audio = audioRef.current;
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
