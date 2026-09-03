import { toast } from "sonner"

export const useToast = () => {
  return {
    toast,
    success: (msg: string, desc?: string) => toast.success(msg, { description: desc }),
    error: (msg: string, desc?: string) => toast.error(msg, { description: desc }),
    info: (msg: string, desc?: string) => toast.info(msg, { description: desc }),
  }
}
