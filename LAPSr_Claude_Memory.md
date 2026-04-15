# LAPSr — Claude Memory Document

## What Is This Project

LAPSr is a React Native (Expo) iOS app for IT administrators. It lets them look up **LAPS passwords** and **BitLocker recovery keys** for Windows devices managed by Microsoft Intune/Entra ID. Users sign in with their Microsoft work account (via MSAL) and retrieve credentials on the go. The goal is App Store distribution — eventually paid/enterprise. No servers, no Lauren-owned infrastructure. All auth and data lives in Microsoft's stack.

**Owner:** Lauren Grassano — lgrassano1029@gmail.com
**Bundle ID:** `com.laurengrassano.lapsr`
**Repo location:** `/Users/laurengrassano/...` (workspace folder mounted in Cowork)

---

## Tech Stack

- **Expo SDK 55** — dev build (NOT Expo Go; uses native modules)
- **React Native 0.83.2** / **React 19.2**
- **TypeScript ~5.9**
- **React Navigation 7** — native stack + bottom tabs
- **react-native-msal 4.x** — Microsoft authentication (MSAL)
- **Axios** + request interceptor that injects Bearer tokens from MSAL
- **Zustand 5** — state management (`authStore`, `deviceStore`)
- **NativeWind 4** (Tailwind for RN) — styling
- **expo-secure-store** — session timestamp storage for timeout enforcement
- **expo-clipboard**, **react-native-svg**, **@expo/vector-icons (Ionicons)**
- **Hermes JS engine** — note: `Buffer` not available; use `atob()` for base64
- **expo-local-authentication** — in dependencies (biometrics, not yet wired)

---

## Azure / Entra Configuration

| Key | Value |
|-----|-------|
| Client ID | `69f93ae6-11ca-4fbe-b486-ebcd3bcb113c` |
| Tenant ID (test) | `a85de100-0171-4931-b322-c2dfb388c78d` |
| Redirect URI | `msauth.com.laurengrassano.lapsr://auth` |
| Bundle ID | `com.laurengrassano.lapsr` |

**Delegated Graph permissions:**
- `DeviceLocalCredential.Read.All` — LAPS passwords
- `Device.Read.All` — device listing/search
- `User.Read.All` — user listing/search
- `BitLockerKey.ReadBasic.All` — list BitLocker key IDs
- `BitLockerKey.Read.All` — retrieve actual recovery key values

Secrets (`MSAL_CLIENT_ID`, `MSAL_TENANT_ID`) are in `.env` (gitignored). `app.config.js` reads them via `process.env` and injects into `Constants.expoConfig.extra`.

---

## File Structure

```
lapsapp/
  app.config.js           Dynamic Expo config — reads from .env
  metro.config.js         Bundle obfuscation (Hermes bytecode + mangle + drop_console)
  babel.config.js
  tailwind.config.js
  src/
    api/
      graphClient.ts      Axios instance, baseURL = graph.microsoft.com/v1.0, auth interceptor
      devices.ts          searchDeviceByName, searchDevicesByUser, getDeviceById, getAllDevices
      users.ts            getAllUsers, searchUsers, getUserDevices
      laps.ts             getLapsPassword(deviceId) → sorts credentials by backupDateTime desc
      bitlocker.ts        getBitLockerKeys(deviceId) → list keys then fetch each key value
    auth/
      msalConfig.ts       MSAL_CONFIG object + GRAPH_SCOPES array
      msalInstance.ts     PublicClientApplication singleton
      authHelpers.ts      getAccessToken() — acquires token silently or interactively
    store/
      authStore.ts        Zustand: isAuthenticated, username, setAuthenticated, clearAuth
      deviceStore.ts      Zustand: allDevices, searchResults, selectedDevice, lapsCredential, etc.
    hooks/
      useAppLock.ts       Session timeout (8hr) + background lock (5min) via AppState + SecureStore
    screens/
      LoginScreen.tsx     MSAL sign-in, TOS acknowledgment, jailbreak detection warning
      HomeScreen.tsx      (tab)
      DevicesScreen.tsx   All devices on mount, search by device name OR user name, pull-to-refresh
      UsersScreen.tsx     All users list, tap → UserDevicesScreen
      UserDevicesScreen   User's registered devices, tap → LapsScreen
      LapsScreen.tsx      Device detail: OS, compliance, hardware, LAPS card, BitLocker card
      SettingsScreen.tsx  Sign out, session info, link to Terms
      TermsScreen.tsx     TOS — accessible from login + settings
    components/
      DeviceListItem.tsx
      LapsPasswordCard.tsx    Reveal/hide toggle, copy button, backup date
      BitLockerKeyCard.tsx    Key ID visible, recovery key hidden with reveal/copy
      PrivacyOverlay.tsx      Covers screen in iOS app switcher / screenshots
      ErrorBanner.tsx
      LoadingOverlay.tsx
      Logo.tsx                SVG logo
    utils/
      logger.ts               Production-safe logger — suppressed when !__DEV__
      jailbreakDetection.ts   Checks canOpenURL for cydia:// and sileo://
    types/
      device.ts               Device, LapsCredential, DeviceOwner interfaces
      graph.ts                GraphDeviceResponse, GraphUserResponse, etc.
      auth.ts
  ios/
    LAPSr/Info.plist          URL scheme (msauth.com.laurengrassano.lapsr), ATS config,
                              LSApplicationQueriesSchemes (cydia, sileo)
    LAPSr/LAPSr.entitlements  Keychain: $(AppIdentifierPrefix)com.microsoft.adalcache
    LAPSr/AppDelegate.swift
```

