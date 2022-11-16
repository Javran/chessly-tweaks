// ==UserScript==
// @name Javran's Chessly Tweaks
// @description Some random Chessly tweaks.
// @homepage https://github.com/Javran/chessly-tweaks
// @namespace javran.github.io
// @version 0.3
// @author Javran Cheng
// @match https://chessly.com/*
// @grant GM_setValue
// @grant GM_getValue
// @require https://code.jquery.com/jquery-3.6.1.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js
// ==/UserScript==

(() => {
  const {$, _} = window

  const BTN1_CLS = 'PrimaryActionButton_button__MrAca'
  const BTN2_CLS = 'SecondaryActionButton_button__OAN7b'
  const SETUP_VIEW_CLS = 'SetupView_buttons____swj'
  const SETUP_LABEL_CLS = 'CheckBox_checkbox__CFxbL'

  // Key for localStorage.
  const LS_KEY = 'github.com/Javran/chessly-tweaks'

  const Config = {
    get: () => {
      const rawConf = GM_getValue(LS_KEY)
      if (typeof rawConf !== 'string') {
        return {}
      }
      const conf = JSON.parse(rawConf)
      return conf
    },
    set: conf =>
      GM_setValue(LS_KEY, JSON.stringify(conf)),
    modify: modifier => {
      const old = Config.get()
      Config.set(modifier(old))
    },
  }

  document.addEventListener('keydown', e => {
    const {href, pathname} = window.location
    if (typeof href !== 'string') {
      return
    }

    const isDrillShuffle = href.endsWith('drill-shuffle')
    const isQuizShuffle = href.endsWith('quiz-shuffle')

    if (isDrillShuffle || isQuizShuffle) {
      switch (e.key) {
        case 'f': {
          /*
            Press 'f' to continue to next one,
            which also happens to map to 'Submit' or 'Retry' buttons.
           */
          $(`button.${BTN1_CLS}`).click()
          break
        }
        case '1': {
          /*
            No good way to tell if we are at configuration screen
            or the session is already started by looking at URL,
            so instead let's just inject a bunch of buttons
            if '1' is pressed.
           */

          // TODO: impl this later for quiz shuffle.
          if (isQuizShuffle) {
            return
          }

          const setupBar = $(`.${SETUP_VIEW_CLS}`)

          if (!setupBar) {
            return
          }

          if (!$('.javran-tweaks', setupBar).length) {
            $(setupBar).prepend($(`
              <div class="javran-tweaks" style="padding-right: 20px">
                <span>Preset</span>
                <button class="act-save">Save</button>
                <button class="act-load">Load</button>
                <button class="act-load-and-go">Load & Go</button>
              </div>`))

            $('.javran-tweaks .act-save', setupBar).click(e => {
              e.preventDefault()
              const selected = []

              $("fieldset input[type='checkbox']").each((i, x) => {
                if (i !== 0 && $(x).is(':checked')) {
                  selected.push(i)
                }
              })
              Config.modify(conf => ({
                ...conf,
                [`${pathname}`]: selected,
              }))
            })

            // Returns true if loads successfully.
            const loadPreset = () => {
              const selected = _.get(Config.get(), [pathname])
              if (!Array.isArray(selected)) {
                return false
              }

              const labels = $(`.${SETUP_LABEL_CLS}`).toArray()

              $("fieldset input[type='checkbox']").each((i, x) => {
                if (i === 0) {
                  return
                }
                const shouldSel = selected.includes(i)
                const actualSel = $(x).is(':checked')

                if (shouldSel !== actualSel) {
                  /*
                    Note that simply clicking the checkbox won't work,
                    we should find the label element and click on it instead.
                   */
                  $(labels[i]).click()
                }
              })

              return true
            }

            $('.javran-tweaks .act-load', setupBar).click(e => {
              e.preventDefault()
              loadPreset()
            })

            $('.javran-tweaks .act-load-and-go', setupBar).click(e => {
              e.preventDefault()
              loadPreset() && $(`button.${BTN1_CLS}`).click()
            })

          }

        }
      }
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
