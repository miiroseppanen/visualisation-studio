# End-to-End Translation Tests

This directory contains end-to-end tests to ensure all UI elements are properly translated and no translation keys are missing.

## Overview

The tests verify that:
1. No translation keys (like `visualizationSettings.gridSettings`) appear in the rendered UI
2. All pages have proper translations in both English and Finnish
3. Language switching works correctly
4. Specific UI elements are translated correctly

## Running Tests

### Run all E2E tests
```bash
npm run test:e2e
```

### Run only translation tests
```bash
npm run test:e2e:translations
```

### Run tests with UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Debug tests
```bash
npm run test:e2e:debug
```

## Test Files

### `translations.spec.ts`
Comprehensive tests that check all pages for missing translations in both English and Finnish. Tests include:
- Missing translation detection on all pages
- Language switching verification
- Specific translation checks for common UI elements

### `grid-field-translations.spec.ts`
Detailed tests specifically for the grid-field page, checking:
- Grid settings translations
- Grid type options
- Pole controls
- Animation controls

### `translation-helpers.ts`
Utility functions for translation testing:
- `checkForMissingTranslations()` - Detects translation keys in the UI
- `setLanguage()` - Sets the language and reloads the page
- `switchLanguage()` - Switches language via the UI
- `getAllPageText()` - Extracts all text content from the page
- `isTranslationKey()` - Checks if text looks like a translation key

## How It Works

The tests work by:
1. Loading pages in both English and Finnish
2. Extracting all text content from the page
3. Checking if any text matches translation key patterns (e.g., `visualizationSettings.gridSettings`)
4. Verifying that expected translated text appears in the correct language
5. Testing language switching functionality

## Adding New Tests

When adding new pages or UI elements:
1. Add the page path to `PAGES_TO_TEST` in `translations.spec.ts`
2. Create specific tests in a new spec file if needed
3. Update expected translations in the test assertions

## Troubleshooting

### Tests fail with "Missing translations found"
- Check the console output for which translation keys are missing
- Verify the translation exists in both `lib/locales/en.json` and `lib/locales/fi.json`
- Ensure the translation key is being used correctly in the component

### Tests timeout
- Increase timeout in test configuration if pages take longer to load
- Check that the dev server is running on port 3000
- Verify network requests are completing

### Language switching doesn't work
- Check that the language selector is accessible
- Verify the language selector button/component has the expected selectors
- Update selectors in `translation-helpers.ts` if the UI has changed

