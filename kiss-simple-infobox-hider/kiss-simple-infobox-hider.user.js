// ==UserScript==
// @name                Kiss Simple Infobox hider
// @description         Hides the infobox on kissanime.com, kisscartoon.me and kissasian.com player sites
// @include             https://kissanime.ru/Anime/*/*
// @include             https://kimcartoon.to/Cartoon/*/*
// @include             https://kissasian.sh/Drama/*/*
// @author              Playacem
// @updateURL           https://raw.githubusercontent.com/Playacem/KissScripts/master/kiss-simple-infobox-hider/kiss-simple-infobox-hider.user.js
// @downloadURL         https://raw.githubusercontent.com/Playacem/KissScripts/master/kiss-simple-infobox-hider/kiss-simple-infobox-hider.user.js
// @require             https://code.jquery.com/jquery-latest.js
// @grant               none
// @run-at              document-end
// @version             0.0.11
// ==/UserScript==

// do not change
var JQ = jQuery;

function hideInfobox() {
    var selector = JQ('#centerDivVideo') /* the div with the video */
        .prev() /*a clear2 div*/
        .prev() /*dropdown*/
        .prev() /*a clear2 div*/
        .prev(); /*the actual div*/
    selector.remove();
}

// load after 2 seconds
setTimeout(hideInfobox, 2000);
