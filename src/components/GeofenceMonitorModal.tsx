import React from 'react';
import {
  Radio,
  Navigation,
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Footprints,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Compass,
  X,
  MapPin,
  ShieldCheck,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { LandParcel } from '../types';
import { useGeofence } from '../context/GeofenceContext';

interface GeofenceMonitorModalProps {
  parcels: LandParcel[];
  onSelectParcelOnMap?: (parcel: LandParcel) => void;
}

export const GeofenceMonitorModal: React.FC<GeofenceMonitorModalProps> = ({
  parcels,
  onSelectParcelOnMap,
}) => {
  const {
    assignedParcel,
    setAssignedParcel,
    isGeofenceActive,
    setIsGeofenceActive,
    trackingMode,
    setTrackingMode,
    currentPosition,
    boundaryStatus,
    distanceToBoundary,
    eventsLog,
    clearEventsLog,
    simulateStepInside,
    simulateStepOutside,
    runSimulationWalk,
    isWalking,
    notificationPermission,
    requestPermission,
    soundEnabled,
    setSoundEnabled,
    isMonitorModalOpen,
    setIsMonitorModalOpen,
  } = useGeofence();

  if (!isMonitorModalOpen) return null;

  const isInside = boundaryStatus === 'inside';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="geofence-modal-title"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-inner ${
                isInside
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}
            >
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 id="geofence-modal-title" className="text-base font-bold text-white leading-tight">
                Cadastral Geofencing & Boundary Telemetry
              </h3>
              <p className="text-xs text-slate-300">
                Real-time boundary crossing detection & instant browser push alerts
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsMonitorModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/60 transition"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Main Status Banner */}
          <div
            className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              !isGeofenceActive
                ? 'bg-slate-50 border-slate-200 text-slate-600'
                : isInside
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-sm'
                : 'bg-amber-50 border-amber-300 text-amber-950 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="relative flex h-3.5 w-3.5 shrink-0">
                {isGeofenceActive && (
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isInside ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                )}
                <span
                  className={`relative inline-flex rounded-full h-3.5 w-3.5 ${
                    !isGeofenceActive
                      ? 'bg-slate-400'
                      : isInside
                      ? 'bg-emerald-500'
                      : 'bg-amber-500'
                  }`}
                />
              </span>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider font-bold">
                    {!isGeofenceActive
                      ? 'Geofencing Paused'
                      : isInside
                      ? 'INSIDE BOUNDARY'
                      : 'OUTSIDE BOUNDARY'}
                  </span>
                  {assignedParcel && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/70 font-semibold border border-slate-200/60">
                      {assignedParcel.parcelNumber}
                    </span>
                  )}
                </div>

                <p className="text-xs mt-0.5 text-slate-700">
                  {!isGeofenceActive
                    ? 'Tracking is currently suspended. Enable to resume notifications.'
                    : isInside
                    ? `Surveyor coordinates are verified INSIDE the cadastral polygon of ${
                        assignedParcel?.title || 'the assigned parcel'
                      }.`
                    : `Surveyor is OUTSIDE the perimeter by ${distanceToBoundary} meters.`}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsGeofenceActive(!isGeofenceActive)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap shrink-0 shadow-2xs ${
                isGeofenceActive
                  ? 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {isGeofenceActive ? 'Pause Geofence' : 'Activate Geofence'}
            </button>
          </div>

          {/* Target Parcel Selector & Info */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label htmlFor="assigned-parcel-select" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Assigned LandParcel Target:</span>
              </label>

              <select
                id="assigned-parcel-select"
                value={assignedParcel?.id || ''}
                onChange={(e) => {
                  const target = parcels.find((p) => p.id === e.target.value) || null;
                  setAssignedParcel(target);
                }}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:border-emerald-500 shadow-2xs"
              >
                {parcels.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.parcelNumber} - {p.title} ({p.areaHectares} ha)
                  </option>
                ))}
              </select>
            </div>

            {assignedParcel && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Owner</span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {assignedParcel.owner}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Area</span>
                  <span className="font-semibold text-slate-800">
                    {assignedParcel.areaHectares} ha ({assignedParcel.areaAcres} ac)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Status</span>
                  <span className="font-semibold capitalize text-emerald-700">
                    {assignedParcel.status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Centroid</span>
                  <span className="font-mono text-[11px] text-slate-700">
                    {assignedParcel.center[0].toFixed(4)}, {assignedParcel.center[1].toFixed(4)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Live Surveyor Telemetry Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Perimeter Distance
              </span>
              <div className="text-base font-bold text-slate-900 mt-1">
                {distanceToBoundary} <span className="text-xs font-normal text-slate-500">meters</span>
              </div>
              <span className="text-[10px] text-slate-400">
                {isInside ? 'Inside boundary edge' : 'To nearest polygon line'}
              </span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Current Position
              </span>
              <div className="text-xs font-mono font-bold text-slate-900 mt-1.5 truncate">
                {currentPosition
                  ? `${currentPosition.lat.toFixed(5)}, ${currentPosition.lng.toFixed(5)}`
                  : 'Awaiting GPS...'}
              </div>
              <span className="text-[10px] text-slate-400">WGS84 Coordinates</span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                GPS Accuracy
              </span>
              <div className="text-base font-bold text-emerald-700 mt-1">
                ±{currentPosition ? Math.round(currentPosition.accuracy) : 5}{' '}
                <span className="text-xs font-normal text-slate-500">meters</span>
              </div>
              <span className="text-[10px] text-slate-400">
                {trackingMode === 'gps' ? 'Live Mobile Sensor' : 'Simulated RTK Fix'}
              </span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Tracking Mode
              </span>
              <div className="text-xs font-bold text-slate-900 mt-1.5 flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    trackingMode === 'gps' ? 'bg-blue-600' : 'bg-purple-600'
                  }`}
                />
                <span className="capitalize">{trackingMode === 'gps' ? 'Real GPS' : 'Simulation'}</span>
              </div>
              <span className="text-[10px] text-slate-400">
                {trackingMode === 'gps' ? 'watchPosition Active' : 'Virtual Walk Mode'}
              </span>
            </div>
          </div>

          {/* Mode Switcher & Simulation Sandbox */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Positioning Mode & Field Sandbox</h4>
                <p className="text-[11px] text-slate-500">
                  Switch between physical mobile device GPS or use the interactive simulator
                </p>
              </div>

              <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-white shrink-0 shadow-2xs">
                <button
                  onClick={() => setTrackingMode('gps')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                    trackingMode === 'gps'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Mobile GPS
                </button>
                <button
                  onClick={() => setTrackingMode('simulation')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                    trackingMode === 'simulation'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Walk Simulator
                </button>
              </div>
            </div>

            {/* Quick Testing Triggers */}
            <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-600">Quick Test Boundary:</span>
              <button
                id="btn-simulate-step-inside"
                onClick={simulateStepInside}
                disabled={!assignedParcel}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                title="Move surveyor inside the assigned parcel boundary"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Simulate Step Inside (Enter)</span>
              </button>

              <button
                id="btn-simulate-step-outside"
                onClick={simulateStepOutside}
                disabled={!assignedParcel}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                title="Move surveyor outside the assigned parcel boundary"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Simulate Step Outside (Exit)</span>
              </button>

              <button
                id="btn-simulate-continuous-walk"
                onClick={runSimulationWalk}
                disabled={!assignedParcel || isWalking}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                title="Walk through boundary path automatically"
              >
                <Footprints className="w-3.5 h-3.5" />
                <span>{isWalking ? 'Walking Across...' : 'Simulate Boundary Cross Walk'}</span>
              </button>
            </div>
          </div>

          {/* Browser Notification Controls & Audio Chime */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-emerald-600" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Browser Push Notification Permission</h4>
                  <p className="text-[11px] text-slate-500">
                    System notifications alert mobile surveyors when crossing property borders
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    notificationPermission === 'granted'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : notificationPermission === 'denied'
                      ? 'bg-red-100 text-red-800 border-red-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}
                >
                  {notificationPermission === 'granted'
                    ? 'Notifications Enabled'
                    : notificationPermission === 'denied'
                    ? 'Notifications Denied'
                    : 'Permission Required'}
                </span>

                {notificationPermission !== 'granted' && (
                  <button
                    onClick={requestPermission}
                    className="px-2.5 py-1 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition shadow-xs whitespace-nowrap"
                  >
                    Enable Browser Notifications
                  </button>
                )}
              </div>
            </div>

            {/* Audio Feedback Toggle */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-600 flex items-center gap-1.5">
                {soundEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>Audible Chime Alert on Boundary Entry/Exit</span>
              </span>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`text-xs font-bold px-2.5 py-0.5 rounded transition ${
                  soundEnabled
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {soundEnabled ? 'Chime Active' : 'Muted'}
              </button>
            </div>
          </div>

          {/* Real-time Transition Event Log */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-slate-600" />
                <h4 className="text-xs font-bold text-slate-900">
                  Geofence Crossing Logs ({eventsLog.length})
                </h4>
              </div>

              {eventsLog.length > 0 && (
                <button
                  onClick={clearEventsLog}
                  className="text-[11px] text-slate-500 hover:text-red-600 font-semibold transition"
                >
                  Clear Logs
                </button>
              )}
            </div>

            {eventsLog.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                No boundary transition events recorded yet. Click &quot;Simulate Step Inside&quot; to test.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {eventsLog.map((evt) => (
                  <div
                    key={evt.id}
                    className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-3 ${
                      evt.type === 'entered'
                        ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950'
                        : 'bg-amber-50/70 border-amber-200/80 text-amber-950'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          evt.type === 'entered' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                      <div className="min-w-0">
                        <div className="font-bold truncate">
                          {evt.type === 'entered' ? 'ENTERED' : 'EXITED'}: {evt.parcelTitle} (
                          {evt.parcelNumber})
                        </div>
                        <div className="text-[10px] opacity-75 font-mono">
                          Coords: {evt.coordinates[0].toFixed(5)}, {evt.coordinates[1].toFixed(5)} &bull;{' '}
                          Dist: {evt.distanceMeters}m
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono opacity-70 shrink-0 font-medium">
                      {evt.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>High-precision Ray-Casting Point-in-Polygon Engine active</span>
          </div>

          <button
            onClick={() => setIsMonitorModalOpen(false)}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold shadow-xs transition"
          >
            Close HUD
          </button>
        </div>
      </div>
    </div>
  );
};
