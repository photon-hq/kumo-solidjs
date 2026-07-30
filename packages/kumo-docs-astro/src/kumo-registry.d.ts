/**
 * Type declarations for virtual:kumo-registry module.
 * Provides component registry data from the AI metadata.
 */
declare module "virtual:kumo-registry" {
  /** Component registry markdown content for documentation */
  export const kumoRegistryMarkdown: string;

  /** Typed component registry JSON */
  export const kumoRegistryJson: import("./lib/registry-types").ComponentRegistry;
}
