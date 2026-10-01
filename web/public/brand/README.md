# CONVERA Brand Assets Directory

Official logo, brandmark, and identity files for CONVERA.

### Active Brand Assets:
- `logo.png` — Canonical horizontal logo (Dark icon + CONVERA wordmark)
- `logo-white.png` — Inverted horizontal logo for dark backgrounds
- `brandmark.png` — Standalone brand emblem / icon
- `wordmark.png` — Stylized CONVERA typography mark
- `wordmark-white.png` — Inverted CONVERA typography mark
- `favicon.ico` — Web browser tab icon

### How to use in Next.js:
Any file in `web/public/brand/` is automatically accessible in your React components as:
```tsx
<img src="/brand/logo.png" alt="CONVERA Logo" className="h-8 w-auto" />
```
