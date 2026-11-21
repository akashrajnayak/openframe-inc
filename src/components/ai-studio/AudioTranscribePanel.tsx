import React, { useEffect, useRef, useState } from 'react';
import {
  Mic,
  Square,
  Upload,
  Copy,
  Check,
  Download,
  Loader2,
  AlertCircle,
  MessageSquare,
  FileAudio,
  Clock,
} from 'lucide-react';
import {
  transcribeAudio,
  type SavedTranscription,
} from '../../services/geminiStudioService';

interface AudioTranscribePanelProps {
  savedTranscriptions: SavedTranscription[];
  onTranscriptionSaved: () => void;
  onSendToChat?: (text: string) => void;
}

export const AudioTranscribePanel: React.FC<AudioTranscribePanelProps> = ({
  savedTranscriptions,
  onTranscriptionSaved,
  onSendToChat,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [title, setTitle] = useState('');
  const [transcript, setTranscript] = useState('');
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const durationRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    };
  }, [audioPreviewUrl]);

  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = typeof reader.result === 'string' ? reader.result : '';
        resolve(result);
      };
      reader.onerror = () => reject(new Error('Failed to read audio recording.'));
      reader.readAsDataURL(blob);
    });

  const submitAudioBlob = async (blob: Blob, mimeType: string, durationSec?: number, label?: string) => {
    setError(null);
    setIsTranscribing(true);
    try {
      const preview = URL.createObjectURL(blob);
      setAudioPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return preview;
      });

      const base64 = await blobToBase64(blob);
      const res = await transcribeAudio({
        audioBase64: base64,
        mimeType: mimeType || blob.type || 'audio/webm',
        title: title.trim() || label,
        durationSeconds: durationSec,
      });

      setTranscript(res.transcript);
      onTranscriptionSaved();
    } catch (err: any) {
      setError(err?.message || 'Unable to transcribe audio.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferredMime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : '';

      const recorder = preferredMime
        ? new MediaRecorder(stream, { mimeType: preferredMime })
        : new MediaRecorder(stream);

      chunksRef.current = [];
      durationRef.current = 0;
      setElapsedSeconds(0);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
        const finalMime = recorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: finalMime });
        if (blob.size > 0) {
          submitAudioBlob(blob, finalMime, durationRef.current, 'Microphone Recording');
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250);
      setIsRecording(true);
      timerRef.current = window.setInterval(() => {
        durationRef.current += 1;
        setElapsedSeconds(durationRef.current);
      }, 1000);
    } catch (err: any) {
      setError(
        err?.name === 'NotAllowedError'
          ? 'Microphone access was blocked. Please enable microphone permission and retry.'
          : err?.message || 'Unable to access microphone.'
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      setError('Please select a valid audio file (MP3, WAV, M4A, WebM, or OGG).');
      return;
    }
    submitAudioBlob(file, file.type, undefined, file.name);
    e.target.value = '';
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleCopy = () => {
    if (!transcript) return;
    navigator.clipboard?.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownloadTxt = () => {
    if (!transcript) return;
    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(title.trim() || 'openframe-transcript').replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-5 space-y-5">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#123D32]">
              Gemini Audio Transcription
            </p>
            <h2 className="font-editorial text-2xl font-semibold text-[#18221F] mt-1">
              Record or Upload Audio
            </h2>
            <p className="text-sm text-slate-600 mt-1.5">
              Capture lectures, study notes, or voice memos from your microphone, or upload an audio clip for instant transcription.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Note Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Physics Chapter 4 Lecture Notes"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F2] text-sm text-[#18221F] focus:outline-none focus:ring-2 focus:ring-[#123D32]/30"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-[#FAF7F2] p-5 flex flex-col items-center text-center gap-3">
            <div className="font-mono text-2xl font-semibold text-[#18221F] tabular-nums">
              {formatTimer(elapsedSeconds)}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5 w-full">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  disabled={isTranscribing}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#123D32] hover:bg-[#0e3027] text-white text-sm font-semibold transition-colors disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                  <span>Record Microphone</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Stop &amp; Transcribe</span>
                </button>
              )}

              <label className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-[#18221F] text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Upload Audio</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  disabled={isRecording || isTranscribing}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {audioPreviewUrl && (
            <div className="pt-1">
              <audio controls src={audioPreviewUrl} className="w-full h-10" />
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {savedTranscriptions.length > 0 && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Saved Transcriptions
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {savedTranscriptions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setTitle(item.title);
                    setTranscript(item.transcript);
                  }}
                  className="w-full text-left p-3 rounded-xl border border-slate-200/80 hover:border-[#123D32]/40 hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#18221F] truncate flex items-center gap-1.5">
                      <FileAudio className="w-3.5 h-3.5 text-[#123D32] shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </span>
                    {item.durationSeconds ? (
                      <span className="text-[11px] font-mono text-slate-500 tabular-nums shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimer(item.durationSeconds)}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.transcript}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl flex flex-col overflow-hidden min-h-[460px]">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-[#18221F]">Transcript Output</h3>
          {transcript && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#18221F] whitespace-nowrap shrink-0 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadTxt}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#18221F] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export .txt</span>
              </button>
              {onSendToChat && (
                <button
                  type="button"
                  onClick={() => onSendToChat(`Summarize and extract key study takeaways from this transcript:\n\n${transcript}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#123D32] hover:bg-[#0e3027] text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ask Gemini</span>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 p-6 overflow-y-auto bg-[#FAF7F2]/40">
          {isTranscribing ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-16">
              <Loader2 className="w-7 h-7 animate-spin text-[#123D32]" />
              <p className="text-sm font-medium text-[#18221F]">Transcribing audio with Gemini...</p>
            </div>
          ) : transcript ? (
            <div className="whitespace-pre-wrap text-sm leading-7 text-[#18221F] font-normal">
              {transcript}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
              <p className="text-sm font-medium text-slate-700">No transcript yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Press Record Microphone to dictate lecture notes or upload an existing audio file to transcribe it immediately.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
