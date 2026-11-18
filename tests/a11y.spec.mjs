// WCAG 2.2 AA, as axe-core checks it, in four states of the page: empty, three todos with one completed, a todo being
// edited, and the Active filter. A rule that fails is a test that fails, unless the README lists it as known.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGE = new URL('../index.html', import.meta.url).href;
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const KNOWN = [];

const press = (locator) => locator.click();
const add = async (page, text) => { await page.keyboard.type(text, { delay: 10 }); await page.keyboard.press('Enter'); await page.waitForTimeout(100); };
const scan = async (page) => {
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  return violations.filter((v) => !KNOWN.includes(v.id)).map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
};

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE);
    await page.locator('.todo-list .title:placeholder-shown').filter({ visible: true }).first().click();
  });

  test('empty', async ({ page }) => {
    expect(await scan(page)).toEqual([]);
  });

  test('three todos, one completed', async ({ page }) => {
    for (const t of ['buy some cheese', 'feed the cat', 'book a doctors appointment']) await add(page, t);
    await press(page.locator('.todo-list li').filter({ visible: true }).nth(1).locator('.tog'));
    expect(await scan(page)).toEqual([]);
  });

  test('editing', async ({ page }) => {
    for (const t of ['buy some cheese', 'feed the cat']) await add(page, t);
    await page.locator('.todo-list li').filter({ visible: true }).first().locator('.todo').dblclick();
    await expect(page.locator('.todo-list li').filter({ visible: true }).first().getByRole('textbox')).toBeFocused();
    expect(await scan(page)).toEqual([]);
  });

  test('active filter', async ({ page }) => {
    for (const t of ['buy some cheese', 'feed the cat']) await add(page, t);
    await press(page.locator('.todo-list li').filter({ visible: true }).first().locator('.tog'));
    await press(page.getByRole('link', { name: 'Active', exact: true }));
    await page.waitForTimeout(200);
    expect(await scan(page)).toEqual([]);
  });
});
