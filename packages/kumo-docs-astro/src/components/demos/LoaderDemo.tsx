import { Loader } from "@photon-ai/kumo-solid";

export function LoaderBasicDemo() {
  return <Loader />;
}

export function LoaderSizesDemo() {
  return (
    <div class="flex items-center gap-4">
      <Loader size="sm" />
      <Loader size="base" />
      <Loader size="lg" />
    </div>
  );
}

export function LoaderCustomSizeDemo() {
  return <Loader size={24} />;
}

/** Shows how to change the loader color using className */
export function LoaderCustomColorDemo() {
  return <Loader className="text-kumo-subtle" />;
}
