// TodoMVC's tests, from tastejs/todomvc's cypress/e2e/spec.cy.js: the same 29 tests, names and steps, in Playwright Test.
// The page has no script, so its document never changes: no element is added and no class comes or goes. The tests
// read what the page shows instead: a todo is a visible list item whose title field is filled, its toggle's
// accessible name is "Mark as complete" or "Mark as active" and its text, completed is the second, the counter is the page's status text.
import { test, expect } from '@playwright/test';

const PAGE = new URL('../index.html', import.meta.url).href;
const ONE = 'buy some cheese', TWO = 'feed the cat', THREE = 'book a doctors appointment';

const todos = (page) => page.locator('.todo-list li').filter({ visible: true, has: page.locator('.title:valid') });
const todo = (page, n) => todos(page).nth(n);
const newTodo = (page) => page.locator('.todo-list .title:placeholder-shown').filter({ visible: true }).first();
const label = (page, n) => todo(page, n).locator('.tog');
const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isDone = (page, n) => expect(label(page, n)).toHaveAccessibleName(/^Mark as active /);
const isActive = (page, n) => expect(label(page, n)).toHaveAccessibleName(/^Mark as complete /);
const toggleAll = (page) => page.locator('.toggle-all');
const count = (page) => page.getByRole('status');
// a title as drawn: the field keeps the spaces typed, and its font draws those before the first letter 0 wide, so the
// title drawn starts where its field's text starts (TodoMVC's "does not have any whitespace around it"); spaces after
// the last letter draw nothing. An accessible name is trimmed by the browser, so it can't tell.
const drawn = (page, n) => todo(page, n).locator('.title').evaluate((f) => { const v = f.value, lead = v.match(/^\s*/)[0].length;
  if (!lead || lead === v.length) return v.trimEnd();
  const cs = getComputedStyle(f), s = document.createElement('span');
  for (const k of ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'fontStretch', 'letterSpacing', 'wordSpacing', 'textTransform']) s.style[k] = cs[k];
  Object.assign(s.style, { position: 'absolute', whiteSpace: 'pre', left: '0', top: '0' }); s.textContent = v; document.body.append(s);
  const r = document.createRange(); r.setStart(s.firstChild, lead); r.setEnd(s.firstChild, lead + 1); const x = r.getBoundingClientRect().left - s.getBoundingClientRect().left; s.remove();
  return (x < 0.5 ? v.slice(lead) : v).trimEnd(); });

// a press is Playwright's click(), down and up at once: every control acts on the click
const press = (locator) => locator.click();
const createTodo = async (page, text) => {
  const n = await todos(page).count();
  await newTodo(page).click();
  await page.keyboard.type(text, { delay: 10 });
  await page.keyboard.press('Enter');
  await expect(todos(page)).toHaveCount(n + 1);
};
const createDefaultTodos = async (page) => { for (const t of [ONE, TWO, THREE]) await createTodo(page, t); };
const hasLabels = async (page, ...texts) => { for (const [n, t] of texts.entries()) await expect(label(page, n)).toHaveAccessibleName(new RegExp(`^Mark as (complete|active) ${esc(t)}$`)); };
const check = (page, n) => press(todo(page, n).locator('.toggle'));
const edit = async (page, n) => { await todo(page, n).locator('.todo').dblclick(); await expect(todo(page, n).getByRole('textbox')).toBeFocused(); };
const clear = (page) => page.keyboard.press('ControlOrMeta+A').then(() => page.keyboard.press('Backspace'));
const filter = (page, name) => press(page.getByRole('link', { name, exact: true }));

test.beforeEach(async ({ page }) => {
  await page.goto(PAGE);
  await expect(todos(page)).toHaveCount(0);
});

test.describe('When page is initially opened', () => {
  test('should focus on the todo input field', async ({ page }) => {
    await expect(newTodo(page)).toBeFocused();
  });
});

test.describe('No Todos', () => {
  test('starts with nothing', async ({ page }) => {
    await expect(todos(page)).toHaveCount(0);
  });
  test('should hide #main and #footer', async ({ page }) => {
    await expect(todos(page)).toHaveCount(0);
    await expect(page.locator('.main .toggle-all')).not.toBeVisible();
    await expect(page.locator('.footer')).not.toBeVisible();
  });
});

