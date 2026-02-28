# Auth0 Scope Debug Plan

## Goal

Identify why the `create:proper_nouns` scope is requested but not present in the session scope set.

## Context

- The app requests scopes via `scopeString`.
- The session is built from the access token `scope` claim.
- UI gating for proper nouns depends on `create:proper_nouns` being present.

## Observed Updates

- The authorization request explicitly includes `create:proper_nouns` in the scope parameter.
- Session logging shows a scope set that does not include `create:proper_nouns`.
- The request uses prompt=none (silent authentication), which can return cached tokens.
- The user has `create:proper_nouns` directly assigned in Auth0.
- Both "Enable RBAC" and "Add Permissions in the Access Token" are OFF.
- Other permissions are present and working despite RBAC being OFF.
- No custom or installed Actions are bound to the login flow.

## Steps

1. Decode the access token used by the app.

   - Inspect both `scope` and `permissions` claims.
   - Confirm whether `create:proper_nouns` appears in either claim.

2. Verify the access token is for the correct audience.

   - Confirm the `aud` claim matches the API that defines `create:proper_nouns`.
   - If not, fix the SPA audience configuration and re-authenticate.

3. Force a fresh token.

   - Log out and clear Auth0 cache (localStorage/session).
   - Log in again and re-check the token claims.
   - Optionally request a token with `ignoreCache: true` once to confirm caching.

4. Verify Auth0 API permissions.

   - Confirm the API defines the permission `create:proper_nouns` exactly.
   - Confirm the user has this permission via role or direct assignment.

5. Check Auth0 RBAC settings.

   - If RBAC is enabled, ensure "Add Permissions in Access Token" is ON.
   - If it is OFF, permissions may appear only in a `permissions` claim.

6. Confirm scope mapping in the frontend.

   - Ensure the application scope map uses `create:proper_nouns` exactly.
   - Confirm the session creation logic is reading the correct claim.

7. Inspect Auth0 Rules/Actions for token enrichment.

   - Look for custom Rules/Actions that add, filter, or override `scope`.
   - Verify `create:proper_nouns` is not missing from a manual allowlist.
   - If roles or groups are injected into `scope`, confirm the logic is updated.
   - If no Actions or Rules exist, move to API permission and app configuration checks.

8. Check API permission definitions and allowed scopes.
   - Confirm `create:proper_nouns` exists under the API permissions list.
   - Verify the scope is not restricted by any application or tenant setting.

## Expected Findings

- If `create:proper_nouns` is in `permissions` but not `scope`, the frontend should read `permissions`.
- If the permission is missing from both claims, the Auth0 API or user role assignment is incomplete.
- If the permission appears after a fresh login, token caching was the issue.
- If `aud` is wrong, the token will not include the permission even if it is granted.
- If other scopes are present with RBAC OFF, a Rule/Action likely injects or filters `scope` and needs updating.

## Rules/Actions Checklist

- Locate any Auth0 Rule or Action that reads or writes `context.accessToken.scope`, `context.idToken.scope`, or `api.accessToken.setScope`.
- Check for a static allowlist/denylist of scopes and ensure `create:proper_nouns` is included.
- Verify any logic that maps roles, groups, or permissions into `scope` includes the proper noun permission.
- Look for code that splits or filters `scope` by prefix (for example, only `read:` or `write:`) and update if needed.
- Confirm no Action is removing scopes when RBAC is disabled.
- If a Rule/Action adds custom claims with scopes, confirm the frontend is not reading those instead of `scope`.
