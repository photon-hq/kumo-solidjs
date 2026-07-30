import { ShikiProvider } from "@photon-ai/kumo-solid/code";
import { Text } from "@photon-ai/kumo-solid";
import { designTips } from "./design-tips";
import { DesignTip } from "./DesignTip";

export interface RenderedDesignTip {
  title: string;
  description?: string;
}

interface DesignTipsProps {
  renderedTips: RenderedDesignTip[];
}

interface MarkdownProps {
  html: string;
}

function Markdown({ html }: MarkdownProps) {
  return <span innerHTML={html} />;
}

export function DesignTips({ renderedTips }: DesignTipsProps) {
  return (
    <ShikiProvider engine="javascript" languages={["tsx"]}>
      {designTips.map((tip, tipIndex) => {
        const renderedTip = renderedTips[tipIndex];
        const orientation = tip.orientation ?? "horizontal";

        return (
          <DesignTip id={tip.id}>
            <DesignTip.Title>
              <span class="flex items-baseline gap-1.5">
                <Text
                  variant="secondary"
                  DANGEROUS_className="text-xl font-semibold hidden md:block"
                  as="span"
                >
                  {tipIndex + 1}.
                </Text>
                <Markdown html={renderedTip.title} />
              </span>
            </DesignTip.Title>
            {renderedTip.description ? (
              <DesignTip.Description>
                <Markdown html={renderedTip.description} />
              </DesignTip.Description>
            ) : null}
            <DesignTip.Examples orientation={orientation}>
              {tip.examples.map((example) => (
                <DesignTip.Example variant={example.variant}>
                  {example.jsx()}
                </DesignTip.Example>
              ))}
            </DesignTip.Examples>
          </DesignTip>
        );
      })}
    </ShikiProvider>
  );
}
