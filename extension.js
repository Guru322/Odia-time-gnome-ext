const Main = imports.ui.main;
const St = imports.gi.St;
const GLib = imports.gi.GLib;
const Clutter = imports.gi.Clutter;

let originalClock;
let customClock;
let clockUpdateId;

function init() {}

function enable() {
    originalClock = Main.panel.statusArea.dateMenu.actor;
    originalClock.hide();

    customClock = new St.Label({
        text: "",
        style_class: "panel-clock",
        y_align: Clutter.ActorAlign.CENTER,
        x_align: Clutter.ActorAlign.CENTER,
        reactive: true,
    });

    customClock.connect("button-press-event", () => {
        let calendarMenu = Main.panel.statusArea.dateMenu.menu;
        if (!calendarMenu.is_open) {
            calendarMenu.open();
            centerCalendarPopup();
        } else {
            calendarMenu.close();
        }
    });

    Main.panel._centerBox.insert_child_at_index(customClock, 0);

    updateClock();
    clockUpdateId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 60, () => {
        updateClock();
        return GLib.SOURCE_CONTINUE;
    });
}

function disable() {
    if (clockUpdateId) {
        GLib.source_remove(clockUpdateId);
        clockUpdateId = null;
    }

    if (customClock) {
        Main.panel._centerBox.remove_child(customClock);
        customClock.destroy();
        customClock = null;
    }

    if (originalClock) {
        originalClock.show();
    }
}

function updateClock() {
    let now = GLib.DateTime.new_now_local();
    let hour = now.get_hour();
    let minute = now.get_minute();
    let odiaTime = toOdiaDigits(`${hour}:${minute}`);

    let weekdayIndex = now.get_day_of_week();
    let monthIndex = now.get_month() - 1;
    let day = now.get_day_of_month();
    let odiaDay = toOdiaDigits(day.toString());

    let odiaWeekdays = ["ରବି", "ସୋମ", "ମଙ୍ଗଳ", "ବୁଧ", "ଗୁରୁ", "ଶୁକ୍ର", "ଶନି"];
    let odiaMonths = ["ଜାନୁ", "ଫେବୃ", "ମାର୍ଚ୍", "ଅପ୍ରେ", "ମଇ", "ଜୁନ", "ଜୁଲା", "ଅଗ", "ସେପ୍", "ଅକ୍", "ନଭ", "ଡିସେ"];

    let odiaWeekday = odiaWeekdays[weekdayIndex - 1];
    let odiaMonth = odiaMonths[monthIndex];

    let formattedDate = `${odiaWeekday}\u2009${odiaDay} ${odiaMonth}`;
    let finalText = `${odiaTime}\u2009•\u2009${formattedDate}`;

    customClock.set_text(finalText);
}

function toOdiaDigits(str) {
    let odiaDigits = ["୦", "୧", "୨", "୩", "୪", "୫", "୬", "୭", "୮", "୯"];
    return str.replace(/\d/g, d => odiaDigits[parseInt(d)]);
}

function centerCalendarPopup() {
    let calendarMenu = Main.panel.statusArea.dateMenu.menu;
    let [panelX, panelY] = Main.panel.get_transformed_position();
    let panelWidth = Main.panel.width;

    let menuWidth = calendarMenu.actor.get_width();
    let menuHeight = calendarMenu.actor.get_height();

    let centerX = panelX + (panelWidth / 2) - (menuWidth / 2);
    let positionY = panelY + Main.panel.height;

    calendarMenu.actor.set_position(centerX, positionY);
}

