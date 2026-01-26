import React, { useState, useEffect, useRef } from 'react';
import { useNotificationStore } from '@/lib/store/notifications';
import { useWMStore } from '@/lib/store/wm';

type Tab = 'timer' | 'stopwatch' | 'alarm';

export default function ClockApp() {
  const [activeTab, setActiveTab] = useState<Tab>('timer');

  return (
    <div className="h-full w-full bg-ub-cool-grey text-white flex flex-col font-ubuntu select-none">
      {/* Top Tabs */}
      <div className="flex border-b border-white/10 bg-ub-grey">
        <TabButton
          active={activeTab === 'timer'}
          onClick={() => setActiveTab('timer')}
          label="Timer"
          icon="⏳"
        />
        <TabButton
          active={activeTab === 'stopwatch'}
          onClick={() => setActiveTab('stopwatch')}
          label="Stopwatch"
          icon="⏱️"
        />
        <TabButton
          active={activeTab === 'alarm'}
          onClick={() => setActiveTab('alarm')}
          label="Alarm"
          icon="🔔"
        />
      </div>

      <div className="flex-1 overflow-hidden relative p-4 flex items-center justify-center">
        {activeTab === 'timer' && <TimerView />}
        {activeTab === 'stopwatch' && <StopwatchView />}
        {activeTab === 'alarm' && <AlarmView />}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 focus:outline-none
        ${active ? 'bg-ub-orange text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}
      `}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

// -----------------------------------------------------------------------------
// TIMER VIEW
// -----------------------------------------------------------------------------
function TimerView() {
  const { addNotification } = useNotificationStore();
  const { focusWindow } = useWMStore();

  const [duration, setDuration] = useState({ minutes: 5, seconds: 0 });
  const [timeLeft, setTimeLeft] = useState(300); // in seconds
  const [status, setStatus] = useState<'idle' | 'running' | 'paused'>('idle');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync timeLeft with inputs when idle
  useEffect(() => {
    if (status === 'idle') {
      setTimeLeft(duration.minutes * 60 + duration.seconds);
    }
  }, [duration, status]);

  useEffect(() => {
    if (status === 'running') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  const handleComplete = () => {
    setStatus('idle');
    addNotification({
      appId: 'clock',
      title: 'Timer Finished',
      body: 'Your timer has completed.',
      persistent: false,
      action: {
        label: 'Open Clock',
        callback: () => focusWindow('clock'),
      },
    });
  };

  const toggleTimer = () => {
    if (status === 'running') setStatus('paused');
    else setStatus('running');
  };

  const resetTimer = () => {
    setStatus('idle');
    setTimeLeft(duration.minutes * 60 + duration.seconds);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md">
      {status === 'idle' ? (
        <div className="flex items-center gap-4 text-4xl font-light">
          <div className="flex flex-col items-center">
            <input
              type="number"
              min="0"
              max="999"
              value={duration.minutes}
              onChange={(e) => setDuration({ ...duration, minutes: Math.max(0, parseInt(e.target.value) || 0) })}
              className="bg-transparent border-b border-white/20 text-center w-24 focus:border-ub-orange focus:outline-none appearance-none"
            />
            <span className="text-xs text-gray-400 mt-2">MIN</span>
          </div>
          <span className="pb-6">:</span>
          <div className="flex flex-col items-center">
            <input
              type="number"
              min="0"
              max="59"
              value={duration.seconds}
              onChange={(e) => setDuration({ ...duration, seconds: Math.min(59, Math.max(0, parseInt(e.target.value) || 0)) })}
              className="bg-transparent border-b border-white/20 text-center w-24 focus:border-ub-orange focus:outline-none appearance-none"
            />
            <span className="text-xs text-gray-400 mt-2">SEC</span>
          </div>
        </div>
      ) : (
        <div className="text-7xl font-thin tracking-wider tabular-nums">
          {formatTime(timeLeft)}
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={toggleTimer}
          className={`px-8 py-3 rounded-full text-lg font-medium transition-transform active:scale-95
            ${status === 'running'
              ? 'bg-ub-grey border border-white/20 hover:bg-white/10'
              : 'bg-ub-orange hover:bg-ub-orange/90 text-white shadow-lg'}
          `}
        >
          {status === 'running' ? 'Pause' : (status === 'paused' ? 'Resume' : 'Start')}
        </button>

        {(status !== 'idle' || timeLeft !== duration.minutes * 60 + duration.seconds) && (
          <button
            onClick={resetTimer}
            className="px-8 py-3 rounded-full text-lg font-medium bg-ub-grey border border-white/20 hover:bg-white/10 transition-transform active:scale-95"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// STOPWATCH VIEW
// -----------------------------------------------------------------------------
function StopwatchView() {
  const [elapsed, setElapsed] = useState(0); // in ms
  const [status, setStatus] = useState<'idle' | 'running' | 'paused'>('idle');
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const offsetRef = useRef<number>(0); // Store elapsed time when paused

  const animate = (time: number) => {
    if (!startTimeRef.current) startTimeRef.current = time;
    const timeDelta = time - startTimeRef.current;
    setElapsed(offsetRef.current + timeDelta);
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (status === 'running') {
      startTimeRef.current = 0; // Reset for new animation frame loop
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (status === 'paused') {
        offsetRef.current = elapsed; // Save current progress
      } else if (status === 'idle') {
        offsetRef.current = 0;
        setElapsed(0);
      }
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [status]);

  const toggleStopwatch = () => {
    if (status === 'running') setStatus('paused');
    else setStatus('running');
  };

  const resetStopwatch = () => {
    setStatus('idle');
  };

  const formatTime = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const cs = Math.floor((ms % 1000) / 10); // centiseconds
    return (
      <div className="flex items-baseline justify-center">
        <span className="text-7xl font-thin tabular-nums w-[1.2em] text-right">{m.toString().padStart(2, '0')}</span>
        <span className="text-7xl font-thin mx-1">:</span>
        <span className="text-7xl font-thin tabular-nums w-[1.2em] text-right">{s.toString().padStart(2, '0')}</span>
        <span className="text-4xl font-light text-gray-400 tabular-nums w-[1.5em] ml-2">.{cs.toString().padStart(2, '0')}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <div className="mt-8">
        {formatTime(elapsed)}
      </div>

      <div className="flex gap-4 mt-4">
        <button
          onClick={toggleStopwatch}
          className={`px-8 py-3 rounded-full text-lg font-medium transition-transform active:scale-95
            ${status === 'running'
              ? 'bg-ub-red hover:bg-red-600 text-white'
              : 'bg-ub-green hover:bg-green-600 text-white shadow-lg'}
          `}
        >
          {status === 'running' ? 'Stop' : 'Start'}
        </button>

        {status !== 'idle' && (
          <button
            onClick={resetStopwatch}
            className="px-8 py-3 rounded-full text-lg font-medium bg-ub-grey border border-white/20 hover:bg-white/10 transition-transform active:scale-95"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// ALARM VIEW
// -----------------------------------------------------------------------------
function AlarmView() {
  const { addNotification } = useNotificationStore();
  const { focusWindow } = useWMStore();

  const [alarmTime, setAlarmTime] = useState('09:00');
  const [isEnabled, setIsEnabled] = useState(false);
  const lastFiredRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isEnabled) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentHHMM = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

      // Check if matches and hasn't fired for this specific time yet
      if (currentHHMM === alarmTime && lastFiredRef.current !== currentHHMM) {
        lastFiredRef.current = currentHHMM;

        addNotification({
          appId: 'clock',
          title: 'Alarm',
          body: 'Alarm is ringing.',
          persistent: true,
          action: {
            label: 'Dismiss',
            callback: () => {
              focusWindow('clock');
              // Optionally disable alarm or leave it for next day?
              // Standard behavior is to leave it enabled for tomorrow, but stop ringing.
            }
          }
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isEnabled, alarmTime]);

  // Reset lastFired if time changes
  useEffect(() => {
    lastFiredRef.current = null;
  }, [alarmTime]);

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-sm">
      <div className="bg-white/5 rounded-2xl p-6 w-full flex flex-col items-center border border-white/10">
        <h3 className="text-xl font-medium mb-6 text-gray-300">Set Alarm</h3>

        <input
          type="time"
          value={alarmTime}
          onChange={(e) => setAlarmTime(e.target.value)}
          className="bg-transparent text-5xl font-light text-center focus:outline-none mb-8 w-full color-scheme-dark"
          style={{ colorScheme: 'dark' }}
        />

        <div className="flex items-center justify-between w-full px-4">
          <span className="text-lg text-gray-300">Enable Alarm</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-8 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-ub-orange"></div>
          </label>
        </div>
      </div>

      <p className="text-sm text-gray-500 text-center max-w-xs">
        Alarm will trigger a persistent notification when the system time matches the set time.
      </p>
    </div>
  );
}
