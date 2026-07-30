import { createContext, splitProps, useContext, type JSX } from "solid-js";
import { cn } from "../../utils/cn";
import {
  Button,
  type ButtonProps,
  type KumoButtonSize,
  type KumoButtonVariant,
} from "../button";
import type { KumoBannerVariant } from "./banner";

export type BannerActionVariant = Extract<
  KumoButtonVariant,
  "primary" | "secondary" | "ghost"
>;

export type BannerActionSize = Extract<KumoButtonSize, "xs" | "sm">;

export interface BannerActionContextValue {
  readonly variant: KumoBannerVariant;
  readonly size: BannerActionSize;
}

export const BannerActionContext = createContext<BannerActionContextValue>({
  variant: "default",
  size: "sm",
});

const BANNER_ACTION_ACCENTS: Record<
  KumoBannerVariant,
  { accent: string; secondary: string; ghost: string }
> = {
  default: {
    accent: "var(--color-kumo-info)",
    secondary:
      "text-inherit ring-kumo-info/50 fill-kumo-info hover:!text-inherit hover:!ring-kumo-info/50 hover:bg-kumo-info/10",
    ghost: "text-inherit fill-kumo-info hover:bg-kumo-info/10",
  },
  alert: {
    accent: "var(--color-kumo-warning)",
    secondary:
      "text-inherit ring-kumo-warning/50 fill-kumo-warning hover:!text-inherit hover:!ring-kumo-warning/50 hover:bg-kumo-warning/10",
    ghost: "text-inherit fill-kumo-warning hover:bg-kumo-warning/10",
  },
  error: {
    accent: "var(--color-kumo-danger)",
    secondary:
      "text-inherit ring-kumo-danger/50 fill-kumo-danger hover:!text-inherit hover:!ring-kumo-danger/50 hover:bg-kumo-danger/10",
    ghost: "text-inherit fill-kumo-danger hover:bg-kumo-danger/10",
  },
  secondary: {
    accent: "var(--color-neutral-700, oklch(37.1% 0 0))",
    secondary:
      "text-inherit ring-kumo-focus/20 fill-kumo-subtle hover:!text-inherit hover:!ring-kumo-focus/20 hover:bg-kumo-contrast/10",
    ghost: "text-inherit fill-kumo-subtle hover:bg-kumo-contrast/10",
  },
};

function bannerActionAccentVars(accent: string) {
  return {
    "--kumo-button-emphasis-ring": `color-mix(in oklch, ${accent}, black 10%)`,
    "--kumo-button-emphasis-bg": `color-mix(in oklch, ${accent}, white 30%)`,
    "--kumo-button-emphasis-gradient-start": `color-mix(in oklch, ${accent}, white 15%)`,
    "--kumo-button-emphasis-gradient-end": accent,
  } as JSX.CSSProperties;
}

type WithBannerActionVariants<Props> = Props extends ButtonProps
  ? Omit<Props, "size" | "variant"> & {
      variant?: BannerActionVariant;
    }
  : never;

export type BannerActionProps = WithBannerActionVariants<ButtonProps>;

export function BannerAction(inputProps: BannerActionProps) {
  const [props, buttonProps] = splitProps(inputProps, [
    "variant",
    "className",
    "style",
    "ref",
  ]);
  const banner = useContext(BannerActionContext);
  const variant = () => props.variant ?? "primary";
  const styles = () => BANNER_ACTION_ACCENTS[banner.variant];
  const buttonVariant = () =>
    variant() === "secondary" ? "outline" : variant();
  const style = () => {
    if (variant() !== "primary") return props.style;

    const accent = bannerActionAccentVars(styles().accent);
    if (typeof props.style === "string") {
      const variables = Object.entries(accent)
        .map(([name, value]) => `${name}:${String(value)}`)
        .join(";");
      return `${variables};${props.style}`;
    }
    return { ...accent, ...props.style };
  };

  return (
    <Button
      {...(buttonProps as ButtonProps)}
      ref={props.ref}
      variant={buttonVariant()}
      size={banner.size}
      className={cn(
        variant() !== "primary" && styles()[variant() as "secondary" | "ghost"],
        props.className,
      )}
      style={style()}
    />
  );
}
