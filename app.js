import 'classlist-polyfill';
import Promise from 'bluebird';
import Markdown from 'markdown';
const md = Markdown.markdown.toHTML;
import workText from 'raw-loader!./work.txt';
import pgpText from 'raw-loader!./pgp.txt';
import headerHTML from 'raw-loader!./header.html';
let styleText = [0, 1, 2, 3].map((i) => require('raw-loader!./styles' + i + '.css').default);
import preStyles from 'raw-loader!./prestyles.css';
import replaceURLs from './lib/replaceURLs';
import {default as writeChar, writeSimpleChar, handleChar} from './lib/writeChar';
import getPrefix from './lib/getPrefix';


const isDev = window.location.hostname === 'localhost';
const speed = 16; 
let style, styleEl, workEl, pgpEl, skipAnimationEl, pauseEl;
let animationSkipped = false, done = false, paused = false;
let browserPrefix;

document.addEventListener("DOMContentLoaded", function() {
  getBrowserPrefix();
  populateHeader();
  getEls();
  createEventHandlers();
  startAnimation();
});

async function startAnimation() {
  try {
    await writeTo(styleEl, styleText[0], 0, speed, true, 1);
    await writeTo(workEl, workText, 0, speed, false, 1);
    await writeTo(styleEl, styleText[1], 0, speed, true, 1);
    createWorkBox();
    await Promise.delay(1000);
    await writeTo(styleEl, styleText[2], 0, speed, true, 1);
    await writeTo(pgpEl, pgpText, 0, speed, false, 32);
    await writeTo(styleEl, styleText[3], 0, speed, true, 1);
  }
  catch(e) {
    if (e.message === "SKIP IT") {
      surprisinglyShortAttentionSpan();
    } else {
      throw e;
    }
  }
}

// Skips all the animations.
async function surprisinglyShortAttentionSpan() {
  if (done) return;
  done = true;
  pgpEl.innerHTML = pgpText;
  let txt = styleText.join('\n');

  style.textContent = "#work-text * { " + browserPrefix + "transition: none; }";
  style.textContent += txt;
  let styleHTML = "";
  for(let i = 0; i < txt.length; i++) {
     styleHTML = handleChar(styleHTML, txt[i]);
  }
  styleEl.innerHTML = styleHTML;
  createWorkBox();

  let start = Date.now();
  while(Date.now() - 1000 > start) {
    workEl.scrollTop = Infinity;
    styleEl.scrollTop = pgpEl.scrollTop = Infinity;
    await Promise.delay(16);
  }
}


/**
 * Helpers
 */

let endOfSentence = /[\.\?\!]\s$/;
let comma = /\D[\,]\s$/;
let endOfBlock = /[^\/]\n\n$/;

async function writeTo(el, message, index, interval, mirrorToStyle, charsPerInterval){
  if (animationSkipped) {
    throw new Error('SKIP IT');
  }
  let chars = message.slice(index, index + charsPerInterval);
  index += charsPerInterval;

  el.scrollTop = el.scrollHeight;

  if (mirrorToStyle) {
    writeChar(el, chars, style);
  } else {
    writeSimpleChar(el, chars);
  }

  if (index < message.length) {
    let thisInterval = interval;
    let thisSlice = message.slice(index - 2, index + 1);
    if (comma.test(thisSlice)) thisInterval = interval * 30;
    if (endOfBlock.test(thisSlice)) thisInterval = interval * 50;
    if (endOfSentence.test(thisSlice)) thisInterval = interval * 70;

    do {
      await Promise.delay(thisInterval);
    } while(paused);

    return writeTo(el, message, index, interval, mirrorToStyle, charsPerInterval);
  }
}

function getBrowserPrefix() {
  browserPrefix = getPrefix(); 
  styleText = styleText.map(function(text) {
    return text.replace(/-webkit-/g, browserPrefix);
  });
}

function getEls() {
  let preStyleEl = document.createElement('style');
  preStyleEl.textContent = preStyles;
  document.head.insertBefore(preStyleEl, document.getElementsByTagName('style')[0]);

  // El refs
  style = document.getElementById('style-tag');
  styleEl = document.getElementById('style-text');
  workEl = document.getElementById('work-text');
  pgpEl = document.getElementById('pgp-text');
  skipAnimationEl = document.getElementById('skip-animation');
  pauseEl = document.getElementById('pause-resume');
}

//
// Create links in header (now footer). Skip, Pause ... maybe Add an algorithmic problem set for distributing drink tickets.
//
function populateHeader() {
  let header = document.getElementById('header');
  header.innerHTML = headerHTML;
}

//
// Create basic event handlers for user input.
//
function createEventHandlers() {
  styleEl.addEventListener('input', function() {
    style.textContent = styleEl.textContent;
  });

  // Skip  on click to skipAnimation
  skipAnimationEl.addEventListener('click', function(e) {
    e.preventDefault();
    animationSkipped = true;
  });

  pauseEl.addEventListener('click', function(e) {
    e.preventDefault();
    if (paused) {
      pauseEl.textContent = "Pause ||";
      paused = false;
    } else {
      pauseEl.textContent = "Resume >>";
      paused = true;
    }
  });
}

function createWorkBox() {
  if (workEl.classList.contains('flipped')) return;
  workEl.innerHTML = '<div class="text">' + replaceURLs(workText) + '</div>' +
                     '<div class="md">' + replaceURLs(md(workText)) + '<div>';

  workEl.classList.add('flipped');
  workEl.scrollTop = 9999;

  // flip
  let flipping = 0;
  require('mouse-wheel')(workEl, async function(dx, dy) {
    if (flipping) return;
    let flipped = workEl.classList.contains('flipped');
    let half = (workEl.scrollHeight - workEl.clientHeight) / 2;
    let pastHalf = flipped ? workEl.scrollTop < half : workEl.scrollTop > half;

    // If we're past half, flip the el.
    if (pastHalf) {
      workEl.classList.toggle('flipped');
      flipping = true;
      await Promise.delay(500);
      workEl.scrollTop = flipped ? 0 : 9999;
      flipping = false;
    }

    // Scroll. If we've flipped, flip the scroll direction.
    workEl.scrollTop += (dy * (flipped ? -1 : 1));
  }, true);
}
