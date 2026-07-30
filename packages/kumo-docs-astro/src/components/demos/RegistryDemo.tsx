import { createMemo, createSignal, type Component } from "solid-js";

import { kumoRegistryJson } from "virtual:kumo-registry";

// Types for the registry
interface PropInfo {
  type: string;
  optional?: boolean;
  required?: boolean;
  values?: string[];
  descriptions?: Record<string, string>;
  default?: string;
  description?: string;
}

interface SubComponent {
  description?: string;
  props?: Record<string, PropInfo>;
  renderElement?: string;
}

interface ComponentInfo {
  name: string;
  description: string;
  importPath: string;
  category: string;
  props: Record<string, PropInfo>;
  examples: string[];
  colors: string[];
  subComponents?: Record<string, SubComponent>;
}

interface ComponentRegistry {
  version: string;
  components: Record<string, ComponentInfo>;
  search: {
    byName: string[];
    byCategory: Record<string, string[]>;
  };
}

const registry = kumoRegistryJson as unknown as ComponentRegistry;

const ComponentCard: Component<{
  component: ComponentInfo;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ component, isExpanded, onToggle }) => {
  // Get variant props (props with values array)
  const variantProps = Object.entries(component.props).filter(
    ([, prop]) => prop.values && prop.values.length > 0,
  );

  return (
    <div class="rounded-lg border border-kumo-hairline bg-kumo-base">
      <button
        type="button"
        onClick={onToggle}
        class="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-kumo-overlay"
      >
        <div>
          <h3 class="font-semibold text-kumo-default">{component.name}</h3>
          <p class="mt-1 text-sm text-kumo-subtle">{component.description}</p>
        </div>
        <span class="ml-4 text-kumo-subtle">{isExpanded ? "−" : "+"}</span>
      </button>

      {isExpanded && (
        <div class="border-t border-kumo-hairline p-4">
          {/* Import */}
          <div class="mb-4">
            <h4 class="mb-2 text-xs font-medium text-kumo-subtle uppercase">
              Import
            </h4>
            <code class="block rounded bg-kumo-overlay p-2 text-xs">
              import {"{"} {component.name} {"}"} from "{component.importPath}";
            </code>
          </div>

          {/* Variants */}
          {variantProps.length > 0 && (
            <div class="mb-4">
              <h4 class="mb-2 text-xs font-medium text-kumo-subtle uppercase">
                Variants
              </h4>
              <div class="space-y-2">
                {variantProps.map(([propName, prop]) => (
                  <div>
                    <span class="font-mono text-sm text-kumo-default">
                      {propName}
                    </span>
                    {prop.default && (
                      <span class="ml-2 text-xs text-kumo-subtle">
                        (default: {prop.default})
                      </span>
                    )}
                    <div class="mt-1 flex flex-wrap gap-1">
                      {prop.values?.map((value) => (
                        <span class="rounded bg-kumo-overlay px-2 py-0.5 text-xs text-kumo-default">
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-components */}
          {component.subComponents &&
            Object.keys(component.subComponents).length > 0 && (
              <div class="mb-4">
                <h4 class="mb-2 text-xs font-medium text-kumo-subtle uppercase">
                  Sub-components
                </h4>
                <div class="flex flex-wrap gap-1">
                  {Object.keys(component.subComponents).map((subName) => (
                    <span class="rounded bg-kumo-overlay px-2 py-0.5 text-xs text-kumo-default">
                      {component.name}.{subName}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {/* Colors */}
          {component.colors && component.colors.length > 0 && (
            <div>
              <h4 class="mb-2 text-xs font-medium text-kumo-subtle uppercase">
                Semantic Tokens
              </h4>
              <div class="flex flex-wrap gap-1">
                {component.colors.map((color) => (
                  <span class="rounded bg-kumo-overlay px-2 py-0.5 text-xs text-kumo-default">
                    {color}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const ComponentRegistryView: Component = () => {
  const [expandedComponent, setExpandedComponent] = createSignal<string | null>(
    null,
  );
  const [selectedCategory, setSelectedCategory] = createSignal<string | null>(
    null,
  );

  const categories = createMemo(() => {
    return Object.keys(registry.search.byCategory).sort();
  });

  const filteredComponents = createMemo(() => {
    const components = Object.values(registry.components);
    if (!selectedCategory())
      return components.sort((a, b) => a.name.localeCompare(b.name));
    return components
      .filter((c) => c.category === selectedCategory())
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  const toggleComponent = (name: string) => {
    setExpandedComponent((current) => (current === name ? null : name));
  };

  return (
    <div class="flex flex-col gap-6">
      {/* Stats */}
      <div class="flex flex-wrap gap-4 text-sm">
        <div class="rounded-lg border border-kumo-hairline bg-kumo-base px-4 py-2">
          <span class="font-semibold text-kumo-default">
            {Object.keys(registry.components).length}
          </span>
          <span class="ml-1 text-kumo-subtle">components</span>
        </div>
        <div class="rounded-lg border border-kumo-hairline bg-kumo-base px-4 py-2">
          <span class="font-semibold text-kumo-default">
            {categories().length}
          </span>
          <span class="ml-1 text-kumo-subtle">categories</span>
        </div>
        <div class="rounded-lg border border-kumo-hairline bg-kumo-base px-4 py-2">
          <span class="text-kumo-subtle">v</span>
          <span class="font-semibold text-kumo-default">
            {registry.version}
          </span>
        </div>
      </div>

      {/* Category Filter */}
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedCategory(null)}
          class={`rounded-full px-3 py-1 text-sm transition-colors ${
            selectedCategory() === null
              ? "bg-kumo-brand text-white"
              : "bg-kumo-overlay text-kumo-default hover:bg-kumo-recessed"
          }`}
        >
          All
        </button>
        {categories().map((category) => (
          <button
            type="button"
            onClick={() => setSelectedCategory(category)}
            class={`rounded-full px-3 py-1 text-sm transition-colors ${
              selectedCategory() === category
                ? "bg-kumo-brand text-white"
                : "bg-kumo-overlay text-kumo-default hover:bg-kumo-recessed"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Component List */}
      <div class="space-y-2">
        {filteredComponents().map((component) => (
          <ComponentCard
            component={component}
            isExpanded={expandedComponent() === component.name}
            onToggle={() => toggleComponent(component.name)}
          />
        ))}
      </div>
    </div>
  );
};
