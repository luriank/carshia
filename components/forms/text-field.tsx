"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Eye, EyeSlash as EyeOff } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type BaseProps = {
  label: string;
  error?: string;
  description?: string;
};

type TextFieldProps = BaseProps &
  Omit<React.ComponentProps<typeof Input>, "id"> & {
    id: string;
    inputClassName?: string;
  };

export function TextField({
  label,
  error,
  description,
  id,
  className,
  inputClassName,
  ...props
}: TextFieldProps) {
  return (
    <Field data-invalid={error ? true : undefined} className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        aria-invalid={!!error}
        className={inputClassName}
        {...props}
      />
      {description && !error ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  );
}

type PasswordFieldProps = BaseProps &
  Omit<React.ComponentProps<typeof Input>, "id" | "type"> & {
    id: string;
    inputClassName?: string;
  };

export function PasswordField({
  label,
  error,
  description,
  id,
  className,
  inputClassName,
  ...props
}: PasswordFieldProps) {
  const t = useTranslations();
  const [show, setShow] = React.useState(false);
  return (
    <Field data-invalid={error ? true : undefined} className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          aria-invalid={!!error}
          className={cn("pr-10", inputClassName)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={
            show ? t("auth.hidePassword") : t("auth.showPassword")
          }
          aria-pressed={show}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:text-foreground"
        >
          {show ? (
            <EyeOff weight="duotone" className="size-4" />
          ) : (
            <Eye weight="duotone" className="size-4" />
          )}
        </button>
      </div>
      {description && !error ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  );
}

type TextAreaFieldProps = BaseProps &
  Omit<React.ComponentProps<typeof Textarea>, "id"> & {
    id: string;
  };

export function TextAreaField({
  label,
  error,
  description,
  id,
  className,
  ...props
}: TextAreaFieldProps) {
  return (
    <Field data-invalid={error ? true : undefined} className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Textarea id={id} aria-invalid={!!error} {...props} />
      {description && !error ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  );
}
