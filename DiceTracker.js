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

            let current_expression = msg[idx];

            // check if expression is a roll by checking if a rollid is present
            if ( _.has(current_expression, "rollid")) {
                log("stats");

                let dice_roll = current_expression["results"]["rolls"][0];
                log(dice_roll);

                let dice_count = dice_roll["dice"];
                log(dice_count);

                let dice_sides = dice_roll["sides"];
                log(dice_sides);

                let results_from_roll = Array.from(dice_roll["results"]);
                log(results_from_roll);

                for (let idx_dice = 0; idx_dice<dice_count; idx_dice++){
                    let roll_result = results_from_roll[idx_dice]["v"];
                    log(roll_result);
                }


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
        let expression_dict = {"expression": null, "results": msg["content"], "rollid": null};
        statTracking.statTracker.track([expression_dict]);
    }

    log(msg);


});