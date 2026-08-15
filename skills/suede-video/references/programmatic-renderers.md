# Programmatic Renderers: React Path and Renderer Selection

Read this when the repo already uses React, or when a renderer choice between an
HTML/CSS path and a React path has to be justified before any install
authorization is requested. The HTML/CSS example and both authorization gates
live in SKILL.md; this file only carries the React sample and the selection
table.

---

## React renderer sample

Remotion may fit a React-based workflow. Verify the installed or callable
version, current documentation, license, rendering path, and hosting cost before
recommending it. React components express timed visuals and props drive
content; confirm whether rendering is local or uses an authorized hosted
renderer.

```tsx
export const ProductDemo: React.FC<{ title: string; features: string[] }> = ({
  title, features
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#000", color: "#fff" }}>
      <h1>{title}</h1>
      {features.map((f, i) => (
        <Sequence from={i * 30} key={i}>
          <p>{f}</p>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
```

**Candidate fit:** complex animation, interactive previews, or batch rendering
when the verified runtime supports them.

---

## When to Pick Which

| Factor | HTML/CSS renderer | React renderer |
|--------|-------------------|----------------|
| Existing stack | Browser and CSS capability | React and renderer capability |
| Animation needs | Test required transitions | Test required timeline primitives |
| Batch rendering | Verify local or hosted path | Verify local or hosted path |
| Team fit | Inspect maintainability in this repo | Inspect maintainability in this repo |
| Rights and cost | Verify current license and runtime cost | Verify current license and runtime cost |

Neither column is a default. Pick the renderer the repo can already run, and
record the evidence for that call in the handoff.
