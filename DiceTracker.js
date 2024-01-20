var statTracking = statTracking || {};

statTracking.statTracker = function () {
    // constructor
    log("tracker constructor");
    this.d4_rolls = [];
    this.d6_rolls = [];
    this.d8_rolls = [];
    this.d10_rolls = [];
    this.d12_rolls = [];
    this.d20_rolls = [];
    this.d100_rolls = [];

    this.init = () => {
        sendChat("StatTracker", "tracking stats...");
    };

    this.track = (msg) => {
        log("tracking stats");
        log(msg.length);
        log(msg);

        // msg contains array of expressions, which are individual dice rolls
        for (let idx = 0; idx < msg.length; idx++){

            var current_expression = msg[idx];

            // check if expression is a roll by checking if a rollid is present
            if ( _.has(current_expression, "rollid")) {
                log("current_expression");
                log(current_expression);
                var dice_rolls = current_expression["results"]["rolls"];

                // there can be multiple different kind of dice and rolls per expression
                for (let idx_rolls = 0; idx_rolls<dice_rolls.length; idx_rolls++){
                    var dice_roll = dice_rolls[idx_rolls];

                    // check if roll type is a Roll("R") there is also Mod("M")
                    var dice_count = 0;
                    if (dice_roll["type"] === "R") {
                        dice_count = dice_roll["dice"];
                        var dice_sides = dice_roll["sides"];

                        // check results for individual dice
                        var results_from_roll = Array.from(dice_roll["results"]);

                        for (let idx_dice = 0; idx_dice<dice_count; idx_dice++){
                            var roll_result = results_from_roll[idx_dice]["v"];
                            log(roll_result);
                        };
                    }; // end if

                }; // end for

            } else {
                log("no dice roll found");
            }
        }
    };
};

// Handle Events as they come up
on("chat:message", (msg) => {
    if (_.has(msg, "inlinerolls")) {
        // TODO check if statTracker available
        log(msg["inlinerolls"]);
        statTracking.statTracker.track(msg["inlinerolls"]);
    }

    else if (msg.type === "api" && msg.content === "!startDiceTracking") {
        if (statTracking.statTracker) {
            log("new tracker");
            statTracking.statTracker = new statTracking.statTracker();
            statTracking.statTracker.init();
        } else {
            log(statTracking.statTracker);
        }

    } else if (msg.type === "rollresult") {
        log("custom dict");
        let expression_dict = {"expression": null, "results": JSON.parse(msg["content"]), "rollid": null};
        statTracking.statTracker.track([expression_dict]);
    }


});