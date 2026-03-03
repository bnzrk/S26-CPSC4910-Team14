import React, { createContext, useContext, useMemo, useRef, useState, useEffect } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children, maxToasts = 5, defaultDurationMs = 50000 })
{
    const [toasts, setToasts] = useState([]);
    const timersRef = useRef(new Map());

    const dismiss = (id) =>
    {
        setToasts((prev) => prev.filter((t) => t.id !== id));

        const handle = timersRef.current.get(id);
        if (handle)
        {
            clearTimeout(handle);
            timersRef.current.delete(id);
        }
    };

    const clearAll = () =>
    {
        setToasts([]);
        for (const handle of timersRef.current.values()) clearTimeout(handle);
        timersRef.current.clear();
    };

    const push = (toast) =>
    {
        const id =
            toast.id ??
            (typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

        const durationMs =
            toast.durationMs === undefined || toast.durationMs === null
                ? defaultDurationMs
                : toast.durationMs;

        const next = {
            id,
            title: toast.title ?? "",
            message: toast.message ?? "",
            type: toast.type ?? "info", // "info" | "success" | "error" | "warning"
            durationMs,
            dismissible: toast.dismissible ?? true,
        };

        setToasts((prev) =>
        {
            const appended = [next, ...prev]; // newest on top
            return appended.slice(0, maxToasts);
        });

        if (durationMs > 0)
        {
            // Clear existing timer if same id is reused
            const existing = timersRef.current.get(id);
            if (existing) clearTimeout(existing);

            const handle = setTimeout(() => dismiss(id), durationMs);
            timersRef.current.set(id, handle);
        }

        return id;
    };

    // Cleanup on unmount
    useEffect(() =>
    {
        return () =>
        {
            for (const handle of timersRef.current.values()) clearTimeout(handle);
            timersRef.current.clear();
        };
    }, []);

    const api = useMemo(() => ({ toasts, push, dismiss, clearAll }), [toasts]);

    return <ToastContext.Provider value={api}>{children}</ToastContext.Provider>;
}

export function useToast()
{
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used inside <ToastProvider />");
    return ctx;
}