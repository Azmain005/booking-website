import { Toaster as SonnerToaster, toast } from "sonner";

// Toast notification wrapper with consistent styling
export function showSuccessToast(message: string, description?: string) {
  toast.success(message, {
    description,
    duration: 4000,
    style: {
      background: "hsl(var(--background))",
      color: "hsl(var(--foreground))",
      border: "1px solid hsl(var(--border))",
    },
  });
}

export function showErrorToast(message: string, description?: string) {
  toast.error(message, {
    description,
    duration: 6000,
    style: {
      background: "hsl(var(--background))",
      color: "hsl(var(--foreground))",
      border: "1px solid hsl(var(--destructive))",
    },
  });
}

export function showLoadingToast(message: string) {
  return toast.loading(message, {
    style: {
      background: "hsl(var(--background))",
      color: "hsl(var(--foreground))",
      border: "1px solid hsl(var(--border))",
    },
  });
}

export function showInfoToast(message: string, description?: string) {
  toast.info(message, {
    description,
    duration: 4000,
    style: {
      background: "hsl(var(--background))",
      color: "hsl(var(--foreground))",
      border: "1px solid hsl(var(--primary))",
    },
  });
}

// Styled Toaster component
export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      expand={true}
      richColors={false}
      closeButton={true}
      toastOptions={{
        style: {
          background: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "12px",
          fontSize: "14px",
          fontWeight: "500",
        },
      }}
    />
  );
}
