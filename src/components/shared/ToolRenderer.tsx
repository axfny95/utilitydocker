import { Suspense } from 'react';
import { getToolComponent } from '../../lib/tool-registry';

interface Props {
  componentName: string;
  toolSlug: string;
}

export default function ToolRenderer({ componentName, toolSlug }: Props) {
  const ToolComponent = getToolComponent(componentName);

  return (
    <Suspense fallback={<div className="tool-skeleton h-64 rounded-lg" />}>
      <ToolComponent toolSlug={toolSlug} />
    </Suspense>
  );
}
