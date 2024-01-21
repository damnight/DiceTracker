var statTracking = statTracking || {};

statTracking.statTrackingRolls = function (rolls) {
    // constructor
    this.d4_rolls = [];
    this.d6_rolls = [];
    this.d8_rolls = [];
    this.d10_rolls = [];
    this.d12_rolls = [];
    this.d20_rolls = [];
    this.d100_rolls = [];

    if (rolls) {
        this.d4_rolls = this.d4_rolls.concat(rolls["d4_rolls"]);
        this.d6_rolls = this.d6_rolls.concat(rolls["d6_rolls"]);
        this.d8_rolls = this.d8_rolls.concat(rolls["d8_rolls"]);
        this.d10_rolls = this.d10_rolls.concat(rolls["d10_rolls"]);
        this.d12_rolls = this.d12_rolls .concat(rolls["d12_rolls"]);
        this.d20_rolls = this.d20_rolls.concat(rolls["d20_rolls"]);
        this.d100_rolls = this.d100_rolls.concat(rolls["d100_rolls"]);
    }

    // methods
    this.add_rolls = (rolls) => {
        this.d4_rolls = this.d4_rolls.concat(rolls["d4_rolls"]);
        this.d6_rolls = this.d6_rolls.concat(rolls["d6_rolls"]);
        this.d8_rolls = this.d8_rolls.concat(rolls["d8_rolls"]);
        this.d10_rolls = this.d10_rolls.concat(rolls["d10_rolls"]);
        this.d12_rolls = this.d12_rolls .concat(rolls["d12_rolls"]);
        this.d20_rolls = this.d20_rolls.concat(rolls["d20_rolls"]);
        this.d100_rolls = this.d100_rolls.concat(rolls["d100_rolls"]);
    }

    this.add_roll = (roll, sides) => {
        log("adding roll: " + roll + " to list of d"+sides);
        switch (sides) {
            case 4:
                this.d4_rolls.push(roll);
                break;
            case 6:
                this.d6_rolls.push(roll);
                break;
            case 8:
                this.d8_rolls.push(roll);
                break;
            case 10:
                this.d10_rolls.push(roll);
                break;
            case 12:
                this.d12_rolls.push(roll);
                break;
            case 20:
                this.d20_rolls.push(roll);
                break;
            case 100:
                this.d100_rolls.push(roll);
                break;
            default:
                log("can't find dice list");
        }
    }
};

statTracking.statTrackingCharacter = function (name, rolls) {
    // constructor
    this.name = name;

    if (rolls) {
        log("new statTrackingRolls");
        this.rolls = new statTracking.statTrackingRolls(rolls);
    } else {
        this.rolls = new statTracking.statTrackingRolls();
    }

    // methods
    this.get_name = () => {
        return this.name;
    }

    this.get_rolls = () => {
        return this.rolls;
    }

    this.add_rolls = (rolls) => {
        log("add these roles");
        this.rolls.add_rolls(rolls);
    }
};

statTracking.statTrackingUser = function (user_id, character, rolls) {
    // constructor
    this.characters = [];
    this.id = user_id;

    if (character && rolls) {
        log("construct or update character");
        // check if character exists
        let existing_character = get_char_this_user(character);

        log(" =================== the existing character is: ");
        log(existing_character);

        if (existing_character === null) {
            // doesn't exist yet, create new
            let new_char = new statTracking.statTrackingCharacter(character, rolls);
            this.characters.push(new_char);
            log("pushed characters to: ");
            log(this.characters);
        } else {
            log(existing_character.id + " character was found");
            existing_character.add_rolls(rolls);
        }
    }

    function get_char_this_user(char_name) {
        for (var i in this.characters){
            if (this.characters[i].name === char_name){
                return this.characters[i];
            }
        }
        // if nothing is found
        return null;
    }


    function get_char(char_name, user) {
        log("searching existing character");
        log("searching existing character");
        log("searching existing character");

        let char_list = user.characters;

        // search and return for character by name in list of characters
        for (var i in char_list) {
            if (char_list[i].name === char_name) {
                return char_list[i];
            }
        }
        // if nothing is found
        return null;
    }

    // methods
    this.get_character = (char_name, user) => {
        log("this is the current user ");
        log("this is the passed user " + user);
        log("this is the passed char_name " + char_name);
        return get_char(char_name, user);
    }

    this.add_character = (character, user) => {
        if (get_char(character.name, user) === null) {
            user.characters.push(character)
        } else {
            log("ERROR: character already exists");
        }
    }

};

