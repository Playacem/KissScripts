// ==UserScript==
// @name         Kiss Statistics
// @description  Adds a stats button to kissanime.com, kissmanga.com, kisscartoon.me and kissasian.com bookmark sites
// @include      http://kissanime.com/BookmarkList
// @include      http://kissanime.com/MyList/*
// @include      http://kissmanga.com/BookmarkList
// @include      http://kisscartoon.me/BookmarkList
// @include      http://kisscartoon.me/MyList/*
// @include      http://kissasian.com/BookmarkList
// @include      http://kissasian.com/MyList/*
// @author       Playacem
// @updateURL    https://raw.githubusercontent.com/Playacem/KissScripts/master/kiss-statistics/kiss-statistics.user.js
// @downloadURL  https://raw.githubusercontent.com/Playacem/KissScripts/master/kiss-statistics/kiss-statistics.user.js
// @require      http://code.jquery.com/jquery-latest.js
// @grant        none
// @version      0.0.54
// ==/UserScript==

/* VARS */
// Seperator for the numbers
var sep = '/';

// width in percent
var widthCatName = 37 + 15;
var widthUnread = 12 + 10;
var widthRead = 26;
// Row names
var strCatName = 'Category name';
var strUnread = 'Not Completed';
var strRead = 'Completed';

/* CONSTS*/
/* DO NOT CHANGE UNDER ANY CIRCUMSTANCES! */
var JQ = jQuery;
const strAllAnimes = ' All Anime';
const strAllCartoons = ' All Cartoons';
const strAllDramas = ' All Drama';
const strNoCategory = ' Uncategorized';
const selectorVisible = ".aUnRead[style!='display: none']";
const classTable = 'listing';
const classTableHead = 'head';
const mainId = 'userscriptVisibleStats';
const userToggleTable = 'userStatTable';
const userCompleted = 'userCompleted';
const userOdd = 'odd';
const catArr = getCatArray();
/* UTILITY FUNCTIONS */

/* You can't access the sites javascript variables in Firefox, so I wrote this function to replicate lstCats content */
function getCatArray() {
	// after http://stackoverflow.com/questions/9229645/remove-duplicates-from-javascript-array
	type = getSiteType();
	if(type === 'Manga'){return {};}

	//filters a given array to include only unique values
	function uniq(a) {
		var seen = {};
		return a.filter(function(item) {
			return seen.hasOwnProperty(item) ? false : (seen[item] = true);
		});
	}

	// get all used categories
	var tmpArray = new Array();
	var selector = 'tr.trAnime';
	if(type === 'Cartoon'){selector = 'tr.trCartoon';}
	if(type === 'Drama'){selector = 'tr.trDrama';}
	jQuery(selector).each(function(index){
		// get Category val
		var tmpCat = jQuery(this).attr('catname');
		// imitate lstCats behaviour
		if(tmpCat === '') {tmpCat = strNoCategory;}
		tmpArray.push(tmpCat);
	});

	// filter duplicates
	var tmpFinalArray = uniq(tmpArray);
	tmpFinalArray.sort();
	return tmpFinalArray;
}

/* Gets all to user visible unread rows by a specific category name and returns their size */
function getVisibleUnreadSizeByCategoryName(type, categoryName) {
	// handle KissManga separately as it does not have categories/folders and no link sharing option
	if (type === 'Manga') {return JQ(selectorVisible).size();}

	// no category given assumes it means all categories combined (All X option in the drop down menu)
	if (categoryName === undefined) {
		if (type === 'Anime') {categoryName = strAllAnimes;}
		if (type === 'Cartoon') {categoryName = strAllCartoons;}
		if (type === 'Drama') {categoryName = strAllDramas;}
	}

	// select indepently from a specific category all visible not completed row size
	if (categoryName === strAllAnimes || categoryName === strAllCartoons || categoryName === strAllDramas) {
		return JQ(selectorVisible).size();
	}

	// handle the special 'Uncategorized' category
	if (categoryName === strNoCategory) {
		if (type === 'Cartoon') {return JQ("tr.trCartoon[catName=''] > td > " + selectorVisible ).size();}
		if (type === 'Drama') {return JQ("tr.trDrama[catName=''] > td > " + selectorVisible ).size();}
		return JQ("tr.trAnime[catName=''] > td > " + selectorVisible ).size();
	}
	// non special categories
	if (type === 'Cartoon') {return JQ("tr.trCartoon[catName='"+ categoryName + "'] > td > " + selectorVisible ).size();}
	if (type === 'Drama') {return JQ("tr.trDrama[catName='"+ categoryName + "'] > td > " + selectorVisible ).size();}
	return JQ("tr.trAnime[catName='" + categoryName + "'] > td > " + selectorVisible).size();
}

/* Gets the total size (completed and not completed) by a specific Category name*/
function getTotalSizeByCategoryName(type, categoryName) {

	// handle KissManga separately as it does not have categories/folders and no link sharing option
	if (type === 'Manga') {return JQ('.aUnRead').size();}

	// no category given assumes it means all categories combined (All X option in the drop down menu)
	if (categoryName === undefined) {
		if (type === 'Anime') {categoryName = strAllAnimes;}
		if (type === 'Cartoon') {categoryName = strAllCartoons;}
		if (type === 'Drama') {categoryName = strAllDramas;}
	}

	// select EVERYTHING (total row count)
	if (categoryName === strAllAnimes || categoryName === strAllCartoons || categoryName === strAllDramas) {
		return JQ('.aUnRead').size();
	}

	// handle the special 'Uncategorized' category
	if (categoryName === strNoCategory) {
		if (type === 'Cartoon') {return JQ("tr.trCartoon[catName='']").size();}
		if (type === 'Drama') {return JQ("tr.trDrama[catName='']").size();}
		return JQ("tr.trAnime[catName='']").size();
	}

	// non special categories
	if (type === 'Cartoon') {return JQ("tr.trCartoon[catName='" + categoryName + "']").size();}
	if (type === 'Drama') {return JQ("tr.trDrama[catName='" + categoryName + "']").size();}
	return JQ("tr.trAnime[catName='" + categoryName + "']").size();
}

