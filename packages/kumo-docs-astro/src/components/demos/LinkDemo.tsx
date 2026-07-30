import type { JSX } from "solid-js";
import { Link } from "@photon-ai/kumo-solid";

export function LinkBasicDemo() {
  return (
    <div class="grid gap-x-6 gap-y-4 text-base md:grid-cols-3">
      <Link href="#">Default inline link</Link>
      <Link href="#" variant="current">
        Current color link
      </Link>
      <Link href="#" variant="plain">
        Plain inline link
      </Link>
    </div>
  );
}

export function LinkInParagraphDemo() {
  return (
    <p class="mx-auto max-w-md text-base leading-relaxed text-kumo-default">
      This is a paragraph with an <Link href="#">inline link</Link> that flows
      naturally with the surrounding text. Links maintain proper underline
      offset for readability.
    </p>
  );
}

export function LinkExternalDemo() {
  return (
    <Link
      href="https://cloudflare.com"
      target="_blank"
      rel="noopener noreferrer"
      className="text-base"
    >
      Visit Cloudflare <Link.ExternalIcon />
    </Link>
  );
}

export function LinkCurrentVariantDemo() {
  return (
    <p class="text-base text-kumo-danger">
      This error message contains a{" "}
      <Link href="#" variant="current">
        link
      </Link>{" "}
      that inherits the red color from its parent.
    </p>
  );
}

// Helper component simulating a framework link (for example, Solid Router's A)
const CustomRouterLink = ({
  children,
  ...props
}: JSX.AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <a data-custom-router-link {...props}>
    {children}
  </a>
);

export function LinkRenderDemo() {
  return (
    <div class="flex flex-col gap-x-6 gap-y-4 text-base md:flex-row">
      <Link
        render={(renderProps) => (
          <CustomRouterLink {...renderProps} href="/dashboard" />
        )}
        variant="inline"
      >
        Dashboard (via render)
      </Link>
      <Link
        render={(renderProps) => (
          <CustomRouterLink
            {...renderProps}
            href="https://developers.cloudflare.com"
            target="_blank"
            rel="noopener noreferrer"
          />
        )}
        variant="inline"
      >
        Cloudflare Docs <Link.ExternalIcon />
      </Link>
    </div>
  );
}
