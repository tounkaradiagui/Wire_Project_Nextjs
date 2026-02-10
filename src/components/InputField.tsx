import { FieldError, FieldErrorsImpl, Merge } from "react-hook-form";

type RHFError = FieldError | Merge<FieldError, FieldErrorsImpl<any>>;

type InputFieldProps = {
  label: string;
  type?: string;
  register: any;
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
  name,
  defaultValue,
  error,
  hidden,
  inputClassName = "",
  inputProps,
}: InputFieldProps) => {
  return (
    <div
      className={
        hidden ? "hidden" : "flex flex-col gap-2 rounded-full"
      }
    >
      <label htmlFor="">{label}</label>
      <input
        type={type}
        {...register(name)}
        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
        {...inputProps}
        defaultValue={defaultValue}
      />
      {error?.message && (
        <p className="text-xs text-red-500">{error.message.toString()}</p>
      )}
    </div>
  );
};

export default InputField;