statTracking.statTracker = function () {
    // constructor
    log("tracker constructor");
    this.users = [];
    this.test_list = [1, 2, 5];


    this.init = () => {
        sendChat("StatTracker", "tracking stats...");
    };

    this.track = (msg) => {
        log("tracking stats");

        // msg contains array of expressions, which are individual dice rolls
        for (let idx = 0; idx < msg.length; idx++){
            // track stats, user, character and current expression
            var current_expression = msg[idx];

            var character_rolls = new statTracking.statTrackingRolls();

            // check if expression is a roll by checking if a rollid is present
            if ( _.has(current_expression, "rollid")) {
                var dice_rolls = current_expression["results"]["rolls"];

                // there can be multiple different kind of dice and rolls per expression
                for (let idx_rolls = 0; idx_rolls<dice_rolls.length; idx_rolls++){
                    var dice_roll = dice_rolls[idx_rolls];

                    // check if roll type is a Roll("R") there is also Mod("M")
                    if (dice_roll["type"] === "R") {
                        var dice_count = dice_roll["dice"];
                        var dice_sides = dice_roll["sides"];

                        // check results for individual dice
                        var results_from_roll = Array.from(dice_roll["results"]);

                        for (let idx_dice = 0; idx_dice<dice_count; idx_dice++){
                            var roll_result = results_from_roll[idx_dice]["v"];
                            // add roll result to correct dice side list in rolls object
                            character_rolls.add_roll(roll_result, dice_sides);
                        };
                    }; // end if

                } // end for

            } else {
                log("no dice roll found");
            }

            // character roles now contains all sorted dice rolls, we have to add them to the correct user now
            var current_user = current_expression["playerid"];
            var current_character = current_expression["who"];
            log("user_name: " + current_user + "\n character_name: " + current_character);

            log("full char rolls: ");
            log(character_rolls);
            var user = this.update_character_rolls(current_user, current_character, character_rolls);
            log("888888888");
            log("user to be added");
            log(user);
            log("updating...");
            this.update_user(user);
        }

        log("end tracking function, result: ")
        log(statTracking.statTracker.users);
    };

    this.update_user = (user) => {
        var user_exists = false;
        let ref_users = statTracking.statTracker.users;

        for (let idx=0; idx<ref_users.length; idx++) {
            if (ref_users[idx].id === user.id) {
                log("found user" + user.id);
                log("old user");
                log(ref_users[idx]);
                log("new user");
                log(user);
                ref_users[idx] = user;
                log("added existing user to list");
                log(ref_users[idx]);
                user_exists = true;
                break;
            } else {
                log("no user yet");
                user_exists = false;
            }
        }

        log("is user missing?");
        if (!user_exists) {
            log("yes, adding new user to list");
            ref_users.push(user);
            log(ref_users);
            log(this.test_list);
        } else {
            log("no")
            log(ref_users);
        }
    }

    this.update_character_rolls = (username, character_name, rolls) => {
        // get existing user
        var user = this.get_user(username);

        if (user === null) {
            log("777 new user add rolls")
            user = new statTracking.statTrackingUser(username, character_name, rolls)
            log(user);
            log("new roles above");
        } else {
            log("777 existing user add rolls")
            log(user);
            log("user shouldnt be null here");
            let character = user.get_character(character_name, user);
            log(character);
            log("found this caracter")
            // if user is missing the character we need to add it
            if (character === null) {
                character = new statTracking.statTrackingCharacter(character_name, rolls);
                user.add_character(character, user);
            } else {
                character.add_rolls(rolls);
            }
        }
        log("++++++++++++ user with new rolls ++++++");
        log(user);
        log("===================");

        return user;

    };

    this.get_user = (username) => {
        // search and return for user by username in dictionary of users
        for (var i in this.users) {
            if (this.users[i].id === username) {
                return this.users[i];
            }
        }

        return null;
    };

}; // close class

// debug
on("ready", () => {
    log("starting tracker");
    statTracking.statTracker = new statTracking.statTracker();
    statTracking.statTracker.init();
});

// Handle Events as they come up
on("chat:message", (msg) => {
    if (_.has(msg, "inlinerolls")) {
        log("inline rolls");
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
        log("manual rolls");
        let expression_dict = {"expression": null, "results": JSON.parse(msg["content"]),
            "rollid": null, "playerid": msg["playerid"], "who": msg["who"]};
        statTracking.statTracker.track([expression_dict]);
    }


});