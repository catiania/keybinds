// ==UserScript==
// @name         Cat Nuke Thing
// @description  Nuke Thing. By Cat.
// @namespace    http://tampermonkey.net/
// @version      1.1.0
// @author       Cat
// @match        https://www.nationstates.net/*
// @require  https://craig.global.ssl.fastly.net/js/mousetrap/mousetrap.min.js?a4098
// @grant        none
// ==/UserScript==

const faction = 212
const reload = 'r' // Reload
const prodNuke = 'a' // Production to nukes
const prodShield = 'd' // Production to shields
const shield = 's' // Press repeatedly to shield nukes
const target = 'e' // Press repeatedly to target nations
const launch = 't' // Press repeatedly to launch targetted nukes
const join = 'j' // Press repeatedly to launch targetted nukes

/**
 * @returns true if we're on the production page
 */
function onProductionPage() {
    return inHref("page=nukes/view=production") && (!window.location.href.includes("nation=")||window.location.href.includes("container"));
}

/**
 * Will fail if on template-overall=none. As will most of this probably. So just don't do that.
 * @returns the current logged in nation name
 */
function nname() {
    return document.body.attributes[1].value;
}

/**
 * @param {string} str input string
 * @returns true if the current url contains the input string
 */
function inHref(str) {
    return window.location.href.includes(str);
}

/**
 * Gets numbers out of those lil button fellas on the nation screens
 * @param {string} indicator class name
 * @returns {string} the text of the given indicator
 */
function numberFromIndicator(indicator) {
    return document.querySelector(indicator).innerText.split("\n")[0]
}

(function () {
    'use strict';
    Mousetrap.bind([reload],
        /**
         * Reload the page
         */
        function (ev) {
            window.location.reload();
        })
    Mousetrap.bind([prodNuke],
        /**
         * Produce nukes on your production page, or view it
         */
        function (ev) {
            if (onProductionPage()) {
                document.querySelector('.button[name="convertproduction"][value^="nukes"]').click();
            }
            else {
                window.location.href = "https://www.nationstates.net/page=nukes/view=production";
            }
        })
    Mousetrap.bind([prodShield],
        /**
         * Produce shields on your production page, or view it
         */
        function (ev) {
            if (onProductionPage()) {
                document.querySelector('.button[name="convertproduction"][value^="shield"]').click();
            }
            else {
                window.location.href = "https://www.nationstates.net/page=nukes/view=production";
            }
        })

    Mousetrap.bind([shield],
        /**
         * Shield a random incoming nuke, or reload if none
         */
        function (ev) {
            if (inHref("/view=incoming")) {
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

    Mousetrap.bind([target],
        /**
         * If on a faction page, view their nations. If viewing nations, view a random one that is alive.
         *
         * If on a nation page, target it with as many nukes as you can without overkilling.
         */
        function (ev) {
            if (inHref("page=faction") && !inHref("view=nations")) {
                // if we're on a faction page, view their nations
                document.querySelector('a.nukestat-nations').click();
            } else if (inHref("page=faction") && inHref("view=nations")) {
                // if we're viewing nations, view one that is alive

                let livingNationsNodeList = document.querySelectorAll("li > a.nlink");
                let livingNations = Array.from(livingNationsNodeList).filter((nation) => {return nation.nextSibling.className!='nukedestroyedicon'});

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
                // calculate how much rads the nation is already getting
                let radiation = numberFromIndicator('.nukestat-radiation')
                radiation = radiation.substring(0, radiation.length - 1);
                const targeted = numberFromIndicator('.nukestat-targeted')
                const incoming = numberFromIndicator('.nukestat-incoming')
                const total = parseInt(targeted) + parseInt(radiation) + parseInt(incoming)

                const buttons = document.querySelectorAll('.button[name="nukes"]');

                // if you can launch nukes without it being overkill, do it
                if (total < 100 && buttons.length>0) {
                    let found = false;
                    for(let button of buttons){
                        if(button.value<=100-total){
                            button.click()
                            found = true;
                        }
                    }
                    if(!found){
                        buttons[buttons.length-1].click();
                    }
                }else{
                    window.location.href = document.querySelector('.factionname').href
                }
            }
        })
    Mousetrap.bind([launch],
        /**
         * View targets page, or if you're on it, launch the first nuke.
         */
        function (ev) {
        if (inHref("page=nukes/view=targets") && inHref("nation=" + nname())) {
            const ready = document.querySelector('.button[name="launch"]')
            if (ready != null) {
                ready.click()
            } else {
                window.location.reload();
            }
        } else {
            window.location.href = "https://www.nationstates.net/page=nukes/view=targets";
        }
    })

Mousetrap.bind([join],
               /**
               * Join your faction!
               */
               function(ev){
    window.location.href = "https://www.nationstates.net/page=faction/fid=" + 212 + "?consider_join_faction=1&join_faction=1";
})

})();