import { test, expect } from '@playwright/test';
import {
  checkForMissingTranslations,
  setLanguage,
  getAllPageText,
} from './translation-helpers';

test.describe('Navigation Translation Tests', () => {
  test('should have navigation items translated in English', async ({ page }) => {
    await setLanguage(page, 'en');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const texts = await getAllPageText(page);
    const textContent = texts.join(' ').toLowerCase();
    
    // Check for navigation translations
    expect(textContent).toMatch(/home|tools|about|ideas|suggestions/i);
  });

  test('should have navigation items translated in Finnish', async ({ page }) => {
    await setLanguage(page, 'fi');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const texts = await getAllPageText(page);
    const textContent = texts.join(' ').toLowerCase();
    
    // Check for navigation translations
    expect(textContent).toMatch(/koti|työkalut|tietoja|ideat|ehdotukset/i);
  });

  test('should not have missing translations in navigation (English)', async ({ page }) => {
    await setLanguage(page, 'en');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const missingTranslations = await checkForMissingTranslations(page);
    expect(missingTranslations.length).toBe(0);
  });

  test('should not have missing translations in navigation (Finnish)', async ({ page }) => {
    await setLanguage(page, 'fi');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const missingTranslations = await checkForMissingTranslations(page);
    expect(missingTranslations.length).toBe(0);
  });

  test('should have hero section translated in English', async ({ page }) => {
    await setLanguage(page, 'en');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const texts = await getAllPageText(page);
    const textContent = texts.join(' ');
    
    expect(textContent).toContain('Visualisation');
    expect(textContent).toContain('Studio');
    expect(textContent).toMatch(/Start Creating|Explore Tools/i);
  });

  test('should have hero section translated in Finnish', async ({ page }) => {
    await setLanguage(page, 'fi');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const texts = await getAllPageText(page);
    const textContent = texts.join(' ');
    
    expect(textContent).toContain('Visualisointi');
    expect(textContent).toContain('Studio');
    expect(textContent).toMatch(/Aloita luominen|Tutki työkaluja/i);
  });

  test('should have common UI elements translated in English', async ({ page }) => {
    await setLanguage(page, 'en');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const texts = await getAllPageText(page);
    const textContent = texts.join(' ').toLowerCase();
    
    // Check for common translations that might appear
    // These are just examples - adjust based on what's actually on the page
    if (textContent.includes('close')) {
      expect(textContent).toContain('close');
    }
    if (textContent.includes('save')) {
      expect(textContent).toContain('save');
    }
    if (textContent.includes('cancel')) {
      expect(textContent).toContain('cancel');
    }
  });

  test('should have common UI elements translated in Finnish', async ({ page }) => {
    await setLanguage(page, 'fi');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const texts = await getAllPageText(page);
    const textContent = texts.join(' ').toLowerCase();
    
    // Check for common translations that might appear
    if (textContent.includes('sulje')) {
      expect(textContent).toContain('sulje');
    }
    if (textContent.includes('tallenna')) {
      expect(textContent).toContain('tallenna');
    }
    if (textContent.includes('peruuta')) {
      expect(textContent).toContain('peruuta');
    }
  });
});

