/**
 Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

 http://aws.amazon.com/apache2.0/

 or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

/**
 * This sample shows how to create a simple Trivia skill with a multiple choice format. The skill
 * supports 1 player at a time, and does not support games across sessions.
 */

'use strict';

/**
 * When editing your questions pay attention to your punctuation. Make sure you use question marks or periods.
 * Make sure the first answer is the correct one. Set at least 4 answers, any extras will be shuffled in.
 */




var questions = {
    
        "FirstPlagueQuestionIntent": {
            "Question": "What was the first plague?",
            "Answers": [
                    "Blood",
                    "Frogs",
                    "Lice",
                    "Darkness"
                ]}
    ,
    
        "FourthQuestionQuestionIntent": {
            "Question": "What is the fourth question?",
            "Answers": [
                    "Why do we lean?",
                    "Why do we dip twice?",
                    "Why do we eat bitter herbs?",
                    "Why do we eat matzah?",
                    "Why are we all here?"
                    ]}
    ,
    
        "MosesAgeQuestionIntent": {
            "Question": "How old was Moses when the plagues started?",
            "Answers": [
                    "Seventy Nine",
                    "Eighty",
                    "Forty",
                    "Thirteen",
                    "One hundred",
                    "Fifty two",
                    "Sixteen"
                ]}
    ,
    
        "BitterHerbsEatingQuestionIntent": {
            "Question": "Why do we eat bitter herbs?",
            "Answers": [
                    "To remember the bitter work of slavery",
                    "Because they taste good",
                    "Because we can",
                    "Because they're good for you"
                ]}
    ,
    
        "AfterKadeshQuestionIntent": {
            "Question": "What comes after Kadesh?",
            "Answers": [
                    "Urchatz",
                    "Karpas",
                    "Hallel",
                    "Maggid"
                ]}
    ,
    
        "DarknessLengthQuestionIntent": {
            "Question": "How long did the plague of darkness last?",
            "Answers": [
                    "A week",
                    "A day",
                    "A year",
                    "An hour"
                ]}
    ,
    
        "MatzahEatingQuestionIntent": {
            "Question": "Why do we eat matzah?",
            "Answers": [
                    "To remember how the Jews left Egypt so fast the bread didn't have time to rise",
                    "Because it's good for you",
                    "Because we're on a diet",
                    "Because we're watching our carbs"]}
    

};

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */

//     if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.05aecccb3-1461-48fb-a008-822ddrt6b516") {
//         context.fail("Invalid Application ID");
//      }

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // add any session init logic here
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId
        + ", sessionId=" + session.sessionId);

    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId
        + ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // handle yes/no intent after the user has been prompted
    if (session.attributes && session.attributes.userPromptedToContinue) {
        delete session.attributes.userPromptedToContinue;
        if ("AMAZON.NoIntent" === intentName) {
            handleFinishSessionRequest(intent, session, callback);
        } else if ("AMAZON.YesIntent" === intentName) {
            handleRepeatRequest(intent, session, callback);
        }
    }

    // dispatch custom intents to handlers here
    if ("AnswerIntent" === intentName) {
        handleAnswerRequest(intent, session, callback);
    } else if ("AnswerOnlyIntent" === intentName) {
        handleAnswerRequest(intent, session, callback);
    } else if ("DontKnowIntent" === intentName) {
        handleAnswerRequest(intent, session, callback);
    } else if ("AMAZON.YesIntent" === intentName) {
        handleAnswerRequest(intent, session, callback);
    } else if ("AMAZON.NoIntent" === intentName) {
        handleAnswerRequest(intent, session, callback);
    } else if ("AMAZON.StartOverIntent" === intentName) {
        getWelcomeResponse(callback);
    } else if ("AMAZON.RepeatIntent" === intentName) {
        handleRepeatRequest(intent, session, callback);
    } else if ("AMAZON.HelpIntent" === intentName) {
        handleGetHelpRequest(intent, session, callback);
    } else if ("AMAZON.StopIntent" === intentName) {
        handleFinishSessionRequest(intent, session, callback);
    } else if ("AMAZON.CancelIntent" === intentName) {
        handleFinishSessionRequest(intent, session, callback);
    } else if (isQuestion(intentName)) {
        askTrueOrFalseQuestion(intent, session, callback);
    } 


    else {
        throw "Invalid intent";
    }
}

// var QUESTION_INTENTS = ["FirstPlagueQuestionIntent",
//                         "MosesAgeQuestionIntent",
//                         "DarknessLengthQuestionIntent",
//                         "MatzahEatingQuestionIntent",
//                         "BitterHerbsEatingQuestionIntent",
//                         "FourthQuestionQuestionIntent"];

function isQuestion(intentName){
    for (var k in questions){
        if (k === intentName) return true;
    }
    return false;
}


