import { useEffect, useRef, useState } from "react";
import "./Face.css";
import useWebSocket,{ReadyState} from 'react-use-websocket';

function Face() {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioSourceRef = useRef(null);
  const analyserRef = useRef(null);
  const animationIdRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
   const timeoutRef = useRef(null);
   const sockerUrl = "ws://127.0.0.1:800"

    const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    WS_URL,
    {
      share: false,
      shouldReconnect: () => true,
    },
  )
  useEffect(() => {
    console.log("Connection state changed")
    if (readyState === ReadyState.OPEN) {
      sendJsonMessage({
        event: "subscribe",
        data: {
          channel: "general-chatroom",
        },
      })
    }
  }, [readyState])
  useEffect(() => {
    const initializeAudioCapture = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        mediaRecorderRef.current = new MediaRecorder(stream);

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };
      } catch (err) {
        console.error("Error accessing microphone:", err);
      }
    };

    initializeAudioCapture();
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
      if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);
  useEffect(() => {
       console.log(`Got a new message: ${lastJsonMessage}`)
       const res = lastJsonMessage
       const blob = await res.blob();
            const audioUrl = URL.createObjectURL(blob);

            const canvas = canvasRef.current;
            const audio = audioRef.current;

            if (canvas && audio) {
              audio.src = audioUrl;
              canvas.width = window.innerWidth;
              canvas.height = window.innerHeight;
              console.log("audio", audio);
              visualiseSpeech();
            }
    
  }, [lastJsonMessage]);

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
          ></canvas>
          <audio id="mouth-audio" ref={audioRef} controls></audio>
        </div>
      </div>
    </div>
  );
}

export default Face;
