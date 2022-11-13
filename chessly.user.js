// ==UserScript==
// @name Javran's Chessly Tweaks
// @description Some random Chessly tweaks.
// @homepage https://github.com/Javran/chessly-tweaks
// @namespace javran.github.io
// @version 0.3
// @author Javran Cheng
// @match https://chessly.com/*
// @grant none
// @require https://code.jquery.com/jquery-3.6.1.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js
// ==/UserScript==

(() => {
  const {$, _} = window

  const BTN1_CLS = 'PrimaryActionButton_button__MrAca'
  const BTN2_CLS = 'SecondaryActionButton_button__OAN7b'

  document.addEventListener('keydown', e => {
    const {href} = window.location
    if (typeof href !== 'string') {
      return
    }

    if (
      ( href.endsWith('drill-shuffle') || href.endsWith('quiz-shuffle')
      ) && e.key === 'f'
    ) {
      /*
        Press 'f' to continue to next one,
        which also happens to map to 'Submit' or 'Retry' buttons.
       */
      $(`button.${BTN1_CLS}`).click()
    }

    /*
      Recognize one section of a course, this could be Video / Study / Drill / Quiz

      - Press 'f' to move forward (which means clicking 'Try again', 'Submit' or 'Next',
        whichever is first available.
      - Press 'r' to click 'Prev' button.

     */
    if (
      href.match('^https://chessly.com/dashboard/learn/courses/[a-f0-9-]+/lessons/[a-f0-9-]+$')
    ) {

      const clickDom = d => {
        (d.tagName === 'A' ? d : $(d)).click()
      }

      switch (e.key) {
        case 'f': {
          const btns = $(`.${BTN1_CLS}`).toArray().map(
            d => {
              const t = $(d).text()
              const pri =
                t === 'Try again' ? 0 :
                t === 'Submit' ? 1 :
                t === 'Next' ? 2 :
                9999

              return [pri, d]
          })
          const sorted = _.sortBy(btns, x => x[0])
          if (sorted.length) {
            const [_p, d] = sorted[0]
            clickDom(d)
          }
          break
        }
        case 'r': {
          $(`a.${BTN2_CLS}`).get(0).click()
          break
        }
      }
    }
  })
})()