// function askTrueOrFalseQuestion(intent, session, callback){
//     var question;
//     if (intent.name === "FirstPlagueQuestionIntent"){
//         question = "What was the first plague?";
//     }
//     else if (intent.name === "MosesAgeQuestionIntent"){
//         question = "How old was Moses when the plagues started?";
//     }

//     var answers = Object.keys(questions[question])[0];

//     var speechOutput = "";
//     var answer,
//         answerIndex;
//     var isCorrect = (Math.random()<.5);
//     if (isCorrect){
//         answerIndex = 0;
//     } 
//     else {
//         answerIndex = Math.floor(Math.random() * (answers.length-1)+1);
//     }
//     answer = answers[answerIndex];
//     speechOutput += "I think it's " + answer + ". Is that right?";
//     var sessionAttributes = {
//         "speechOutput": speechOutput,
//         "repromptText": speechOutput,
//         "isTrueOrFalse": isTrueOrFalse,
//         "isCorrect": isCorrect,
//         "correctAnswerText": answers[0],
//         "questions": questions // to stop it from thinking the game restarted
//     };

//     var repromptText = speechOutput;

//     callback(sessionAttributes,
//         buildSpeechletResponse(CARD_TITLE, speechOutput, repromptText, false));
// }

function askTrueOrFalseQuestion(intent, session, callback){

    // var question;
    // if (intent.name === "FirstPlagueQuestionIntent"){
    //     question = "What was the first plague?";
    // }
    // else if (intent.name === "MosesAgeQuestionIntent"){
    //     question = "How old was Moses when the plagues started?";
    // }

    // var question = "What was the first plague?";

    var speechOutput = "",
        sessionAttributes = {};
    // var questionIndex = 0;
    // var answers = [
    //         "Blood",
    //         "Frogs",
    //         "Lice",
    //         "Darkness"
    //     ];
    var answers = questions[intent.name]["Answers"];

    var answer,
        answerIndex;
    var isTrueOrFalse = true;
    if (isTrueOrFalse){
        // var question = Object.keys(questions[questionIndex])[0];
        var isCorrect = (Math.random()<.5);
        // var answer = createTrueOrFalseAnswer(questions, questionIndex, isTrue);
        if (isCorrect){
            answerIndex = 0;
        } 
        else {
            answerIndex = Math.floor(Math.random() * (answers.length-1)+1);
            // answer = answers[answerIndex];
        }
        answer = answers[answerIndex];
        speechOutput += "I think it's " + answer + ". Is that right?";
    }
    var sessionAttributes = {
        "speechOutput": speechOutput,
        "repromptText": speechOutput,
        "isTrueOrFalse": isTrueOrFalse,
        "isCorrect": isCorrect,
        "correctAnswerText": answers[0],
        "questions": questions // just to make it think there's a game
    };

    var repromptText = speechOutput;

    callback(sessionAttributes,
        buildSpeechletResponse(CARD_TITLE, speechOutput, repromptText, false));
}

// function createTrueOrFalseAnswer(questions, questionIndex, isTrue){
//     var possibleAnswers = [];
//     // var question = Object.keys(questions[questionIndex])[0];
//     if (isTrue){
//         return questions[questionIndex][0];
//     } 
//     else {
//         var answerIndex = Math.floor(Math.random() * (answers.length-1)+1);
//         return answers[answerIndex];
//     }
// }

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // Add any cleanup logic here
}

// ------- Skill specific business logic -------

var ANSWER_COUNT = 4;
var GAME_LENGTH = 5;
var CARD_TITLE = "Passover Trivia"; // Be sure to change this for your skill.

function getWelcomeResponse(callback) {
    var sessionAttributes = {},
        speechOutput = "Welcome to the seder. Ask me a question.",
        repromptText = speechOutput,
        shouldEndSession = false;

        // gameQuestions = populateGameQuestions(),
        // correctAnswerIndex = Math.floor(Math.random() * (ANSWER_COUNT)), // Generate a random index for the correct answer, from 0 to 3
        // roundAnswers = populateRoundAnswers(gameQuestions, 0, correctAnswerIndex),

        // currentQuestionIndex = 0,
        // spokenQuestion = Object.keys(questions[gameQuestions[currentQuestionIndex]])[0],
        // repromptText = "Question 1. " + spokenQuestion + " ",

        // i, j;

    // for (i = 0; i < ANSWER_COUNT; i++) {
    //     repromptText += (i+1).toString() + ". " + roundAnswers[i] + ". "
    // }
    // speechOutput += repromptText;
    // sessionAttributes = {
        // "speechOutput": repromptText,
        // "repromptText": repromptText,
        // "currentQuestionIndex": currentQuestionIndex,
        // "correctAnswerIndex": correctAnswerIndex + 1,
        // "questions": gameQuestions,
        // "score": 0,
        // "correctAnswerText":
            // questions[gameQuestions[currentQuestionIndex]][Object.keys(questions[gameQuestions[currentQuestionIndex]])[0]][0]
    // };
    sessionAttributes = {};
    callback(sessionAttributes,
        buildSpeechletResponse(CARD_TITLE, speechOutput, repromptText, shouldEndSession));
}

