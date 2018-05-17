// ==UserScript==
// @name				Kiss Statistics
// @description	        Adds a stats button to kissanime.com, kissmanga.com, kisscartoon.me and kissasian.com bookmark sites
// @include				http://kissanime.ru/BookmarkList
// @include				http://kissanime.ru/MyList/*
// @include				http://kissmanga.com/BookmarkList
// @include				http://kimcartoon.me/BookmarkList
// @include				http://kimcartoon.me/MyList/*
// @include				http://kissasian.ch/BookmarkList
// @include				http://kissasian.ch/MyList/*
// @include				http://readcomiconline.to/BookmarkList
// @include				http://readcomiconline.to/MyList/*
// @author              Playacem
// @updateURL			https://raw.githubusercontent.com/Playacem/KissScripts/master/kiss-statistics/kiss-statistics.user.js
// @downloadURL		    https://raw.githubusercontent.com/Playacem/KissScripts/master/kiss-statistics/kiss-statistics.user.js
// @require				http://code.jquery.com/jquery-latest.js
// @grant				none
// @run-at				document-idle
// @version				0.1.5
// ==/UserScript==

/* VARS */
// Row names
var strCatName = 'Category name';
var strTotal = 'Total';
var strUnread = 'Not Completed';
var strRead = 'Completed';

/* CONSTS*/
/* DO NOT CHANGE UNDER ANY CIRCUMSTANCES! */
var JQ = jQuery;
const STR_NO_CATEGORY = ' Uncategorized';

const SELECTOR_VISIBLE = ".aUnRead[style!='display: none']";

const ID_MAIN = 'userscriptKissStatistics';
const ID_TABLE = 'userscriptTable';

const CLASS_TABLE_TOGGLE = 'userStatTable';

const SITE_ANIME = 'Anime';
const SITE_MANGA = 'Manga';
const SITE_CARTOON = 'Cartoon';
const SITE_DRAMA = 'Drama';
const SITE_COMIC = 'Comic';
const SITE_TYPE = getSiteType();

const CATEGORY_ARRAY = getCatArray();

/* ****************************************************************************
 * UTILITY FUNCTIONS
 * ****************************************************************************/

/* You can't access the sites javascript variables in Firefox, so I wrote this function to replicate lstCats content */
function getCatArray() {
    // after http://stackoverflow.com/questions/9229645/remove-duplicates-from-javascript-array

    if (SITE_TYPE === SITE_MANGA) {
        return [];
    }

    //filters a given array to include only unique values
    function uniq(a) {
        var seen = {};
        return a.filter(function (item) {
            return seen.hasOwnProperty(item) ? false : (seen[item] = true);
        });
    }

    // get all used categories
    var tmpArray = [];
    var selector = 'tr.trAnime';
    if (SITE_TYPE === SITE_CARTOON) {
        selector = 'tr.trCartoon';
    }
    if (SITE_TYPE === SITE_DRAMA) {
        selector = 'tr.trDrama';
    }
    if (SITE_TYPE === SITE_COMIC) {
        selector = 'tr.trComic';
    }
    jQuery(selector).each(function (index) {
        // get Category val
        var tmpCat = jQuery(this).attr('catname');
        // imitate lstCats behaviour
        if (tmpCat === '') {
            tmpCat = STR_NO_CATEGORY;
        }
        tmpArray.push(tmpCat);
    });

    // filter duplicates
    var tmpFinalArray = uniq(tmpArray);
    tmpFinalArray.sort();
    return tmpFinalArray;
}

/* determine the Site this script is running on */
function getSiteType() {
    var url = window.location.href;
    // Why indexOf? Not every browser supports includes (I am looking at you, Firefox!)
    if (url.indexOf('kissmanga') !== -1) {
        return SITE_MANGA;
    }
    if (url.indexOf('kimcartoon') !== -1) {
        return SITE_CARTOON;
    }
    if (url.indexOf('kissasian') !== -1) {
        return SITE_DRAMA;
    }
    if (url.indexOf('readcomiconline') !== -1) {
        return SITE_COMIC;
    }
    return SITE_ANIME;
}

