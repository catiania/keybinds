// ==UserScript==
// @name         Cat Nuke Thing
// @description  Nuke Thing. By Cat.
// @namespace    http://tampermonkey.net/
// @version      2.1.4
// @author       Cat
// @match        https://www.nationstates.net/*
// @include      */nday_links.html
// @require  https://craig.global.ssl.fastly.net/js/mousetrap/mousetrap.min.js?a4098
// @require       https://openuserjs.org/src/libs/sizzle/GM_config.min.js
// @grant              GM_getValue
// @grant              GM_setValue
// @grant        window.close
// ==/UserScript==


GM_config.init({
    'id': 'catconfig',
    'title': 'Cat Nuke Settings',
    'fields': {
        'faction': {
            'label': GM_config.create("Your Faction ID"),
            'section': [GM_config.create("Calibration")],
            'type': "number",
            'default': 1,
        },
        'targetFaction': {
            'label': GM_config.create("Target Faction ID"),
            'type': "number",
            'default': 1,
        },
        'targetNum': {
            'label': GM_config.create("Number of nations in target faction"),
            'type': "number",
            'default': 1000,
        },
        'turbo': {
            'label': GM_config.create("Turbo mode (use only if you know what you're doing)"),
            'type': "checkbox",
            'default': false,
        },
        'config': {
            'label': GM_config.create("Open Config"),
            'section': [GM_config.create("NS Keybinds")],
            'type': "text",
            'default': "c",
        },
        'reload': {
            'label': GM_config.create("Reload Page"),
            'type': "text",
            'default': "r",
        },
        'prodNuke': {
            'label': GM_config.create("Produce Nukes"),
            'type': "character",
            'default': "a",
        },
        'prodShield': {
            'label': GM_config.create("Produce Shield"),
            'type': "character",
            'default': "d",
        },
        'shield': {
            'label': GM_config.create("Shield Incoming"),
            'type': "character",
            'default': "s",
        },
        'target': {
            'label': GM_config.create("Target Nation (press multiple times)"),
            'type': "character",
            'default': "t",
        }, 'launch': {
            'label': GM_config.create("Launch Nukes"),
            'type': "character",
            'default': "f",
        }, 'join': {
            'label': GM_config.create("Join Faction"),
            'type': "character",
            'default': "j",
        },
        'nation': {
            'label': GM_config.create("Open nation and focus next"),
            'section': [GM_config.create("Sheet Keybinds")],
            'type': "character",
            'default': "w",
        }, 'next': {
            'label': GM_config.create("Focus next"),
            'type': "character",
            'default': "e",
        },
        'prev': {
            'label': GM_config.create("Focus previous"),
            'type': "character",
            'default': "q",
        },
    },
    'css': "\
#catconfig {justify-content:center; display:flex; flex-direction:row;background-color:#EAEAE2;}\     #catconfig .field_label {width:250px;display:inline-block;}\
#catconfig_wrapper {width:50%;display:flex;flex-direction:column;align-items:center;}\
#catconfig * {font-family: special elite,'courier 10 point',courier new,cursive,serif;}\
#catconfig .field_label{padding:10px;text-align:right;font-weight:700;}\
#catconfig .config_header{font-size:50px;color:#555;text-shadow:0 -1px 1px rgba(64,64,64,.5);}\
#catconfig .section_header{background:none;color:black;font-weight:bold;border: 0px solid #555;border-bottom-width:1px;} \
#catconfig input {padding:3px;}\
#catconfig .section_header {margin: 10px;}\
#catconfig .saveclose_buttons {padding:7px;}\
#catconfig_buttons_holder{text-align:center;}\
",
    'events':
    {
        'save': function () {
            turbo = GM_config.get("turbo");
            udpate();
        },
        'init': function () {
            var links = Array.from(document.querySelectorAll('a')).filter(a => a.textContent === "target");
            links.forEach(function (link) {
                link.href = link.href.replace(/start=\d+/, "start=" + Math.max(Math.floor(Math.random() * (GM_config.get("targetNum") - 50)),0));
                link.href = link.href.replace(/fid=\d+/, "fid=" + GM_config.get("targetFaction"));
            });
            links = Array.from(document.querySelectorAll('a')).filter(a => a.textContent === "join");
            links.forEach(function (link) {
                link.href = link.href.replace(/fid=\d+/, "fid=" + GM_config.get("faction"));
            }
            );
            links = Array.from(document.querySelectorAll('a')).filter(a => a.textContent === "incoming");
            links.forEach(function (link) {
                link.href = link.href.replace(/fid=\d+/, "fid=" + GM_config.get("faction"));
            }
            );
        }
    }
});

