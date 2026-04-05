# Security Policy

## Overview

Access to Mediation is a collection of educational resources, practice templates, and interactive tools for family mediators. While it does not process sensitive data on a server, it does handle information locally in users' browsers via localStorage.

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| main    | Yes                |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly:

1. **Email**: Send details to **dougdevitre@gmail.com**
2. **Subject line**: `[SECURITY] Access to Mediation — <brief description>`
3. **Include**: A description of the vulnerability, steps to reproduce, and potential impact

We will acknowledge receipt within 48 hours and provide a timeline for resolution.

**Please do not open a public GitHub issue for security vulnerabilities.**

## Security Considerations

### Browser-Based Tools

The interactive tools (Parenting Plan Builder, Compliance Dashboard, CE Tracker) store data in the browser's `localStorage`. Users should be aware:

- Data is stored locally on the user's device only
- Data is **not** transmitted to any server
- Clearing browser data will remove saved progress
- Users should not enter personally identifiable client information into the tools
- The tools are designed for mediator practice management, not for storing client case data

### Content Integrity

All reference guides, templates, and scenarios reference published model standards (2025 AFCC/ABA, 2005 ABA/AAA/ACR). Contributors should:

- Cite authoritative sources for any legal or standards-based content
- Not introduce content that could be mistaken for legal advice
- Flag any outdated statute citations when discovered

### Dependencies

This project intentionally has **zero external dependencies**. The GitHub Pages site uses only vanilla HTML, CSS, and JavaScript. This minimizes the attack surface and eliminates supply chain risks.

## Responsible Disclosure

We follow coordinated disclosure practices. If you report a vulnerability, we ask that you:

- Allow reasonable time for us to address the issue before public disclosure
- Act in good faith to avoid privacy violations, data destruction, or service disruption
