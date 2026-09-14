import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { styles } from "../editor.styles";

type FormFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  error?: string;
  as?: "input" | "textarea";
};

export const FormField = ({
  id,
  label,
  value,
  onChange,
  maxLength,
  error,
  as = "input",
}: FormFieldProps) => {
  const Field = as === "textarea" ? Textarea : Input;

  return (
    <div className={styles.field}>
      <div className={styles.fieldHeader}>
        <Label htmlFor={id}>{label}</Label>
        <span className={error ? styles.counterInvalid : styles.counter}>
          {value.length}/{maxLength}
        </span>
      </div>
      <Field
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};
