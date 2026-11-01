import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Video, 
  Grid2X2, 
  Grid3X3, 
  Maximize2, 
  Minimize2, 
  Moon, 
  Sun, 
  RefreshCw, 
  Camera, 
  CircleDot, 
  Volume2, 
  VolumeX, 
  Sliders, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut,
  ShieldCheck,
  MapPin,
  Sparkles
} from 'lucide-react';

export const LiveCameraMonitorView: React.FC = () => {
  const { installations, showToast } = useApp();

  const [layoutMode, setLayoutMode] = useState<'4-split' | '9-split' | 'single'>('4-split');
  const [selectedCamIndex, setSelectedCamIndex] = useState<number>(0);
  const [isNightVision, setIsNightVision] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [liveClock, setLiveClock] = useState(new Date().toLocaleTimeString());

  // Flatten all camera points from installations
  const allCameras = installations.flatMap(inst => 
    inst.camerasList.map(cam => ({
      ...cam,
      customerName: inst.customerName,
      location: inst.installationLocation,
      dvr: inst.dvrNvrDetails
    }))
  );

  // Live clock tick
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveClock(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePtz = (direction: 'up' | 'down' | 'left' | 'right' | 'center') => {
    if (direction === 'up') setPanOffset(prev => ({ ...prev, y: Math.max(-30, prev.y - 10) }));
    if (direction === 'down') setPanOffset(prev => ({ ...prev, y: Math.min(30, prev.y + 10) }));
    if (direction === 'left') setPanOffset(prev => ({ ...prev, x: Math.max(-30, prev.x - 10) }));
    if (direction === 'right') setPanOffset(prev => ({ ...prev, x: Math.min(30, prev.x + 10) }));
    if (direction === 'center') setPanOffset({ x: 0, y: 0 });
  };

  const handleSnapshot = (camName: string) => {
    showToast(`Snapshot captured and saved for ${camName}`, 'success');
  };

  const displayedCameras = layoutMode === 'single'
    ? [allCameras[selectedCamIndex] || allCameras[0]]
    : layoutMode === '4-split'
    ? allCameras.slice(0, 4)
    : allCameras.slice(0, 9);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Video className="h-6 w-6 text-blue-600" />
            Live Camera Matrix & PTZ Surveillance
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time feed simulator for installed client cameras with Night Vision toggle, stream diagnostics & PTZ controls
          </p>
        </div>

        {/* Matrix Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Night Vision Toggle */}
          <button
            onClick={() => {
              setIsNightVision(!isNightVision);
              showToast(isNightVision ? 'Switched to Color Day Vision' : 'Switched to Infrared Night Vision', 'info');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              isNightVision
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200'
            }`}
          >
            <Moon className="h-4 w-4" />
            {isNightVision ? 'IR Night Vision Active' : 'IR Night Vision Off'}
          </button>

          {/* Grid Layout Switcher */}
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              onClick={() => setLayoutMode('single')}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                layoutMode === 'single' ? 'bg-white shadow-xs dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500'
              }`}
              title="Single Full Screen"
            >
              1-Cam
            </button>
            <button
              onClick={() => setLayoutMode('4-split')}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                layoutMode === '4-split' ? 'bg-white shadow-xs dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500'
              }`}
              title="4-Split Quad View"
            >
              4-Grid
            </button>
            <button
              onClick={() => setLayoutMode('9-split')}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                layoutMode === '9-split' ? 'bg-white shadow-xs dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500'
              }`}
              title="9-Split Multi View"
            >
              9-Grid
            </button>
          </div>
        </div>
      </div>

      {/* Main Video Surveillance Viewport */}
      <div className={`grid gap-3 ${
        layoutMode === 'single'
          ? 'grid-cols-1'
          : layoutMode === '4-split'
          ? 'grid-cols-1 md:grid-cols-2'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      }`}>
        {displayedCameras.map((cam, idx) => {
          if (!cam) return null;
          const isOffline = cam.status === 'Offline';
          const isMaint = cam.status === 'Under Maintenance';

          return (
            <div
              key={cam.id || idx}
              onClick={() => setSelectedCamIndex(idx)}
              className={`group relative overflow-hidden rounded-2xl bg-slate-950 border transition-all ${
                selectedCamIndex === idx ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg' : 'border-slate-800'
              } ${layoutMode === 'single' ? 'min-h-[480px]' : 'min-h-[260px]'}`}
            >
              {/* Simulated Live Video Canvas with realistic CCTV surveillance environment */}
              <div 
                className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                  isNightVision ? 'filter grayscale contrast-125 brightness-90' : ''
                }`}
                style={{
                  transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                  backgroundImage: isOffline
                    ? 'none'
                    : `radial-gradient(ellipse at center, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.95) 100%), linear-gradient(135deg, rgba(2, 6, 23, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)`
                }}
              >
                {/* Surveillance Wireframe / Room Perspective Simulation */}
                {isOffline ? (
                  <div className="text-center p-6 space-y-2">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/20 text-rose-500 animate-pulse">
                      <CircleDot className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-bold text-rose-400">VIDEO LOSS / SIGNAL OFFLINE</p>
                    <p className="text-xs text-slate-500 font-mono">Check IP: {cam.ipAddress || '192.168.1.105'}</p>
                  </div>
                ) : (
                  <div className="relative w-full h-full flex flex-col items-center justify-center select-none opacity-40">
                    {/* Simulated 3D CCTV room grid lines */}
                    <div className="w-48 h-48 border border-slate-700/60 rounded-xl flex items-center justify-center relative">
                      <div className="w-24 h-24 border border-dashed border-slate-600/60 rounded-lg flex items-center justify-center">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                          TARGET ZONE
                        </span>
                      </div>
                      {/* Crosshairs */}
                      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-700/40" />
                      <div className="absolute left-0 right-0 top-1/2 h-px bg-slate-700/40" />
                    </div>
                  </div>
                )}
              </div>

              {/* CCTV OSD Overlay (On-Screen Display) */}
              <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between text-white font-mono text-[11px]">
                {/* Top OSD Bar */}
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-md">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                      <span className="text-rose-400 font-bold uppercase tracking-wider text-[10px]">● REC</span>
                      <span className="text-emerald-400 font-bold">LIVE</span>
                    </div>
                    <p className="text-xs font-bold text-white tracking-wide">
                      CH{cam.channelNumber || idx + 1}: {cam.locationName}
                    </p>
                    <p className="text-[10px] text-slate-300">
                      {cam.customerName}
                    </p>
                  </div>

                  {/* Time & FPS OSD */}
                  <div className="text-right bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-md">
                    <p className="text-amber-400 font-bold tracking-widest">{liveClock}</p>
                    <p className="text-[10px] text-slate-300">
                      {cam.resolution || '4MP (2560x1440)'} • 25 FPS
                    </p>
                    <p className="text-[9px] text-slate-400">4096 Kbps • H.265+</p>
                  </div>
                </div>

                {/* Bottom OSD Bar */}
                <div className="flex items-end justify-between">
                  <div className="bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px]">
                    <span className="text-slate-300">Type: {cam.cameraType}</span>
                    <span className="mx-1.5">•</span>
                    <span className="text-blue-400">RTSP Stream #1</span>
                  </div>

                  {/* Interactive Snapshot & Fullscreen buttons */}
                  <div className="pointer-events-auto flex items-center gap-1.5 bg-black/70 backdrop-blur-xs p-1 rounded-lg">
                    <button
                      onClick={() => handleSnapshot(cam.cameraName)}
                      className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10"
                      title="Take Snapshot"
                    >
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCamIndex(idx);
                        setLayoutMode(layoutMode === 'single' ? '4-split' : 'single');
                      }}
                      className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10"
                      title="Toggle Full View"
                    >
                      {layoutMode === 'single' ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PTZ and Video Diagnostic Controls Panel */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <Sliders className="h-4 w-4 text-blue-600" />
          PTZ (Pan-Tilt-Zoom) Telemetry & Remote Control
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* PTZ D-Pad Controller */}
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
              Directional Pan & Tilt
            </span>
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Up */}
              <button
                onClick={() => handlePtz('up')}
                className="absolute top-0 p-2.5 rounded-xl bg-white dark:bg-slate-700 shadow-md hover:bg-blue-600 hover:text-white transition-all text-slate-700 dark:text-slate-200"
                title="Tilt Up"
              >
                <ChevronUp className="h-5 w-5" />
              </button>

              {/* Down */}
              <button
                onClick={() => handlePtz('down')}
                className="absolute bottom-0 p-2.5 rounded-xl bg-white dark:bg-slate-700 shadow-md hover:bg-blue-600 hover:text-white transition-all text-slate-700 dark:text-slate-200"
                title="Tilt Down"
              >
                <ChevronDown className="h-5 w-5" />
              </button>

              {/* Left */}
              <button
                onClick={() => handlePtz('left')}
                className="absolute left-0 p-2.5 rounded-xl bg-white dark:bg-slate-700 shadow-md hover:bg-blue-600 hover:text-white transition-all text-slate-700 dark:text-slate-200"
                title="Pan Left"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Right */}
              <button
                onClick={() => handlePtz('right')}
                className="absolute right-0 p-2.5 rounded-xl bg-white dark:bg-slate-700 shadow-md hover:bg-blue-600 hover:text-white transition-all text-slate-700 dark:text-slate-200"
                title="Pan Right"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Center / Home */}
              <button
                onClick={() => handlePtz('center')}
                className="p-2.5 rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-500 font-mono text-[10px] font-bold"
                title="Reset Center"
              >
                HOME
              </button>
            </div>
          </div>

          {/* Optical Zoom & Night Vision */}
          <div className="flex flex-col justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Optical & Digital Zoom
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setZoomLevel(prev => Math.max(1, prev - 0.25))}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-700 shadow-xs text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                >
                  <ZoomOut className="h-4 w-4" /> Zoom Out
                </button>
                <span className="font-mono text-sm font-extrabold text-blue-600 dark:text-blue-400">
                  {zoomLevel.toFixed(2)}x
                </span>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.25))}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-700 shadow-xs text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                >
                  <ZoomIn className="h-4 w-4" /> Zoom In
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Active Camera Stream
              </span>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {displayedCameras[selectedCamIndex]?.cameraName || 'Main Camera'}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {displayedCameras[selectedCamIndex]?.location}
              </p>
            </div>
          </div>

          {/* Quick Technical Outage Support */}
          <div className="flex flex-col justify-between p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block mb-1">
                Direct CCTV Technical Helpline
              </span>
              <h4 className="text-sm font-bold text-white">
                Rique Deliveries & CCTV Solutions
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Experiencing camera offline, hard disk failure, or video distortion? Contact our rapid response technician unit directly.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-700 flex items-center justify-between">
              <a
                href="tel:0792093927"
                className="text-xs font-extrabold text-amber-400 hover:underline flex items-center gap-1"
              >
                0792093927 (Call Support)
              </a>
              <span className="text-[10px] text-emerald-400 font-bold">24/7 ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
