import React, { useState, useRef } from 'react';
import { Play, Pause, Lock, Unlock, Zap, Heart, Wind, Brain, Volume2, Headphones, CheckCircle } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  frequency: string;
  type: 'mono' | 'binaural';
  hz?: number;
  base?: number;
  beat?: number;
  description: string;
  icon: React.ReactNode;
  color: string;
  isLocked: boolean;
}

const FrequencyApp = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [isPremium, setIsPremium] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef1 = useRef<OscillatorNode | null>(null);
  const oscRef2 = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const tracks: Track[] = [
    {
      id: '432hz',
      title: "Nature's Balance",
      frequency: "432 Hz",
      type: "mono",
      hz: 432,
      description: "Deep relaxation, grounding, and stress relief.",
      icon: <Wind size={20} />,
      color: "from-teal-400 to-emerald-500",
      isLocked: false
    },
    {
      id: '528hz',
      title: "Miracle Tone",
      frequency: "528 Hz",
      type: "mono",
      hz: 528,
      description: "DNA repair, transformation, and positive energy.",
      icon: <Heart size={20} />,
      color: "from-rose-400 to-pink-500",
      isLocked: true
    },
    {
      id: '14hz',
      title: "Deep Focus",
      frequency: "14 Hz Beat",
      type: "binaural",
      base: 200,
      beat: 14,
      description: "Mid-Beta waves for active studying and concentration.",
      icon: <Brain size={20} />,
      color: "from-blue-400 to-indigo-500",
      isLocked: true
    },
    {
      id: '20hz',
      title: "High Alertness",
      frequency: "20 Hz Beat",
      type: "binaural",
      base: 200,
      beat: 20,
      description: "High-Beta waves for problem solving and high energy.",
      icon: <Zap size={20} />,
      color: "from-amber-400 to-orange-500",
      isLocked: true
    },
    {
      id: '463hz',
      title: "Pure Tone 463",
      frequency: "463 Hz",
      type: "mono",
      hz: 463,
      description: "Custom requested frequency for meditative states.",
      icon: <Volume2 size={20} />,
      color: "from-purple-400 to-violet-500",
      isLocked: true
    }
  ];

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
  };

  const stopAudio = () => {
    if (oscRef1.current) {
      try { oscRef1.current.stop(); oscRef1.current.disconnect(); } catch (e) {}
      oscRef1.current = null;
    }
    if (oscRef2.current) {
      try { oscRef2.current.stop(); oscRef2.current.disconnect(); } catch (e) {}
      oscRef2.current = null;
    }
    setIsPlaying(false);
  };

  const playFrequency = (track: Track) => {
    initAudio();
    stopAudio();

    if (track.isLocked && !isPremium) {
      setShowPaywall(true);
      return;
    }

    setCurrentTrack(track);
    setIsPlaying(true);
    
    if (audioCtxRef.current!.state === 'suspended') {
      audioCtxRef.current!.resume();
    }

    const ctx = audioCtxRef.current!;
    const masterGain = ctx.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(ctx.destination);
    gainNodeRef.current = masterGain;

    if (track.type === 'mono' && track.hz) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(track.hz, ctx.currentTime);
      osc.connect(masterGain);
      osc.start();
      oscRef1.current = osc;

    } else if (track.type === 'binaural' && track.base && track.beat) {
      const oscL = ctx.createOscillator();
      const panL = ctx.createStereoPanner();
      oscL.type = 'sine';
      oscL.frequency.setValueAtTime(track.base, ctx.currentTime);
      panL.pan.value = -1;
      oscL.connect(panL);
      panL.connect(masterGain);

      const oscR = ctx.createOscillator();
      const panR = ctx.createStereoPanner();
      oscR.type = 'sine';
      oscR.frequency.setValueAtTime(track.base + track.beat, ctx.currentTime);
      panR.pan.value = 1;
      oscR.connect(panR);
      panR.connect(masterGain);

      oscL.start();
      oscR.start();
      oscRef1.current = oscL;
      oscRef2.current = oscR;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(newVol, audioCtxRef.current.currentTime, 0.1);
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      stopAudio();
    } else if (currentTrack) {
      playFrequency(currentTrack);
    }
  };

  const handleSubscribe = () => {
    setTimeout(() => {
      setIsPremium(true);
      setShowPaywall(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Header */}
      <header className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/90 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
            <Volume2 size={16} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">SonicTherapy<span className="text-indigo-400">.ai</span></h1>
        </div>
        <div>
          {!isPremium ? (
            <button 
              onClick={() => setShowPaywall(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity shadow-lg shadow-orange-500/20"
            >
              Go Premium
            </button>
          ) : (
            <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-medium text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle size={12} /> Premium Active
            </span>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 pb-32">
        
        {/* Intro */}
        <div className="mb-10 text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
            Tune Your Mind & Body
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            Select a frequency below to begin your session. Pure sine waves generated in real-time for maximum therapeutic effect.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-xs text-slate-400">
            <Headphones size={12} />
            <span>Headphones recommended for Binaural Beats</span>
          </div>
        </div>

        {/* Track Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tracks.map((track) => {
            const isActive = currentTrack?.id === track.id;
            const isLocked = track.isLocked && !isPremium;

            return (
              <div 
                key={track.id}
                onClick={() => !isActive && playFrequency(track)}
                className={`
                  relative group overflow-hidden rounded-2xl p-5 border transition-all duration-300 cursor-pointer
                  ${isActive 
                    ? 'bg-slate-800 border-indigo-500 shadow-xl shadow-indigo-500/10 scale-[1.02]' 
                    : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
                  }
                `}
              >
                {/* Background Gradient Glow */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${track.color} opacity-10 blur-3xl rounded-full -mr-10 -mt-10 group-hover:opacity-20 transition-opacity`} />

                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg
                      bg-gradient-to-br ${track.color}
                    `}>
                      {isActive && isPlaying ? <Pause size={24} onClick={(e) => { e.stopPropagation(); stopAudio(); }} /> : track.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-100">{track.title}</h3>
                      <p className="text-xs font-mono text-indigo-300 mb-1">{track.frequency}</p>
                    </div>
                  </div>
                  
                  {isLocked && (
                    <div className="bg-slate-900/80 p-2 rounded-full text-slate-400">
                      <Lock size={16} />
                    </div>
                  )}
                  {!isLocked && isActive && isPlaying && (
                    <div className="flex gap-1 items-end h-4">
                      <div className="w-1 bg-indigo-400 animate-[bounce_1s_infinite] h-2"></div>
                      <div className="w-1 bg-indigo-400 animate-[bounce_1.2s_infinite] h-4"></div>
                      <div className="w-1 bg-indigo-400 animate-[bounce_0.8s_infinite] h-3"></div>
                    </div>
                  )}
                </div>

                <p className="mt-4 text-sm text-slate-400 leading-relaxed">
                  {track.description}
                </p>
              </div>
            );
          })}
        </div>
      </main>

      {/* Player Bar */}
      <div className={`
        fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-4 transition-transform duration-500 z-30
        ${currentTrack ? 'translate-y-0' : 'translate-y-full'}
      `}>
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
             <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${currentTrack?.color || 'from-gray-500 to-gray-600'}`}>
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
             </div>
             <div className="hidden sm:block">
               <div className="text-sm font-bold text-white">{currentTrack?.title}</div>
               <div className="text-xs text-slate-400">{currentTrack?.type === 'binaural' ? 'Stereo Audio Required' : 'Mono Tone'}</div>
             </div>
          </div>

          <div className="flex items-center gap-6 flex-1 justify-center">
            <button 
              onClick={togglePlayPause}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-900 hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-white/10"
            >
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
            </button>
          </div>

          <div className="flex items-center gap-3 flex-1 justify-end">
            <Volume2 size={18} className="text-slate-400" />
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 md:w-32 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Paywall Modal */}
      {showPaywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => setShowPaywall(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20">
                <Lock size={32} className="text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-white">Unlock Full Frequency Access</h3>
              <p className="text-slate-400">
                You've discovered a Premium Frequency. Upgrade to access our full library of 50+ healing tones and binaural beats.
              </p>

              <div className="space-y-3 py-4 text-left">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle size={16} className="text-emerald-500" />
                  <span>Access to 528 Hz (Miracle Tone)</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle size={16} className="text-emerald-500" />
                  <span>Binaural Beta Waves (Focus & Energy)</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle size={16} className="text-emerald-500" />
                  <span>Background Play & Offline Mode</span>
                </div>
              </div>

              <button 
                onClick={handleSubscribe}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
              >
                <Unlock size={18} />
                Start 7-Day Free Trial
              </button>
              <p className="text-xs text-slate-500 mt-4">
                Then INR. 49/month. Cancel anytime.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FrequencyApp;
