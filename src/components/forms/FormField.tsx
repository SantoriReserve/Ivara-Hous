import { type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";

type BaseFieldProps = {
  label: string;
  name: string;
  required?: boolean;
  hint?: string;
  error?: string;
};

type InputFieldProps = BaseFieldProps &
  InputHTMLAttributes<HTMLInputElement> & {
    as?: "input";
  };

type TextareaFieldProps = BaseFieldProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    as: "textarea";
  };

type SelectFieldProps = BaseFieldProps & {
  as: "select";
  options: { value: string; label: string }[];
} & Omit<InputHTMLAttributes<HTMLSelectElement>, "children">;

type FormFieldProps = InputFieldProps | TextareaFieldProps | SelectFieldProps;

const FIELD_META_KEYS = [
  "as",
  "label",
  "name",
  "required",
  "hint",
  "error",
] as const;

function omitFieldMeta<T extends FormFieldProps>(
  props: T,
  extraKeys: readonly string[] = []
) {
  const rest = { ...props } as Record<string, unknown>;
  for (const key of [...FIELD_META_KEYS, ...extraKeys]) {
    delete rest[key];
  }
  return rest;
}

function FieldWrapper({
  label,
  name,
  required,
  hint,
  error,
  children,
}: BaseFieldProps & { children: ReactNode }) {
  return (
    <div className="space-y-3">
      <label htmlFor={name} className="luxury-label block text-black">
        {label}
        {required && <span> *</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="font-sans text-xs text-gray-muted">{hint}</p>
      )}
      {error && <p className="font-sans text-xs text-red-700">{error}</p>}
    </div>
  );
}

export function FormField(props: FormFieldProps) {
  const { label, name, required, hint, error } = props;

  if (props.as === "textarea") {
    const textareaProps = omitFieldMeta(props);
    return (
      <FieldWrapper label={label} name={name} required={required} hint={hint} error={error}>
        <textarea
          id={name}
          name={name}
          className="luxury-textarea"
          required={required}
          {...textareaProps}
        />
      </FieldWrapper>
    );
  }

  if (props.as === "select") {
    const { options } = props;
    const selectProps = omitFieldMeta(props, ["options"]);
    return (
      <FieldWrapper label={label} name={name} required={required} hint={hint} error={error}>
        <select
          id={name}
          name={name}
          className="luxury-select"
          required={required}
          {...selectProps}
        >
          <option value="">Select an option</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </FieldWrapper>
    );
  }

  const inputProps = omitFieldMeta(props);
  return (
    <FieldWrapper label={label} name={name} required={required} hint={hint} error={error}>
      <input
        id={name}
        name={name}
        className="luxury-input"
        required={required}
        {...inputProps}
      />
    </FieldWrapper>
  );
}
