/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core')
// const recipes = require('./recipes');
const i18n = require('i18next')
const sprintf = require('i18next-sprintf-postprocessor')

/* INTENT HANDLERS */

const PokemonHandler = require('./intents/PokemonIntent').PokemonHandler
const PokemonStatHandler = require('./intents/PokemonStatIntent').PokemonStatHandler

// Name free launch
const CFIRPokemonHandler = require('./intents/CFIRPokemonIntent').CFIRPokemonIntentHandler

const LaunchRequestHandler = require('./intents/AMZN/LaunchRequestHandler').LaunchRequestHandler
const HelpHandler = require('./intents/AMZN/HelpIntent').HelpHandler
const RepeatHandler = require('./intents/AMZN/RepeatIntent').RepeatHandler
const ExitHandler = require('./intents/AMZN/Exit').ExitHandler
const SessionEndedRequestHandler = require('./intents/AMZN/SessionEndedRequestHandler').SessionEndedRequestHandler
const ErrorHandler = require('./intents/AMZN/Error').ErrorHandler

/* CONSTANTS */
const skillBuilder = Alexa.SkillBuilders.custom()
const languageStrings = require('./helpers/strings').languageStrings

// Finding the locale of the user
const LocalizationInterceptor = {
  process (handlerInput) {
    const localizationClient = i18n.use(sprintf).init({
      lng: handlerInput.requestEnvelope.request.locale,
      overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
      resources: languageStrings,
      returnObjects: true
    })

    const attributes = handlerInput.attributesManager.getRequestAttributes()
    attributes.t = function (...args) {
      return localizationClient.t(...args)
    }
  }
}

/* LAMBDA SETUP */
exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    CFIRPokemonHandler,
    PokemonHandler,
    PokemonStatHandler,
    HelpHandler,
    RepeatHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addRequestInterceptors(LocalizationInterceptor)
  .addErrorHandlers(ErrorHandler)
  .lambda()
