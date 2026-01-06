import { FieldError } from "react-hook-form";

type InputFieldProps = {
  label: string;
  type?: string;
  register: any;
  name: string;
  defaultValue?: string;
  error?: FieldError;
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
        hidden ? "hidden" : "flex flex-col gap-2 rounded-full md:w-1/4"
      }
    >
      <label htmlFor="">{label}</label>
      <input
        type={type}
        {...register(name)}
        className="ring-[1.5px] p-2 rounded-md text-sm w-full mb-4"
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
