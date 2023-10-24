import React from "react";

// Unsing interface
interface InterfaceProps {
  className: string;
}

export const ButtonInterface = (props: InterfaceProps) => {
  return <button className={props.className}></button>;
};

// Using type
type TypeProps = {
  className: string;
};

export const ButtonType = (props: TypeProps) => {
  return <button className={props.className}></button>;
};

// Inline
export const ButtonInline = (props: { className: string }) => {
  return <button className={props.className}></button>;
};

// Inline with destructuring
export const ButtonDestruct = ({ className }: { className: string }) => {
  return <button className={className}></button>;
};

// Function component
export const ButtonFC: React.FC<TypeProps> = (props: TypeProps) => {
  return {
    ohDear: "123",
  };
};

// children
export const ButtonChildren = (props: { children: React.ReactNode }) => {
  return <button>{props.children}</button>;
};

// Event handlers
interface ButtonProps {
  className: string;
  children: React.ReactNode;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export const ButtonEvent = ({ children, className, onClick }: ButtonProps) => {
  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
};

// Extending React Component Props
interface ButtonProps extends React.ComponentProps<"button"> {}

export const ButtonComponentProps = (props: ButtonProps) => {
  return <button className={`default-classname ${props.className}`}></button>;
};

export const ButtonAttributesDestruct = ({
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button {...rest} className={`default-classname ${className}`}></button>
  );
};

// Overriding React Component Props with type
type InputPropsType = Omit<React.ComponentProps<"input">, "onChange"> & {
  onChange: (value: string) => void;
};

export const InputType = (props: InputPropsType) => {
  return (
    <input
      {...props}
      onChange={(e) => {
        props.onChange(e.target.value);
      }}
    ></input>
  );
};

// Overriding with interface
interface InputPropsInterface
  extends Omit<React.ComponentProps<"input">, "onChange"> {
  onChange: (value: string) => void;
}

export const InputInterface = (props: InputPropsInterface) => {
  return (
    <input
      {...props}
      onChange={(e) => {
        props.onChange(e.target.value);
      }}
    ></input>
  );
};

// Overriding with custom utility type
type OverrideProps<T, TOverridden> = Omit<T, keyof TOverridden> & TOverridden;

type InputProps = OverrideProps<
  React.ComponentProps<"input">,
  {
    onChange: (value: string) => void;
  }
>;

export const InputCustom = (props: InputProps) => {
  return (
    <input
      {...props}
      onChange={(e) => {
        props.onChange(e.target.value);
      }}
    ></input>
  );
};

// Extracting types from a component
export const NavBar = (props: {
  title: string;
  links: string[];
  children: React.ReactNode;
}) => {
  return <div>Some content</div>;
};

type NavBarProps = React.ComponentProps<typeof NavBar>;
