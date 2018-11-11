class Card {
    constructor(number, suit) {
        this.number = number;
        this.suit = suit;
        }
    same(card) { return ((this.number == card.number) && (this.suit == card.suit)) }
    sameSuit(card) { return ((this.suit == card.suit)) }
    }
class MainDeck {
    constructor() {
        this.cards = [];
        let tmpCard;
        for (let i=0; i<52; i++){
            while(this._isInHand(tmpCard = new Card(cardnames[randomNumber(13)], suits[randomNumber(4)])));
            this.cards.push(tmpCard);
        }
    }
    _isInHand(card) { // used only by constructor
        for (let i=0; i<this.cards.length; i++) {
            if (this.cards[i].same(card)) return true;
        }
        return false;
    }
    empty () {
        while (this.cards.length) 
            delete this.cards.pop();
    }
}
class Game {
    constructor (mainDeck) {
        this.cards = [];
        this.mainDeck = mainDeck;
        this.getCardsFromMainDeck(7);
    }
    emptyHand() {
        while (this.cards.length) 
            this.cards.pop();
    }
    getCardsFromMainDeck (numCards) {
        while (numCards--)
            this.cards.push(this.mainDeck.cards.pop());
    }
    countSuits(handOrCommunity, suit) { // counts suits in "hand" or "community" or "all"
        let sameSuit = 0, start, end;
        if (handOrCommunity == 'hand') {
            start = 0, end = 1;
        } else if (handOrCommunity == 'community') {
            start = 2, end = 6;
        } else { // 'all'
            start = 0, end = 6;
        }
        for (let i=start; i<=end; i++) 
            if (this.cards[i].suit == suit) sameSuit++;
        return sameSuit;
    }
    hasCardInHand(cardNumber) { 
        if ((this.cards[0].number == cardNumber) || (this.cards[1].number == cardNumber)) { 
            if ((this.cards[0].number == cardNumber) && (this.cards[1].number == cardNumber)) {
                return false;
            } else return true;
        }
        return false;
    }
    hasFlush(suit) { // suit can be 'any'
    
        if (suit == "any") {
            for (let suit of suits) {
                if (this.countSuits('all', suit) >= 5)
                    return true;
            }
        } else if (this.countSuits('all', suit) >= 5)
            return true;
        return false;
    }
    handIsSuited() {
        for (let suit of suits) 
            if (this.countSuits('hand', suit) == 2) return {is:true, suit:suit};
        return {is:false, suit:'na'};
    }
    hasStraight(numOfCardsToCheck) {
        var cards = this.cards.concat();            // copy the hand
        cards.splice(numOfCardsToCheck, 7);         // leave only cards I want to check
        cards.sort(compareCards);                   // sort cards
        for (let i = 0; i < cards.length-1; ) {     // remove duplicates
            if (cards[i].number != cards[i+1].number) {
                i++;
                continue;
            }
            remove_obj_from_list(cards[i], cards);
        }
        if (cards[0].number == "A")                 // push Ace in to the end of the hand to check for high straights
            cards.push(cards[0]);
        // find the largest straight
        var sLen = 0, sFirst, sLast;                 // maximum straight
        var len=1, first=0, last=0;                 // first points to first card of straight, last points to last element
        var inSeq = true;
        for (let i=0; i < (cards.length - 1); i++) { // search for consecutive cards for a straight
            if ((compareCards(cards[i], cards[i+1]) == -1) ||
                 (cards[i].number == "K" && cards[i+1].number == "A")) { 
                // this card and its next one are consecutive cards
                if (!inSeq) 
                    first = i;
                inSeq = true;
                last = i+1;
                if (++len > sLen) {
                    sLen = len; sFirst = first; sLast = last;
                }
            } else {
                // not consecutive cards
                len = 1;
                inSeq = false;
            } 
        }
            return cards.slice(sFirst, sLast + 1);
    }
}
class Experiment {
    constructor (iterations) {
        this.iterations = iterations;
        this.games = [];
        var stat = document.getElementById('status');
        var game, mainDeck, statTimer=0;
        for (let i=0; i<iterations; i++) {
            if (!(statTimer--)) { 
                console.log('Preparing experiment database ... ' + Math.round(i*100/iterations) + '%');
                statTimer = iterations/100;
            }
            mainDeck = new MainDeck();
            game = new Game(mainDeck);
            this.games.push(game);
            mainDeck.empty();
        }
        stat.innerHTML = 'Experimenting with ' + iterations + ' iterations: <br>';
    }
    check(txt, callback) {
        preConditionExists = 0;
        var filteredExperiment = this.games.filter(callback);
        tableHTML += '<tr><td>#' + experimentNum++ + '</td><td>' + txt + '</td>';
        var successes = filteredExperiment.length;
        tableHTML += '<td>' + preConditionExists + '</td><td>' + (preConditionExists/iterations*100).toFixed(2) + '%</td><td>' + 
            + successes + '</td><td>' + (successes/preConditionExists*100).toFixed(2) + '%</td></tr>';
    }
}
function randomNumber(max) { return Math.floor(Math.random()*max); }
function remove_obj_from_list (value, list) {
    let index = list.indexOf(value);
    list.splice(index, 1);
}
function compareCards(a,b) {
    var ia, ib;
    ia = cardnames.indexOf(a.number);
    ib = cardnames.indexOf(b.number);
    return ia - ib;
}