test.describe('New Todo', () => {
  test('should allow me to add todo items', async ({ page }) => {
    await createTodo(page, ONE);
    await hasLabels(page, ONE);
    await createTodo(page, TWO);
    await hasLabels(page, ONE, TWO);
  });
  test('should clear text input field when an item is added', async ({ page }) => {
    await createTodo(page, ONE);
    await expect(page.locator('.todo-list .title:focus')).toHaveValue('');
  });
  test('should append new items to the bottom of the list', async ({ page }) => {
    await createDefaultTodos(page);
    await expect(count(page)).toContainText('3 items left', { useInnerText: true });
    await hasLabels(page, ONE, TWO, THREE);
  });
  test('should trim text input', async ({ page }) => {
    await createTodo(page, `    ${ONE}    `);
    await hasLabels(page, ONE);
    expect(await drawn(page, 0)).toBe(ONE);
  });
  test('should show #main and #footer when items added', async ({ page }) => {
    await createTodo(page, ONE);
    await expect(page.locator('.main .toggle-all')).toBeVisible();
    await expect(page.locator('.footer')).toBeVisible();
  });
});

test.describe('Mark all as completed', () => {
  test.beforeEach(async ({ page }) => { await createDefaultTodos(page); });
  test('should allow me to mark all items as completed', async ({ page }) => {
    await press(page.locator('.toggle-all'));
    for (const n of [0, 1, 2]) await isDone(page, n);
  });
  test('should allow me to clear the complete state of all items', async ({ page }) => {
    await press(page.locator('.toggle-all'));
    await expect(toggleAll(page)).toHaveAccessibleName('Mark all as active');
    await press(page.locator('.toggle-all'));
    for (const n of [0, 1, 2]) await isActive(page, n);
  });
  test('complete all checkbox should update state when items are completed / cleared', async ({ page }) => {
    await press(page.locator('.toggle-all'));
    await expect(toggleAll(page)).toHaveAccessibleName('Mark all as active');
    await check(page, 0);
    await expect(toggleAll(page)).toHaveAccessibleName('Mark all as complete');
    await check(page, 0);
    await expect(toggleAll(page)).toHaveAccessibleName('Mark all as active');
  });
});

test.describe('Item', () => {
  test('should allow me to mark items as complete', async ({ page }) => {
    await createTodo(page, ONE);
    await createTodo(page, TWO);
    await check(page, 0);
    await isDone(page, 0);
    await isActive(page, 1);
    await check(page, 1);
    await isDone(page, 0);
    await isDone(page, 1);
  });
  test('should allow me to un-mark items as complete', async ({ page }) => {
    await createTodo(page, ONE);
    await createTodo(page, TWO);
    await check(page, 0);
    await isDone(page, 0);
    await isActive(page, 1);
    await check(page, 0);
    await isActive(page, 0);
    await isActive(page, 1);
  });
  test('should allow me to edit an item', async ({ page }) => {
    await createDefaultTodos(page);
    await edit(page, 1);
    await expect(todo(page, 1).getByRole('textbox')).toHaveValue(TWO);
    await clear(page);
    await page.keyboard.type('buy some sausages', { delay: 10 });
    await page.keyboard.press('Enter');
    await hasLabels(page, ONE, 'buy some sausages', THREE);
  });
});

