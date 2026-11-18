# TodoMVC: CSS

## Description

This application uses HTML and CSS alone to implement a todo application. There is no JavaScript on the page, and its Content-Security-Policy, `script-src 'none'`, has the browser refuse any. It holds 12 todos, and a deleted todo's row is free again only once the list is empty. It keeps nothing after a reload.

CSS is the language for describing the presentation of web pages, including colors, layout, and fonts.

[w3.org/Style/CSS](https://www.w3.org/Style/CSS/)

## Implementation details

Every todo is a text field, and the whole list is one form of 12 of them. The empty field at the top is where you type. When you press Enter, the browser's own form validation moves the cursor to the next empty required field, and that one becomes the new top field. The field you left keeps its text, which is now the todo's title. Double-click a todo to edit it in that same field.

CSS tells todos from empty rows by the state of their fields. A field with text is `:valid`, and an empty one is `:placeholder-shown`. A `pattern` refuses a title made only of spaces, or one holding `</xmp` (Escape's copy of the titles is written inside an `<xmp>`), so a row like that isn't a todo either.

Each row also keeps a few numbers, such as whether it's completed or deleted. A click sets one, and it stays set after you let go.

A todo's circle and its ×, Clear completed and toggle all are buttons that open and close an empty popover each (`commandfor`). Each row, and the list's section, keeps by layout whether its popovers were open: a box's position, read back through a scroll-driven animation's progress. For the one frame in which a popover and what was kept differ, a todo turns over or is deleted, a completed row marks itself deleted, or every row takes toggle all's target, as the counts were a frame before, and each row's own record keeps what it took. No timer and no timed animation does it, so they work the same from a mouse, Enter, Space, a tap or a screen reader, however short the press. (The sheet's timed CSS keeps no state: for 10 ms after Enter the new field steps off the page while its placeholder is drawn in its place, a spare row leaves the flow a second after the list passes it, and a row's Edit button stays for 0.1 s after an emptied edit closes, so Escape gives the focus back to it.)

The filters are links to `#/`, `#/active` and `#/completed`, and `:target` decides which rows show. So the filter lives in the address: a reload keeps it, and Back undoes it.

The count of items left is measured, not counted: each todo puts a box 16 pixels wide in a chain (17 when completed), and the chain's width, read back as one number, holds both totals. It is written out as text so a screen reader can read it.

The page holds 12 todos: a stylesheet can't add rows, so the page has 12. A new todo always goes after the last one, so the rows' order is the list's; a deleted todo's row is used again once the list is empty (the last todo deleted, or everything cleared). When the last row holds a todo, the new-todo field says so, with how many rows deleted todos still hold, and takes nothing more.

TodoMVC's own Cypress tests, run unchanged, pass 0 of 29 here, in Chrome, Firefox and WebKit (Cypress's experimental WebKit). Their `beforeEach` wants no `.todo-list li` on a fresh page, and this page has its 12 rows from the start, because a stylesheet can't add an element. They also look for the `completed` and `selected` classes, which nothing here can add. `tests/todomvc.spec.mjs` runs the same 29 tests with the same steps, and reads what the page shows where TodoMVC's read classes and the DOM: a todo's name for its label, `aria-current` for `selected`, and for trimming, where the title's first letter is drawn. 27 pass in each engine. Escape is marked as failing, because the circle's name still says the typed title after Escape, and the persistence test is skipped, as TodoMVC skips it for apps that keep nothing in `localStorage`.

### Reading app.css

`index.html` and `src/app.css` are written by a program from one source: the 12 rows are one row, numbered, and a row's record is laid out from a table. app.css is in eleven sections, each opened by a comment, in the page's order: the registered numbers, keyframes, fonts and counter styles, the page, the latch, toggle all and Clear completed, a row and its record, the count, a row drawn, an edit and Escape's copy, the ×, the footer. The short names:

- `--rec`, a row's record: six fields of two values packed in one number. `cx`, an edit cancelled by Escape; `done`; `dead`, deleted; `live`, a todo; `tk` and `gk`, the circle's and the ×'s popovers as the row last saw them.
- For each field `<f>`: `--k-<f>`, its value as kept; `--set-<f>`, the value a rule writes; `--w-<f>`, 1 where that rule writes (several rules write one field, and the cascade keeps the last, so their order matters); `--x-<f>`, the value after the writes. `--next` packs them again, and the latch keeps it.
- `--la` and `--lc`: the two layout reads, a row's record and the counts. `--e-ta`, `--e-cc`, `--e-gx`: the frame a press of toggle all, Clear completed or a × is seen.
- `--e` and `--f`: a row's field is empty, focused. `--tc` and `--gx`: its circle's and its ×'s popovers are open.
- `.tog` and `.gone`: the circle and the ×, as buttons; `.wipe`: the × on the last todo, the form's reset; `.pop`: an edit's popover; `.snap` and `.copy`: the button that sends the titles to Escape's copy, and the frame that draws it; `.tally` and `.sum`: the count's chain of boxes and its end; `.said`: the count as a screen reader says it; `.rest`, `.sink` and `.last`: where the focus goes after Enter, after an emptied edit, and when the list is full.

## Known deviations

From TodoMVC's app spec, because the page runs no script:

- **12 todos.** A deleted or cleared todo's row is used again only once the list is empty; until then the new-todo field says how many rows deleted todos still hold. The add that takes the last row says at once, in the browser's own message, that the page is full.
- **Escape** draws the old title again, but the field keeps what you typed, so the todo's name for a screen reader and the next edit have the typed text. It cancels only an edit begun by a double-click: a title reached by Tab is edited in place, and there Escape keeps what you typed. A `+` in the old title is drawn as a space. In Chrome and Safari the old title can be drawn 1 px high when a deleted todo's row is above it. An edit emptied (or left with only spaces) and then cancelled by Escape deletes the todo, as such an edit left by Enter does.
- **Leaving the new-todo field adds what is in it,** as Enter does: a click or tap elsewhere with text typed makes it a todo (on an iPhone, a tap on the page's text keeps the focus, so there it doesn't).
- **Two presses closer than a frame can count once.** A press is seen as its popover differing from what the page kept a frame before, so a second press of the same button in that frame can undo the first before it is seen: two Enters on toggle all 1 ms apart did in WebKit (2 of 3 runs), and a click and an Enter on it 5 ms apart in Firefox and WebKit. Two clicks on a todo's circle 0 ms apart counted twice in all three browsers.
- **Nothing is kept** after a reload: there is no `localStorage`.
- **A long title is one line,** cut with "…": a title is its own text field, and a row's height is fixed. TodoMVC's examples wrap it onto more lines.
- **Trimming is drawn.** A title's leading and trailing spaces stay in its field and are drawn as nothing. In Safari and Firefox a completed title's line-through runs on over its trailing spaces.
- **No focus at a filter's address.** Loaded at `#/active` or `#/completed`, the page focuses no field: HTML runs no autofocus while the address points at an element.
- **Back can take more than one press** to undo a filter after editing: an edit and its Escape can add entries to the history.
- **No `completed`, `editing` or `selected` classes,** and the count's number is drawn by CSS rather than written in its `<strong>`.
- **Titles holding `</xmp` are refused,** as titles of only spaces are.
- **The focus goes to the page** after a × or Clear completed, after a filter is chosen, and after an edit ended by Enter, as in TodoMVC's script examples. After an edit ended by Escape it goes back to the row's Edit button, where they leave it on the page.
- **The console logs "An invalid form control is not focusable"** on each Enter, once for each empty field the browser's validation passes over (the rows not in use, and each row's hidden field that takes the focus when an edit is emptied). It is the browser reporting its own form validation; the page runs no script.
- **The circles and toggle all are buttons, not checkboxes.** Their state is in their names ("Mark as complete", "Mark as active"), not a checked state.
- **In WebKit an edit begun by a double-click puts the caret at the start** of the title, not the end (WebKit's autofocus does that; Chrome and Firefox put it at the end).
- **A full list takes Enter's focus to its message.** With every row used, Enter moves the focus to a hidden field under the header, whose ring is drawn round the message; typing there does nothing.

## Build Steps

A simple build script copies all necessary files to a `dist` folder.

```
npm run build
```

## Requirements

A browser with invoker commands (`commandfor`), popovers, anchor positioning and scroll-driven animations: by MDN's compatibility data, Chrome 135, Safari 26.2 and Firefox 159 or later. Tested in Chrome 155 and Chromium 159, WebKit 26.4 and 27.2, and Firefox 159. Node 22.12 or later to install, build and test (@axe-core/playwright needs it).

## Local preview

```
terminal:
1. npm install
2. npm run dev
browser:
1. http://localhost:7001/
```

If port 7001 is taken, serve the folder on another: `npx http-server -p 8080 -c-1`.

## In a page of your own

Copy `section.todoapp` (the form is inside it) and link `src/app.css`. Like TodoMVC's own stylesheet, app.css styles `html` and `body`: a light grey background, and the body 550px wide and centred. Both are yours to change. It also puts `timeline-scope: --cnt` on `body`, which the count needs on some element around `.todoapp`; if you change `body`, put it on a wrapper instead:

```css
html, body { background: #15171c; }
body { max-width: none; }
.wrap { max-width: 550px; margin: 0 auto; timeline-scope: --cnt; }
```

The "todos" heading is drawn in `.todoapp`'s 130px top margin, so keep that space above it. Don't put CSS `zoom` on an element around the app: WebKit 27.2 (the build Playwright 1.65 runs) reads each row's state multiplied by it, and the list goes wrong. A browser's own zoom is fine.

Colours, for a dark page of your own: the colours are written in app.css's rules, with no variables to set, and the circles are SVG images. The old title after Escape is drawn in a frame of its own, styled by the form's `action` (its `color:%23484848`), so change it there. The app's own custom properties have short names (`--todo`, `--done`, `--filter`): give yours a prefix, since inside the app its own values replace yours.

One app to a page: its ids, and the filter it reads from the address, are the page's own. Your page's `box-sizing` reset and `button` styles don't reach inside the app, and its footer folds onto two lines when the app is 430px wide or less, whatever the window's width.

## Credit

The look follows [todomvc-app-css](https://github.com/tastejs/todomvc-app-css) by Sindre Sorhus ([CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)), rewritten for this markup. The font is cut from [TeX Gyre Heros](https://ctan.org/pkg/tex-gyre-heros) by B. Jackowski and J.M. Nowacki ([GUST Font License](https://www.gust.org.pl/projects/e-foundry/licenses)).

## Tests

```
npm ci
npx playwright install --with-deps
npm test
```
