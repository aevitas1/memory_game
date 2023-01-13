"use strict";
class Card {
    constructor(cardObject) {
        this.card1 = cardObject.card1;
        this.card2 = cardObject.card2;
        this.set = cardObject.set;
        this.sound = cardObject.sound;
    }
};

// Create an empty array to put the JSON data in
let myCardArray = [];
fetch("js/cards.json")
    
// Put the data in the array
    .then(response => response.json())
    .then(data => {

// Use the map function to properly insert the data into the array to be used later, after this is done load the function memoryGame() to avoid issues which the fetch delay may cause
        myCardArray = data.map(card => new Card(card));
        memoryGame();
    });

window.onload = () => {
// create the onscreen element for the audio + audio mute button
    let top = document.querySelector('.top-container');
    let buttonDiv = document.createElement("div");
    buttonDiv.setAttribute("class", "buttonDiv");
    let newButton = document.createElement("i");
    newButton.setAttribute("onclick", "muteAudio");
    newButton.setAttribute("id", "muteAudio");
    newButton.setAttribute("class", "fas fa-volume-up");

// store the preference in local storage
    if (window.localStorage.getItem('volume') == 'off') {
        newButton.setAttribute("class", "fas fa-volume-mute");
    }
    buttonDiv.appendChild(newButton);
    top.appendChild(buttonDiv);

// add click listener to switch the icon and store the preference in local storage
    newButton.addEventListener("click", function () {
        if (newButton.className == ('fas fa-volume-up')) {
            newButton.className = ('fas fa-volume-mute');
            window.localStorage.setItem('volume', 'off');
        }
        else {
            newButton.className = ('fas fa-volume-up');
            window.localStorage.setItem('volume', 'on');
        }
    })
};




