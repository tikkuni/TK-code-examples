// ==UserScript==
// @name         Kast Notification & Delete
// @namespace    http://kast.gg/
// @version      0.1
// @description  Beeps and Auto Deletes Meanies
// @author       Tkay
// @match        https://w.kastapp.live/*
// @match        https://w.kast.gg/*
// @match        https://w.kast.live/*
// @match        https://w.kastapp.co/*
// @grant        none
// ==/UserScript==

//goal: check message text for bad words, then find associated delete button with that message and click delete.
(function() {
    // source for mp3 https://www.zedge.net/ringtone/bccd1662-094f-3b9c-9bd4-23726b0da84e
    // converted to base64 with https://base64.guru/converter/encode/audio/mp3
    console.log('hello from delete script :)')
    const youHaveRecievedAMessageAudio = "data:audio/wav;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAGDgYtAgAyN+QWaAAihwMWm4G8QQRDiMcCBcH3Cc+CDv/7xA4Tvh9Rz/y8QADBwMWgQAZG/ILNAARQ4GLTcDeIIIhxGOBAuD7hOfBB3/94gcJ3w+o5/5eIAIAAAVwWgQAVQ2ORaIQwEMAJiDg95G4nQL7mQVWI6GwRcfsZAcsKkJvxgxEjzFUgfHoSQ9Qq7KNwqHwuB13MA4a1q/DmBrHgPcmjiGoh//EwC5nGPEmS4RcfkVKOhJf+WOgoxJclFz3kgn//dBA+ya1GhurNn8zb//9NNutNuhz31f////9vt///z+IdAEAAAK4LQIAKobHItEIYCGAExBwe8jcToF9zIKrEdDYIuP2MgOWFSE34wYiR5iqQPj0JIeoVdlG4VD4XA67mAcNa1fhzA1jwHuTRxDUQ//iYBczjHiTJcIuPyKlHQkv/LHQUYkuSi57yQT//uggfZNajQ3Vmz+ Zt//+mm3Wm3Q576v////+32///5/EOgAAADVghQAAAAA//uQZAUAB1WI0PZugAAAAAoQwAAAEk3nRd2qAAAAACiDgAAAAAAABCqEEQRLCgwpBGMlJkIz8jKhGvj4k6jzRnqasNKIeoh5gI7BJaC1A1AoNBjJgbyApVS4IDlZgDU5WUAxEKDNmmALHzZp0Fkz1FMTmGFl1FMEyodIavcCAUHDWrKAIA4aa2oCgILEBupZgHvAhEBcZ6joQBxS76AgccrFlczBvKLC0QI2cBoCFvfTDAo7eoOQInqDPBtvrDEZBNYN5xwNwxQRfw8ZQ5wQVLvO8OYU+mHvFLlDh05Mdg7BT6YrRPpCBznMB2r//xKJjyyOh+cImr2/4doscwD6neZjuZR4AgAABYAAAABy1xcdQtxYBYYZdifkUDgzzXaXn98Z0oi9ILU5mBjFANmRwlVJ3/6jYDAmxaiDG3/6xjQQCCKkRb/6kg/wW+kSJ5//rLobkLSiKmqP/0ikJuDaSaSf/6JiLYLEYnW/+kXg1WRVJL/9EmQ1YZIsv/6Qzwy5qk7/+tEU0nkls3/zIUMPKNX/6yZLf+kFgAfgGyLFAUwY//uQZAUABcd5UiNPVXAAAApAAAAAE0VZQKw9ISAAACgAAAAAVQIygIElVrFkBS+Jhi+EAuu+lKAkYUEIsmEAEoMeDmCETMvfSHTGkF5RWH7kz/ESHWPAq/kcCRhqBtMdokPdM7vil7RG98A2sc7zO6ZvTdM7pmOUAZTnJW+NXxqmd41dqJ6mLTXxrPpnV8avaIf5SvL7pndPvPpndJR9Kuu8fePvuiuhorgWjp7Mf/PRjxcFCPDkW31srioCExivv9lcwKEaHsf/7ow2Fl1T/9RkXgEhYElAoCLFtMArxwivDJJ+bR1HTKJdlEoTELCIqgEwVGSQ+hIm0NbK8WXcTEI0UPoa2NbG4y2K00JEWbZavJXkYaqo9CRHS55FcZTjKEk3NKoCYUnSQ 0rWxrZbFKbKIhOKPZe1cJKzZSaQrIyULHDZmV5K4xySsDRKWOruanGtjLJXFEmwaIbDLX0hIPBUQPVFVkQkDoUNfSoDgQGKPekoxeGzA4DUvnn4bxzcZrtJyipKfPNy5w+9lnXwgqsiyHNeSVpemw4bWb9psYeq//uQZBoABQt4yMVxYAIAAAkQoAAAHvYpL5m6AAgAACXDAAAAD59jblTirQe9upFsmZbpMudy7Lz1X1DYsxOOSWpfPqNX2WqktK0DMvuGwlbNj44TleLPQ+Gsfb+GOWOKJoIrWb3cIMeeON6lz2umTqMXV8Mj30yWPpjoSa9ujK8SyeJP5y5mOW1D6hvLepeveEAEDo0mgCRClOEgANv3B9a6fikgUSu/DmAMATrGx7nng5p5iimPNZsfQLYB2sDLIkzRKZOHGAaUyDcpFBSLG9MCQALgAIgQs2YunOszLSAyQYPVC2YdGGeHD2dTdJk1pAHGAWDjnkcLKFymS3RQZTInzySoBwMG0QueC3gMsCEYxUqlrcxK6k1LQQcsmyYeQPdC2YfuGPASCBkcVMQQqpVJshui1tkXQJQV0OXGAZMXSOEEBRirXbVRQW7ugq7IM7rPWSZyDlM3IuNEkxzCOJ0ny2ThNkyRai1b6ev//3dzNGzNb//4uAvHT5sURcZCFcuKLhOFs8mLAAEAt4UWAAIABAAAAAB4qbHo0tIjVkUU//uQZAwABfSFz3ZqQAAAAAngwAAAE1HjMp2qAAAAACZDgAAAD5UkTE1UgZEUExqYynN1qZvqIOREEFmBcJQkwdxiFtw0qEOkGYfRDifBui9MQg4QAHAqWtAWHoCxu1Yf4VfWLPIM2mHDFsbQEVGwyqQoQcwnfHeIkNt9YnkiaS1oizycqJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7 FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb//////////////////////////// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU="
    const audioBeep = new Audio(youHaveRecievedAMessageAudio);
    audioBeep.volume = 0.3; // 0.0 - 1.0

    var wordsToBeepTo = ['help', '?', 'how do', 'what do', 'pls', 'please', 'Tkay', 'how to', 'night', 'bye', 'see you']
    var badWords = ['cunt', 'fuck', 'asshole', 'shit']
    var myUsername = "Tkay"

    var lastLength = 0;

    Notification.requestPermission()

    window.heckinCursers = {};// window is so you can access this from console


    setInterval(function(){ // this is each interval
        var chatLogElements = document.getElementsByClassName('lobby-chat-message-text');
        if(chatLogElements === undefined) return;
        var chatLogLength = chatLogElements.length;
        if(chatLogLength === lastLength) return;
        lastLength = chatLogLength;

        var readMessagesAmount = document.getElementsByClassName('read-message').length
        var firstTime = readMessagesAmount === 0

        var deleteQueue = {}; // messages to delete. it erases each time

        for(var i = chatLogLength - 1; i > 0; i--){
            var currentElem = chatLogElements[i]
            if(currentElem.classList.contains('read-message')) break; // we've reached where we've read before already.

            currentElem.classList.add('read-message');
            var text = currentElem.textContent
            var username = currentElem.parentElement.getElementsByClassName('lobby-chat-message-login')[0].textContent
            if(username.trim() === myUsername.trim()) continue; // add this

            if(!firstTime && checker(text, wordsToBeepTo)){ //then we send in the wordsToBeepTo array here
                audioBeep.play();
                new Notification(text);// O
            }

            if(checker(text, badWords)){
                var deletebutton = currentElem.parentElement.getElementsByClassName('lobby-chat-message-delete')[0];
                if(deletebutton !== undefined){ // delete button exists :>
                    if(deleteQueue[username] === undefined){ // okay so first time this will be true. you might be the type of person who likes it to === undefined

                        deleteQueue[username] = {
                            deleteButtons: [deletebutton], // one delete button
                            username: username,
                            messageText: text,
                            curseCountCunt: 1
                        }

                    } else { // we've seen this hecker before so lets just increase their curseCountCunt count
                        deleteQueue[username].curseCountCunt++
                        deleteQueue[username].deleteButtons.push(deletebutton) // adds to array at end
                        //so we've seen this person before. we already have. we have to add this new message's delete button too
                    }

                    if(window.heckinCursers[username] === undefined)
                        //open console and type window
                        window.heckinCursers[username] = deleteQueue[username].curseCountCunt

                    else{
                        window.heckinCursers[username]++
                    }
                }
            }

        } // end of for loop

        var usernames = "";
        var keys = Object.keys(deleteQueue) // i think this makes sense LOL, this should have ["Tkay","Teik"] in keys
        for(i = 0; i < keys.length; i++){ // loops through ["Tkay", "Teik"]
            var currQ = deleteQueue[keys[i]] // example: deleteQueue["Tkay"]

            //time to loop
            for(var k = 0; k < currQ.deleteButtons.length; k++){
                currQ.deleteButtons[k].click()
            }
            console.log("deleted bad word: ", currQ.messageText," -", currQ.username, "x" + currQ.curseCountCunt) //here

            new Notification("DELETED: " + currQ.messageText);
            var curseCountText = "";
            if(currQ.curseCountCunt > 1){ // wont show for x1 but will for x2, x3,...
                curseCountText = " x" + currQ.curseCountCunt
            }
            if(i === keys.length - 1)
                usernames += currQ.username + curseCountText; // so we dont have a trailing comma
            else
                usernames += currQ.username + curseCountText + ", "; // "Tkay x3, Teik x1"
        }
        if(keys.length > 0){
            var partner = "partner🤠 "
            if(keys.length > 1) { // i have a bad habit of making it all one line
                partner = "partners🤠 "
            }
            sendMessage("Please watch your language " + partner + usernames)
        }
    }, 3000); // runs ever 3 seconds, 3000 milliseconds

    var checker = function checker(messageText, wordsArray){
        var m = messageText.toLowerCase().trim()
        var splitUpMessagePerWord = m.split(/\b/)
        for(var i = 0 ; i < wordsArray.length; i++){
            if(m.indexOf(wordsArray[i].toLowerCase()) > -1) return true; //this works
        }
        return false
    }

    var sendMessage = function sendMessage(messageText){
        var textbox = document.getElementsByClassName('lobby-chat-message-compose-textarea')[0]
        var backupTextboxValue = textbox.value;
        textbox.value = messageText


        // this for loop below is disgusting. it looks new to me each time i look at it.
        var keys = Object.keys(textbox); // copy this into console
        for(var i = 0; i < keys.length; i++){ // loop through the keys of the textbox
            if(keys[i].indexOf("__reactEventHandler") > -1){ //here is me looping through to find it
                var eventHandlerName = keys[i] // found it
                textbox[eventHandlerName].onKeyPress({ // use it and call the function it has named onKeyPress
                    charCode:13, // it expects this
                    preventDefault:function(){},
                    target: textbox
                    } )
            }
        }
        textbox.value = backupTextboxValue;
        textbox.focus()

    }

})();