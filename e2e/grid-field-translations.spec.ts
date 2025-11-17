import { test, expect } from '@playwright/test';
import {
  checkForMissingTranslations,
  setLanguage,
  getAllPageText,
} from './translation-helpers';

test.describe('Grid Field Translation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/grid-field');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Wait for canvas and controls to load
  });

  test('should not display translation keys in English', async ({ page }) => {
    await setLanguage(page, 'en');
    await page.waitForTimeout(2000);
    
    const missingTranslations = await checkForMissingTranslations(page);
    
    if (missingTranslations.length > 0) {
      const texts = await getAllPageText(page);
      console.error('Page texts:', texts.slice(0, 20));
      console.error('Missing translations:', missingTranslations);
    }
    
    expect(missingTranslations.length).toBe(0);
  });

  test('should not display translation keys in Finnish', async ({ page }) => {
    await setLanguage(page, 'fi');
    await page.waitForTimeout(2000);
    
    const missingTranslations = await checkForMissingTranslations(page);
    
    if (missingTranslations.length > 0) {
      const texts = await getAllPageText(page);
      console.error('Page texts:', texts.slice(0, 20));
      console.error('Missing translations:', missingTranslations);
    }
    
    expect(missingTranslations.length).toBe(0);
  });

  test('should have all grid settings translated in English', async ({ page }) => {
    await setLanguage(page, 'en');
    await page.waitForTimeout(2000);
    
    // Open controls panel if it's not open
    const controlsButton = page.locator('button:has-text("Controls"), button:has-text("Open controls")').first();
    if (await controlsButton.count() > 0) {
      await controlsButton.click();
      await page.waitForTimeout(500);
    }
    
    const texts = await getAllPageText(page);
    const textContent = texts.join(' ').toLowerCase();
    
    // Check for key English translations
    expect(textContent).toContain('grid settings');
    expect(textContent).toContain('grid type');
    expect(textContent).toContain('grid spacing');
    expect(textContent).toContain('line length');
    expect(textContent).toContain('curve stiffness');
    expect(textContent).toContain('zoom level');
    expect(textContent).toContain('poles');
    expect(textContent).toContain('animation');
  });

  test('should have all grid settings translated in Finnish', async ({ page }) => {
    await setLanguage(page, 'fi');
    await page.waitForTimeout(2000);
    
    // Open controls panel if it's not open
    const controlsButton = page.locator('button:has-text("Ohjaimet"), button:has-text("Avaa ohjaimet")').first();
    if (await controlsButton.count() > 0) {
      await controlsButton.click();
      await page.waitForTimeout(500);
    }
    
    const texts = await getAllPageText(page);
    const textContent = texts.join(' ').toLowerCase();
    
    // Check for key Finnish translations
    expect(textContent).toContain('ruudukon asetukset');
    expect(textContent).toContain('ruudukon tyyppi');
    expect(textContent).toContain('ruudukon väli');
    expect(textContent).toContain('viivan pituus');
    expect(textContent).toContain('käyrän jäykkyys');
    expect(textContent).toContain('zoomaustaso');
    expect(textContent).toContain('navat');
    expect(textContent).toContain('animaatio');
  });

  test('should have grid type options translated in English', async ({ page }) => {
    await setLanguage(page, 'en');
    await page.waitForTimeout(2000);
    
    const texts = await getAllPageText(page);
    const textContent = texts.join(' ').toLowerCase();
    
    // Check for grid type translations
    expect(textContent).toMatch(/rect|square|triangular|hex|radial|random|spiral/i);
  });

  test('should have grid type options translated in Finnish', async ({ page }) => {
    await setLanguage(page, 'fi');
    await page.waitForTimeout(2000);
    
    const texts = await getAllPageText(page);
    const textContent = texts.join(' ').toLowerCase();
    
    // Check for grid type translations (Finnish uses shorter labels)
    expect(textContent).toMatch(/suora|kolmio|kuusikulmio|säteittäinen|satunnainen|spiraali/i);
  });

  test('should have pole controls translated in English', async ({ page }) => {
    await setLanguage(page, 'en');
    await page.waitForTimeout(2000);
    
    const texts = await getAllPageText(page);
    const textContent = texts.join(' ').toLowerCase();
    
    // Check for pole-related translations
    expect(textContent).toMatch(/add pole|strength|position|show poles|magnetic|electric/i);
  });

  test('should have pole controls translated in Finnish', async ({ page }) => {
    await setLanguage(page, 'fi');
    await page.waitForTimeout(2000);
    
    const texts = await getAllPageText(page);
    const textContent = texts.join(' ').toLowerCase();
    
    // Check for pole-related translations
    expect(textContent).toMatch(/lisää napa|vahvuus|sijainti|näytä navat|magneettinen|sähköinen/i);
  });

  test('should have animation controls translated in English', async ({ page }) => {
    await setLanguage(page, 'en');
    await page.waitForTimeout(2000);
    
    const texts = await getAllPageText(page);
    const textContent = texts.join(' ').toLowerCase();
    
    // Check for animation-related translations
    expect(textContent).toMatch(/play|pause|wind strength|wind speed/i);
  });

  test('should have animation controls translated in Finnish', async ({ page }) => {
    await setLanguage(page, 'fi');
    await page.waitForTimeout(2000);
    
    const texts = await getAllPageText(page);
    const textContent = texts.join(' ').toLowerCase();
    
    // Check for animation-related translations
    expect(textContent).toMatch(/toista|tauko|tuulen voimakkuus|tuulen nopeus/i);
  });
});

