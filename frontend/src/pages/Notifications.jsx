import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Bell, Check, Sparkles, CheckCircle2, Clock, CheckCheck, Inbox } from 'lucide-react';

const Notifications = () => {
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      toast.success('Notification marked as read.');
      fetchNotifications();
    } catch (err) {}
  };

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.read);
      await Promise.allSettled(unread.map(n => api.put(`/notifications/${n.id}/read`)));
      toast.success('All notifications marked as read.');
      fetchNotifications();
    } catch (err) {}
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
                <span>Platform Activity & Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    {unreadCount} Unread
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Real-time event feed for candidate movements, interviews, and offers</p>
            </div>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-slate-700 self-start md:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-cyan-400" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3.5">
        {loading ? (
          <div className="text-center py-12 text-slate-500 text-xs flex flex-col items-center justify-center">
            <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-2"></div>
            <span>Loading notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs flex flex-col items-center justify-center space-y-2">
            <Inbox className="w-8 h-8 text-slate-600 stroke-[1.5]" />
            <span>No notifications in event feed.</span>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border transition-all flex justify-between items-start ${
                n.read ? 'bg-slate-950/40 border-slate-800/60 opacity-75' : 'bg-slate-950 border-slate-700/80 shadow-md'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div className={`p-2 rounded-xl border mt-0.5 ${
                  n.type === 'STAGE_CHANGE' ? 'bg-amber-950/50 text-amber-400 border-amber-800' :
                  n.type === 'INTERVIEW_SCHEDULED' ? 'bg-cyan-950/50 text-cyan-400 border-cyan-800' :
                  n.type === 'OFFER_EXTENDED' ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800' :
                  'bg-purple-950/50 text-purple-400 border-purple-800'
                }`}>
                  <Bell className="w-4 h-4" />
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-bold text-slate-100">{n.title}</h4>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{n.message}</p>
                  <div className="text-[10px] text-slate-500 mt-2 flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {!n.read && (
                <button
                  onClick={() => markAsRead(n.id)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors border border-slate-700 shrink-0 ml-3"
                >
                  <Check className="w-3 h-3" />
                  <span>Mark Read</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
