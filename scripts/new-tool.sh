#!/bin/bash
# Usage: ./scripts/new-tool.sh <slug> <ComponentName> <category>
# Example: ./scripts/new-tool.sh base64-encoder Base64Encoder "Developer Tools"

set -e

SLUG="$1"
COMPONENT="$2"
CATEGORY="$3"

if [ -z "$SLUG" ] || [ -z "$COMPONENT" ] || [ -z "$CATEGORY" ]; then
  echo "Usage: ./scripts/new-tool.sh <slug> <ComponentName> <category>"
  echo "Example: ./scripts/new-tool.sh base64-encoder Base64Encoder \"Developer Tools\""
  exit 1
fi

TOOL_DIR="src/content/tools"
COMP_DIR="src/components/tools"
REGISTRY="src/lib/tool-registry.ts"
TODAY=$(date +%Y-%m-%d)

# Create MDX content file
if [ -f "$TOOL_DIR/$SLUG.mdx" ]; then
  echo "Error: $TOOL_DIR/$SLUG.mdx already exists"
  exit 1
fi

cat > "$TOOL_DIR/$SLUG.mdx" << EOF
---
title: "${COMPONENT}"
description: "TODO: Write a 155-character description for SEO."
category: "${CATEGORY}"
icon: "wrench"
component: "${COMPONENT}"
keywords: ["${SLUG}"]
featured: false
premium: false
relatedTools: []
faq:
  - question: "TODO: Add FAQ question"
    answer: "TODO: Add FAQ answer"
howTo:
  steps:
    - name: "Step 1"
      text: "TODO: Describe step 1"
    - name: "Step 2"
      text: "TODO: Describe step 2"
    - name: "Step 3"
      text: "TODO: Describe step 3"
publishedAt: ${TODAY}
estimatedTime: "Instant"
---

## TODO: Write SEO Content

Add 500-1000 words of unique content here.
EOF

echo "Created $TOOL_DIR/$SLUG.mdx"

# Create React component
if [ -f "$COMP_DIR/$COMPONENT.tsx" ]; then
  echo "Error: $COMP_DIR/$COMPONENT.tsx already exists"
  exit 1
fi

cat > "$COMP_DIR/$COMPONENT.tsx" << EOF
import { useState } from 'react';

export default function ${COMPONENT}() {
  return (
    <div className="space-y-4">
      <p className="text-surface-500">TODO: Implement ${COMPONENT}</p>
    </div>
  );
}
EOF

echo "Created $COMP_DIR/$COMPONENT.tsx"

# Add to registry
if grep -q "$COMPONENT" "$REGISTRY"; then
  echo "Warning: $COMPONENT already in registry"
else
  # Insert before the closing brace of the registry object
  sed -i '' "s|^};|  ${COMPONENT}: () => import('../components/tools/${COMPONENT}'),\n};|" "$REGISTRY"
  echo "Added $COMPONENT to $REGISTRY"
fi

echo ""
echo "Done! Next steps:"
echo "  1. Edit $COMP_DIR/$COMPONENT.tsx — implement the tool"
echo "  2. Edit $TOOL_DIR/$SLUG.mdx — write SEO content, FAQ, and description"
echo "  3. Run 'npm run dev' to preview"
