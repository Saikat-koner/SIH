import React, { useState } from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Check,
  ExternalLink,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { NotificationItem, NotificationType } from '../types';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onSelectParcelFromNotification: (parcelId: string) => void;
  onSimulateNewNotification: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onSelectParcelFromNotification,
  onSimulateNewNotification,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  if (!isOpen) return null;

  const filteredNotifs = notifications.filter((n) => {
    if (filterType === 'all') return true;
    return n.type === filterType;
  });

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getCardBorder = (type: NotificationType, read: boolean) => {
    if (read) return 'border-slate-200 bg-white opacity-80';
    switch (type) {
      case 'critical':
        return 'border-rose-300 bg-rose-50/40';
      case 'warning':
        return 'border-amber-300 bg-amber-50/40';
      case 'success':
        return 'border-emerald-300 bg-emerald-50/40';
      case 'info':
        return 'border-blue-300 bg-blue-50/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Real-Time Cadastre Updates</h3>
                <p className="text-[11px] text-slate-500">Live spatial events, survey pings & audit flags</p>
              </div>
            </div>

            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Actions & Filters */}
          <div className="p-3 border-b border-slate-100 bg-white flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                  filterType === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('critical')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                  filterType === 'critical' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Critical
              </button>
              <button
                onClick={() => setFilterType('success')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                  filterType === 'success' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Syncs
              </button>
            </div>

            <button
              onClick={onMarkAllRead}
              className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              Mark all read
            </button>
          </div>

          {/* Notifications List */}
          <div className="p-4 overflow-y-auto flex-1 space-y-3">
            {filteredNotifs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No notifications in this category.
              </div>
            ) : (
              filteredNotifs.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-xl border transition shadow-2xs ${getCardBorder(
                    notif.type,
                    notif.read
                  )}`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5">{getIcon(notif.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">{notif.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{notif.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>

                      {notif.parcelId && (
                        <button
                          onClick={() => {
                            onSelectParcelFromNotification(notif.parcelId!);
                            onClose();
                          }}
                          className="mt-2 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
                        >
                          <span>Inspect Affected Parcel</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Trigger for Live Simulation */}
          <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">Real-time WebSocket stream active</span>
            <button
              onClick={onSimulateNewNotification}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-[11px] flex items-center gap-1 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Simulate Live Event</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
