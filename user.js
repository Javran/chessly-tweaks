// ==UserScript==
// @name Chessly tweaks
// @namespace javran.github.io
// @version 0.1
// @description Some random tweaks.
// @author Javran Cheng
// @match https://chessly.com/*
// @grant none
// @require https://code.jquery.com/jquery-3.6.1.min.js
// ==/UserScript==
const $ = window.$;

$(() => {
  document.addEventListener('keydown', e => {
    const {href} = window.location
    if (href && href.endsWith('drill-shuffle') && e.key === 'f') {
      $('button.PrimaryActionButton_button__MrAca').click();
    }
  });
});
