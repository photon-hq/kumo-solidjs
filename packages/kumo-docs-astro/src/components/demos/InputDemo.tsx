import { createSignal } from "solid-js";

import { Input } from "@photon-ai/kumo-solid";

export function InputBasicDemo() {
  return (
    <Input
      label="Email"
      placeholder="you@example.com"
      description="We'll never share your email"
    />
  );
}

export function InputWithLabelDemo() {
  return (
    <Input
      label="Username"
      placeholder="Choose a username"
      description="3-20 characters, alphanumeric only"
    />
  );
}

export function InputErrorStringDemo() {
  return (
    <Input
      label="Email"
      placeholder="you@example.com"
      value="invalid-email"
      error="Please enter a valid email address"
    />
  );
}

export function InputErrorObjectDemo() {
  return (
    <Input
      label="Password"
      type="password"
      value="short"
      error={{
        message: "Password must be at least 8 characters",
        match: "tooShort",
      }}
      minLength={8}
    />
  );
}

export function InputSizesDemo() {
  return (
    <div class="flex flex-col gap-4">
      <Input size="xs" label="Extra Small" placeholder="Extra small input" />
      <Input size="sm" label="Small" placeholder="Small input" />
      <Input label="Base" placeholder="Base input (default)" />
      <Input size="lg" label="Large" placeholder="Large input" />
    </div>
  );
}

export function InputDisabledDemo() {
  return <Input label="Disabled field" placeholder="Cannot edit" disabled />;
}

export function InputBareDemo() {
  return <Input placeholder="Search..." aria-label="Search products" />;
}

/** Input without a visible label, showing error and description via `aria-label`. */
export function InputErrorWithoutLabelDemo() {
  return (
    <div class="flex flex-col gap-4">
      <Input
        aria-label="Hostname"
        placeholder="example.com"
        value="not a host"
        error="Please enter a valid hostname"
      />
      <Input
        aria-label="Path"
        placeholder="/api/v1/users"
        value="missing-slash"
        error={{ message: "Path must start with /", match: true }}
      />
    </div>
  );
}

/** Side-by-side comparison: Keeper shows its icon on the default input but not the ignored one. */
export function InputPasswordManagerIgnoreDemo() {
  return (
    <div class="flex flex-col gap-4">
      <Input
        label="API Key (default)"
        type="password"
        placeholder="sk_live_..."
      />
      <Input
        label="API Key (passwordManagerIgnore)"
        type="password"
        placeholder="sk_live_..."
        passwordManagerIgnore
      />
    </div>
  );
}

export function InputTypesDemo() {
  return (
    <div class="flex flex-col gap-4">
      <Input type="email" label="Email" placeholder="you@example.com" />
      <Input type="password" label="Password" placeholder="••••••••" />
      <Input type="number" label="Age" placeholder="18" />
      <Input type="tel" label="Phone" placeholder="+1 (555) 000-0000" />
    </div>
  );
}

export function InputOptionalFieldDemo() {
  return (
    <Input
      label="Phone Number"
      required={false}
      placeholder="+1 (555) 000-0000"
    />
  );
}

export function InputLabelTooltipDemo() {
  return (
    <Input
      label="API Key"
      labelTooltip="Find this in your dashboard under Settings > API Keys"
      placeholder="sk_live_..."
    />
  );
}

export function InputRichLabelDemo() {
  return (
    <Input
      label={
        <span>
          Email for <strong>billing</strong>
        </span>
      }
      required
      placeholder="billing@company.com"
      type="email"
    />
  );
}

/** Controlled input using Solid's native `onInput` event. */
export function InputControlledOnInputDemo() {
  const [value, setValue] = createSignal("");
  return (
    <Input
      label="With onInput"
      placeholder="Type something..."
      description={value() ? `Value: ${value()}` : "Uses e.currentTarget.value"}
      value={value()}
      onInput={(event) => setValue(event.currentTarget.value)}
    />
  );
}

/** Controlled input using `onValueChange` (Base UI convenience — gives you the string directly). */
export function InputControlledOnValueChangeDemo() {
  const [value, setValue] = createSignal("");
  return (
    <Input
      label="With onValueChange"
      placeholder="Type something..."
      description={
        value() ? `Value: ${value()}` : "Receives the value directly"
      }
      value={value()}
      onValueChange={(v) => setValue(v)}
    />
  );
}
