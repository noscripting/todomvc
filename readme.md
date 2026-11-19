# TodoMVC: CSS

## Description

This application uses HTML and CSS, with no JavaScript, to implement the TodoMVC application. The todos' state is kept in the page's layout: each of a todo's flags (done, deleted, and two more) is one bit of a number with a bit for every todo, held as the length of a chain of boxes and read back by a view timeline.

## Usage

Open `index.html` in Chrome 138, Safari 26.2 or Firefox 159, or later.

## Tests

```
npm install
npm test
```

## Credit

The look follows [todomvc-app-css](https://github.com/tastejs/todomvc-app-css) by Sindre Sorhus ([CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)). The font is cut from [TeX Gyre Heros](https://ctan.org/pkg/tex-gyre-heros) by B. Jackowski and J.M. Nowacki ([GUST Font License](https://www.gust.org.pl/projects/e-foundry/licenses)).
