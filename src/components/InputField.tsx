import { FieldError, FieldErrorsImpl, Merge } from "react-hook-form";

// Type pour les erreurs de validation de React Hook Form, utilisé pour afficher les messages d'erreur sous les champs de formulaire en cas de validation échouée
type RHFError = FieldError | Merge<FieldError, FieldErrorsImpl<any>>;


// Composant d'input réutilisable pour les formulaires, avec des props pour le label, le type d'input, l'enregistrement avec React Hook Form, les messages d'erreur, etc.
type InputFieldProps = {
  label: string;
  type?: string;
  register: any;
  placeholder?: string;
  name: string;
  defaultValue?: string;
  error?: RHFError;
  hidden?: boolean;
  inputClassName?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
};

const InputField = ({
  label,
  type = "text",
  register,
  placeholder,
  name,
  defaultValue,
  error,
  hidden,
  inputProps,
}: InputFieldProps) => {
  // Le composant rend un champ de formulaire avec un label, un input et un message d'erreur (le cas échéant).
  return (
    <div
      className={
        hidden ? "hidden" : "flex flex-col gap-2 rounded-full"
      }
    >
      <label htmlFor="">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
        {...inputProps}
        defaultValue={defaultValue}
        {...register(name)}
      />
      {error?.message && (
        <p className="text-xs text-red-500">{error.message.toString()}</p>
      )}
    </div>
  );
};

export default InputField;
