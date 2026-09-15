import { spacing } from "@/lib/spacing";

export const styles = {
  container: `flex min-h-[70vh] w-full items-center justify-center px-${spacing.normal} py-${spacing.xl}`,
  card: "w-full max-w-sm",
  form: "flex flex-col gap-4",
  field: "flex flex-col gap-1.5",
  submit: "w-full",
  error: "text-sm text-destructive",
};