function populateGameQuestions() {
    var gameQuestions = [];
    var indexList = [];
    var index = questions.length;

    if (GAME_LENGTH > index){
        throw "Invalid Game Length.";
    }

    for (var i = 0; i < questions.length; i++){
        indexList.push(i);
    }

    // Pick GAME_LENGTH random questions from the list to ask the user, make sure there are no repeats.
    for (var j = 0; j < GAME_LENGTH; j++){
        var rand = Math.floor(Math.random() * index);
        index -= 1;

        var temp = indexList[index];
        indexList[index] = indexList[rand];
        indexList[rand] = temp;
        gameQuestions.push(indexList[index]);
    }

    return gameQuestions;
}

function populateRoundAnswers(gameQuestionIndexes, correctAnswerIndex, correctAnswerTargetLocation) {
    // Get the answers for a given question, and place the correct answer at the spot marked by the
    // correctAnswerTargetLocation variable. Note that you can have as many answers as you want but
    // only ANSWER_COUNT will be selected.
    var answers = [],
        answersCopy = questions[gameQuestionIndexes[correctAnswerIndex]][Object.keys(questions[gameQuestionIndexes[correctAnswerIndex]])[0]],
        temp, i;

    var index = answersCopy.length;

    if (index < ANSWER_COUNT){
        throw "Not enough answers for question.";
    }

    // Shuffle the answers, excluding the first element.
    for (var j = 1; j < answersCopy.length; j++){
        var rand = Math.floor(Math.random() * (index - 1)) + 1;
        index -= 1;

        var temp = answersCopy[index];
        answersCopy[index] = answersCopy[rand];
        answersCopy[rand] = temp;
    }

    // Swap the correct answer into the target location
    for (i = 0; i < ANSWER_COUNT; i++) {
        answers[i] = answersCopy[i];
    }
    temp = answers[0];
    answers[0] = answers[correctAnswerTargetLocation];
    answers[correctAnswerTargetLocation] = temp;
    return answers;
}

