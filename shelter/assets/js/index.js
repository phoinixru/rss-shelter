const qs = (selector, element = document) => element.querySelector(selector);
const qsa = (selector, element = document) => [...element.querySelectorAll(selector)];
const { entries, keys, values, assign, fromEntries } = Object;

function elt(type, props, ...children) {
  let dom = document.createElement(type);
  if (props) Object.assign(dom, props);
  for (let child of children) {
    if (typeof child != "string") dom.appendChild(child);
    else dom.appendChild(document.createTextNode(child));
  }
  return dom;
}

window.addEventListener('load', initialize);

function initialize() {
  console.log('initializing');
  // Burger menu
  addBurgerMenuHandlers();
}

const addBurgerMenuHandlers = (e) => {
  qs('#burger-button').addEventListener('click', toggleBurgerMenu);

  qs('.burger-navigation').addEventListener('click', handleBurgerClicks);


  // Switch off burger menu on media query
  const mediaQueryList = window.matchMedia("(max-width: 768px)");

  function handleOrientationChange(mqlEvent) {
    const { matches } = mqlEvent;
    if (!matches) {
      qs('body').classList.toggle('burger-open', false);
    }
  }

  handleOrientationChange(mediaQueryList);

  mediaQueryList.addEventListener("change", handleOrientationChange);
};

const toggleBurgerMenu = (event) => {
  qs('body').classList.toggle('burger-open');

  event && event.preventDefault();
}

const handleBurgerClicks = (event) => {
  const classList = event.target.classList;
  const isOverlay = classList.contains('burger-navigation');
  const isClickableLink = classList.contains('navigation__link') && !classList.contains('navigation__link--active');

  if (isOverlay || isClickableLink) {
    toggleBurgerMenu();
  }
}