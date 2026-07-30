import { createMemo, createSignal } from "solid-js";

import { Select } from "@photon-ai/kumo-solid";

// ============================================================================
// STRESS TEST: TypeScript Generic Inference
// ============================================================================

interface User {
  id: string;
  name: string;
  email: string;
}

const users: User[] = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com" },
  { id: "2", name: "Bob Smith", email: "bob@example.com" },
  { id: "3", name: "Charlie Brown", email: "charlie@example.com" },
];

/**
 * Tests: `value={objectOrNull}` with strictNullChecks.
 * The bug caused T to infer as `never` making callbacks unusable.
 */
export function SelectStrictNullChecksDemo() {
  const [selected, setSelected] = createSignal<User | null>(null);
  const selectedLabel = createMemo(() => {
    const current = selected();
    return current ? `${current.name} (${current.email})` : "None";
  });

  return (
    <div class="space-y-4">
      <Select<User>
        label="Select User (Object | Null)"
        placeholder="Choose a user..."
        value={selected()}
        onValueChange={(value) => {
          // This callback should receive User | null, not never
          setSelected(value);
        }}
        renderValue={(user) => (
          <span>
            {user.name} ({user.email})
          </span>
        )}
      >
        {users.map((user) => (
          <Select.Option value={user}>{user.name}</Select.Option>
        ))}
      </Select>

      <div class="rounded bg-kumo-tint p-3 text-sm">
        <strong>Selected:</strong> {selectedLabel()}
      </div>
    </div>
  );
}

// ============================================================================
// STRESS TEST: renderValue + placeholder interaction
// ============================================================================

interface Country {
  code: string;
  name: string;
  flag: string;
}

const countries: Country[] = [
  { code: "us", name: "United States", flag: "🇺🇸" },
  { code: "uk", name: "United Kingdom", flag: "🇬🇧" },
  { code: "de", name: "Germany", flag: "🇩🇪" },
  { code: "fr", name: "France", flag: "🇫🇷" },
  { code: "jp", name: "Japan", flag: "🇯🇵" },
];

/**
 * Tests: renderValue should NOT be called with null.
 * Placeholder should show when no value selected.
 */
export function SelectRenderValuePlaceholderDemo() {
  const [country, setCountry] = createSignal<Country | null>(null);
  const countryLabel = createMemo(() => {
    const current = country();
    return current
      ? `Selected: ${current.flag} ${current.name}`
      : "No selection (placeholder should be visible above)";
  });

  return (
    <div class="space-y-4">
      <Select<Country>
        label="Select Country"
        placeholder="Pick a country..."
        value={country()}
        onValueChange={setCountry}
        renderValue={(c) => (
          <span>
            {c.flag} {c.name}
          </span>
        )}
      >
        {countries.map((c) => (
          <Select.Option value={c}>
            {c.flag} {c.name}
          </Select.Option>
        ))}
      </Select>

      <div class="rounded bg-kumo-tint p-3 text-sm">
        <strong>Status:</strong> {countryLabel()}
      </div>
    </div>
  );
}

// ============================================================================
// STRESS TEST: items prop with { label, value } array
// ============================================================================

interface Priority {
  level: number;
  name: string;
  color: string;
}

const priorities: Priority[] = [
  { level: 1, name: "Critical", color: "text-kumo-danger" },
  { level: 2, name: "High", color: "text-kumo-warning" },
  { level: 3, name: "Medium", color: "text-kumo-default" },
  { level: 4, name: "Low", color: "text-kumo-subtle" },
];

/**
 * Tests: items prop with array of { label, value } objects.
 */
export function SelectItemsArrayDemo() {
  const [priority, setPriority] = createSignal<Priority | null>(null);
  const priorityLabel = createMemo(() => {
    const current = priority();
    return current ? `Level ${current.level}: ${current.name}` : "None";
  });

  return (
    <div class="space-y-4">
      <Select<Priority>
        label="Priority (items array)"
        placeholder="Select priority..."
        value={priority()}
        onValueChange={setPriority}
        items={priorities.map((p) => ({
          label: (
            <span class={p.color}>
              [{p.level}] {p.name}
            </span>
          ),
          value: p,
        }))}
        renderValue={(p) => (
          <span class={p.color}>
            [{p.level}] {p.name}
          </span>
        )}
      />

      <div class="rounded bg-kumo-tint p-3 text-sm">
        <strong>Selected:</strong> {priorityLabel()}
      </div>
    </div>
  );
}

