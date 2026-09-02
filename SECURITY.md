# Security Policy

## Supported Versions
We actively maintain and support the following versions of RatchetAI with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| 1.x.x   | :x:                |

## Reporting a Vulnerability
The RatchetAI team takes the security of our platform and user credentials seriously. If you discover a potential vulnerability or security flaw, please follow these guidelines:

1. **Do not create a public GitHub issue.**
2. Report the vulnerability privately via [GitHub Private Vulnerability Reporting](https://github.com/markalvincadangin/RatchetAI/security/advisories/new) or by contacting the repository maintainers directly.
3. Include detailed steps to reproduce the vulnerability, sample requests, and potential impact.

## Response SLA
* **Initial Acknowledgement:** Within 48 hours.
* **Triage & Patch Estimate:** Within 5 business days.
* **Public Release & Attribution:** Once the fix is verified and deployed.

## Security Best Practices for Deploying RatchetAI
* Never commit real API keys or database connection strings to source control.
* Always use `.env.example` templates and keep actual `.env` files in your `.gitignore`.
* Rotate API keys periodically if running public demonstration servers.