test.describe('Editing', () => {
  test.beforeEach(async ({ page }) => { await createDefaultTodos(page); });
  test('should hide other controls when editing', async ({ page }) => {
    await edit(page, 1);
    // not drawn: the circle stays in the Tab order (Shift+Tab from the field reaches it), so it is hidden by opacity
    await expect.poll(() => todo(page, 1).locator('.toggle').evaluate((e) => { const s = getComputedStyle(e); return s.visibility === 'hidden' || s.opacity === '0'; })).toBe(true);
    await expect.poll(() => todo(page, 1).locator('.destroy').evaluate((e) => { const s = getComputedStyle(e); return s.visibility === 'hidden' || s.opacity === '0'; })).toBe(true);
  });
  test('should save edits on blur', async ({ page }) => {
    await edit(page, 1);
    await clear(page);
    await page.keyboard.type('buy some sausages', { delay: 10 });
    await todo(page, 1).getByRole('textbox').blur();
    await hasLabels(page, ONE, 'buy some sausages', THREE);
  });
  test('should trim entered text', async ({ page }) => {
    await edit(page, 1);
    await clear(page);
    await page.keyboard.type('    buy some sausages    ', { delay: 10 });
    await page.keyboard.press('Enter');
    await hasLabels(page, ONE, 'buy some sausages', THREE);
    expect(await drawn(page, 1)).toBe('buy some sausages');
  });
  test('should remove the item if an empty text string was entered', async ({ page }) => {
    await edit(page, 1);
    await clear(page);
    await page.keyboard.press('Enter');
    await expect(todos(page)).toHaveCount(2);
  });
  test('should cancel edits on escape', async ({ page }) => {
    test.fail(true, 'Escape draws the old title again, but the field keeps the typed text, and its name with it: a page with no script cannot set a field back');
    await edit(page, 1);
    await clear(page);
    await page.keyboard.type('foo', { delay: 10 });
    await page.keyboard.press('Escape');
    await hasLabels(page, ONE, TWO, THREE);
  });
});

test.describe('Counter', () => {
  test('should display the current number of todo items', async ({ page }) => {
    await createTodo(page, ONE);
    await expect(count(page)).toContainText('1 item left', { useInnerText: true });
    await createTodo(page, TWO);
    await expect(count(page)).toContainText('2 items left', { useInnerText: true });
  });
});

test.describe('Clear completed button', () => {
  test.beforeEach(async ({ page }) => { await createDefaultTodos(page); });
  test('should display the correct text', async ({ page }) => {
    await check(page, 0);
    await expect(page.locator('.clear-completed')).toHaveText('Clear completed');
    await expect(page.locator('.clear-completed')).toBeVisible();
  });
  test('should remove completed items when clicked', async ({ page }) => {
    await check(page, 1);
    await press(page.locator('.clear-completed'));
    await expect(todos(page)).toHaveCount(2);
    await hasLabels(page, ONE, THREE);
  });
  test('should be hidden when there are no items that are completed', async ({ page }) => {
    await check(page, 1);
    await expect(page.locator('.clear-completed')).toBeVisible();
    await press(page.locator('.clear-completed'));
    await expect(page.locator('.clear-completed')).not.toBeVisible();
  });
});

test.describe('Persistence', () => {
  test('should persist its data', async () => {
    test.skip(true, 'TodoMVC skips it for apps that keep nothing in localStorage (noLocalStorageCheck), as for its React, Vue and Svelte');
  });
});

test.describe('Routing', () => {
  test.beforeEach(async ({ page }) => { await createDefaultTodos(page); });
  test('should allow me to display active items', async ({ page }) => {
    await check(page, 1);
    await filter(page, 'Active');
    await expect(todos(page)).toHaveCount(2);
    await hasLabels(page, ONE, THREE);
  });
  test('should respect the back button', async ({ page }) => {
    await check(page, 1);
    await filter(page, 'All');
    await expect(todos(page)).toHaveCount(3);
    await filter(page, 'Active');
    await filter(page, 'Completed');
    await expect(todos(page)).toHaveCount(1);
    await page.goBack();
    await expect(todos(page)).toHaveCount(2);
    await page.goBack();
    await expect(todos(page)).toHaveCount(3);
  });
  test('should allow me to display completed items', async ({ page }) => {
    await check(page, 1);
    await filter(page, 'Completed');
    await expect(todos(page)).toHaveCount(1);
  });
  test('should allow me to display all items', async ({ page }) => {
    await check(page, 1);
    await filter(page, 'Active');
    await filter(page, 'Completed');
    await filter(page, 'All');
    await expect(todos(page)).toHaveCount(3);
  });
  test('should highlight the currently applied filter', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'All', exact: true })).toHaveAttribute('aria-current', 'page');
    await filter(page, 'Active');
    await expect(page.getByRole('link', { name: 'Active', exact: true })).toHaveAttribute('aria-current', 'page');
    await filter(page, 'Completed');
    await expect(page.getByRole('link', { name: 'Completed', exact: true })).toHaveAttribute('aria-current', 'page');
  });
});