/* Adds an 's' if appropriate (basically add it if the Kiss site does so too) */
function getPluralS() {
    if (SITE_TYPE === SITE_ANIME) {
        return '';
    }
    if (SITE_TYPE === SITE_MANGA) {
        return 's';
    }
    if (SITE_TYPE === SITE_CARTOON) {
        return 's';
    }
    if (SITE_TYPE === SITE_DRAMA) {
        return '';
    }
    if (SITE_TYPE === SITE_COMIC) {
        return '';
    }
    return '';
}

/* ****************************************************************************
 * DATA GATHERING FUNCTIONS
 * *************************************************************************** */

/* Gets the total size (completed and not completed) by a specific category name */
function getTotalSize(categoryName) {

    // handle KissManga separately as it does not have categories/folders and no link sharing option
    if (SITE_TYPE === SITE_MANGA) {
        return JQ('.aUnRead').size();
    }

    // no category given assumes it means all categories combined (All X option in the drop down menu)
    if (categoryName === undefined) {
        // select EVERYTHING (total row count)
        return JQ('.aUnRead').size();
    }

    // handle the special 'Uncategorized' category
    if (categoryName === STR_NO_CATEGORY) {
        if (SITE_TYPE === SITE_CARTOON) {
            return JQ("tr.trCartoon[catName='']").size();
        }
        if (SITE_TYPE === SITE_DRAMA) {
            return JQ("tr.trDrama[catName='']").size();
        }
        if (SITE_TYPE === SITE_COMIC) {
            return JQ("tr.trComic[catName='']").size();
        }
        return JQ("tr.trAnime[catName='']").size();
    }

    // non special categories
    if (SITE_TYPE === SITE_CARTOON) {
        return JQ("tr.trCartoon[catName='" + categoryName + "']").size();
    }
    if (SITE_TYPE === SITE_DRAMA) {
        return JQ("tr.trDrama[catName='" + categoryName + "']").size();
    }
    if (SITE_TYPE === SITE_COMIC) {
        return JQ("tr.trComic[catName='" + categoryName + "']").size();
    }
    return JQ("tr.trAnime[catName='" + categoryName + "']").size();
}

/* Gets all to user visible unread rows by a specific category name and returns their size */
function getNonCompletedSize(categoryName) {
    // handle KissManga separately as it does not have categories/folders and no link sharing option
    if (SITE_TYPE === SITE_MANGA) {
        return JQ(SELECTOR_VISIBLE).size();
    }

    // no category given assumes it means all categories combined (All X option in the drop down menu)
    if (categoryName === undefined) {
        // all visible not completed row size
        return JQ(SELECTOR_VISIBLE).size();
    }

    // handle the special 'Uncategorized' category
    if (categoryName === STR_NO_CATEGORY) {
        if (SITE_TYPE === SITE_CARTOON) {
            return JQ("tr.trCartoon[catName=''] > td > " + SELECTOR_VISIBLE).size();
        }
        if (SITE_TYPE === SITE_DRAMA) {
            return JQ("tr.trDrama[catName=''] > td > " + SELECTOR_VISIBLE).size();
        }
        if (SITE_TYPE === SITE_COMIC) {
            return JQ("tr.trComic[catName=''] > td > " + SELECTOR_VISIBLE).size();
        }
        return JQ("tr.trAnime[catName=''] > td > " + SELECTOR_VISIBLE).size();
    }
    // non special categories
    if (SITE_TYPE === SITE_CARTOON) {
        return JQ("tr.trCartoon[catName='" + categoryName + "'] > td > " + SELECTOR_VISIBLE).size();
    }
    if (SITE_TYPE === SITE_DRAMA) {
        return JQ("tr.trDrama[catName='" + categoryName + "'] > td > " + SELECTOR_VISIBLE).size();
    }
    if (SITE_TYPE === SITE_COMIC) {
        return JQ("tr.trComic[catName='" + categoryName + "'] > td > " + SELECTOR_VISIBLE).size();
    }
    return JQ("tr.trAnime[catName='" + categoryName + "'] > td > " + SELECTOR_VISIBLE).size();
}