// ============================================================================
// STRESS TEST: items prop with object map (string keys)
// ============================================================================

/**
 * Tests: items prop with object map + renderValue.
 */
export function SelectItemsObjectMapDemo() {
  const [status, setStatus] = createSignal<string | null>(null);

  const statusItems = {
    active: "🟢 Active",
    pending: "🟡 Pending",
    inactive: "🔴 Inactive",
    archived: { label: "📦 Archived", disabled: true },
  };

  return (
    <div class="space-y-4">
      <Select
        label="Status (object map)"
        placeholder="Select status..."
        value={status()}
        onValueChange={setStatus}
        items={statusItems}
      />

      <div class="rounded bg-kumo-tint p-3 text-sm">
        <strong>Selected:</strong> {status() || "None"}
      </div>
    </div>
  );
}

// ============================================================================
// STRESS TEST: Multiple selection mode
// ============================================================================

/**
 * Tests: multiple selection with object values.
 */
export function SelectMultipleDemo() {
  const [selectedUsers, setSelectedUsers] = createSignal<User[]>([]);

  return (
    <div class="space-y-4">
      <Select<User, true>
        label="Select Users (Multiple)"
        placeholder="Choose users..."
        multiple
        value={selectedUsers()}
        onValueChange={setSelectedUsers}
        renderValue={(users) => (
          <span>{users.map((u) => u.name).join(", ") || "None selected"}</span>
        )}
      >
        {users.map((user) => (
          <Select.Option value={user}>{user.name}</Select.Option>
        ))}
      </Select>

      <div class="rounded bg-kumo-tint p-3 text-sm">
        <strong>Selected ({selectedUsers().length}):</strong>{" "}
        {selectedUsers().length > 0
          ? selectedUsers()
              .map((u) => u.name)
              .join(", ")
          : "None"}
      </div>
    </div>
  );
}

// ============================================================================
// STRESS TEST: Controlled vs Uncontrolled
// ============================================================================

/**
 * Tests: Switching between controlled and uncontrolled modes.
 */
