import { Button } from "./button";

<Button>Save</Button>;
<Button shape="square" aria-label="Add" />;
<Button shape="circle" aria-labelledby="add-label" />;
<Button shape="square" title="Add" />;

// @ts-expect-error Icon-only square buttons require an accessible name.
<Button shape="square" />;

// @ts-expect-error Icon-only circle buttons require an accessible name.
<Button shape="circle" />;