/* Counts the completed visible entries filtered by a specific category name */
function getCompletedSize(categoryName) {
    return getTotalSize(categoryName) - getNonCompletedSize(categoryName);
}

/* Gathers data in an array filled with objects */
function getDataArray() {
    var array = [];
    var allCombined = {
        'category': " All " + SITE_TYPE + getPluralS(),
        'total': getTotalSize(),
        'todo': getNonCompletedSize(), // not completed column
        'done': getCompletedSize()
    };
    array.push(allCombined);

    for (var i = 0; i < CATEGORY_ARRAY.length; i++) {
        var el = CATEGORY_ARRAY[i];
        array.push({
            'category': el,
            'total': getTotalSize(el),
            'todo': getNonCompletedSize(el),
            'done': getCompletedSize(el)
        });
    }

    return array;
}

/* ****************************************************************************
 * CONTROL
 * ****************************************************************************/

/* Makes the button actually do stuff */
function addClickFunctionality() {
    var statTableHidden = true;
    JQ('#btnToggleStats').click(function () {
        statTableHidden = !statTableHidden;
        JQ('.' + CLASS_TABLE_TOGGLE).fadeToggle(400);
        if (statTableHidden) {
            JQ('#btnToggleStats').text('Show Statistics');
        } else {
            JQ('#btnToggleStats').text('Hide Statistics');
        }
    });
}

/* ****************************************************************************
 * VISUALIZATION
 * ****************************************************************************/
/* Gets the sites default link color */
function getLinkColor() {
    if (SITE_TYPE === SITE_ANIME) {
        return '#d5f406';
    }
    if (SITE_TYPE === SITE_MANGA) {
        return '#72cefe';
    }
    if (SITE_TYPE === SITE_CARTOON) {
        return '#ff9600';
    }
    if (SITE_TYPE === SITE_DRAMA) {
        return '#ecc835';
    }
    //default text white
    return '#dadada';
}

/* Adds the table specific styles to the page */
function addTableStylesToPage() {
    var styleNode = document.createElement('style');
    styleNode.type = 'text/css';
    const COLOR_BG_ODD = '#161616';
    const COLOR_BG_DEFAULT = '#000000';
    const COLOR_BG_HOVER = '#494949';
    const COLOR_FONT = '#dadada';

    const COLOR_ROW_NUMBERS = getLinkColor();

    var styleContent = [
		// Some default settings like font related settings and text color
		'.google-visualization-table-table {',
		'	font-family: "Tahoma",Arial,Helvetica,sans-serif;',
		'	font-size: 12px;',
		'	background-color: ' + COLOR_BG_DEFAULT + ';',
		'	cursor: default;',
		'	margin: 0;',
		'	border-spacing: 0;',
		'	border-collapse: collapse;',
		'	line-height: 18px;',
		'	color: ' + COLOR_FONT + ';',
		'	border-style: none !important;',
		'	border-width: 0px !important;',
		'}',

		// force center alignment for numbers.
		'.google-visualization-table-td-number {',
		'	text-align: center !important;',
		'	white-space: nowrap !important;',
		'}',

		// set text color for the header and add odd colored background
		'.kiss-statistics-header {',
		'	color: ' + COLOR_FONT + ';',
		'	background-color: ' + COLOR_BG_ODD + ';',
		'}',

		// add border to the bottom. Similiar to BookmarkList
		'.kiss-statistics-header-cell {',
		'	border-style: none !important;',
		'	border-width: 0px !important;',
		'	border-bottom-style: solid !important;',
		'	border-bottom-width: 1px !important;',
		// make header text bigger, bold and centered
		'	font-size: 120%;',
		'	font-weight: bold;',
		'	text-align: center;',
		'}',

		// default black background for a row entry
		'.kiss-statistics-table-row {',
		'	background-color: ' + COLOR_BG_DEFAULT + ';',
		'	height: 25px;',
		'}',

		// odd rows get the same highlighting as the BookmarkList ones
		'.kiss-statistics-table-row-odd {',
		'	background: none repeat scroll 0 0 ' + COLOR_BG_ODD + ';',
		'}',

		// copy BookmarkList hover effect
		'.kiss-statistics-table-row-hover {',
		'	background: none repeat scroll 0 0 ' + COLOR_BG_HOVER + ';',
		'}',

		// no borders and default centered cells
		'.kiss-statistics-cell {',
		'	border: none !important;',
		'	border-width: 0px !important; ',
		'	text-align: center;',
		'}',

		// the sites link color
		'.kiss-statistics-row-numbers {',
		'	color: ' + COLOR_ROW_NUMBERS + ';',
		'}'
	];
    styleNode.textContent = styleContent.join("");

    document.head.appendChild(styleNode);
}