function memoryGame() {

// run the player function to display highscores as soon as you enter the webpage
    player();

// fisher yates shuffle
    const ArrayShuffle = {
        shuffle: function (array) {
            let m = array.length, t, i;
            while (m) {
                i = Math.floor(Math.random() * m--);
                t = array[m];
                array[m] = array[i];
                array[i] = t;
            }
            return array;
        }
    };
    const myField = document.getElementById('field');
    myField.addEventListener("click", onClickCard);
    document.onload = onSelectFieldSize();

// the full shuffled card deck
    let shuffledDeck = ArrayShuffle.shuffle(myCardArray);

// the highscore tracker which will store information in the switch below
    let hsTracker = [];

// move counter
    let moves = 0;

// successful turn counter
    let successTurns = 0;

// average turn counter
    let avgTurns = 0;

// function to display the selected field size
    function onSelectFieldSize() {
        const dropDown = document.getElementById('select-options');

//the array to store the smaller deck of cards in depending on selected field size
        let slicedDeck = [];

// the variable that will store the css board class depending on selected field size
        let boardClass = '';

// the select option switch
        dropDown.addEventListener('change', (e) => {
            switch (e.target.value) {

// slice the full arraydeck into a smaller deck depending on selected field size
                case "4": slicedDeck = shuffledDeck.slice(0, 8);
                    
// tell the boardClass which CSS class it should store for the selected field size
                    boardClass = 'board4';
                    
// fill the hsTracker array with information it will need later (8 cards, select option 4)
                    hsTracker = ['8', '4'];
                    
// completely reset the game. This includes the timer, move counter, successful turn counter and average turn counter
// we do it at this point in the code so a user can finish a game and then take the time to look at the statistics. They are wiped when a new game is started
                resetGame();
                ; break;
                case "5": slicedDeck = shuffledDeck.slice(0, 12);
                boardClass = 'board5';
                hsTracker = ['12', '5'];
                resetGame();
                ; break;
                case "6": slicedDeck = shuffledDeck.slice(0, 18);
                boardClass = 'board6';
                hsTracker = ['18', '6'];
                resetGame();
                ; break;
            }

// assign the sliced deck of cards to myCardSet
            let myCardSet = slicedDeck;

// double the cards and shuffle them again
            myCardSet = myCardSet.concat(slicedDeck);
            myCardSet = ArrayShuffle.shuffle(myCardSet);

// assign myCardSet and boardClass to the populateField function to be used to create the layout of the cards
            populateField(myCardSet, boardClass);
        })
    };



    function populateField(myCardSet, boardClass) {
        myField.innerHTML = '';

// use the sliced cardset to create the field layout
        myCardSet.forEach(card => {
            let newTile = document.createElement("div");
            let newCard = document.createElement("img");

// grab the classname for CSS from boardClass
            newTile.setAttribute("class", boardClass);

// When playing the game fast, you may accidently grab a card and try to drag it which is slightly annoying
// With the following 2 lines I decided to counter this by disabling dragging completely on the cards
            newTile.setAttribute("draggable", "false");
            newTile.setAttribute("ondragstart", "return false");

// create the card elements, grab the name from array which we pulled from the JSON file
            let imageURL = "img/" + card.card1 + ".jpg";
            newCard.setAttribute("src", imageURL);

// assign a name to the card with again, the name we pull from the array
            newCard.setAttribute("name", card.card1);
            newCard.setAttribute("set", card.set);
            newTile.appendChild(newCard);
            myField.appendChild(newTile);
            let cardCover = document.createElement("img");
            cardCover.setAttribute("class", "covered");
            cardCover.setAttribute("src", "img/cover.png");
            newTile.appendChild(cardCover);
        })
    };


// creating the Timer class
    class Timer {
        constructor(element) {

// assign all data we need to this
            this.elapsed = null;
            this.paused = false;
            this.m = 0;
            this.s = 0;
            this.ms = 0;

// add the element the timer will be shown on
            this.element = document.getElementById('timer');
        }


        startTimer(timestamp) {

// set this.paused to false to make sure the timer always runs when this function is called for
            this.paused = false;

// start the AnimationFrame and link the updateTimer by binding it
            window.requestAnimationFrame(this.updateTimer.bind(this));
        }


        pauseTimer() {
// when this function is called for, set the paused state to true
            this.paused = true;         
        }
        resetTimer() {

// timer reset to be used in the resetGame() function
// in this function the timer data will be reset and the element text is replaced with zero's
            this.m = 0;
            this.s = 0;
            this.ms = 0;
            this.element.textContent = '00:00:000';
        }

        updateTimer(timestamp) {

// if the paused state is set to true, return
            if (this.paused == true) {
                return;
            }

// calculate the time difference between system times
// timestamp = when timer started, this.elapsed = current time
            const change = timestamp - this.elapsed;
            this.elapsed += change;
            this.ms += change;

// if ms reaches the value of 999, start at zero and add a second to the timer
            if (this.ms >= 999) {
                this.s++;
                this.ms = 0;
            }

// if seconds reaches 60, reset to 0 and add a minute
            if (this.s >= 60) {
                this.m++;
                this.s = 0;
            }

// update the element with the current timer data.
// convert this.timerData.to a string
// padStart to add a zero if there are less than 2 numbers in the timerData string (3 numbers on the milliseconds)
// inbetween the minutes/seconds, add : to format it into an actual timer
            this.element.textContent = `${this.m.toString().padStart(2, "0")}:${this.s.toString().padStart(2, "0")}:${Math.round(this.ms).toString().padStart(3, "0")}`;

// start the AnimationFrame and link the updateTimer by binding it
            window.requestAnimationFrame(this.updateTimer.bind(this));
        }
    }

// create a timer to be used at the start of a game
    let t = new Timer();



// assign the elements to be used for click/attempt/average counters
    const attempts = document.getElementById('attempts');
    const success = document.getElementById('success');
    const average = document.getElementById('average');




// the function that will keep the scores
    function keepScore() {

// if the total amount of matched card sets is not zero
        if (successTurns != 0) {

// then divide the amount of moves by the amount of successful turns to get an average number of moves to find a match
            avgTurns = moves / successTurns;

// make a function to round the number up or down to avoid long numbers such as 1.333333333333
            function roundToTwo(avgTurns) {
                return +(Math.round(avgTurns + "e+2")  + "e-2");
            }

// display the average on the element
            average.innerHTML = roundToTwo(avgTurns);
        }

// display the moves and successfull turns on their respective elements
        attempts.innerHTML = moves;
        success.innerHTML = successTurns;

// assign a variable to the timer element
        let showTimer = document.getElementById('timer');

// assign variables to the window.localstorage items needed for the highscore counter
        let getEasyHS = window.localStorage.getItem('easyHS');
        let getNormalHS = window.localStorage.getItem('normalHS');
        let getHardHS = window.localStorage.getItem('hardHS');

// if successfull turns is equal to the first entry of the hsTracker (which is the amount of card sets put in the game in the onSelectFieldSize function)
        if (successTurns == hsTracker[0]) {

// call for the pause function in the timer
            t.pauseTimer();

// run a switch for the highscores depending on the second entry on the HS tracker which stored what playfield you selected
            switch (hsTracker[1]) {

// if there is no highscore stored, then run this alert
                case "4": if (getEasyHS == null) {

// run the alert for a first highscore entry
                    alert('Congratulations!' + "\n" + 'Your time was: ' + showTimer.innerText + "\n" + 'This is the first game you\'ve played, can you beat the highscore?')

// store the new high score entry locally
                    window.localStorage.setItem('easyHS', showTimer.innerText);
                    return;
                }
                    
// if a highscore has been stored
                    if (showTimer.innerText < getEasyHS) {

// run this to congratulate the user, show the new highscore and then show the old highscore for comparison
                        alert('New highscore!' + "\n" + 'Your time was: ' + showTimer.innerText + "\n" + 'Your old highscore was:  ' + getEasyHS)

// store the new highscore locally
                    window.localStorage.setItem('easyHS', showTimer.innerText)
                }
                    else {
                        
// if no new highscore, display the time of the played game and show the time of your highest score
                    alert('Congratulations!' + "\n" + 'You\'ve beaten the game in: ' + showTimer.innerText + "\n" + 'You have not beaten your last highscore: ' + getEasyHS)
                }
                    ; break;
                
                
                
                case "5": if (getNormalHS == null) {
                    alert('Congratulations!' + "\n" + 'Your time was: ' + showTimer.innerText + "\n" + 'This is the first game you\'ve played, can you beat the highscore?')
                    window.localStorage.setItem('normalHS', showTimer.innerText);
                    return;
                }
                    if (showTimer.innerText < getNormalHS) {
                        alert('New highscore!' + "\n" + 'Your time was: ' + showTimer.innerText + "\n" + 'Your old highscore was:  ' + getNormalHS)
                    window.localStorage.setItem('normalHS', showTimer.innerText)
                }
                else {
                    alert('Congratulations!' + "\n" + 'You\'ve beaten the game in: ' + showTimer.innerText + "\n" + 'You have not beaten your last highscore: ' + getNormalHS)
                    }
                    
                    ; break;            
                
                case "6": if (getHardHS == null) {
                    alert('Congratulations!' + "\n" + 'Your time was: ' + showTimer.innerText + "\n" + 'This is the first game you\'ve played, can you beat the highscore?')
                    window.localStorage.setItem('hardHS', showTimer.innerText);
                    return;
                }
                    if (showTimer.innerText < getHardHS) {
                        alert('New highscore!' + "\n" + 'Your time was: ' + showTimer.innerText + "\n" + 'Your old highscore was:  ' + getHardHS)
                    window.localStorage.setItem('hardHS', showTimer.innerText)
                }
                else {
                    alert('Congratulations!' + "\n" + 'You\'ve beaten the game in: ' + showTimer.innerText + "\n" + 'You have not beaten your last highscore: ' + getHardHS)
                }
                    break;
            }
        }
    }


    function player() {
// assign variables to the local storage items
        let userName = window.localStorage.getItem('name');
        let firstHS = window.localStorage.getItem('easyHS');
        let secondHS = window.localStorage.getItem('normalHS');
        let thirdHS = window.localStorage.getItem('hardHS');
    
// if no username has been registered yet
        if (userName == null) {

// make a prompt asking for the name
            const answer = prompt('What is your name?');

// store it in the localstorage variable
            window.localStorage.setItem('name', answer);
        }

// if no scores have been stored yet, display this text instead
        if (firstHS == null) {
            firstHS = 'no highscore registered.'
        }
        if (secondHS == null) {
            secondHS = 'no highscore registered.'
        }
        if (thirdHS == null) {
            thirdHS = 'no highscore registered.'
        }

// if a username has been registered locally, run this alert
        if (userName != null) {

// give a brief explaination of how the game works and show the current highscores
            alert('Welcome ' + userName + "\n" + "\n" + 'How to play:' + "\n" + 'Select the difficulty. (16, 24 or 36 cards).' + "\n" + 'Turn the first card to start the timer.' + "\n" + 'Can you beat your own highscores ?' + "\n" + "\n" + 'Highscores:' + "\n" + '4x4 cards: ' + firstHS + "\n" + '5x5 cards: ' + secondHS + "\n" + '6x6 cards: ' + thirdHS)
        }
    }


// the function for sounds
    function animalSounds(event) {

// assign a variable to the mute button
        let muteBtn = document.getElementById('muteAudio');

// if event.target is the field ID, then
        if (event.target != document.getElementById('field')) {

// create new audio which grabs the attribute name from the animal image element
            let audio = new Audio('snd/' + event.target.parentNode.firstChild.getAttribute('name') + '.wav');

// then play the sound
            audio.play();

// if the audio is not muted
            if (muteBtn.className == ('fas fa-volume-up')) {

// then don't mute it
                audio.muted = false;
            }
            else {

// if the classname is not fas fa-volume-up (it will change to fas fa-volume-mute on click), then mute the audio
                audio.muted = true;
            }
        }
    };


// create an array which stores the cards that have been flipped
    let turnedCards = [];

// the click listener for the cards
    function onClickCard(event) {

// start the timer here to make sure the timer won't start until a user is ready to play
        t.startTimer();

// if the classname is covered
        if (event.target.className == 'covered') {

// replace it with the classname uncovered to reveal the card
            event.target.className = 'uncovered';

// run the animalSounds function
            animalSounds(event);

// push the card to the turnedCards array
            turnedCards.push(event.target.parentNode.firstChild);

// run the evaluatematch function
            evaluateMatch();
        };

// if an uncovered card is clicked, run the animal sound anyway so kids can enjoy it.
        animalSounds(event);
    };

// function to evaluate the cards for a match
    function evaluateMatch() {

// assign variable to the first and second array item in turnedCards
        let card1Check = turnedCards[0];
        let card2Check = turnedCards[1];

// if this array reaches a length of 2
        if (turnedCards.length == 2) {

// check if the set name attributes match
            if (card1Check.getAttribute('set') == card2Check.getAttribute('set')) {

// add +1 to the move counter and successfull turn counter
                moves++;
                successTurns++;

// run the keepScore function to check if the cardgame has completed and to update the move/successfull moves/avg counter
                keepScore();

// play a short animation to make it visually more attractive
                card1Check.style.animation = 'matchSuccess 1s ease-out';
                card2Check.style.animation = 'matchSuccess 1s ease-out';

// set a timeout until the matched cards dissapear from the game. The timeout is shorter than the animation on purpose, when setting them both on the same time it didn't look as good as it does now
                setTimeout(() => {
                    card1Check.parentNode.style.visibility = 'hidden';
                    card2Check.parentNode.style.visibility = 'hidden';
                }, 500);
            }

// if no match
            else {

// add +1 to the move counter
                moves++;

// run the keepScore function to update the move/successfull moves/avg counter
                keepScore();

// run a different animation
                card2Check.style.animation = 'matchError 1s ease-out';
                card1Check.style.animation = 'matchError 1s ease-out';

// set a timeout after which the cards are flipped again by renaming the classnames back to 'covered'
                setTimeout(() => {
                    card1Check.style.animation = '';
                    card2Check.style.animation = '';
                    card1Check.parentNode.lastChild.className = 'covered';
                    card2Check.parentNode.lastChild.className = 'covered';
                }, 500);

            }

// remove the eventlistener
            myField.removeEventListener("click", onClickCard);

// when the cards are removed from the game or flipped, add the eventlistener again and reset the turnedCards array
            setTimeout(() => {
                myField.addEventListener("click", onClickCard);
                turnedCards.length = 0;
            }, 500);
        }
    }

// the reset game function
    function resetGame() {

// pause the timer
        t.pauseTimer();

// run the resetTimer function
        t.resetTimer();

// reset the counter variables to 0
        moves = 0;
        successTurns = 0;
        avgTurns = 0;

// update the elements to display 0
        average.innerHTML = '0';
        attempts.innerHTML = '0';
        success.innerHTML = '0';
    }
}