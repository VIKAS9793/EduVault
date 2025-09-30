/**
 * Voice Button Component
 * Provides voice interaction: speech input and audio playback
 */

import React, { useState } from 'react';
import { asrService } from '../services/ASRService';
import { llmService } from '../services/LLMService';
import { ttsService } from '../services/TTSService';
import { useAccessibility } from '../hooks/useAccessibility';

interface VoiceButtonProps {
  onTranscript?: (text: string) => void;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({ onTranscript }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { hapticFeedback, announceToScreenReader } = useAccessibility();

  const handleVoiceInteraction = async (): Promise<void> => {
    if (!asrService.isSupported()) {
      announceToScreenReader('Voice input not supported on this device');
      return;
    }

    try {
      hapticFeedback();
      setIsListening(true);
      announceToScreenReader('Listening...');

      await asrService.startListening();

      // Listen for 5 seconds
      await new Promise((resolve) => {
        setTimeout(resolve, 5000);
      });

      const result = await asrService.stopListening();
      setIsListening(false);

      if (result && result.transcript) {
        onTranscript?.(result.transcript);

        // Process with LLM
        setIsProcessing(true);
        const llmResponse = await llmService.process(result.transcript);

        // Speak response
        await ttsService.speak(llmResponse.text);
        announceToScreenReader(llmResponse.text);
      } else {
        announceToScreenReader('No speech detected');
      }
    } catch (error) {
      console.error('Voice interaction failed:', error);
      announceToScreenReader('Voice interaction failed');
    } finally {
      setIsListening(false);
      setIsProcessing(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => {
        void handleVoiceInteraction();
      }}
      disabled={isListening || isProcessing}
      className={`btn-accent flex items-center gap-2 ${isListening ? 'voice-active' : ''}`}
      aria-label={isListening ? 'Listening to your voice' : 'Start voice interaction'}
      aria-live="polite"
    >
      <svg
        className="w-5 h-5"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
          clipRule="evenodd"
        />
      </svg>
      {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Voice Help'}
    </button>
  );
};