var focus = 0;
var links = 6;
var targetNum = GM_config.get("targetNum");
var turbo = GM_config.get("turbo");
var faction = GM_config.get("faction");
var target = GM_config.get("targetFaction");

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
    document.querySelectorAll('a')[focus - 1].scrollIntoView();
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
function udpate() {
    var newNum = GM_config.get("targetNum");
    if (newNum != targetNum && onSheet()) {
        targetNum = newNum;
        var links = Array.from(document.querySelectorAll('a')).filter(a => a.textContent === "target");
        links.forEach(function (link) {
            link.href = link.href.replace(/start=\d+/, "start=" + Math.max(Math.floor(Math.random() * (targetNum - 50)),0));
        });
    }

    var newTarget = GM_config.get("targetFaction");
    if (newTarget != target && onSheet()) {
        target = newTarget;
        var links = Array.from(document.querySelectorAll('a')).filter(a => a.textContent === "target");
        links.forEach(function (link) {
            link.href = link.href.replace(/fid=\d+/, "fid=" + target);
        });
    }

    var newFaction = GM_config.get("faction");
    if (newFaction != faction && onSheet()) {
        faction = newFaction;
        var links = Array.from(document.querySelectorAll('a')).filter(a => a.textContent === "join");
        links.forEach(function (link) {
            link.href = link.href.replace(/fid=\d+/, "fid=" + faction);
        });
        links = Array.from(document.querySelectorAll('a')).filter(a => a.textContent === "incoming");
        links.forEach(function (link) {
            link.href = link.href.replace(/fid=\d+/, "fid=" + faction);
        }
        );
    }
}

(function () {
    'use strict';
    if (onSheet()) {
        document.querySelectorAll('a')[focus].style.color = "red";
        udpate();
    } else if (turbo) {
        // close pages when necesary
        if (onProductionPage()) {
            if (document.querySelector('.button[name="convertproduction"]') === null && turbo) {
                window.close();
            }
        } else if (inHref("incoming")) {
            var message = document.querySelector("p[class=info]");
            if (message != null && !message.innerText.includes("completely")) {
                window.close();
            }
        } else if (inHref("page=nukes")&&document.querySelector("p[class=info]")!=null) {
            var num = document.querySelector("span[class=nukeselfview] > a").innerText
            if (num == "0\nNUKES") {
                window.close();
            }
        } else if (inHref("view=targets")) {
            var icon = document.querySelector("a[class='nukestat nukestat-targets nukestat-zero nukestat-current']");
            if (icon != null) {
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
        const total = parseInt(targeted) + parseInt(radiation) + parseInt(incoming)
        if(total>=100){
             var bar = document.querySelector('.nukeiconbar')
        var div = document.createElement('div')
        var message = document.createElement('p')
        message.innerText = "This nation already has 100 or more targets + radiation. Consider aiming at someone else"
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
        [GM_config.get("nation")],
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
        [GM_config.get("next")],
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
        [GM_config.get("prev")],
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

    Mousetrap.bind(
        /**
        * Open Config
        */
        [GM_config.get("config")], function (ev) {
            GM_config.open();
        }, "keyup");


    Mousetrap.bind([GM_config.get("reload")],
        /**
        * Reload the page
        */
        function (ev) {
            window.location.reload();
        })
    Mousetrap.bind([GM_config.get("prodNuke")],
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
    Mousetrap.bind([GM_config.get("prodShield")],
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

    Mousetrap.bind([GM_config.get("shield")],
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

    Mousetrap.bind([GM_config.get("target")],
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

                let livingNationsNodeList = document.querySelectorAll("li > a.nlink");
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
                window.location.href = "https://www.nationstates.net/page=faction/fid=" + GM_config.get("targetFaction") + "/view=nations/start=" + Math.floor(Math.random() * targetNum);
            }
        })
    Mousetrap.bind([GM_config.get("launch")],
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

    Mousetrap.bind([GM_config.get("join")],
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

})();
