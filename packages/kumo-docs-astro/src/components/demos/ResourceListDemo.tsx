import { Surface, Code } from "@photon-ai/kumo-solid";
import { DatabaseIcon } from "~/components/icons";
import { ResourceListPage } from "../kumo/resource-list/resource-list";

export function ResourceListBasicDemo() {
  return (
    <ResourceListPage
      className="min-h-[400px]"
      title="Databases"
      description="Manage your database instances and configurations"
      icon={<DatabaseIcon size={32} className="text-kumo-subtle" />}
    >
      <Surface className="p-6">
        <p>Main content area - your resource list would go here</p>
      </Surface>
    </ResourceListPage>
  );
}

export function ResourceListWithUsageDemo() {
  return (
    <ResourceListPage
      className="min-h-[400px]"
      title="API Keys"
      description="Create and manage API keys for your applications"
      usage={
        <Surface className="p-4">
          <h3 class="mb-2 font-semibold">Quick Start</h3>
          <p class="mb-3 text-sm text-kumo-subtle">
            Generate an API key to authenticate your requests
          </p>
          <Code
            lang="bash"
            code='curl -H "Authorization: Bearer YOUR_API_KEY" https://api.example.com'
          />
        </Surface>
      }
    >
      <Surface className="p-6">
        <p>API keys list would appear here</p>
      </Surface>
    </ResourceListPage>
  );
}

export function ResourceListCompleteDemo() {
  return (
    <ResourceListPage
      className="min-h-[400px]"
      title="KV Namespaces"
      description="Store key-value data globally with low-latency access"
      icon={<DatabaseIcon size={32} className="text-kumo-subtle" />}
      usage={
        <Surface className="p-4">
          <h3 class="mb-2 font-semibold">Usage Example</h3>
          <Code
            lang="ts"
            code={`// Read from KV
const value = await KV.get('key');

// Write to KV
await KV.put('key', 'value');`}
          />
        </Surface>
      }
      additionalContent={
        <Surface className="p-4">
          <h3 class="mb-2 font-semibold">Learn More</h3>
          <p class="text-sm text-kumo-subtle">
            Check out our documentation to learn more about KV storage.
          </p>
        </Surface>
      }
    >
      <div class="space-y-4">
        <Surface className="p-6">
          <h4 class="mb-2 font-semibold">production-kv</h4>
          <p class="text-sm text-kumo-subtle">Created 2 days ago</p>
        </Surface>
        <Surface className="p-6">
          <h4 class="mb-2 font-semibold">staging-kv</h4>
          <p class="text-sm text-kumo-subtle">Created 1 week ago</p>
        </Surface>
      </div>
    </ResourceListPage>
  );
}
