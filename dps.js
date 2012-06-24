var curSlot = null;

var stats = ["weaponMinDmg", "weaponMaxDmg", "weaponSpeed", "primaryStat", "attackSpeed", "minDmg", "maxDmg", "critChance", "critDamage"];
var slots = ["helm", "shoulder", "chest", "amulet", "gloves", "bracers", "belt", "left-ring", "right-ring", "pants",
    "weapon", "boots", "off-hand"];

function getOrDefault(slot, defaultValue) {
    var value = localStorage[slot];
    return value ? parseFloat(value) : (defaultValue ? defaultValue : 0);
}


function calcDps(useSecondary) {
    var primaryStat = 187;
    var speedBonus = 0;
    var minDmg = 0;
    var maxDmg = 0;
    var critChance = 5;
    var critDmg = 50;
    var speedBase = 1.0;
    var wmin = 0;
    var wmax = 0;

    $.each(slots, function(index, value) {

        if (useSecondary && value == curSlot) {
            value = value + ".secondary";
        }

        // special case for weapons
        var weaponMinDmg = localStorage[value + ".weaponMinDmg"];
        var weaponMaxDmg = localStorage[value + ".weaponMaxDmg"];
        var weaponSpeed = localStorage[value + ".weaponSpeed"];
        if (weaponMinDmg && weaponMaxDmg && weaponSpeed) {
            var ws = parseFloat(weaponSpeed);
            if (ws > 0) {
                // borked for dual wield
                speedBase = ws;
                wmin = parseFloat(weaponMinDmg);
                wmax = parseFloat(weaponMaxDmg);
            }
        }

        primaryStat += getOrDefault(value + ".primaryStat", 0);
        speedBonus += getOrDefault(value + ".attackSpeed", 0);
        minDmg += getOrDefault(value + ".minDmg", 0);
        maxDmg += getOrDefault(value + ".maxDmg", 0);
        critChance += getOrDefault(value + ".critChance", 0);
        critDmg += getOrDefault(value + ".critDamage", 0);
    });

    var speed = speedBase * (1 + speedBonus / 100);
    var avgDmg = (minDmg + maxDmg) / 2;
    var modifier = 1.0;
    var dps = modifier * ((wmin + wmax)/2 + (minDmg + maxDmg) / 2) * speed * (1 + (0.01 * critChance * 0.01 * critDmg)) * (1 + 0.01 * primaryStat);

    if (useSecondary) {
        $("#secondaryDps").text("dps: " + dps.toFixed(0));
    } else {
        $("#totalDps").text("dps: " + dps.toFixed(0));
        $("#primary").text("primary: " + primaryStat);
        $("#attackSpeed").text("atk: " + speed.toFixed(2));
        $("#critChance").text("crit%: " + critChance);
        $("#critDmg").text("crit-dmg: " + critDmg);
    }
    //console.log("primary", primaryStat, "\nminDmg", minDmg, "\nmaxDmg", maxDmg, "\ncrit%", critChance, "\ncritDmg", critDmg, "\nspeed: ", speed, "\ndps", dps);
}

function loadSlot(slot, isWeapon) {
    var d = document.current_item;
    $.each(stats, function(index, value) {
       d[value].value = getOrDefault(slot + "." + value, 0);
    });

    var enableWeaponEdit = !isWeapon;
    $.each(["#current_min_dmg", "#current_max_dmg", "#current_speed", "#new_min_dmg", "#new_max_dmg", "#new_speed"], function(index, value) {
       $(value).attr("disabled", enableWeaponEdit);
    });

    $("#current_slot").text(slot);
    curSlot = slot;
}

function updateSlot(useSecondary) {
    var d = useSecondary ? document.new_item : document.current_item;
    if (!curSlot) {
        alert("No slot selected");
        return;
    }

    $.each(stats, function(index, value) {
        if (useSecondary) {
            localStorage[curSlot + ".secondary." + value] = d[value].value;
        } else {
            localStorage[curSlot + "." + value] = d[value].value;
        }
    });

    calcDps(useSecondary);
}

function resetGear() {
    localStorage.clear();
}

function replaceSlot() {

}
