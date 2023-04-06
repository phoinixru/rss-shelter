import PETS from './pets.js';

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
  // Burger menu
  addBurgerMenuHandlers();

  // Pet cards
  populateSlider();
  addSliderPaginationHandlers();
}


// Burger menu
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


// Slider
const shuffle = () => Math.random() - 0.5;
const pickCardsForSlider = (exclude = [], number = 3) => {
  return keys(PETS)
    .filter(id => !exclude.includes(id))
    .sort(shuffle)
    .slice(0, number);
};

const populateSlider = () => {
  const slider = qs('.slider');
  if (!slider) {
    return;
  }

  qs('.slider__slides', slider).innerHTML = '';
  let cardIds = [];
  for (let slideId = 0; slideId < 3; slideId++) {
    cardIds = pickCardsForSlider(cardIds);
    renderSlide(slideId, cardIds);
  }
}

const renderSlide = (slideId, cardIds) => {
  const slider = qs('.slider');
  let slide = qs(`.slider__slide[data-id="${slideId}"]`);

  if (!slide) {
    slide = elt('div', { className: 'slider__slide' });
    slide.dataset.id = slideId;
    qs('.slider__slides', slider).append(slide);
  }

  slide.innerHTML = `<ul class="pets__cards slider__cards">${cardIds.map(generatePetCard).join`\n`}</ul>`;
}

const generatePetCard = (id) => {
  const { name, img } = PETS[id];

  return `<li class="pet__card slider__card" data-id="${id}">
  <a class="pet__link" href="#">
    <div class="pet__photo">
      <img src="${img}" alt="${name}'s photo" width="270" height="270">
    </div>
    <strong class="pet__name">${name}</strong>
    <span class="button button-secondary">Learn more</span>
  </a>
</li>`;
}

let sliderInTransition = false;

const addSliderPaginationHandlers = () => {
  const sliderPagination = qs('.slider__pagination');
  if (!sliderPagination) {
    return;
  }

  sliderPagination.addEventListener('click', changeSlide);

  qs(".slider__slides").addEventListener("transitionend", updateSlidesAfterTransition);
};


const changeSlide = (event) => {
  event.preventDefault();

  const button = event.target.closest('.slider__nav');
  if (!button || sliderInTransition) {
    return;
  }

  sliderInTransition = true;

  const direction = button.matches('.slider__prev') ? 'prev' : 'next';

  qs('.slider').classList.toggle('show_next', direction === 'next');
  qs('.slider').classList.toggle('show_prev', direction === 'prev');
}


const updateSlidesAfterTransition = (event) => {
  const { target } = event;

  if (!target.matches('.slider__slide')) {
    return;
  }

  if (target.dataset.id === '1') {
    // finish transition
    qs('.slider').classList.remove('show_next', 'show_prev');
    sliderInTransition = false;
  } else {
    // update slides
    updateSlides(target);
  }
};

const updateSlides = (fromSlide) => {
  const fromSlideId = +fromSlide.dataset.id;
  const otherSlideId = fromSlideId == 2 ? 0 : 2;

  const centerSlide = qs(`.slider__slide[data-id="1"]`);
  const otherSlide = qs(`.slider__slide[data-id="${otherSlideId}"]`);

  // move cards from center slide
  otherSlide.innerHTML = '';
  otherSlide.append(...centerSlide.children);

  // put cards from new slide in center
  centerSlide.innerHTML = '';
  centerSlide.append(...fromSlide.children);

  const excludeIds = qsa('.slider__card', centerSlide).map(card => card.dataset.id);
  renderSlide(fromSlideId, pickCardsForSlider(excludeIds));
}