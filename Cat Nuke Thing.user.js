// ==UserScript==
// @name         Cat Nuke Thing
// @description  Nuke Thing. By Cat.
// @namespace    http://tampermonkey.net/
// @version      2.5.0
// @author       Cat
// @match        https://www.nationstates.net/*
// @include      */nday_links.html
// @require  https://craig.global.ssl.fastly.net/js/mousetrap/mousetrap.min.js?a4098
// @grant              GM_getValue
// @grant              GM_setValue
// @grant        window.close
// ==/UserScript==

// CHANGE
var faction = 146 // your faction id
var target = 0 // faction id of your target faction
var targetNum = 0 // number of nations in your target faction
var turbo = false // TURBO MODE??

// DON'T CHANGE
var focus = 0
var links = 6
var oldTarget = -1
var oldFaction = -1
var oldTargetNum = -1

/**
 * @param {string} str input string
 * @returns true if the current url contains the input string
 */
function inHref(str) {
    return window.location.href.includes(str);
}

/**
 * @returns true if we're on the production page
 */
function onProductionPage() {
    return inHref("page=nukes/view=production");
}

/**
* @returns true if on the html sheet
*/
function onSheet() {
    return inHref("nday_links.html");
}

/**
 * Will fail if on template-overall=none. As will most of this probably. So just don't do that.
 * @returns the current logged in nation name
 */
function nname() {
    return document.body.attributes[1].value;
}

/*
 * Move the focused puppet down one, represented by a red highlight
 */
function moveFocus() {
    document.querySelectorAll('a')[focus].style.color = "black";

    if (focus < document.querySelectorAll('a').length - links - 2) {
        focus += links;
    }
    document.querySelectorAll('a')[focus].style.color = "red";
    document.querySelectorAll('a')[focus + 1].scrollIntoView();
}

/**
 * Gets numbers out of those lil button fellas on the nation screens
 * @param {string} indicator class name
 * @returns {string} the text of the given indicator
 */
function numberFromIndicator(indicator) {
    return document.querySelector(indicator).innerText.split("\n")[0]
}

/**
 * Update the sheet if the config has been changed
 */
function update() {
    console.log("update")
    if ((oldTargetNum != targetNum && onSheet())) {
        oldTargetNum = targetNum;
        console.log("hi")
        var targetNums = Array.from(document.querySelectorAll('a')).filter(a => a.textContent === "target");
        targetNums.forEach(function (link) {
            link.href = link.href.replace(/start=\d+/, "start=" + Math.max(Math.floor(Math.random() * (targetNum - 50)),0));
        });
    }
    console.log(oldTargetNum + " " + targetNum)

    if ((oldTarget != target && onSheet())) {
        oldTarget = target;
        var targets = Array.from(document.querySelectorAll('a')).filter(a => a.textContent === "target");
        targets.forEach(function (link) {
            link.href = link.href.replace(/fid=\d+/, "fid=" + target);
        });
    }

    if ((oldFaction != faction && onSheet())) {
        oldFaction = faction;
        var factions = Array.from(document.querySelectorAll('a')).filter(a => a.textContent === "join");
        factions.forEach(function (link) {
            link.href = link.href.replace(/fid=\d+/, "fid=" + faction);
        });
        factions = Array.from(document.querySelectorAll('a')).filter(a => a.textContent === "incoming");
        factions.forEach(function (link) {
            link.href = link.href.replace(/fid=\d+/, "fid=" + faction);
        }
        );
    }
}

