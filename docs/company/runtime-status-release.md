# Company Plugin Hub 1.4.3-company.3

Installed bundles excluded from the profile previously displayed “Restart pending” forever. The installed list and detail dialog now show “Not enabled” and omit the restart action. A configured package absent after startup shows “Not loaded — check logs”; only a bundle newly configured since startup is marked restart pending. Disabled loader entries no longer count as running, and missing runtime information remains unknown.

This release does not enable dsh-web-ui-all or repair its legacy settings API dependencies.

Validation: npm ci and npm run check passed on Node 24.14.1 (82 tests passed, two existing optional network tests skipped), including the profile → loader → installed-row regression. The same fix was verified in the macOS desktop list and detail dialog after a real restart. Source and prebuilt distributions are included.
