import { Text } from "./text";

const _headingH1 = (
  <Text variant="heading1" as="h1">
    Page title
  </Text>
);
const _headingH2 = (
  <Text variant="heading2" as="h2">
    Section title
  </Text>
);
const _decorativeHeading = (
  <Text variant="heading3" as="span">
    Decorative heading
  </Text>
);
const _body = <Text>Body copy</Text>;
const _bodyInline = <Text as="span">Inline body</Text>;
const _mono = <Text variant="mono">console.log()</Text>;
const _monoLarge = (
  <Text variant="mono" size="lg">
    console.log()
  </Text>
);

// @ts-expect-error Heading variants require an explicit semantic element.
const _missingHeadingElement = <Text variant="heading1">Heading</Text>;

const _sizedHeading = (
  // @ts-expect-error Heading variants do not accept body-copy sizes.
  <Text variant="heading2" as="h2" size="sm">
    Heading
  </Text>
);

const _smallMono = (
  // @ts-expect-error Monospace variants only support the optically adjusted lg size.
  <Text variant="mono" size="sm">
    Code
  </Text>
);

export const __typeSpec = {
  _headingH1,
  _headingH2,
  _decorativeHeading,
  _body,
  _bodyInline,
  _mono,
  _monoLarge,
  _missingHeadingElement,
  _sizedHeading,
  _smallMono,
};