/* Draw all charts. Currently only the table */
function drawCharts() {
    drawTable();
}

/* Draws the main stats table*/
function drawTable() {
    var dataArray = getDataArray();
    var data = new google.visualization.DataTable();
    // add columns
    data.addColumn('string', strCatName);
    data.addColumn('number', strTotal);
    data.addColumn('number', strUnread);
    data.addColumn('number', strRead);

    // fill table with data from the data array
    for (var i = 0; i < dataArray.length; i++) {
        var el = dataArray[i];
        data.addRow([el.category, el.total, el.todo, el.done]);
    }

    // set the previously in addTableStylesToPage defined classes to be used by the table
    var cssClasses = {
        'headerRow': 'kiss-statistics-header',
        'tableRow': 'kiss-statistics-table-row',
        'oddTableRow': 'kiss-statistics-table-row-odd',
        'selectedTableRow': 'kiss-statistics-table-row-hover',
        'hoverTableRow': 'kiss-statistics-table-row-hover',
        'headerCell': 'kiss-statistics-header-cell',
        'tableCell': 'kiss-statistics-cell',
        'rowNumberCell': 'kiss-statistics-row-numbers'
    };

    // various options for the table
    var options = {
        allowHtml: true,
        showRowNumber: true,
        sortColumn: 0,
        width: '100%',
        height: '100%',
        cssClassNames: cssClasses
    };

    var table = new google.visualization.Table(document.getElementById(ID_TABLE));

    table.draw(data, options);
}

/* Creates everything needed for filling the table */
function createHtmlSkeleton() {
    var buttonHtml = "<a href='#' class='bigChar' onclick='return false;' id='btnToggleStats'> Show Statistics </a>";
    var clear2InTable = "<div class='clear2 " + CLASS_TABLE_TOGGLE + "' style='padding-top:10px'></div>";
    var divTable = "<div class='" + CLASS_TABLE_TOGGLE + "' id='" + ID_TABLE + "' ></div>";
    var divHtml = "<div id='" + ID_MAIN + "' style='padding-top:10px;padding-bottom:10px'>" + buttonHtml + clear2InTable + divTable + "</div>";

    var catSelect = '#divListCategories';
    // KissManga has no Category drop down selection menu
    if (SITE_TYPE === SITE_MANGA) {
        catSelect = '.listing';
    }

    JQ(divHtml).insertBefore(catSelect);
    JQ('#' + ID_MAIN).prev('div .clear2').remove();
    // hide by default
    JQ('.' + CLASS_TABLE_TOGGLE).hide();

    addClickFunctionality();
}

/* ****************************************************************************
 * SCRIPT
 * ****************************************************************************/

// load after 0.5 seconds to capture delayed categories.
setTimeout(function () {
    addTableStylesToPage();
    createHtmlSkeleton();

    // after http://stackoverflow.com/questions/19126279/loading-google-jsapi-asynchronously
    JQ.ajax({
        url: '//www.google.com/jsapi',
        dataType: 'script',
        cache: true,
        success: function () {
            google.load('visualization', '1.1', {
                'packages': ['table'],
                'callback': drawCharts
            });
        }
    });
}, 500);
