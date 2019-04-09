

CarDiff.prototype.draw = function (car) {

    console.log("DRAW.CAR");
    console.log("car.name=" + car.name);
    console.log(car.trims);

    var tbbuf = "";

    //START TABLE
    tbbuf += otable("table table-hover table-header-fix");;
    tbbuf += oth();

    //HEDER - TRIM
    tbbuf += otr("table-primary", car.desc);
    tbbuf += mktd(trimHeader(car.name), "table-header-fix-th", "font-weight: bold; font-size: 18px;");

    for (var [trimId, trim] of car.trims) {
        if (!trim.checked) continue;

        var optionSum = 0;
        for (var [optionName, choice] of trim.choices) {
            if (!choice.checked) continue;

            if (choice.combine == null) {
                optionSum += choice.price;
            } else {
                var combine = trim.choices.get(choice.combine);
                if( combine.checked ) optionSum += choice.combinedPrice;
                else optionSum += choice.price;
            }
        }

        var tax = (trim.price + optionSum) * 0.07;
        var sum = trim.price + optionSum + tax;
        var priceList = "";
        priceList += price('', trim.price, "btn btn-secondary btn-ssm");
        priceList += price('+ ', optionSum, "btn btn-secondary btn-ssm");
        priceList += price('+ ', tax, "btn btn-secondary btn-ssm", null, '7%');
        priceList += price('= ', sum, "btn btn-danger btn-ssm", 'white');

        tbbuf += mktd(trimHeader(trim.name, priceList), "table-header-fix-th", "font-size: 14px; font-weight: bold;");
    }
    tbbuf += ctr();


    //HEADER - TRIM OPTIONS
    var clsSecondFixed = "";
    var clsSecondPrimary = "";
    var selectedTrimCount = 0;

    tbbuf += otr("opt-tr" + clsSecondPrimary, "double click to fix / release");

    var trimlist = "";
    for (var [trimId, trim] of car.trims) {
        trimlist += toggleTrimButton(trim);
    }
    tbbuf += mktd(trimlist, "opt-td" + clsSecondFixed, "font-size: 14px;");

    for (var [trimId, trim] of car.trims) {
        if (!trim.checked) continue;
        selectedTrimCount++;

        var optionlist = "";
        for (var [optionName, choice] of trim.choices) {
            optionlist += toggleOptionButton(trim, choice);
        }

        tbbuf += mktd(optionlist, "opt-td" + clsSecondFixed, "font-size: 14px;");
    }

    tbbuf += ctr();
    tbbuf += cth();

    //BODY - ITEMS
    tbbuf += otb();
    tbbuf += otr();
    tbbuf += mktd("", "part-dt text-center", "font-weight: bold;", (selectedTrimCount + 1));
    tbbuf += ctr();
    for (var [itemGroupName, itemGroup] of car.itemGroups) {

        //ITEM-GROUP
        tbbuf += otr("table-secondary");
        tbbuf += mktd(itemGroup.name, "part-dt text-center", "font-weight: bold;", (selectedTrimCount + 1));
        tbbuf += ctr();

        //CHECK ITEM
        itemGroup.items.forEach(function (item, index, array) {
            tbbuf += otr();
            tbbuf += mktd(item.name, '', 'font-size: 14px;');

            //CHECK ITEM PER TRIM
            for (var [trimName, trim] of car.trims) {
                if (!trim.checked) continue;

                tbbuf += mktd(itemValue(item, trim), 'text-center', 'font-size: 14px;');
            }

            tbbuf += ctr();
        });

    }

    tbbuf += ctb();
    tbbuf += ctable();

    return tbbuf;
}


function itemValue(item, trim) {

    //find at option's items
    for (var [optionName, choice] of trim.choices) {

        if (!choice.checked) continue;
        var choiceItem = choice.items.get(item.name);
        if (choiceItem == null) continue;

        if( choiceItem.linked!=null ){

            var activeLinked = false;
            for (var [linkedOptionName, linkedChoice] of trim.choices) {
                if( !linkedChoice.checked) continue;
                if( choiceItem.linked.indexOf( linkedChoice.optionName ) >=0 ){
                    activeLinked = true;
                    break;
                }
            }

            if( !activeLinked ) break;
        }

        var clazz = 'btn btn-primary btn-ssm';

        var htmlbuf = "";
        htmlbuf += ellipsis(optionName, 'border border-primary rounded bg-primary text-light font-weight-bold', 'font-size: .777rem;');
        if(choiceItem.linked!=null){
            htmlbuf += ellipsis( '+ ' + choiceItem.linked, 'border border-primary rounded bg-primary text-light font-weight-bold', 'font-size: .777rem;');
        }

        console.log("item.value=" + item.value + ", choiceItem.value=" + choiceItem.value);

        htmlbuf += choiceItem.value;

        return htmlbuf;
    }

    //find at trim's items
    var trimItem = trim.items.get(item.name);

    if (trimItem == null) return 'X';

    return trimItem.value;
}

