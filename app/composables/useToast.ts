export type ToastTone = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  message: string
  tone: ToastTone
  /** Optional action rendered as a link, e.g. "View basket". */
  action?: { label: string; to: string }
}

/**
 * A tiny toast queue shared across the app.
 *
 * `useState` keeps one instance per request on the server and one per app on
 * the client, which avoids the module-level-array bug where SSR would leak
 * one visitor's toasts into another's render.
 */
export function useToast() {
  const toasts = useState<Toast[]>('toasts', () => [])
  const counter = useState<number>('toast-counter', () => 0)

  function push(message: string, tone: ToastTone = 'success', action?: Toast['action']) {
    counter.value += 1
    const toast: Toast = { id: counter.value, message, tone, action }
    toasts.value = [...toasts.value, toast]

    if (import.meta.client) {
      window.setTimeout(() => dismiss(toast.id), tone === 'error' ? 6000 : 4000)
    }
    return toast.id
  }

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  function clear() {
    toasts.value = []
  }

  return { toasts, push, dismiss, clear }
}
