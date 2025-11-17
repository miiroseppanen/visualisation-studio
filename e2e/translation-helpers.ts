import { Page, expect } from '@playwright/test';

/**
 * Translation key pattern - matches keys like "visualizationSettings.gridSettings"
 * or "common.loading" that might appear if translations are missing
 */
const TRANSLATION_KEY_PATTERN = /^[a-zA-Z]+\.[a-zA-Z]+(\.[a-zA-Z]+)*$/;

/**
 * Common translation keys that should never appear in the rendered UI
 */
const COMMON_TRANSLATION_KEYS = [
  'visualizationSettings',
  'common.',
  'navigation.',
  'hero.',
  'tools.',
  'suggestions.',
  'visualization.',
  'metadata.',
  'error.',
  'notFound.',
  'offline.',
  'pwa.',
  'cellular.',
  'sound.',
  'about.',
];

/**
 * Checks if a text looks like a translation key (e.g., "visualizationSettings.gridSettings")
 */
export function isTranslationKey(text: string): boolean {
  const trimmed = text.trim();
  
  // Skip very short texts (likely not translation keys)
  if (trimmed.length < 3) {
    return false;
  }
  
  // Skip numbers and common punctuation-only strings
  if (/^[\d\s.,!?;:()\[\]{}'"]+$/.test(trimmed)) {
    return false;
  }
  
  // Check if it matches the pattern of a translation key (e.g., "visualizationSettings.gridSettings")
  if (TRANSLATION_KEY_PATTERN.test(trimmed)) {
    return true;
  }
  
  // Check if it contains common translation key prefixes followed by a dot
  // This catches cases like "visualizationSettings.gridSettings" in the middle of text
  return COMMON_TRANSLATION_KEYS.some(key => {
    // Look for the key followed by a dot and more text (e.g., "visualizationSettings.gridSettings")
    const pattern = new RegExp(`\\b${key.replace('.', '\\.')}[a-zA-Z]`, 'i');
    return pattern.test(trimmed);
  });
}

/**
 * Gets all text content from the page, excluding script and style tags
 */
export async function getAllPageText(page: Page): Promise<string[]> {
  const texts = await page.evaluate(() => {
    // Remove script and style elements
    const scripts = document.querySelectorAll('script, style');
    scripts.forEach(el => el.remove());
    
    // Get all text nodes
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    const textNodes: string[] = [];
    let node;
    while (node = walker.nextNode()) {
      const text = node.textContent?.trim();
      if (text && text.length > 0) {
        textNodes.push(text);
      }
    }
    
    return textNodes;
  });
  
  return texts;
}

/**
 * Checks the page for missing translations (translation keys that appear in the UI)
 */
export async function checkForMissingTranslations(page: Page): Promise<string[]> {
  const allTexts = await getAllPageText(page);
  const missingTranslations: string[] = [];
  
  for (const text of allTexts) {
    // Skip empty or very short texts
    if (!text || text.trim().length < 3) {
      continue;
    }
    
    // Check the full text first (catches full translation keys)
    if (isTranslationKey(text)) {
      missingTranslations.push(text.trim());
      continue;
    }
    
    // Split by whitespace and check each word/token
    const tokens = text.split(/\s+/);
    for (const token of tokens) {
      // Remove punctuation for checking, but keep dots (they're part of translation keys)
      const cleanToken = token.replace(/[!?;:()\[\]{}'"]/g, '').replace(/^[,.]|[,.]$/g, '');
      
      if (cleanToken.length >= 3 && isTranslationKey(cleanToken)) {
        missingTranslations.push(cleanToken);
      }
    }
  }
  
  // Remove duplicates and sort
  return [...new Set(missingTranslations)].sort();
}

/**
 * Switches the language on the page
 */
export async function switchLanguage(page: Page, language: 'en' | 'fi'): Promise<void> {
  // Find and click the language selector
  const languageSelector = page.locator('button[aria-label*="language"], button:has-text("Language"), [data-testid="language-selector"]').first();
  
  // Try to find by text content if aria-label doesn't work
  if (await languageSelector.count() === 0) {
    // Look for globe icon or language button
    const globeButton = page.locator('button:has(svg), button').filter({ hasText: /EN|FI|English|Finnish|Suomi/i }).first();
    if (await globeButton.count() > 0) {
      await globeButton.click();
    } else {
      // Try finding by any button that might be the language selector
      const allButtons = page.locator('button');
      const count = await allButtons.count();
      for (let i = 0; i < Math.min(count, 10); i++) {
        const button = allButtons.nth(i);
        const text = await button.textContent();
        if (text && (text.includes('EN') || text.includes('FI') || text.includes('Language'))) {
          await button.click();
          break;
        }
      }
    }
  } else {
    await languageSelector.click();
  }
  
  // Wait for dropdown menu
  await page.waitForTimeout(500);
  
  // Click on the language option
  const languageOption = page.locator(`text=${language === 'en' ? 'English' : 'Finnish'}, text=${language === 'en' ? 'EN' : 'FI'}, text=${language === 'fi' ? 'Suomi' : 'English'}`).first();
  if (await languageOption.count() > 0) {
    await languageOption.click();
  }
  
  // Wait for language change to take effect
  await page.waitForTimeout(1000);
}

/**
 * Verifies that text content changes when language is switched
 */
export async function verifyLanguageSwitch(page: Page, expectedEnglishText: string, expectedFinnishText: string): Promise<void> {
  // Check English
  await switchLanguage(page, 'en');
  await expect(page.locator(`text=${expectedEnglishText}`).first()).toBeVisible({ timeout: 5000 });
  
  // Check Finnish
  await switchLanguage(page, 'fi');
  await expect(page.locator(`text=${expectedFinnishText}`).first()).toBeVisible({ timeout: 5000 });
}

/**
 * Gets the current language from localStorage
 */
export async function getCurrentLanguage(page: Page): Promise<string> {
  return await page.evaluate(() => {
    return localStorage.getItem('i18nextLng') || 'en';
  });
}

/**
 * Sets the language in localStorage and reloads
 */
export async function setLanguage(page: Page, language: 'en' | 'fi'): Promise<void> {
  await page.evaluate((lang) => {
    localStorage.setItem('i18nextLng', lang);
  }, language);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000); // Wait for i18n to initialize
}