function otable(clazz) {
    return '<table class="' + clazz + '">';
}

function ctable() {
    return '</table>';
}

function otr(clazz, title) {
    var trbuf = "";

    trbuf += '<tr';
    if (clazz != null) trbuf += ' class="' + clazz + '"';
    if (title != null) trbuf += ' title="' + title + '"';
    trbuf += '>';

    return trbuf;
}

function ctr(clazz) {
    return '</tr>';
}

function oth() {
    return '<thead>';
}

function cth() {
    return '</thead>';
}

function otb() {
    return '<tbody>';
}

function ctb() {
    return '</tbody>';
}


function mktd(value, clazz, style, colspan) {

    var tdbuf = '<td';

    if (clazz != null) tdbuf += ' class="' + clazz + '"';
    if (style != null) tdbuf += ' style="' + style + '"';
    if (colspan != null) tdbuf += ' colspan="' + colspan + '"';

    tdbuf += '>';
    tdbuf += value;
    tdbuf += '</td>';

    return tdbuf;
}



function br() {
    return '<br>';
}

function nbsp(n) {

    if (n == null) return '&nbsp;';

    var nbspbuf = "";

    for (var i = 0; i < n; i++) nbspbuf += "&nbsp;";

    return nbspbuf;
}

function sp(value, title) {

    return '<span title="' + title + '">' + value + '</span>';
}

function trimHeader(name, priceList) {

    var htmlbuf = "";

    htmlbuf += ellipsis(name);
    if (priceList != null) htmlbuf += priceList;

    return htmlbuf;
}



function price(flag, price, clazz, color, extra) {

    var intVal = Math.round(price);
    var formatted = intVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    var htmlbuf = "";

    htmlbuf += '<button type="button"';
    if (clazz != null) htmlbuf += ' class="' + clazz + '"';
    htmlbuf += ' style="height: 19px; width:100%; text-align: left; z-index: 1500;';
    if (color != null) htmlbuf += ' font-weight: bold; color: ' + color + ';';
    htmlbuf += '"';
    htmlbuf += ' title="' + formatted + '"';
    htmlbuf += ' disabled>';
    if (extra != null) htmlbuf += ellipsis(flag + formatted + ' (' + extra + ')');
    else htmlbuf += ellipsis(flag + formatted);
    htmlbuf += '</button>'

    return htmlbuf;
}

function ellipsis(text, clazz, style) {

    var htmlbuf = "";
    htmlbuf += '<div ';
    if (clazz != null) htmlbuf += 'class="' + clazz + '"';
    htmlbuf += ' style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;';
    if (style != null) htmlbuf += ' ' + style;
    htmlbuf += '"';
    htmlbuf += ' >';
    htmlbuf += text;
    htmlbuf += '</div>';

    return htmlbuf;
}

function toggleTrimButton(trim) {

    var htmlbuf = "";
    var formatted = trim.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    var selected = "btn-secondary";

    if (trim.checked) selected = "btn-primary";

    htmlbuf += '<button type="button" class="btn-trim btn ' + selected + ' btn-ssm mb-1" style="height: 19px; width:100%; text-align: left; z-index: 1400;"';
    htmlbuf += ' trimName="' + trim.name + '"';
    htmlbuf += ' title="' + trim.name + '"';
    htmlbuf += '>';
    htmlbuf += ellipsis(trim.name);
    htmlbuf += '</button>'

    return htmlbuf;
}


function toggleOptionButton(trim, choice) {

    var price = 0;
    if (choice.combine == null) {
        price = choice.price;
    } else {
        var combine = trim.choices.get(choice.combine);
        if( combine.checked ) price = choice.combinedPrice;
        else price = choice.price;
    }

    var htmlbuf = "";
    var formatted = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    var selected = "btn-secondary";

    if (choice.checked) selected = "btn-primary";

    var textbuf = "";
    textbuf += '<span style="border-radius: 2px; color: #FFC107; font-weight: bold;">' + formatted + '</span>';
    textbuf += nbsp();
    textbuf += choice.optionName;

    htmlbuf += '<button type="button" class="btn-opt btn ' + selected + ' btn-ssm mb-1" style="height: 19px; width:100%; text-align: left; z-index: 1400;"';
    htmlbuf += ' trimName="' + trim.name + '"';
    htmlbuf += ' optionName="' + choice.optionName + '"';
    htmlbuf += ' title="' + choice.optionName + '"';
    htmlbuf += '>';
    htmlbuf += ellipsis(textbuf);
    htmlbuf += '</button>'

    return htmlbuf;
}