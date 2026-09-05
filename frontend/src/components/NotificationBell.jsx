import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { notificationsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  const load = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationsAPI.list();
      setItems(res.data || []);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    load();
    if (!isAuthenticated) return undefined;
    const id = setInterval(load, 45000);
    return () => clearInterval(id);
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  const unread = items.filter((n) => !n.read).length;

  const markAll = async () => {
    try {
      await notificationsAPI.readAll();
      setItems((list) => list.map((n) => ({ ...n, read: true })));
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        className="relative hover:text-[var(--accent)]"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) load();
        }}
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-2 -right-2 bg-[var(--accent)] text-white text-[10px] rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-3 w-80 max-h-96 overflow-auto bg-[var(--bg)] border border-[var(--line)] shadow-xl rounded-xl z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line)]">
            <p className="text-sm font-medium">Notifications</p>
            {unread > 0 && (
              <button type="button" className="text-xs underline text-[var(--ink-muted)]" onClick={markAll}>
                Mark all read
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <p className="p-4 text-sm text-[var(--ink-muted)]">No notifications yet.</p>
          ) : (
            <ul>
              {items.slice(0, 12).map((n) => (
                <li key={n._id} className={`px-4 py-3 border-b border-[var(--line)] text-sm ${n.read ? "opacity-70" : ""}`}>
                  {n.link ? (
                    <Link to={n.link} onClick={() => setOpen(false)} className="block">
                      <p className="font-medium text-[var(--ink)]">{n.title}</p>
                      <p className="text-[var(--ink-muted)] mt-0.5">{n.message}</p>
                    </Link>
                  ) : (
                    <>
                      <p className="font-medium">{n.title}</p>
                      <p className="text-[var(--ink-muted)] mt-0.5">{n.message}</p>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