(function () {
    'use strict';
    if (onSheet()) {
        document.querySelectorAll('a')[focus].style.color = "red";
        update();
    } else if (turbo) {
        // close pages when necesary
        if (onProductionPage()) {
            var prod = document.querySelector(".nukestat-production").innerText
            if (prod === "0\nPRODUCTION" || prod==="1\nPRODUCTION" || prod==="2\nPRODUCTION" || prod==="3\nPRODUCTION" || prod==="4\nPRODUCTION" || prod==="5\nPRODUCTION" ) {
              window.close();
            }
        } else if (inHref("incoming")) {
            var message = document.querySelector("p[class=info]");
            var error =document.querySelector(".error");
            if (message != null && !message.innerText.includes("completely")||(error!=null&&document.querySelector(".error").innerText.includes("none left"))||(error!=null&&document.querySelector(".error").innerText.includes("when destroyed"))) {
              window.close();
            }
        } else if (inHref("page=nukes")&&document.querySelector("p[class=info]")!=null) {
            var num = document.querySelector("span[class=nukeselfview] > a").innerText
            if (num == "0\nNUKES") {
               window.close();
            }
        } else if (inHref("view=targets")) {
            var icon = document.querySelector("button[class='button big icon danger']");
            if (icon == null) {
                window.close();
            }
        } else if (inHref("join_faction")) {
            var message = document.querySelector("p[class=info]");
            if (message != null) {
              window.close();
            }
        }
    }

     if (inHref("page=nukes?target=")) {
        // calculate how much rads the nation is already getting and alert if it's over 100
        let radiation = numberFromIndicator('.nukestat-radiation')
        radiation = radiation.substring(0, radiation.length - 1);
        const targeted = numberFromIndicator('.nukestat-targeted')
        const incoming = numberFromIndicator('.nukestat-incoming')
        const total = parseInt(targeted) + 4*parseInt(radiation) + parseInt(incoming)
        if(total>=400){
             var bar = document.querySelector('.nukeiconbar')
        var div = document.createElement('div')
        var message = document.createElement('p')
        message.innerText = "This nation already has 400 or more targets + radiation. Consider aiming at someone else"
        div.style.backgroundColor= "red"
        message.style.fontSize = "30px"
        message.style.margin = "5px"
        div.style.padding = "5px"
        div.appendChild(message)
        var fineprint = document.createElement('i')
        fineprint.innerText = "This message has been inserted by the Cat Nuke Thing script, the devs are not yelling at you, that would be weird - Cat"
        div.appendChild(fineprint)
        bar.insertAdjacentElement('afterend', div)
        }
       
    }

    Mousetrap.bind(
        ['w'],
        /**
         * Open the nation page of a puppet on the sheet
         */
        function (ev) {
            if (onSheet()) {
                document.querySelectorAll('a')[focus].click();
                moveFocus()
            }
        }
    )

    Mousetrap.bind(
        ['e'],
        /**
         * Focus the next puppet on the sheet
         */
        function (ev) {
            if (onSheet()) {
                moveFocus()
            }
        }
    )

    Mousetrap.bind(
        ['q'],
        /**
         * Focus the previous puppet on the sheet
         */
        function (ev) {
            document.querySelectorAll('a')[focus].style.color = "black";
            if (focus >= links) {
                focus -= links;
            }
            document.querySelectorAll('a')[focus].style.color = "red";
            if (focus > 1) { document.querySelectorAll('a')[focus - 1].scrollIntoView(); }
        }
    )

    Mousetrap.bind(['r'],
        /**
        * Reload the page
        */
        function (ev) {
            window.location.reload();
        })

    Mousetrap.bind(['a'],
        /**
        * Produce nukes on your production page, or view it
        */
        function (ev) {
            if (onSheet()) {
                document.querySelectorAll('a')[focus + 1].click();
                moveFocus()
            }

            else if (onProductionPage()) {
                document.querySelector('.button[name="convertproduction"][value^="nukes"]').click();
            }

            else {
                window.location.href = "https://www.nationstates.net/page=nukes/view=production";
            }
        })
    Mousetrap.bind(['d'],
        /**
        * Produce shields on your production page, or view it
        */
        function (ev) {
            if (onSheet()) {
                document.querySelectorAll('a')[focus + 1].click();
                moveFocus()
            }
            else if (onProductionPage()) {
                document.querySelector('.button[name="convertproduction"][value^="shield"]').click();
            }
            else {
                window.location.href = "https://www.nationstates.net/page=nukes/view=production";
            }
        })

    Mousetrap.bind(['s'],
        /**
        * Shield a random incoming nuke, or reload if none
        */
        function (ev) {
            if (onSheet()) {
                document.querySelectorAll('a')[focus + 2].click();
                moveFocus()
            }
            else if (inHref("/view=incoming")) {
                const buttons = document.querySelectorAll('.button[name="defend"]')
                if (buttons.length > 0) {
                    buttons[Math.floor(Math.random() * buttons.length)].click();
                } else {
                    window.location.reload();
                }
            } else {
                window.location.href = "https://www.nationstates.net/page=faction/fid=" + faction + "/view=incoming";
            }
        })

    Mousetrap.bind(['t'],
        /**
        * If on a faction page, view their nations. If viewing nations, view a random one that is alive.
        *
        * If on a nation page, target it with as many nukes as you can without overkilling.
        */
        function (ev) {
            if (onSheet()) {
                document.querySelectorAll('a')[focus + 3].click();
                moveFocus()
            }
            else if (inHref("page=faction") && !inHref("view=nations")) {
                // if we're on a faction page, view their nations
                document.querySelector('a.nukestat-nations').click();
            } else if (inHref("page=faction") && inHref("view=nations")) {
                // if we're viewing nations, view one that is alive

                let livingNationsNodeList = document.querySelectorAll("ol > li > a.nlink");
                let livingNations = Array.from(livingNationsNodeList).filter((nation) => { return nation.nextSibling.className != 'nukedestroyedicon' });

                if (livingNations.length > 0) {
                    // if there are living nations, go to the page of a random one
                    const tName = livingNations[Math.floor(Math.random() * livingNations.length)].href
                    tName.replace('/nation=', '');
                    tName.replace('/page=nukes', '');
                    window.location.href = "https://www.nationstates.net/nation=" + tName + "/page=nukes?target=tName";
                } else {
                    // if there aren't, reload
                    window.location.reload();
                }
            } else if (inHref("page=nukes?target=")) {

                const buttons = document.querySelectorAll('.button[name="nukes"]');

                if (buttons.length > 0) {
                    buttons[0].click();
                }
            } else {
                window.location.href = "https://www.nationstates.net/page=faction/fid=" +target + "/view=nations/start=" + Math.floor(Math.random() * targetNum);
            }
        })
    Mousetrap.bind(['f'],
        /**
        * View targets page, or if you're on it, launch the first nuke.
        */
        function (ev) {
            if (onSheet()) {
                document.querySelectorAll('a')[focus + 4].click();
                moveFocus()
            }
            // FIX THE URLS CAT
            else if (inHref("page=nukes/view=targets") && inHref("nation=" + nname())) {
                const ready = document.querySelector('.button[name="launch"]')
                if (ready != null) {
                    ready.click()
                } else if (!turbo) {
                    window.location.reload();
                }
            } else {
                window.location.href = "https://www.nationstates.net/page=nukes/view=targets";
            }
        })

    Mousetrap.bind(['j'],
        /**
        * Join your faction!
        */
        function (ev) {
            if (onSheet()) {
                document.querySelectorAll('a')[focus + 5].click();
                moveFocus()
            }
            else { window.location.href = "https://www.nationstates.net/page=faction/fid=" + faction + "?consider_join_faction=1&join_faction=1"; }
        })


    Mousetrap.bind(['h'],
        /**
        * Heal
        */
        function (ev) {
            if (inHref("/page=nukes") && !inHref("radiation")){
                document.querySelector('a[title="Radiation"]').click()
            } else if (inHref("/page=nukes/view=radiation")){
                document.querySelector("button[name='cureradiation']").click()
            }
        })
})();
