# ADR-003: React PWA Over React Native

**Status:** Proposed
**Date:** 2026-01-04
**Deciders:** Development Team

---

## Context

We need a mobile-friendly player application. The options are:

1. **React PWA** - Progressive Web App using React
2. **React Native** - Native mobile app
3. **Flutter** - Cross-platform native app
4. **Native iOS/Android** - Separate native apps

---

## Decision

**We will build a React PWA.**

The Player app will be a Progressive Web App built with:
- React 19 (same as Editor)
- Vite for bundling
- Service Worker for offline
- Web APIs for GPS and camera

---

## Rationale

### Feature Comparison

| Feature | PWA | React Native |
|---------|-----|--------------|
| **GPS/Location** | Geolocation API | Native (better accuracy) |
| **Camera** | MediaDevices API | Native (more features) |
| **QR Access** | Direct (no download) | App store download |
| **Offline** | Service Worker | Native storage |
| **Push Notifications** | Web Push (iOS 16.4+) | Native |
| **Installation** | Add to Home Screen | App store |

### Development Comparison

| Factor | PWA | React Native |
|--------|-----|--------------|
| **Time to market** | Faster | Slower |
| **Code sharing with Editor** | Maximum | Moderate |
| **Learning curve** | None (same stack) | Moderate |
| **Build complexity** | Vite | Metro + native builds |
| **Testing** | Browser DevTools | Emulators + devices |
| **Deployment** | Static hosting | App stores |

### HuntHub-Specific Considerations

| Requirement | PWA Capability | Verdict |
|-------------|----------------|---------|
| GPS for location challenges | 10-30m accuracy | **Sufficient** |
| Photo capture for missions | MediaDevices API | **Good** |
| QR code scanning | Direct browser access | **Excellent** |
| Offline play | Service Worker + IndexedDB | **Good** |
| Push notifications | Web Push API | **Good** (iOS 16.4+) |

---

## Consequences

### Positive
- **Faster development** - Same React stack, no new tools
- **Maximum code sharing** - SDK components work in both apps
- **No app store** - QR code opens directly in browser
- **Simpler deployment** - Static files to CDN
- **Easier updates** - No app store review

### Negative
- **GPS accuracy** - Web API is 10-30m, native is 5-10m
- **Camera features** - No access to native camera controls
- **iOS limitations** - Some PWA features limited on iOS
- **No app store presence** - Discoverability

### Mitigation for Negatives
- Use generous radius (50m) for location validation
- Basic photo capture is sufficient for MVP
- iOS 17+ has improved PWA support
- QR codes are the primary discovery mechanism anyway

---

## PWA Features We'll Use

### 1. Service Worker (Offline Support)

```javascript
// sw.js - Service Worker
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

### 2. Web App Manifest

```json
{
  "name": "HuntHub Player",
  "short_name": "HuntHub",
  "start_url": "/play",
  "display": "standalone",
  "theme_color": "#FF6B6B",
  "background_color": "#FFFFFF",
  "icons": [...]
}
```

### 3. Geolocation API

```typescript
const { coords, error } = useGeolocation({
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
});
```

### 4. MediaDevices API

```typescript
const stream = await navigator.mediaDevices.getUserMedia({
  video: { facingMode: 'environment' }
});
```

---

## Future Option: Capacitor

If native features become critical, we can wrap the PWA in Capacitor:

```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add ios
npx cap add android
```

This provides:
- Native GPS with better accuracy
- Native camera with more controls
- App store distribution
- Push notifications via native APIs

**Estimated effort:** 1-2 days to wrap existing PWA.

---

## Alternatives Considered

### React Native (Rejected for MVP)
**Pros:**
- Better native integration
- App store presence
- Native performance

**Rejected because:**
- Longer development time
- Different build toolchain
- Separate deployment process
- QR → app store → download → open is worse UX than QR → browser

### Flutter (Rejected)
**Rejected because:**
- Different language (Dart)
- No code sharing with React frontend
- Learning curve

### Native iOS/Android (Rejected)
**Rejected because:**
- Two separate codebases
- Longest development time
- Most expensive to maintain

---

## Decision Checklist

- [x] GPS works in browser → Yes, Geolocation API
- [x] Camera works in browser → Yes, MediaDevices API
- [x] Can work offline → Yes, Service Worker
- [x] Can be installed → Yes, Add to Home Screen
- [x] Shares code with Editor → Yes, same React stack
- [x] Fast time to market → Yes, no new tooling

---

## References

- [PWA vs React Native in 2025](https://flatirons.com/blog/pwa-vs-react-native/)
- [What Web Can Do Today](https://whatwebcando.today/)
- [Capacitor Documentation](https://capacitorjs.com/docs)