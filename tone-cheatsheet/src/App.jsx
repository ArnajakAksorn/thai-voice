import { useEffect, useMemo, useState } from 'react';
import './App.css';
import ToneCheatSheet from './ToneCheatSheet';

const LOCAL_STORAGE_KEY = 'tonecheatsheet.voiceId';

function App() {
  const [manifest, setManifest] = useState(null);
  const [selectedVoiceId, setSelectedVoiceId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadManifest = async () => {
      try {
        const res = await fetch('/voices.json');
        const data = await res.json();
        setManifest(data);

        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        const hasStored = data?.voices?.some((v) => v.id === stored);
        const initialVoice = hasStored
          ? stored
          : data?.voices?.[0]?.id ?? null;
        if (initialVoice) {
          setSelectedVoiceId(initialVoice);
          localStorage.setItem(LOCAL_STORAGE_KEY, initialVoice);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load voices.json', err);
        setError('ไม่สามารถโหลดรายการเสียงได้');
      }
    };

    loadManifest();
  }, []);

  const audioMap = useMemo(() => {
    if (!manifest?.clips) return {};
    return manifest.clips.reduce((acc, clip) => {
      acc[clip.word] = clip.file;
      return acc;
    }, {});
  }, [manifest]);

  const selectedVoice =
    manifest?.voices?.find((v) => v.id === selectedVoiceId) ??
    manifest?.voices?.[0] ??
    null;

  const handleVoiceChange = (voiceId) => {
    setSelectedVoiceId(voiceId);
    localStorage.setItem(LOCAL_STORAGE_KEY, voiceId);
  };

  return (
    <ToneCheatSheet
      audioMap={audioMap}
      voices={manifest?.voices ?? []}
      selectedVoice={selectedVoice}
      onVoiceChange={handleVoiceChange}
      isLoading={!manifest && !error}
      error={error}
    />
  );
}

export default App;
