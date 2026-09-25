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
