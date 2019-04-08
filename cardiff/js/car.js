
class Item {
    constructor(name, value, linked) {
        this.name = name;
        this.value = value;
        this.linked = linked;
    }

    clone() {
        var item = new Item(this.name, this.value, this.linked);
        return item;
    }
}


class ItemGroup {

    constructor(name) {
        this.name = name;
        this.items = new Map();
    }

    addItem(item) {
        this.items.set(item.name, item);
    }
}


class Option {

    constructor(name) {
        this.name = name;
        this.items = new Map();
    }

    addItem(item) {
        this.items.set(item.name, item);
    }
}

class Choice {

    constructor(optionName, price) {
        this.optionName = optionName;
        this.price = price;
        this.checked = false;
        this.need = null;
        this.conflict = null;
        this.combine = null;
        this.combinedPrice = 0;
        this.items = new Map();
    }

    addItem(item) {
        this.items.set(item.name, item);
    }

    copy(option) {

        for (var [name, item] of option.items) {

            this.addItem(item.clone());
        }
    }
}


class Trim {

    constructor(name, price) {
        this.name = name;
        this.price = price;
        this.checked = true;
        this.items = new Map();
        this.choices = new Map();
    }

    addItem(item) {

        this.items.set(item.name, item);
    }


    addChoice(choice) {

        this.choices.set(choice.optionName, choice);
    }

    copy(trim) {

        for (var [name, item] of trim.items) {

            this.addItem(item.clone());
        }
    }
}



class Car {

    constructor() {
        this.name = null;
        this.desc = null;
        this.trims = new Map();
        this.options = new Map();
        this.itemGroups = new Map();
        this.checked = false;
    }

    setName(name) {
        this.name = name;
    }

    setDesc(desc) {
        this.desc = desc;
    }

    addTrim(trim) {

        this.trims.set(trim.name, trim);
    }

    getTrim(name) {
        return this.trims.get(name);
    }

    addOption(option) {
        this.options.set(option.name, option);
    }

    addItemGroup(itemGroup) {
        this.itemGroups.set(itemGroup.name, itemGroup);
    }

    getItemGroup(name) {
        return this.itemGroups.get(name);
    }
}

class Carjs {

    constructor(name, jsfile, init) {
        this.name = name;
        this.jsfile = jsfile;
        this.init = init;
    }
}

class Store {

    constructor() {
        this.carjsList = new Map();
    }

    addCarjs(carjs) {
        this.carjsList.set(carjs.name, carjs);
    }

}