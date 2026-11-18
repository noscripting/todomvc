// A tap does what a click does, on a touch screen as Playwright emulates one (hasTouch): a todo's circle, Clear
// completed, its × and toggle all, each by one tap.
import { test, expect } from '@playwright/test';

const PAGE = new URL('../index.html', import.meta.url).href;
test.use({ hasTouch: true });

test('a tap completes, clears, deletes and toggles all', async ({ page }) => {
  await page.goto(PAGE);
  const todos = page.locator('.todo-list li').filter({ visible: true, has: page.locator('.title:valid') });
  await page.locator('.todo-list .title:placeholder-shown').filter({ visible: true }).first().tap();
  for (const t of ['buy some cheese', 'feed the cat', 'book a doctors appointment']) {
    await page.keyboard.type(t, { delay: 10 }); await page.keyboard.press('Enter');
  }
  await expect(todos).toHaveCount(3);
  await page.mouse.click(5, 5);
  await todos.nth(0).locator('.tog').tap();
  await expect(page.getByRole('status')).toContainText('2 items left', { useInnerText: true });
  await page.locator('.clear-completed').tap({ force: true });
  await expect(todos).toHaveCount(2);
  await todos.nth(0).getByRole('button', { name: /^Delete/ }).tap();
  await expect(todos).toHaveCount(1);
  await page.locator('.toggle-all').tap();
  await expect(page.getByRole('status')).toContainText('0 items left', { useInnerText: true });
});
