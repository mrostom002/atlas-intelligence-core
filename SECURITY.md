# Security Policy

## Public-code boundary

This repository is intentionally public. It must contain software and public/synthetic examples only.

Never commit:
- passwords, recovery tokens or session cookies
- API keys or private keys
- production database credentials
- confidential customer or supplier data
- private pricing, margins or commercial entitlements
- private relationship notes
- contracts, purchase orders or unpublished requirements
- private Atlas evidence or proprietary operating observations

Runtime secrets belong in managed secret stores, not source control.

## AI boundary

Public/free model routes may process public internet material and synthetic test data only.

AI output is inference attached to evidence; it is not independent evidence. No model may promote its own output directly into verified fact, commitment, contracted revenue or other consequential commercial state.

## Reporting

If you discover a secret, private commercial record or non-public personal information in this repository, do not redistribute it. Report it privately to the Atlas maintainers.


## Runtime authentication boundary

The public Gemini Edge Function supports two approved caller modes:

- Atlas human/admin callers: verified Supabase user JWT plus the private `allowed_users` authorization check.
- Atlas machine/runtime callers: a dedicated `ATLAS_PUBLIC_RUNTIME_TOKEN` supplied only through the `x-atlas-runtime-token` header.

The runtime token is scoped to the PUBLIC-only Gemini function. It is not a Supabase service-role key, Google API key, or general Atlas credential.

Because the runtime-secret path is not a Supabase JWT, the deployed function uses in-function dual authentication rather than relying solely on the platform `verify_jwt` precheck. Requests without either valid authorization path remain fail-closed with HTTP 401.
