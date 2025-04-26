// Shadcn/ui toast hook implementation
import * as React from "react"

type ToastProps = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000

type ToasterToast = ToastProps

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST", 
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let listeners: ((state: ToasterToast[]) => void)[] = []

let memoryState: ToasterToast[] = []

function dispatch(action: { type: string; [key: string]: any }) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

function reducer(state: ToasterToast[], action: { type: string; [key: string]: any }) {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return [...state, action.toast].slice(-TOAST_LIMIT)

    case actionTypes.UPDATE_TOAST:
      return state.map((t) =>
        t.id === action.toast.id ? { ...t, ...action.toast } : t
      )

    case actionTypes.DISMISS_TOAST: {
      const { id } = action
      if (id) {
        addToRemoveQueue(id)
      }
      return state.map((t) =>
        t.id === id || id === undefined
          ? {
              ...t,
              open: false,
            }
          : t
      )
    }

    case actionTypes.REMOVE_TOAST:
      if (action.id === undefined) {
        return []
      }
      return state.filter((t) => t.id !== action.id)

    default:
      return state
  }
}

function addToRemoveQueue(id: string) {
  if (toastTimeouts.has(id)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(id)
    dispatch({
      type: actionTypes.REMOVE_TOAST,
      id,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(id, timeout)
}

export function useToast() {
  const [state, setState] = React.useState<ToasterToast[]>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])
  
  return {
    toasts: state,
    toast: (props: Omit<ToasterToast, "id">) => {
      const id = genId()

      const update = (props: Partial<ToasterToast>) =>
        dispatch({
          type: actionTypes.UPDATE_TOAST,
          toast: { ...props, id },
        })
      
      const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, id })

      dispatch({
        type: actionTypes.ADD_TOAST,
        toast: {
          ...props,
          id,
          open: true,
          onOpenChange: (open: boolean) => {
            if (!open) dismiss()
          },
        },
      })

      return {
        id,
        dismiss,
        update,
      }
    },
    dismiss: (id?: string) => dispatch({ type: actionTypes.DISMISS_TOAST, id }),
  }
} 