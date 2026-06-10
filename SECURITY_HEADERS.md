# Security Headers Configuration

This document outlines the recommended security headers that should be configured for DebiasDaily to protect against common web vulnerabilities.

## Required Security Headers

### Content Security Policy (CSP)
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com;
```

### X-Frame-Options
```
X-Frame-Options: DENY
```

### X-Content-Type-Options
```
X-Content-Type-Options: nosniff
```

### Referrer-Policy
```
Referrer-Policy: strict-origin-when-cross-origin
```

### Permissions-Policy
```
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### Strict-Transport-Security (HTTPS only)
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## Deployment-Specific Configuration

### Vercel
Add to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com;"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

### Netlify
Add to `netlify.toml`:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com;"
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
```

### Nginx
Add to server configuration:
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com;" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
```

### Apache
Add to `.htaccess` or virtual host:
```apache
<IfModule mod_headers.c>
  Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com;"
  Header always set X-Frame-Options "DENY"
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
</IfModule>
```

## Testing Security Headers

After implementing security headers, test them using:

1. **Security Headers Checker**: https://securityheaders.com/
2. **CSP Evaluator**: https://csp-evaluator.withgoogle.com/
3. **Browser DevTools**: Check Network tab for response headers

## Notes

- The CSP policy is configured to allow Google Analytics and Google Fonts
- `unsafe-inline` is required for inline scripts/styles but should be minimized where possible
- HSTS header should only be added once HTTPS is properly configured
- Regularly review and update these headers as security best practices evolve

## Dependency Scanning

Automated dependency scanning helps identify security vulnerabilities in third-party packages.

### npm audit (Built-in)
```bash
# Run basic audit
npm audit

# Audit with fix (development only)
npm audit fix

# Audit for production vulnerabilities only
npm audit --production

# Set audit level in package.json
"scripts": {
  "audit": "npm audit --audit-level=moderate"
}
```

### Snyk (Recommended for CI/CD)
```bash
# Install Snyk CLI
npm install -g snyk

# Authenticate
snyk auth

# Test for vulnerabilities
snyk test

# Monitor for ongoing vulnerability detection
snyk monitor
```

### GitHub Dependabot
Add `.github/dependabot.yml`:
```yaml
version: 2
dependabot:
  package-ecosystem: "npm"
  directory: "/"
  schedule:
    interval: "weekly"
  open-pull-requests-limit: 10
```

### CI/CD Integration
Add to CI pipeline:
```yaml
- name: Run security audit
  run: npm audit --audit-level=moderate

- name: Run Snyk security scan
  uses: snyk/actions/node@master
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### Best Practices
- Run dependency scanning before every deployment
- Review and update dependencies regularly
- Prioritize critical and high severity vulnerabilities
- Test compatibility before updating dependencies
- Keep development and production dependencies aligned
