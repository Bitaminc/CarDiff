

window.CarDiff = class {

    constructor() {
        console.log("CarDiff object created");
    }

    parse(data) {

        var txtLines = new TextLines(data);
        var car = new Car();

        while (true) {

            var line = txtLines.next();

            if (line == null) break;
            if (line == '') continue;
            if (line.startsWith('--')) continue;

            if (line == '#CHECKED') {
                car.checked = true;
                continue;
            }

            if (line == '#CAR') {
                this.readCar(car, txtLines);
                continue;
            }

            if (line == '#ITEMGROUP') {
                this.readItemGroupDefine(car, txtLines);
                continue;
            }

            if (line == '#TRIM') {
                this.readTrim(car, txtLines);
                continue;
            }

            if (line == '#OPTION') {
                this.readOption(car, txtLines);
                continue;
            }

            if (line == '#END') {
                break;
            }

            throw "cardiff-exception, unknown - " + line;
        }

        console.log("V");
        console.log("E");
        console.log("R");
        console.log("I");
        console.log("F");
        console.log("Y");
        console.log(car);

        this.verify(car);

        return car;
    }


    verify(car) {

        //copy items from option to choice
        for (var [trimId, trim] of car.trims) {

            for (var [optionName, choice] of trim.choices) {

                var option = car.options.get(optionName);

                console.log('verify choice - ' + optionName);
                console.log(option);

                if (option == null) throw 'cardiff-verify-choice-exception, not found option - ' + optionName;

                console.log('copy option to choice');
                choice.copy(option);
                console.log(choice);

                if (choice.need != null) {
                    option = car.options.get(choice.need);
                    if (option == null) throw 'cardiff-verify-choice.need-exception, not found option - ' + choice.need;
                }

                if (choice.conflict != null) {
                    option = car.options.get(choice.conflict);
                    if (option == null) throw 'cardiff-verify-choice.conflict-exception, not found option - ' + choice.conflict;
                }

                if (choice.combine != null) {
                    option = car.options.get(choice.combine);
                    if (option == null) throw 'cardiff-verify-choice.combine-exception, not found option - ' + choice.combine;
                }
            }
        }

        //add etc items - if not found item from itemGroups, add to etc-group, at options
        for (var [optionName, option] of car.options) {

            for (var [oItemName, oItem] of option.items) {

                var found = false;

                for (var [itemGroupName, itemGroup] of car.itemGroups) {

                    var item = itemGroup.items.get(oItemName);

                    if (item != null) {
                        found = true;
                        break;
                    }
                }

                if (!found) {

                    throw 'cardiff-verify-option-exception, not found itme - ' + " @OPTION " + optionName + ", ITEM=" + oItemName;
                }
            }
        }
    }

    valid(trim, choice) {

        if (choice.checked) {

            for (var [optionName, childChoice] of trim.choices) {

                if (!childChoice.checked) continue;
                if (choice.optionName == childChoice.optionName) continue;
                if (choice.optionName == childChoice.need) {
                    throw 'Uncheck first\n\n' + childChoice.optionName;
                }
            }

            return false;
        }

        if (choice.need != null) {

            var need = trim.choices.get(choice.need);
            if (need == null) {
                throw 'cardiff-valid-trim.choice-exception, not found need - ' + + " @TRIM " + trim.name + ", CHOICE=" + choice.optionName + ", NEED=" + choice.need;
            }

            if (!need.checked) {
                throw 'Required option\n\n' + need.optionName;
            }
        }

        //find conflict
        for (var [optionName, childChoice] of trim.choices) {

            if (!childChoice.checked) continue;
            if (choice.optionName == childChoice.optionName) continue;
            if (choice.optionName == childChoice.conflict) {
                throw 'Option conflict\n\n' + childChoice.optionName;
            }

            if(choice.conflict == childChoice.optionName){
                throw 'Option conflict\n\n' + childChoice.optionName;
            }
        }

        return true;
    }

    readCar(car, lines) {

        console.log("READ CAR-DEFINE");

        var name = lines.next();
        var desc = lines.next();

        console.log("NEW CAR - NAME=" + name + ", DESC=" + desc);

        this.invalid(name, 'Car.name');
        this.invalid(desc, 'Car.desc');

        car.setName(name);
        car.setDesc(desc);

        console.log(car);
    }

    readItemGroupDefine(car, lines) {

        console.log("READ ITEMGROUP-DEFINE");

        var itemGroups = lines.next();

        if (itemGroups == null) throw 'cardiff-read-exception, invalid #ITEMGROUP';
        if (itemGroups == '') throw 'cardiff-read-exception, invalid #ITEMGROUP';
        if (itemGroups.startsWith('#')) throw 'cardiff-read-exception, invalid #ITEMGROUP';

        var arrNames = lines.split(itemGroups);
        for (var i = 0; i < arrNames.length; i++) {

            car.addItemGroup(new ItemGroup(arrNames[i]));
        }

        while (true) {
            var name = lines.next();

            if (name == null) throw 'cardiff-read-exception, invalid #ITEMGROUP';
            if (name == '') continue;
            if (name.startsWith('#')) {
                lines.before();
                break;
            }

            var itemGroup = car.itemGroups.get(name);

            if (itemGroup == null) throw 'cardiff-read-exception, not fount itemgroup - ' + name;

            while (true) {
                var values = lines.next();

                if (values == null) throw 'cardiff-read-exception, invalid #ITEMGROUP - ' + name;
                if (values == '') break;
                if (values.startsWith('#')) {
                    lines.before();
                    break;
                }

                var arrValues = lines.split(values);
                for (var i = 0; i < arrValues.length; i++) {
                    itemGroup.addItem(this.parseItem(arrValues[i]));
                }
            }
        }

        console.log(car);
    }

    readTrim(car, lines) {

        console.log("READ TRIM-BLOCK");

        var name = lines.next();
        var price = lines.next();

        console.log("NEW TRIM - NAME=" + name + ", PRICE=" + price);

        this.invalid(name, 'Trim.name');
        this.invalid(price, 'Trim.price');

        var trim = new Trim(name, parseFloat(price.replace(/,/g, '')));

        car.addTrim(trim);

        while (true) {

            var name = lines.next();

            if (name == null) throw 'cardiff-read.trim-exception, invalid #TRIM';
            if (name == '') continue;
            if (name == '#COPY') {
                var cpTrimName = lines.next();
                var cpTrim = car.getTrim(cpTrimName);
                if (cpTrim == null) throw 'cardiff-read.trim-exception, not found trim - ' + cpTrimName;
                console.log("COPY TRIM - " + cpTrimName);
                trim.copy(cpTrim);
                continue;
            }
            if (name == '#CHOICE') {
                this.readChoice(car, trim, lines);
                continue;
            }
            if (name.startsWith('#')) {
                lines.before();
                break;
            }

            var itemGroup = car.getItemGroup(name);
            if (itemGroup == null) throw 'cardiff-read.trim-exception, not found itemGroup - ' + name;

            while (true) {

                var values = lines.next();

                if (values == null) throw 'cardiff-read.trim-exception, invalid #TRIM';
                if (values == '') break;
                if (values.startsWith('#')) {
                    throw "cardiff-read.trim-exception, invalid ItemGroup - " + name;
                }

                var arrValues = lines.split(values);
                for (var i = 0; i < arrValues.length; i++) {
                    var item = this.parseItem(arrValues[i]);
                    itemGroup.addItem(item);
                    trim.addItem(item.clone());

                    console.log("ITEMGROUP : " + itemGroup.name + ", item : " + item.name + " = " + item.desc);
                }

            }
        }

        console.log(car);
    }

    readChoice(car, trim, lines) {

        console.log("READ CHOICE-BLOCK");

        while (true) {

            var name = lines.next();
            if (name == null) break;
            if (name == '') continue;
            if (name == '#TRIM' || name == '#OPTION') {
                lines.before();
                break;
            }
            if (name.startsWith('#')) throw 'cardiff-read.choice-exception, invalid choice - ' + name;

            var price = lines.next();
            if (price == null) break;
            if (price == '' || price.startsWith('#')) throw 'cardiff-read.choice-exception, invalid choice - ' + name;

            var need = null;
            var conflict = null;
            var combine = null;
            var combinedPrice = '0';

            var extra = lines.next();
            if (extra == '#NEED') {
                extra = lines.next();
                if (extra == '' || extra.startsWith('#')) throw 'cardiff-read.choice-exception, invalid choice need - ' + name;
                need = extra;
            }
            if (extra == '#CONFLICT') {
                extra = lines.next();
                if (extra == '' || extra.startsWith('#')) throw 'cardiff-read.choice-exception, invalid choice conflict - ' + name;
                conflict = extra;
            }
            if (extra == '#COMBINE') {
                extra = lines.next();
                if (extra == '' || extra.startsWith('#')) throw 'cardiff-read.choice-exception, invalid choice combine - ' + name;
                combine = extra;

                extra = lines.next();
                if (extra == '' || extra.startsWith('#')) throw 'cardiff-read.choice-exception, invalid Choice combine - ' + name;
                combinedPrice = extra;
            }


            var choice = new Choice(name, parseFloat(price.replace(/,/g, '')));
            choice.need = need;
            choice.conflict = conflict;
            choice.combine = combine;
            choice.combinedPrice = parseFloat(combinedPrice.replace(/,/g, ''));
            choice.checked = car.checked;

            trim.addChoice(choice);
        }

        console.log(car);
    }

    readOption(car, lines) {

        console.log("READ OPTION-BLOCK");

        while (true) {

            var name = lines.next();

            if (name == null) break;
            if (name == '') continue;
            if (name.startsWith('#')) {
                lines.before();
                break;
            }

            console.log("NEW OPTION - " + name);

            var option = new Option(name);
            car.addOption(option);

            while (true) {

                var values = lines.next();

                if (values == null) break;
                if (values == '') break;
                if (values.startsWith('#')) {
                    lines.before();
                    break;
                }

                var arrValues = lines.split(values);
                for (var i = 0; i < arrValues.length; i++) {
                    var item = this.parseItem(arrValues[i]);
                    option.addItem(item);
                }
            }
        }

        console.log(car);
    }

    invalid(val, name) {
        if (val.startsWith('#')) throw 'cardiff-value-exception, ' + name + ' is invalid - ' + val;
        if (val == null || val == '') throw 'cardiff-value-exception, ' + name + ' is empty';
    }

    parseItem(itemDef) {

        var defstr = itemDef;

        var name = null;
        var value = null;
        var linked = null;

        var posAT = defstr.indexOf('@');

        if (posAT == 0) throw 'invalid item format - ' + itemDef;

        if (posAT > 0) {
            linked = defstr.substring(posAT + 1).trim();
            defstr = defstr.substring(0, posAT).trim();
        }

        var posEQ = defstr.indexOf('=');

        if (posEQ == 0) throw 'invalid item format - ' + itemDef;

        if (posEQ > 0) {
            value = defstr.substring(posEQ + 1).trim();
            defstr = defstr.substring(0, posEQ).trim();
        }

        name = defstr;

        if (value == null) value = 'O';

        return new Item(name, value, linked);
    }
}

window.TextLines = class {

    constructor(text) {
        this.lines = text.split('\n');
        this.index = 1;

        console.log('textLines.length : ' + this.lines.length);
    }

    next() {

        while (true) {

            if (this.index >= this.lines.length) return null;

            var line = this.lines[this.index];

            console.log('[L-' + this.index + '] ' + line);

            this.index++;

            line = line.trim();

            if (line.startsWith('--')) continue;

            return line;
        }
    }

    get(pos) {

        var line = this.lines[pos];

        return line.trim();
    }

    before() {
        this.index -= 1;
    }

    size() {
        return this.lines.length;
    }

    split(s) {

        let results = [];
        let next;
        let str = '';
        let left = 0, right = 0;

        function keepResult() {
            results.push(str.trim());
            str = '';
        }

        for (var i = 0; i < s.length; i++) {
            switch (s[i]) {
                case ',':
                    if ((left === right)) {
                        keepResult();
                        left = right = 0;
                    } else {
                        str += s[i];
                    }
                    break;
                case '(':
                    left++;
                    str += s[i];
                    break;
                case ')':
                    right++;
                    str += s[i];
                    break;
                default:
                    str += s[i];
            }
        }

        keepResult();

        return results;
    }

}