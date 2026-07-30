import { createSignal } from "solid-js";

import { MenuBar } from "@photon-ai/kumo-solid";
import { TextBolderIcon, TextItalicIcon } from "~/components/icons";

export function MenuBarBasicDemo() {
  const [active, setActive] = createSignal<string | undefined>("bold");

  return (
    <MenuBar
      isActive={active()}
      optionIds
      options={[
        {
          icon: <TextBolderIcon />,
          id: "bold",
          tooltip: "Bold",
          onClick: () => setActive(active() === "bold" ? undefined : "bold"),
        },
        {
          icon: <TextItalicIcon />,
          id: "italic",
          tooltip: "Italic",
          onClick: () =>
            setActive(active() === "italic" ? undefined : "italic"),
        },
      ]}
    />
  );
}

export function MenuBarTextFormattingDemo() {
  const [active, setActive] = createSignal<string | undefined>("bold");

  return (
    <MenuBar
      isActive={active()}
      optionIds
      options={[
        {
          icon: <TextBolderIcon />,
          id: "bold",
          tooltip: "Bold",
          onClick: () => setActive(active() === "bold" ? undefined : "bold"),
        },
        {
          icon: <TextItalicIcon />,
          id: "italic",
          tooltip: "Italic",
          onClick: () =>
            setActive(active() === "italic" ? undefined : "italic"),
        },
      ]}
    />
  );
}

export function MenuBarNoActiveDemo() {
  const [active, setActive] = createSignal<string | undefined>(undefined);

  return (
    <MenuBar
      isActive={active()}
      optionIds
      options={[
        {
          icon: <TextBolderIcon />,
          id: "bold",
          tooltip: "Bold",
          onClick: () => setActive(active() === "bold" ? undefined : "bold"),
        },
        {
          icon: <TextItalicIcon />,
          id: "italic",
          tooltip: "Italic",
          onClick: () =>
            setActive(active() === "italic" ? undefined : "italic"),
        },
      ]}
    />
  );
}
