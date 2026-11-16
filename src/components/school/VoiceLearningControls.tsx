import React, { useState, useEffect, useMemo } from 'react';
import { Mic, MicOff, Volume2, Square } from 'lucide-react';
import { SchoolLanguage } from '../../types';
import { getLanguagePack } from '../../data/allIndiaLanguagesData';

interface VoiceLearningControlsProps {
  textToRead?: string;
  language: SchoolLanguage;
  onVoiceTranscript?: (transcript: string) => void;
  compact?: boolean;
}

export const VoiceLearningControls: React.FC<VoiceLearningControlsProps> = ({
  textToRead,
  language,
  onVoiceTranscript,
  compact = false,
}) => {
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [rate, setRate] = useState(1);
  const [voiceNote, setVoiceNote] = useState('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const langSpec = useMemo(() => getLanguagePack(language), [language]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const syncVoices = () => {
      try {
        setVoices(window.speechSynthesis.getVoices() || []);
      } catch {
        setVoices([]);
      }
    };
    syncVoices();
    window.speechSynthesis.addEventListener?.('voiceschanged', syncVoices);
    return () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', syncVoices);
      window.speechSynthesis.cancel();
    };
  }, []);

  const matchedVoice = useMemo(() => {
    if (voices.length === 0) return null;
    const exact = voices.find((v) => v.lang.toLowerCase() === langSpec.bcp47Code.toLowerCase());
    if (exact) return exact;
    const prefix = langSpec.bcp47Code.split('-')[0].toLowerCase();
    return voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) || null;
  }, [voices, langSpec.bcp47Code]);

  const handleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setVoiceNote('Audio playback is not supported in this browser.');
      return;
    }
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    if (!textToRead?.trim()) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead.slice(0, 1400));
    utterance.lang = langSpec.bcp47Code;
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
    utterance.rate = rate;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    setVoiceNote(
      matchedVoice
        ? ''
        : `Playing ${langSpec.name} (${langSpec.bcp47Code}) via default browser synthesizer.`
    );
    window.speechSynthesis.speak(utterance);
  };

  const handleListen = () => {
    if (!onVoiceTranscript) return;
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setVoiceNote('Microphone speech recognition requires Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRec();
    recognition.lang = langSpec.bcp47Code;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setListening(true);
    setVoiceNote(`Listening in ${langSpec.name} (${langSpec.bcp47Code})...`);

    recognition.onresult = (event: any) => {
      const spoken = event?.results?.[0]?.[0]?.transcript || '';
      if (spoken) {
        onVoiceTranscript(spoken);
        setVoiceNote(`Captured: "${spoken}"`);
      }
      setListening(false);
    };
    recognition.onerror = () => {
      setListening(false);
      setVoiceNote('Could not capture voice audio. Check microphone permission.');
    };
    recognition.onend = () => {
      setListening(false);
    };

    try {
      recognition.start();
    } catch {
      setListening(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {textToRead && (
        <div className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-lg px-2 py-1">
          <button
            type="button"
            onClick={handleSpeak}
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              speaking
                ? 'bg-rose-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {speaking ? (
              <>
                <Square className="w-3 h-3 fill-current shrink-0" />
                <span>Stop Audio</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 shrink-0" />
                <span>{compact ? 'Listen' : `Listen (${langSpec.name})`}</span>
              </>
            )}
          </button>
          {!compact && (
            <select
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              aria-label="Speech speed"
              className="text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 rounded px-1.5 py-0.5"
            >
              <option value={0.85}>0.85x Slow</option>
              <option value={1}>1.0x Normal</option>
              <option value={1.2}>1.2x Fast</option>
            </select>
          )}
        </div>
      )}

      {onVoiceTranscript && (
        <button
          type="button"
          onClick={handleListen}
          disabled={listening}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            listening
              ? 'bg-rose-50 text-rose-700 border-rose-300'
              : 'bg-white text-slate-700 border-slate-300 hover:border-blue-500 hover:text-blue-700'
          }`}
        >
          {listening ? <MicOff className="w-3.5 h-3.5 shrink-0" /> : <Mic className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
          <span>{listening ? 'Listening...' : compact ? 'Voice Answer' : `Speak (${langSpec.name})`}</span>
        </button>
      )}

      {voiceNote && (
        <span className="text-[11px] text-slate-500 font-medium">{voiceNote}</span>
      )}
    </div>
  );
};
