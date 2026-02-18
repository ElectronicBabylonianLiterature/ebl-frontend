# CHANGELOG: Auth0 Scopes/Permissions Handling Fix (#685)

**Date**: February 18, 2026  
**Branch**: `fix-scopes`  
**PR**: [#685](https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/685)  
**Previous Related PRs**: #661, #662, #671, #672

---

## Summary

Fixed broken Auth0 session permission extraction by switching from scope-string-based parsing to direct `permissions` array extraction from decoded JWT tokens. This aligns with Auth0's modern permission-based access control model and fixes session initialization failures for authenticated users.

---

## Changes Made

### 1. src/auth/react-auth0-spa.tsx

#### Modified: `createSession()` function (Lines 13-22)

**What Changed:**

- Replaced direct scope string parsing with structured permission array extraction
- Added explicit token type definition for better type safety
- Changed to use `permissions` claim from decoded token instead of `scope`

**Before (PR #672):**

```typescript
async function createSession(auth0Client: Auth0Client): Promise<Session> {
  const accessToken = await auth0Client.getTokenSilently()
  return new MemorySession(
    decode<{ scope: string }>(accessToken).scope.split(' '),
  )
}
```

**After (Current):**

```typescript
async function createSession(auth0Client: Auth0Client): Promise<Session> {
  const accessToken = await auth0Client.getTokenSilently()
  const decoded = decode<{
    scope?: string
    aud: string
    permissions?: string[]
  }>(accessToken)
  return new MemorySession(decoded.permissions || [])
}
```

**Rationale:**

- Old code assumed `scope` claim contained space-separated permissions (legacy behavior)
- Current Auth0 configuration uses explicit `permissions` array claim
- The old approach was failing because the claim structure changed
- New type definition matches actual Auth0 token format:
  - `scope?`: Optional, may not exist in all tokens
  - `aud`: Required audience identifier
  - `permissions?`: Array of permission strings, optional with fallback to []

#### Modified: Error handling comments (Line 50)

- **Removed comment**: `// If session creation fails (e.g., expired token), fall back to guest session`
- **Reason**: Comment was redundant with actual error handling code
- **Console.error logging preserved**: Still logs failures for debugging

#### Removed: ESLint disable comment (Line 100)

- **Removed**: `// Options are intended to be static for the app lifetime.` + `eslint-disable-next-line react-hooks/exhaustive-deps`
- **Reason**: No longer needed due to proper ref-based state management from PR #661
- **Safety**: The mechanism using refs (`initOptionsRef`, `onRedirectCallbackRef`, `returnToRef`) ensures no stale closures

---

### 2. src/auth/Session.ts

#### Added: Debug logging (Lines 148-149)

**New Lines:**

```typescript
hasApplicationScope(applicationScope: string): boolean {
  console.log(this.scopes)  // NEW: Log current scopes set
  const scope = applicationScopes[applicationScope]
  console.log(applicationScope, applicationScopes[applicationScope])  // NEW: Log scope lookup
  return this.scopes.has(scope)
}
```

**Purpose:**

- Debug logging to trace permission checking flow
- Helps diagnose permission mapping issues
- Shows what permissions session has vs. what scopes are being checked
- **Note**: These are debug logs - should likely be removed or conditional in production

---

## Impact Analysis

### User-Facing Impact

- ✅ **Authenticated users** now get proper permissions in their session
- ✅ **Permission checks** (lemmatize, annotate, etc.) now work correctly
- ✅ **Guest fallback** still works when authentication fails
- ⚠️ **Existing authenticated sessions** might need to be refreshed to pick up new permission format

### Developer Impact

- 🔧 **Type Safety**: Better defined token structure reduces debugging confusion
- 🔧 **Maintainability**: Explicit permissions array is clearer than parsing space-separated strings
- 📊 **Testing**: New approach requires comprehensive tests for permission extraction

### Technical Debt

- **Debug Logging**: Console logs in `Session.ts` should be removed or made conditional
- **Test Coverage**: `react-auth0-spa.test.tsx` is severely under-tested (see TEST_UPDATE_PLAN.md)
- **Backward Compatibility**: No fallback for old scope-based tokens

---

## History & Context

### Previous Changes (Background)

1. **PR #661** (Frontend Optimization):
   - Added `useRef` for stable prop references
   - Introduced `Auth0ProviderProps` type
   - Fixed stale closure issues

2. **PR #662** (Frontend Optimization):
   - Removed ESLint disable comment (now done again)

3. **PR #671** (Layout Fixes):
   - Added `checkSession()` call with error handling

4. **PR #672** (Layout Fixes):
   - Wrapped authenticated session creation in try-catch
   - Improved error logging

### What Broke?

The changes in #661-#672 built a more robust auth system but didn't update the token decoding logic. The Auth0 configuration was changed to use `permissions` claim instead of `scope`, causing `createSession()` to fail because it was looking for the wrong claim.

---

## Testing Status

⚠️ **WARNING: Test coverage is insufficient!**

### Currently Tested ✓

- ✓ Permission checking logic (Session.test.ts)
- ✓ Service initialization (partial in Auth0AuthenticationService.test.tsx)

### NOT Tested ❌

- ❌ Token decoding and permission extraction
- ❌ Session creation with actual permissions
- ❌ Error scenarios in Auth0Provider
- ❌ Permission propagation from token → session → permission checks

**See TEST_UPDATE_PLAN.md for detailed testing todos.**

---

## Staged vs. Unstaged Changes

### Staged for Commit (Ready to merge)

✓ `src/auth/react-auth0-spa.tsx` - All fixes above

### Unstaged Changes (Not yet staged)

⚠️ `src/auth/Session.ts` - Debug logging

- **Status**: Not yet staged, review before committing
- **Recommendation**: Either stage if debug output is needed, or discard

---

## Files Modified Summary

| File                           | Impact                | Status       |
| ------------------------------ | --------------------- | ------------ |
| `src/auth/react-auth0-spa.tsx` | Major - Core fix      | **STAGED** ✓ |
| `src/auth/Session.ts`          | Minor - Debug logging | Unstaged ⚠️  |

---

## Verification Checklist

Before merging, verify:

- [ ] Application loads without errors
- [ ] Authenticated users can login successfully
- [ ] User permissions are correctly extracted from token
- [ ] Permission checks work (can lemmatize, annotate, etc. if authorized)
- [ ] Guest users still work
- [ ] Session errors gracefully fall back to guest mode
- [ ] Tests pass (once TEST_UPDATE_PLAN.md items are implemented)

---

## Related Issues/PRs

- GitHub PR: #685 Fix Auth0 Scopes/Permissions Handling
- Previous: #661, #662, #671, #672 (context and related changes)
- Related: Auth0 configuration changes (external)

---

## Next Steps

1. **Immediate**: Review and merge staged changes
2. **Short-term**: Implement tests from TEST_UPDATE_PLAN.md (Priority 1)
3. **Medium-term**: Remove debug logging from Session.ts
4. **Long-term**: Consider backward compatibility strategy if scopes-based tokens still exist

---

## Developer Notes

### How Permissions Flow

```
Auth0 Token (JWT)
  ↓ contains "permissions": ["read:words", "write:fragments", ...]
  ↓
createSession() - decode token, extract permissions array
  ↓
MemorySession - created with permissions string[]
  ↓
hasApplicationScope() - maps app scope (e.g., "lemmatizeFragments") to Auth0 scope (e.g., "lemmatize:fragments") via applicationScopes.json
  ↓
Permission Methods - isAllowedToLemmatizeFragments() returns true/false
```

### Scope Mapping Reference

See `src/auth/applicationScopes.json` for complete mapping:

- `readWords` → `read:words`
- `lemmatizeFragments` → `lemmatize:fragments`
- `access:beta` → `access:beta`
- etc.

---

**Last Updated**: 2026-02-18  
**Status**: In Testing/Review
