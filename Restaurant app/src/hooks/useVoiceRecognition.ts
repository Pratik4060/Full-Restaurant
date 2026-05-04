// hooks/useVoiceRecognition.ts
import { useState, useEffect, useCallback, useRef } from "react";

interface UseVoiceRecognitionReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  setSearchQuery: (query: string) => void;
}

export const useVoiceRecognition = (
  setSearchQuery: (query: string) => void,
): UseVoiceRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const stopListening = useCallback(() => {
    console.log("Stopping voice recognition...");

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error("Error stopping recognition:", error);
      }
    }
    setIsListening(false);
  }, []);

  // Function to explicitly request microphone permission
  const requestMicrophonePermission =
    useCallback(async (): Promise<boolean> => {
      try {
        console.log("Requesting microphone permission...");
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        // Stop the stream immediately after getting permission
        stream.getTracks().forEach((track) => track.stop());
        console.log("Microphone permission granted");
        setHasPermission(true);
        return true;
      } catch (error) {
        console.error("Microphone permission denied:", error);
        setHasPermission(false);

        // Provide a more helpful message based on error
        if (error instanceof Error) {
          if (error.name === "NotAllowedError") {
            alert(
              "Microphone access was denied. Please click the lock icon in your browser and allow microphone access, then refresh the page.",
            );
          } else if (error.name === "NotFoundError") {
            alert("No microphone found on your device.");
          } else {
            alert(
              "Could not access microphone. Please check your permissions and try again.",
            );
          }
        }
        return false;
      }
    }, []);

  const startListening = useCallback(async () => {
    console.log("Starting voice recognition...");

    if (!recognitionRef.current) {
      alert(
        "Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.",
      );
      return;
    }

    // Check and request permission first
    if (hasPermission === false) {
      const granted = await requestMicrophonePermission();
      if (!granted) return;
    } else if (hasPermission === null) {
      // First time - request permission
      const granted = await requestMicrophonePermission();
      if (!granted) return;
    }

    // Don't start if already listening
    if (isListening) {
      console.log("Already listening");
      return;
    }

    try {
      recognitionRef.current.start();
      setIsListening(true);
      console.log("Voice recognition started successfully");
    } catch (error) {
      console.error("Error starting speech recognition:", error);

      if (error instanceof Error && error.message.includes("already started")) {
        console.log("Recognition already started, stopping...");
        stopListening();
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
            setIsListening(true);
          } catch (retryError) {
            console.error("Retry failed:", retryError);
          }
        }, 200);
      } else {
        alert(
          "Could not start voice recognition. Please check your microphone.",
        );
        setIsListening(false);
      }
    }
  }, [isListening, stopListening, hasPermission, requestMicrophonePermission]);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Speech recognition not supported in this browser");
      return;
    }

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = "en-US";

    recognitionInstance.onresult = (event: any) => {
      const transcriptText = event.results[0][0].transcript;
      console.log("Voice recognized:", transcriptText);
      setTranscript(transcriptText);
      setSearchQuery(transcriptText);
      setIsListening(false);
    };

    recognitionInstance.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);

      // Handle specific errors
      switch (event.error) {
        case "not-allowed":
          console.log("Microphone permission denied");
          setHasPermission(false);
          alert(
            "Please allow microphone access to use voice search. You can enable it in your browser settings.",
          );
          break;
        case "no-speech":
          console.log("No speech detected");
          // Don't show alert for this, just silently fail
          break;
        case "audio-capture":
          console.log("No microphone found");
          alert("No microphone found on your device.");
          break;
        case "network":
          console.log("Network error");
          alert("Network error occurred. Please check your connection.");
          break;
        default:
          console.log("Other error:", event.error);
      }

      setIsListening(false);
    };

    recognitionInstance.onend = () => {
      console.log("Speech recognition ended");
      setIsListening(false);
    };

    recognitionRef.current = recognitionInstance;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (error) {
          // Ignore abort errors
        }
      }
    };
  }, [setSearchQuery]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    setSearchQuery,
  };
};