function handleAnswerRequest(intent, session, callback) {
    var speechOutput = "";
    var sessionAttributes = {};
    var gameInProgress = session.attributes && session.attributes.questions;
    var answerSlotValid;
    // var answerSlotValid = isAnswerSlotValid(intent);
    if (session.attributes.isTrueOrFalse){
        answerSlotValid = (intent.name === "AMAZON.YesIntent" || intent.name === "AMAZON.NoIntent");
        // answerSlotValid = true;
    }
    else{
        answerSlotValid = false;
    }
    var userGaveUp = intent.name === "DontKnowIntent";

    if (!gameInProgress) {
        // If the user responded with an answer but there is no game in progress, ask the user
        // if they want to start a new game. Set a flag to track that we've prompted the user.
        sessionAttributes.userPromptedToContinue = true;
        speechOutput = "There is no game in progress. Do you want to start a new game? ";
        callback(sessionAttributes,
            buildSpeechletResponse(CARD_TITLE, speechOutput, speechOutput, false));
    } else if (!answerSlotValid && !userGaveUp) {
        // If the user provided answer isn't a number > 0 and < ANSWER_COUNT,
        // return an error message to the user. Remember to guide the user into providing correct values.
        var reprompt = session.attributes.speechOutput;
        var speechOutput;
        if (session.attributes.isTrueOrFalse){
            speechOutput = "Your answer needs to be a yes or no. " + reprompt;
        }
        else{
            speechOutput = "Your answer must be a number between 1 and " + ANSWER_COUNT + ". " + reprompt;
        } 
        callback(session.attributes,
            buildSpeechletResponse(CARD_TITLE, speechOutput, reprompt, false));
    } else {
        if (session.attributes.isTrueOrFalse){
            var correct = (session.attributes.isCorrect && intent.name === "AMAZON.YesIntent") || 
                (!(session.attributes.isCorrect) && intent.name === "AMAZON.NoIntent");

            var speechOutputAnalysis = "";
            if (correct){
                speechOutputAnalysis = "correct. ";
            }
            else {
                speechOutputAnalysis = "wrong. "
            }
            if (!correct || (correct && !(session.attributes.isCorrect))){
                speechOutputAnalysis += "The correct answer is: " + session.attributes.correctAnswerText;
            }
            speechOutput = speechOutputAnalysis;
            callback(session.attributes,
                buildSpeechletResponse(CARD_TITLE, speechOutput, "", true));
        }
        else {

            var gameQuestions = session.attributes.questions,
                correctAnswerIndex = parseInt(session.attributes.correctAnswerIndex),
                currentScore = parseInt(session.attributes.score),
                currentQuestionIndex = parseInt(session.attributes.currentQuestionIndex),
                correctAnswerText = session.attributes.correctAnswerText;

            var speechOutputAnalysis = "";

            if (answerSlotValid && parseInt(intent.slots.Answer.value) == correctAnswerIndex) {
                currentScore++;
                speechOutputAnalysis = "correct. ";
            } else {
                if (!userGaveUp) {
                    speechOutputAnalysis = "wrong. "
                }
                speechOutputAnalysis += "The correct answer is " + correctAnswerIndex + ": " + correctAnswerText + ". ";
            }
            // if currentQuestionIndex is 4, we've reached 5 questions (zero-indexed) and can exit the game session
            if (currentQuestionIndex == GAME_LENGTH - 1) {
                speechOutput = userGaveUp ? "" : "That answer is ";
                speechOutput += speechOutputAnalysis + "You got " + currentScore.toString() + " out of "
                    + GAME_LENGTH.toString() + " questions correct. Thank you for playing!";
                callback(session.attributes,
                    buildSpeechletResponse(CARD_TITLE, speechOutput, "", true));
            } else {
                currentQuestionIndex += 1;
                var spokenQuestion = Object.keys(questions[gameQuestions[currentQuestionIndex]])[0];
                // Generate a random index for the correct answer, from 0 to 3
                correctAnswerIndex = Math.floor(Math.random() * (ANSWER_COUNT));
                var roundAnswers = populateRoundAnswers(gameQuestions, currentQuestionIndex, correctAnswerIndex),

                    questionIndexForSpeech = currentQuestionIndex + 1,
                    repromptText = "Question " + questionIndexForSpeech.toString() + ". " + spokenQuestion + " ";
                for (var i = 0; i < ANSWER_COUNT; i++) {
                    repromptText += (i+1).toString() + ". " + roundAnswers[i] + ". "
                }
                speechOutput += userGaveUp ? "" : "That answer is ";
                speechOutput += speechOutputAnalysis + "Your score is " + currentScore.toString() + ". " + repromptText;

                sessionAttributes = {
                    "speechOutput": repromptText,
                    "repromptText": repromptText,
                    "currentQuestionIndex": currentQuestionIndex,
                    "correctAnswerIndex": correctAnswerIndex + 1,
                    "questions": gameQuestions,
                    "score": currentScore,
                    "correctAnswerText":
                        questions[gameQuestions[currentQuestionIndex]][Object.keys(questions[gameQuestions[currentQuestionIndex]])[0]][0]
                };
                callback(sessionAttributes,
                    buildSpeechletResponse(CARD_TITLE, speechOutput, repromptText, false));
            }
        }
    }
}

function handleRepeatRequest(intent, session, callback) {
    // Repeat the previous speechOutput and repromptText from the session attributes if available
    // else start a new game session
    if (!session.attributes || !session.attributes.speechOutput) {
        getWelcomeResponse(callback);
    } else {
        callback(session.attributes,
            buildSpeechletResponseWithoutCard(session.attributes.speechOutput, session.attributes.repromptText, false));
    }
}

function handleGetHelpRequest(intent, session, callback) {
    // Provide a help prompt for the user, explaining how the game is played. Then, continue the game
    // if there is one in progress, or provide the option to start another one.

    // Set a flag to track that we're in the Help state.
    session.attributes.userPromptedToContinue = true;

    // Do not edit the help dialogue. This has been created by the Alexa team to demonstrate best practices.

    var speechOutput = "I will ask you " + GAME_LENGTH + " multiple choice questions. Respond with the number of the answer. "
        + "For example, say one, two, three, or four. To start a new game at any time, say, start game. "
        + "To repeat the last question, say, repeat. "
        + "Would you like to keep playing?",
        repromptText = "To give an answer to a question, respond with the number of the answer . "
        + "Would you like to keep playing?";
        var shouldEndSession = false;
    callback(session.attributes,
        buildSpeechletResponseWithoutCard(speechOutput, repromptText, shouldEndSession));
}

function handleFinishSessionRequest(intent, session, callback) {
    // End the session with a "Good bye!" if the user wants to quit the game
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Good bye!", "", true));
}

function isAnswerSlotValid(intent) {
    var answerSlotFilled = intent.slots && intent.slots.Answer && intent.slots.Answer.value;
    var answerSlotIsInt = answerSlotFilled && !isNaN(parseInt(intent.slots.Answer.value));
    return answerSlotIsInt && parseInt(intent.slots.Answer.value) < (ANSWER_COUNT + 1) && parseInt(intent.slots.Answer.value) > 0;
}

// ------- Helper functions to build responses -------


function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}