/* Adds an 's' if appropriate (basically add it if the Kiss site does so too) */
function getPluralS(type) {
	if(type === 'Anime') {return '';}
	if(type === 'Manga') {return 's';}
	if(type === 'Cartoon') {return 's';}
	if(type === 'Drama') {return '';}
	return '';
}

/*
	Returns a String that represents css classes to be added to a given table row
*/
function getCssClasses(statusObject) {
	var cssClasses = new Array();
	// alternate between odd class and no odd class
	if (statusObject.odd) {
		cssClasses.push(userOdd);
		statusObject.odd = false;
	} else {
		statusObject.odd = true;
	}

	// add userCompleted css class
	// if there aren't any not completed elements in a category
	if (statusObject.unread === 0) {
		cssClasses.push(userCompleted);
	}

	if (cssClasses.length === 0) {
		return '';
	}

	return cssClasses.join(' ');
}

/* gets the html that represents the data in a table */
function getTableHtml(type) {
	var tableHtml = "<table class='" + classTable + ' ' + userToggleTable +"'>";
	// add header
	tableHtml += "<tr class='" + classTableHead + "'> <th width='" + widthCatName + "%'>" + strCatName + "</th> <th width='" + widthUnread + "%'>" + strUnread + "</th> <th width='" + widthRead + "%'>" + strRead + "</th> </tr>";
	tableHtml += "<tr style='height: 10px'></tr>";//style row (the bookmark table has it too)

	var statusObj = {
		'odd' : true,
		'category' : "All " + type + getPluralS(type),
		'total' : getTotalSizeByCategoryName(type),
		'unread' : getVisibleUnreadSizeByCategoryName(type),
		'read' : getTotalSizeByCategoryName(type) - getVisibleUnreadSizeByCategoryName(type)
	};

	// All X category
	tableHtml += "<tr class='" + getCssClasses(statusObj) + "'> <td>" + statusObj.category + "</td> <td>" + statusObj.unread + sep + statusObj.total + "</td> <td>" + statusObj.read + sep + statusObj.total + "</td> </tr>";

	// do not check for categories if it is KissManga
	if(type !== 'Manga') {
		// go over all categories
		for (var index = 0; index < catArr.length; ++index) {
			updateStatusObject(statusObj, catArr[index]);
			// add entry for the current category
			tableHtml += "<tr class='" + getCssClasses(statusObj) + "'> <td>" + statusObj.category + "</td> <td>" + statusObj.unread + sep + statusObj.total + "</td> <td>" + statusObj.read + sep + statusObj.total + "</td> </tr>";
		}
	}

	tableHtml += '</table>';

	return tableHtml;
}

/*
Updates the statusObject with the current row's data
*/
function updateStatusObject(statusObject, categoryName) {
	var type = getSiteType();
	statusObject.category = categoryName;
	statusObject.total = getTotalSizeByCategoryName(type, categoryName);
	statusObject.unread = getVisibleUnreadSizeByCategoryName(type, categoryName);
	statusObject.read = statusObject.total - statusObject.unread;
}

/* determine the Site this script is running on */
function getSiteType() {
	var url = window.location.href;
	// Why indexOf? Not every browser supports includes (I am looking at you, Firefox!)
	if (url.indexOf('kissmanga') != -1) {return 'Manga';}
	if (url.indexOf('kisscartoon') != -1) {return 'Cartoon';}
	if (url.indexOf('kissasian') != -1) {return 'Drama';}
	return 'Anime';
}

/* Makes the button actually do stuff */
function addClickFunctionality() {
	var statTableHidden = true;
	JQ('#btnToggleStats').click(function() {
		statTableHidden = !statTableHidden;
		JQ('.' + userToggleTable).fadeToggle(400);
		if (statTableHidden) {
			JQ('#btnToggleStats').text('Show Statistics');
		}else {
			JQ('#btnToggleStats').text('Hide Statistics');
		}
	});
}

/* combine everything */
function create() {
	var siteType = getSiteType();
	var tableHtml = getTableHtml(siteType);

	buttonHtml = "<a href='#' class='bigChar' onclick='return false;' id='btnToggleStats'> Show Statistics </a>";
	var clear2InTable = "<div class='clear2 " + userToggleTable + "' style='padding-top:10px'></div>";
	var divHtml = "<div id='" + mainId + "' style='padding-top:10px;padding-bottom:10px'>" + buttonHtml + clear2InTable + tableHtml + "</div>";

	var catSelect = '#divListCategories';
	// KissManga has no Category drop down selection menu
	if(siteType === 'Manga') {catSelect = '.listing';}

	JQ(divHtml).insertBefore(catSelect);
	JQ('#' + mainId).prev('div .clear2').remove();
	// hide by default
	JQ('.' + userToggleTable).hide();

	addClickFunctionality();
}

// load after 2 seconds to capture delayed categories. Categories are loaded from the server asynchronously.
JQ(window).load(function() {
	setTimeout(function() {
		create();
	}, 2000);
});
