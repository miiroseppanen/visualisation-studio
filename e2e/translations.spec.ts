import { test, expect } from '@playwright/test';
import {
  checkForMissingTranslations,
  setLanguage,
  getAllPageText,
  switchLanguage,
} from './translation-helpers';

/**
 * List of all pages to test for translations
 */
const PAGES_TO_TEST = [
  { path: '/', name: 'Home' },
  { path: '/grid-field', name: 'Grid Field' },
  { path: '/flow-field', name: 'Flow Field' },
  { path: '/circular-field', name: 'Circular Field' },
  { path: '/turbulence', name: 'Turbulence' },
  { path: '/topography', name: 'Topography' },
  { path: '/wave-interference', name: 'Wave Interference' },
  { path: '/particle-swarm', name: 'Particle Swarm' },
  { path: '/neural-network', name: 'Neural Network' },
  { path: '/cellular-automata', name: 'Cellular Automata' },
  { path: '/sound-wave', name: 'Sound Wave' },
  { path: '/mathematical-lines', name: 'Mathematical Lines' },
  { path: '/suggestions', name: 'Suggestions' },
  { path: '/suggestions/new', name: 'New Suggestion' },
];

test.describe('Translation Coverage Tests', () => {
  test.describe('English Translations', () => {
    for (const page of PAGES_TO_TEST) {
      test(`should not have missing translations on ${page.name} page (English)`, async ({ page: playwrightPage }) => {
        await setLanguage(playwrightPage, 'en');
        await playwrightPage.goto(page.path);
        await playwrightPage.waitForLoadState('networkidle');
        await playwrightPage.waitForTimeout(2000); // Wait for i18n to initialize
        
        const missingTranslations = await checkForMissingTranslations(playwrightPage);
        
        if (missingTranslations.length > 0) {
          console.error(`Missing translations found on ${page.name} (English):`, missingTranslations);
        }
        
        expect(missingTranslations.length).toBe(0);
      });
    }
  });

  test.describe('Finnish Translations', () => {
    for (const page of PAGES_TO_TEST) {
      test(`should not have missing translations on ${page.name} page (Finnish)`, async ({ page: playwrightPage }) => {
        await setLanguage(playwrightPage, 'fi');
        await playwrightPage.goto(page.path);
        await playwrightPage.waitForLoadState('networkidle');
        await playwrightPage.waitForTimeout(2000); // Wait for i18n to initialize
        
        const missingTranslations = await checkForMissingTranslations(playwrightPage);
        
        if (missingTranslations.length > 0) {
          console.error(`Missing translations found on ${page.name} (Finnish):`, missingTranslations);
        }
        
        expect(missingTranslations.length).toBe(0);
      });
    }
  });

  test.describe('Language Switching', () => {
    test('should switch between English and Finnish on home page', async ({ page }) => {
      await setLanguage(page, 'en');
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Get English text
      const englishTexts = await getAllPageText(page);
      const hasEnglishContent = englishTexts.some(text => 
        text.includes('Visualisation') || 
        text.includes('Studio') || 
        text.includes('Tools')
      );
      expect(hasEnglishContent).toBeTruthy();
      
      // Switch to Finnish
      await switchLanguage(page, 'fi');
      await page.waitForTimeout(2000);
      
      // Get Finnish text
      const finnishTexts = await getAllPageText(page);
      const hasFinnishContent = finnishTexts.some(text => 
        text.includes('Visualisointi') || 
        text.includes('Studio') || 
        text.includes('Työkalut')
      );
      expect(hasFinnishContent).toBeTruthy();
    });

    test('should switch between English and Finnish on grid-field page', async ({ page }) => {
      await setLanguage(page, 'en');
      await page.goto('/grid-field');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000); // Wait for canvas and controls to load
      
      // Check for English content
      const englishTexts = await getAllPageText(page);
      const hasEnglishGridSettings = englishTexts.some(text => 
        text.includes('Grid Settings') || 
        text.includes('Grid Type') ||
        text.includes('Poles')
      );
      expect(hasEnglishGridSettings).toBeTruthy();
      
      // Switch to Finnish
      await switchLanguage(page, 'fi');
      await page.waitForTimeout(2000);
      
      // Check for Finnish content
      const finnishTexts = await getAllPageText(page);
      const hasFinnishGridSettings = finnishTexts.some(text => 
        text.includes('Ruudukon asetukset') || 
        text.includes('Ruudukon tyyppi') ||
        text.includes('Navat')
      );
      expect(hasFinnishGridSettings).toBeTruthy();
    });
  });

  test.describe('Specific Translation Checks', () => {
    test('should have all grid field translations in English', async ({ page }) => {
      await setLanguage(page, 'en');
      await page.goto('/grid-field');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      const texts = await getAllPageText(page);
      const textContent = texts.join(' ');
      
      // Check for key translations
      expect(textContent).toContain('Grid Settings');
      expect(textContent).toContain('Grid Type');
      expect(textContent).toContain('Grid Spacing');
      expect(textContent).toContain('Line Length');
      expect(textContent).toContain('Poles');
      expect(textContent).toContain('Animation');
    });

    test('should have all grid field translations in Finnish', async ({ page }) => {
      await setLanguage(page, 'fi');
      await page.goto('/grid-field');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      const texts = await getAllPageText(page);
      const textContent = texts.join(' ');
      
      // Check for key translations
      expect(textContent).toContain('Ruudukon asetukset');
      expect(textContent).toContain('Ruudukon tyyppi');
      expect(textContent).toContain('Ruudukon väli');
      expect(textContent).toContain('Viivan pituus');
      expect(textContent).toContain('Navat');
      expect(textContent).toContain('Animaatio');
    });

    test('should have navigation translations in both languages', async ({ page }) => {
      // Test English
      await setLanguage(page, 'en');
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      let texts = await getAllPageText(page);
      let textContent = texts.join(' ');
      expect(textContent).toMatch(/Home|Tools|About|Ideas/i);
      
      // Test Finnish
      await setLanguage(page, 'fi');
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      texts = await getAllPageText(page);
      textContent = texts.join(' ');
      expect(textContent).toMatch(/Koti|Työkalut|Tietoja|Ideat/i);
    });
  });
});

