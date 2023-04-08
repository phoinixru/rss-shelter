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

  // Pet cards slider
  populateSlider();
  addSliderPaginationHandlers();

  // Our pets page
  Pets.init();
}


// Burger menu
const addBurgerMenuHandlers = (e) => {
  qs('#burger-button').addEventListener('click', toggleBurgerMenu);
  qs('.burger-navigation').addEventListener('click', handleBurgerClicks);


  // Switch off burger menu on media query
  const mediaQueryList = window.matchMedia("(max-width: 768px)");

  function handleWidthChange(mqlEvent) {
    const { matches } = mqlEvent;
    if (!matches) {
      qs('body').classList.toggle('burger-open', false);
    }
  }

  handleWidthChange(mediaQueryList);
  mediaQueryList.addEventListener("change", handleWidthChange);
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
const petIds = keys(PETS);
const pickCards = (exclude = [], number = 3) => {
  return petIds
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
    cardIds = pickCards(cardIds);
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

  const sliderCard = (id) => `<li class="pet__card slider__card" data-id="${id}">${generatePetCard(id)}</li>`;

  slide.innerHTML = `<ul class="pets__cards slider__cards">${cardIds.map(sliderCard).join`\n`}</ul>`;
}

const generatePetCard = (id) => {
  const { name, img } = PETS[id];

  return `<a class="pet__link" href="#">
    <div class="pet__photo">
      <img src="${img}" alt="${name}'s photo" width="270" height="270">
    </div>
    <strong class="pet__name">${name}</strong>
    <span class="button button-secondary">Learn more</span>
  </a>`;
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
  renderSlide(fromSlideId, pickCards(excludeIds));
}

const Pets = {
  SIX_CARDS_BP: 628,
  EIGHT_CARDS_BP: 1280,

  ON_DESKTOP: 8,
  ON_TABLET: 6,
  ON_MOBILE: 3,
  TOTAL_CARDS: 48,

  currentPage: 1,
  firstCardIdx: 0,

  init() {
    const container = qs('#pets');
    if (!container) {
      return;
    }

    this.container = container;
    this.perPage = this.ON_MOBILE;
    this.pickCards();

    this.addMediaQueryHandlers();
    this.addPaginationHandlers();
    this.renderCards();

    this.updateTotalPages();
    this.updatePagination();
  },

  pickCards(numberOfCards = this.TOTAL_CARDS) {
    const cards = [];
    const pick = [6, 2, 4, 4, 2, 6];
    let exclude = [], i = 0;

    while (cards.length < numberOfCards) {
      const count = pick[i++ % pick.length];
      exclude = pickCards(exclude, count);
      cards.push(...exclude);

      if (cards.length % 24 === 0) {
        exclude = [];
      }
    }

    this.cards = cards;
  },

  addMediaQueryHandlers() {
    // Change number of cards
    const mqTablet = window.matchMedia(`(min-width: ${this.SIX_CARDS_BP}px)`);
    const mqDesktop = window.matchMedia(`(min-width: ${this.EIGHT_CARDS_BP}px)`);

    mqTablet.addEventListener("change", e => this.handleWidthChange(e));
    mqDesktop.addEventListener("change", e => this.handleWidthChange(e));

    if (mqTablet.matches) {
      this.perPage = this.ON_TABLET;
    }

    if (mqDesktop.matches) {
      this.perPage = this.ON_DESKTOP;
    }
  },

  handleWidthChange(mqlEvent) {
    const { media, matches } = mqlEvent;

    this.perPage = media.match(`${this.EIGHT_CARDS_BP}`)
      ? (matches ? this.ON_DESKTOP : this.ON_TABLET)
      : (matches ? this.ON_TABLET : this.ON_MOBILE);

    this.updateTotalPages();
    this.putCardInView(this.firstCardIdx);
    this.updatePagination();
  },

  updateTotalPages() {
    this.totalPages = Math.ceil(this.cards.length / this.perPage);
  },

  renderCards() {
    const { cards, currentPage, perPage, container } = this;

    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    const ids = cards.slice(start, end);

    qsa('.pet__card', container).forEach((card, id) => {
      const petId = ids[id];

      card.innerHTML = petId ? generatePetCard(petId) : '';
      card.classList.toggle('pet__card--empty', petId === undefined);
      card.dataset.id = petId || -1;

    });

    // Save first visible card for num cards change
    this.firstCardIdx = start;
  },

  putCardInView(cardIdx) {
    const pageWithCard = Math.ceil((cardIdx + 1) / this.perPage);

    this.currentPage = pageWithCard;
    this.renderCards();
  },

  addPaginationHandlers() {
    qs('.pagination', this.container).addEventListener('click', e => this.handlePaginationClick(e))
  },

  handlePaginationClick(event) {
    event.preventDefault();

    const { target: link } = event;
    if (!link.matches('.pagination__link') || link.matches('.pagination__link--disabled')) {
      return;
    }

    this.currentPage = +link.dataset.page;
    this.renderCards();
    this.updatePagination();
  },

  updatePagination() {
    const { currentPage, totalPages, container } = this;

    const relations = {
      first: 1,
      prev: Math.max(1, currentPage - 1),
      current: currentPage,
      next: Math.min(currentPage + 1, totalPages),
      last: totalPages
    };

    const disabled = {
      first: currentPage === 1,
      prev: currentPage === 1,
      next: currentPage >= totalPages,
      last: currentPage >= totalPages
    }

    qsa('.pagination__link', container).forEach(link => {
      const rel = link.dataset.rel;
      const isDisabled = disabled[rel];

      link.dataset.page = relations[rel];
      link.classList.toggle('pagination__link--disabled', isDisabled);
    });

    qs('.pagination__page', container).innerText = currentPage;
  }
}