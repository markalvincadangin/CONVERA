# RatchetAI Brand Assets Directory

Place your official logo, brandmark, and icon files here.

### Recommended File Naming:
- `logo.svg` or `logo.png` — Full horizontal logo (Icon + RatchetAI wordmark)
- `brandmark.svg` or `brandmark.png` — Standalone brand icon / symbol
- `favicon.ico` / `icon.png` — Web browser tab icon

### How to use in Next.js:
Any file in `web/public/brand/` is automatically accessible in your React components as:
```tsx
<img src="/brand/logo.png" alt="RatchetAI Logo" className="w-8 h-8" />
```
