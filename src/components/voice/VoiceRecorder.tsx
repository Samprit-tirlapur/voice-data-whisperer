
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscription }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcriptResult = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        setTranscript(transcriptResult);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event);
        toast.error('Speech recognition error. Please try again.');
        stopRecording();
      };
    } else {
      toast.error('Speech recognition not supported in this browser');
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);
  
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      setTranscript("");
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.start();
      recognitionRef.current?.start();
      setIsRecording(true);
      
      toast.info('Recording started. Speak your query...');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Could not access microphone. Please check permissions.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      recognitionRef.current?.stop();
      
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      
      // Send the final transcript to parent component
      if (transcript.trim()) {
        onTranscription(transcript.trim());
      }
      
      toast.success('Recording stopped');
    }
  };
  
  return (
    <div className="w-full flex flex-col items-center p-6 bg-card rounded-lg shadow-sm border border-border">
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold mb-2">Voice Query</h2>
        <p className="text-muted-foreground text-sm mb-4">
          Press the microphone button and ask a question about your data
        </p>
      </div>
      
      <div className="relative mb-6">
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-16 h-16 rounded-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-brand-purple hover:bg-brand-light-purple'}`}
        >
          {isRecording ? (
            <MicOff className="h-6 w-6" />
          ) : (
            <Mic className={`h-6 w-6 ${isRecording ? 'pulse' : ''}`} />
          )}
        </Button>
        {isRecording && <div className="pulse absolute top-0 left-0 w-16 h-16 rounded-full"></div>}
      </div>
      
      <div className="w-full">
        <div className="p-4 bg-secondary rounded-md min-h-[100px] max-h-[200px] overflow-y-auto">
          {transcript ? (
            <p>{transcript}</p>
          ) : (
            <p className="text-muted-foreground italic text-center">
              {isRecording ? "Listening..." : "Your query will appear here..."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceRecorder;