export function SelectControlledVsUncontrolledDemo() {
  const [controlled, setControlled] = createSignal<string | null>(null);
  const [isControlled, setIsControlled] = createSignal(true);

  return (
    <div class="space-y-4">
      <div class="flex items-center gap-2">
        <label class="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isControlled()}
            onInput={(e) => setIsControlled(e.target.checked)}
          />
          Controlled mode
        </label>
      </div>

      {isControlled() ? (
        <Select
          label="Controlled Select"
          placeholder="Select a fruit..."
          value={controlled()}
          onValueChange={setControlled}
          items={{
            apple: "Apple",
            banana: "Banana",
            cherry: "Cherry",
          }}
        />
      ) : (
        <Select
          label="Uncontrolled Select"
          placeholder="Select a fruit..."
          defaultValue="banana"
          items={{
            apple: "Apple",
            banana: "Banana",
            cherry: "Cherry",
          }}
        />
      )}

      <div class="rounded bg-kumo-tint p-3 text-sm">
        {isControlled() ? (
          <>
            <strong>Controlled value:</strong> {controlled() || "None"}
          </>
        ) : (
          <span class="text-kumo-subtle">
            Uncontrolled mode - state managed internally
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// STRESS TEST: Groups and Separators
// ============================================================================

/**
 * Tests: Grouped options with separators.
 */
export function SelectGroupedOptionsDemo() {
  const [selected, setSelected] = createSignal<string | null>(null);

  return (
    <div class="space-y-4">
      <Select
        label="Grouped Options"
        placeholder="Select an option..."
        value={selected()}
        onValueChange={setSelected}
      >
        <Select.Group>
          <Select.GroupLabel>Fruits</Select.GroupLabel>
          <Select.Option value="apple">Apple</Select.Option>
          <Select.Option value="banana">Banana</Select.Option>
          <Select.Option value="cherry">Cherry</Select.Option>
        </Select.Group>
        <Select.Separator />
        <Select.Group>
          <Select.GroupLabel>Vegetables</Select.GroupLabel>
          <Select.Option value="carrot">Carrot</Select.Option>
          <Select.Option value="broccoli">Broccoli</Select.Option>
          <Select.Option value="spinach">Spinach</Select.Option>
        </Select.Group>
      </Select>

      <div class="rounded bg-kumo-tint p-3 text-sm">
        <strong>Selected:</strong> {selected() || "None"}
      </div>
    </div>
  );
}

// ============================================================================
// STRESS TEST: Error and Description states
// ============================================================================

/**
 * Tests: Field integration with error and description together.
 * The Field component treats description and error as mutually exclusive —
 * when an error is present, it replaces the description in the UI.
 * This stress test verifies that toggling between the two states works correctly.
 */
export function SelectFieldIntegrationDemo() {
  const [value, setValue] = createSignal<string | null>(null);
  const [showError, setShowError] = createSignal(false);

  return (
    <div class="space-y-4">
      <div class="flex items-center gap-2">
        <label class="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showError()}
            onInput={(e) => setShowError(e.target.checked)}
          />
          Show validation error
        </label>
      </div>

      <Select
        label="Required Field"
        placeholder="This field is required..."
        required
        value={value()}
        onValueChange={setValue}
        description="Please select an option from the list."
        error={showError() && !value() ? "This field is required" : undefined}
        labelTooltip="This is a helpful tooltip explaining the field."
        items={{
          option1: "Option 1",
          option2: "Option 2",
          option3: "Option 3",
        }}
      />

      <div class="rounded bg-kumo-tint p-3 text-sm">
        <strong>Value:</strong> {value() || "None"} | <strong>Valid:</strong>{" "}
        {value() ? "Yes" : "No"}
      </div>
    </div>
  );
}

// ============================================================================
// STRESS TEST: Size variants
// ============================================================================

/**
 * Tests: All size variants render correctly.
 */
export function SelectSizeVariantsDemo() {
  const items = { a: "Option A", b: "Option B", c: "Option C" };

  return (
    <div class="space-y-4">
      <Select
        size="xs"
        label="Extra Small (xs)"
        placeholder="xs size"
        items={items}
      />
      <Select
        size="sm"
        label="Small (sm)"
        placeholder="sm size"
        items={items}
      />
      <Select
        size="base"
        label="Base (default)"
        placeholder="base size"
        items={items}
      />
      <Select
        size="lg"
        label="Large (lg)"
        placeholder="lg size"
        items={items}
      />
    </div>
  );
}

// ============================================================================
// STRESS TEST: Loading state
// ============================================================================

/**
 * Tests: Loading state shows skeleton.
 */
export function SelectLoadingStateDemo() {
  const [loading, setLoading] = createSignal(true);

  return (
    <div class="space-y-4">
      <div class="flex items-center gap-2">
        <label class="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={loading()}
            onInput={(e) => setLoading(e.target.checked)}
          />
          Loading state
        </label>
      </div>

      <Select
        label="Data Loading"
        placeholder="Select when loaded..."
        loading={loading()}
        items={{
          data1: "Loaded Data 1",
          data2: "Loaded Data 2",
          data3: "Loaded Data 3",
        }}
      />
    </div>
  );
}

// ============================================================================
// STRESS TEST: Disabled options
// ============================================================================

/**
 * Tests: Individual disabled options.
 */
export function SelectDisabledOptionsDemo() {
  const [value, setValue] = createSignal<string | null>(null);

  return (
    <div class="space-y-4">
      <Select
        label="With Disabled Options"
        placeholder="Select an option..."
        value={value()}
        onValueChange={setValue}
        items={{
          available1: "Available Option 1",
          disabled1: { label: "Disabled Option 1", disabled: true },
          available2: "Available Option 2",
          disabled2: { label: "Disabled Option 2", disabled: true },
          available3: "Available Option 3",
        }}
      />

      <div class="rounded bg-kumo-tint p-3 text-sm">
        <strong>Selected:</strong> {value() || "None"}
      </div>
    </div>
  );
}

// ============================================================================
// STRESS TEST: No explicit generic (inference test)
// ============================================================================

/**
 * Tests: TypeScript inference without explicit generic parameter.
 */
export function SelectInferenceDemo() {
  // No explicit type - should infer from items
  const [value, setValue] = createSignal<string | null>(null);

  return (
    <div class="space-y-4">
      <Select
        label="Inferred Types"
        placeholder="Select..."
        value={value()}
        onValueChange={(v) => {
          // v should be inferred correctly
          setValue(v);
        }}
        items={{
          foo: "Foo",
          bar: "Bar",
          baz: "Baz",
        }}
      />

      <div class="rounded bg-kumo-tint p-3 text-sm">
        <strong>Inferred value:</strong> {value() || "None"}
      </div>
    </div>
  );
}