---

## API Layer — Key Implementation Details

### graphClient.ts
Axios instance with base URL `https://graph.microsoft.com/v1.0`. Single request interceptor calls `getAccessToken()` and injects `Authorization: Bearer <token>`.

### devices.ts
- `getAllDevices()` — fetches `/devices` with `$top=100`, sorts client-side (no `$orderby`!)
- `searchDeviceByName(name)` — `/devices?$filter=startswith(displayName,'...')`, includes `ConsistencyLevel: eventual` + `$count: true`
- `searchDevicesByUser(userName)` — searches `/users` first, then fetches `/users/{id}/registeredDevices` per matched user in parallel, deduplicates
- `getDeviceById(id)` — full device detail including `$expand=registeredOwners` (safe for single device, not bulk)
- `DEVICE_SELECT` constant: `id,deviceId,displayName,operatingSystem,approximateLastSignInDateTime`

### laps.ts
- Endpoint: `GET /directory/deviceLocalCredentials/{deviceId}?$select=credentials`
- Returns array of credentials; sorts by `backupDateTime` descending, returns most recent
- Uses `deviceId` (Azure AD Device ID field), NOT the object `id`
- LAPS passwords are base64-encoded — decode with `atob()` (not `Buffer.from`, Hermes lacks it)

### bitlocker.ts
- **Correct endpoint:** `/informationProtection/bitlocker/recoveryKeys` (NOT `bitlockerRecoveryKeys`)
- Step 1: list keys with `$filter=deviceId eq '...'`, `ConsistencyLevel: eventual`, `$count: true`
- Step 2: for each key, fetch `/informationProtection/bitlocker/recoveryKeys/{id}?$select=key`
- Returns `BitLockerKey[]` with `id, createdDateTime, volumeType, deviceId, key?`

---

## Critical Gotchas (Never Forget These)

1. **`$orderby` breaks silently** on `/devices` and `/users` — always sort client-side
2. **`$expand=registeredOwners` fails silently on bulk** `getAllDevices()` — only use expand on single-device or search calls
3. **BitLocker endpoint spelling** — `/informationProtection/bitlocker/recoveryKeys` (lowercase 'b' in bitlocker, plural recoveryKeys)
4. **`deviceId` vs `id`** — LAPS and BitLocker lookups use `deviceId` (the Azure AD Device ID GUID), not the object `id`
5. **`ConsistencyLevel: eventual` + `$count: true`** required for any filtered query on `/devices` or `/users`
6. **`atob()` for base64** — `Buffer` doesn't exist in Hermes; decode LAPS passwords with `atob()`
7. **New scopes = user must re-auth** — after adding Graph permissions, existing token won't have new scopes; user must sign out and back in
8. **NEVER run `npx expo prebuild --clean`** — wipes custom `Info.plist` and `.entitlements` that MSAL depends on
9. **Keychain entitlement** — `.entitlements` must have `$(AppIdentifierPrefix)com.microsoft.adalcache`
10. **Do NOT re-add NSPinnedDomains cert pinning** — Microsoft rotated their TLS cert in April 2026; pinning broke MSAL with error -9802. MSAL uses OS trust store — leave it alone.

---

## Security Features

| Feature | Implementation |
|---------|----------------|
| Production logger | `logger.ts` — all output gated on `__DEV__` |
| No credential logging | clientId/tenantId never passed to logger |
| Credential memory cleanup | LAPS/BitLocker cleared from `deviceStore` on screen unmount |
| Sanitized error messages | Generic user-facing strings only |
| Jailbreak detection | `jailbreakDetection.ts` — cydia:// and sileo:// URL scheme check at login |
| Session timeout | 8 hours — `useAppLock.ts` checks timestamp in SecureStore |
| Background lock | 5 minutes backgrounded → force sign-out via `AppState` listener |
| Privacy overlay | `PrivacyOverlay.tsx` — covers screen during iOS app switcher |
| Bundle obfuscation | Hermes bytecode + `drop_console` + `mangle` in `metro.config.js` |

---

## iOS Build Notes

**Development provisioning:** Free Apple Developer account — profile expires every 7 days. Fix: open `ios/LAPSr.xcworkspace` in Xcode → Cmd+B to regenerate → on iPhone: Settings → General → VPN & Device Management → trust cert. Long-term: paid Apple Developer account ($99/yr).

**Test on physical device:**
```bash
npx expo run:ios --device
```
Phone must be plugged in, same WiFi. This is how Lauren tests.

**Never do:**
```bash
npx expo prebuild --clean  # DESTROYS Info.plist and .entitlements
```

---

## Pre-Launch Checklist (Outstanding)

- [ ] Form an LLC
- [ ] Write Privacy Policy + host publicly (App Store requirement)
- [ ] Write Terms of Service / EULA (skeleton exists in `TermsScreen.tsx`)
- [ ] Get E&O / Cyber Liability Insurance before enterprise sales
- [ ] Tenant config screen — let customers enter their own Client ID/Tenant ID (no custom build per customer)
- [ ] EAS production build + App Store Connect submission
- [ ] Paid Apple Developer account

**Legal position:** No servers, no customer data touches anything Lauren owns. Auth is Microsoft's. Each customer uses their own Entra ID app registration.

---

## How Lauren Likes to Work

- Give **exact terminal commands**, not descriptions
- When she pastes terminal output, focus on actual **ERROR/LOG lines** — ignore iOS simulator spam (`hapticpatternlibrary`, `RemoteTextInput` noise)
- She tests on **physical device** via `npx expo run:ios --device` (phone plugged in, same WiFi)
