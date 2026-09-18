/* eslint-disable -- sx-port: ported verbatim from https://sciex.com/blocks/hero-small/hero-small.js (2026-09-18); only import paths changed. See stardust/eds-port-log.md */
import { span } from '../../scripts/sx/dom-builder.js';
import { decorateIcons } from '../../scripts/aem.js';

function extractBlockData(block) {
  const cells = [...block.querySelectorAll(':scope > div')];
  const clonedCells = cells.map((cell) => cell.cloneNode(true));

  const mediaDivChildren = clonedCells[15]?.querySelectorAll(':scope > div') || [];

  const isContactHero = mediaDivChildren[1]
    ?.querySelector('p')
    ?.textContent
    ?.trim() === 'true';

  const data = {
    heading: clonedCells[1]?.innerText.trim(),
    description: clonedCells[2]?.innerText.trim(),
    tagline: clonedCells[12]?.innerText.trim(),
    badgePicture: clonedCells[13]?.querySelector('picture'),
    captionPosition: clonedCells[14]?.querySelector('p')?.textContent?.trim() || 'top',
    mainPicture: clonedCells[15]?.querySelector('picture'),
    videoAnchor: clonedCells[15]?.querySelector('.button-container a'),
    mediaDivChildren,
    buttonDataList: [],
    isContactHero,
  };

  // Extract button data
  for (let i = 3; i < 12; i += 3) {
    const label = clonedCells[i]?.innerText.trim();
    const link = clonedCells[i + 1]?.querySelector('a')?.getAttribute('href');
    const target = clonedCells[i + 2]?.innerText.trim() || '_self';
    if (label && link) data.buttonDataList.push({ label, link, target });
  }

  // Detect colourPic (3 div children pattern)
  if (mediaDivChildren.length === 3) {
    data.colourPicture = clonedCells[14]?.querySelector('picture');
    data.colourPictureBg = clonedCells[14]?.querySelector('.button-container a');
  }

  return data;
}

function preserveOriginalAuthoring(block) {
  const originalWrapper = document.createElement('div');
  originalWrapper.className = 'hero-original';
  originalWrapper.style.display = 'none';
  while (block.firstChild) {
    originalWrapper.appendChild(block.firstChild);
  }
  block.appendChild(originalWrapper);
}

function buildHeroContent(data) {
  const taglineWrap = document.createElement('div');
  const applyClass = (baseClass) => (data.isContactHero ? `contact-${baseClass}` : baseClass);

  const content = document.createElement('div');
  content.className = applyClass('hero-content');

  // Tagline + Badge
  if (data.tagline) {
    const baseClass = applyClass('hero-tagline-wrap');

    taglineWrap.className = data.captionPosition === 'bottom'
      ? `${baseClass}-bottom`
      : baseClass;
    if (data.badgePicture) {
      const badgeWrap = document.createElement('div');
      badgeWrap.className = applyClass('hero-badge');
      badgeWrap.append(data.badgePicture);
      taglineWrap.append(badgeWrap);
    }

    const tagline = document.createElement('p');
    tagline.className = applyClass('hero-tagline');
    tagline.textContent = data.tagline;
    taglineWrap.append(tagline);
    if (data.captionPosition !== 'bottom') {
      content.append(taglineWrap);
    }
  }

  // Heading
  if (data.heading) {
    const heading = document.createElement('h1');
    heading.className = applyClass('hero-heading-hero');
    heading.textContent = data.heading;
    content.append(heading);
  }

  // Description
  if (data.description) {
    const desc = document.createElement('p');
    desc.className = applyClass('hero-description');
    desc.textContent = data.description;
    content.append(desc);
  }

  // Buttons
  if (data.buttonDataList.length) {
    const buttons = document.createElement('div');
    buttons.className = applyClass('hero-buttons');

    const buttonClasses = ['button primary', 'button secondary', 'button link'];

    data.buttonDataList.forEach((btn, index) => {
      const buttonEl = document.createElement('a');
      buttonEl.href = btn.link;
      buttonEl.target = btn.target;
      buttonEl.className = buttonClasses[index] || 'button link';

      const labelSpan = document.createElement('span');
      labelSpan.textContent = btn.label;
      buttonEl.append(labelSpan);
      if (data.isContactHero && index === 1) {
        buttonEl.append(span({ class: 'icon icon-arrow-blue' }));
      } else {
        buttonEl.append(span({ class: 'icon icon-arrow' }));
      }

      buttons.append(buttonEl);
    });

    content.append(buttons);
    decorateIcons(buttons, '/blocks/hero-small');
  }
  if (taglineWrap && data.captionPosition === 'bottom') {
    content.append(taglineWrap);
  }

  return content;
}

function applyLayoutAndBackground(data, heroContainer, heroWrapper, heroContent) {
  if (data.colourPicture) {
    const imgSrc = data.colourPicture.querySelector('img')?.src;
    const bgColor = data.colourPictureBg?.textContent?.trim();

    if (bgColor) heroContainer.style.backgroundColor = bgColor;

    if (imgSrc) {
      const sideImage = document.createElement('div');
      sideImage.className = 'hero-side-image';
      const img = document.createElement('img');
      img.src = imgSrc;
      img.alt = 'hero-side-image';
      sideImage.append(img);

      const wrapper = document.createElement('div');
      wrapper.className = 'hero-content-wrapper';
      wrapper.append(heroContent);
      wrapper.append(sideImage);
      heroWrapper.append(wrapper);
    } else {
      heroWrapper.append(heroContent);
    }
  } else if (data.videoAnchor) {
    const videoSrc = data.videoAnchor.getAttribute('href');
    if (videoSrc) {
      const video = document.createElement('video');
      video.src = videoSrc;
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.className = 'hero-bg-video';
      heroContainer.append(video);
      heroContainer.classList.add('hero-has-bg');
    }
    heroWrapper.append(heroContent);
  } else if (data.mainPicture) {
    const imgSrc = data.mainPicture.querySelector('img')?.src;
    if (imgSrc) {
      if (data.isContactHero) {
        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = 'Contact hero image';
        img.classList.add('contact-hero-img');
        heroContainer.appendChild(img);
      } else {
        heroContainer.style.backgroundImage = `url('${imgSrc}')`;
        heroContainer.classList.add('hero-has-bg');
      }
    }
    heroWrapper.append(heroContent);
  } else {
    heroWrapper.append(heroContent);
  }
}

export default function decorate(block) {
  const data = extractBlockData(block);
  preserveOriginalAuthoring(block);

  const fragment = document.createDocumentFragment();
  const heroContainer = document.createElement('div');

  const heroWrapper = document.createElement('div');
  heroWrapper.className = data.isContactHero ? 'contact-hero-wrapper' : 'hero-wrapper';
  heroContainer.classList.add(data.isContactHero ? 'contact-hero-container' : 'herosmallclass');

  const heroContent = buildHeroContent(data);
  applyLayoutAndBackground(data, heroContainer, heroWrapper, heroContent);

  heroContainer.append(heroWrapper);
  fragment.append(heroContainer);
  block.append(fragment);
}