class Filter {
    constructor () {
    }
    gettingJackOnDeal(game) { // this is just for samity check, should be 4/52 + 4/52 - (4/52*3/52) = 14.94%
        preConditionExists++;
        if (game.hasCardInHand("J"))
            return true;
        return false;
    }
    suitedHand(game) {
        preConditionExists++;
        return (game.handIsSuited().is);
    }
    flushOnSuitedHand(game) { // e.g. if I have 3Heart & 9Heart, what's the probability of a flush of hearts?
        var res = game.handIsSuited();
        if (!res.is) return false;
        preConditionExists++;
        return (game.hasFlush(res.suit));
    }
    anyFlushOnSuitedHand(game) { // e.g. if I have 3Heart & 9Heart, what's the probability of a flush of **any** kind?
            if (!game.handIsSuited().is) return false;
            preConditionExists++;
            return (game.hasFlush('any'));
    }
    anyFlushOnAnyHand(game) { // e.g. 7 cards are dealt, do I have 5 or more of the same suit?
        preConditionExists++;
        return (game.hasFlush('any'));        
    }
    dualSidedStraight(game) { // e.g. after the flop, the 5 cards have exactly a 4 card straight waiting for the turn/river to produce final card
        let res = game.hasStraight(5);
        if ((res.length == 4)           // check that after the flop, has exactly 4 cards straight
            && (res[0] != "A") && (res[res.length-1] != "A")) // check that indeed this is a belly straight
        {
            preConditionExists++;
            res = game.hasStraight(7);
            if (res.length >= 5)
                return true;
        }
        return false;
    }
}

// MAIN
let cardnames = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
let suits = ["Club", "Diamond", "Heart", "Spade"];
var preConditionExists, experimentNum = 1;
var tableHTML = "<tr><th width = 5%></th><th width='55%'>Experiment</th><th width='10%'>Qualified Events (QE)</th><th width='10%'>QE (%)</th><th width='10%'>Successes</th><th width='10%'>% Success of QE</th></tr>";
var experiment, filter;
var iterations = 1e5;
var unittestMode = false;

window.onload = start();

function start() {
    if (unittestMode) {
        unitTests();
        return;
    }
    experiment = new Experiment(iterations);
    filter = new Filter();
    experiment.check('Have Jack in hand on deal <br>(sanity check - should be 14.48%)', filter.gettingJackOnDeal);
    experiment.check('Same suit hand <br>(chances of getting same suit on deal)', filter.suitedHand);
    experiment.check('Flush on suited hand <br>(suited hand + >3 same suited cards in commune)', filter.flushOnSuitedHand);
    experiment.check('*Any* flush on *any* hand', filter.anyFlushOnAnyHand);
    experiment.check('*Any* flush on suited hand', filter.anyFlushOnSuitedHand);
    experiment.check('Waiting for dual-sided straight after flop', filter.dualSidedStraight);
    document.getElementById('table').innerHTML = tableHTML;
}

function unitTests() {
    iterations = 1;
    experiment = new Experiment(iterations);
    filter = new Filter();
    let game = experiment.games[0];
    game.emptyHand();
    game.cards = [new Card("2", "Heart"), new Card("2", "Heart"), new Card("5", "Spade"), 
        new Card("3", "Club"), new Card("4", "Heart"), new Card("A", "Diamond"), new Card("2", "Club")];
    experiment.check('Waiting for dual-sided straight after flop', filter.dualSidedStraight);
    document.getElementById('table').innerHTML = tableHTML;
}


