import { Button, ButtonProps } from "@mantine/core";

type ButtonType = "primary" | "secondary" | "tertiary";

interface CustomButtonProps extends Omit<ButtonProps, "variant"> {
  buttonType?: ButtonType;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

/**
 * CustomButton - A reusable button component with predefined styles
 * 
 * @param buttonType - Determines the button style:
 *   - "primary": Filled button (default)
 *   - "secondary": Outline button
 *   - "tertiary": Clear/subtle button
 * @param props - All Mantine Button props can be passed to override defaults
 */
export function CustomButton({
  buttonType = "primary",
  color = "orange",
  radius = "xl",
  size = "md",
  children,
  type = "button",
  onClick,
  ...props
}: CustomButtonProps) {
  const getVariant = (type: ButtonType): ButtonProps["variant"] => {
    switch (type) {
      case "primary":
        return "filled";
      case "secondary":
        return "outline";
      case "tertiary":
        return "subtle";
      default:
        return "filled";
    }
  };

  return (
    <Button
      variant={getVariant(buttonType)}
      color={color}
      radius={radius}
      size={size}
      type={type}
      onClick={onClick}
      {...props}
    >
      {children}
    </Button>
  );
}
