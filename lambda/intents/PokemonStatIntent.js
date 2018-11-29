
class CustomError extends Error {
  constructor (msg = '', ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError)
    }

    // Custom debugging information
    this.msg = msg
    this.date = new Date()
  }
}

const utils = require('../helpers/utils')
const pokemon = require('../helpers/pokemon')
const Pokedex = require('pokedex-promise-v2')
let options = {
  protocol: process.env.API_PROTO || 'https',
  hostName: process.env.API_HOST || 'pokeapi.co:443',
  versionPath: process.env.API_PATH || '/api/v2/',
  cacheLimit: process.env.API_CACHE || 2 * 1000,
  timeout: process.env.API_TIMEOUT || 2 * 1000
}
let P = new Pokedex(options)

const PokemonStatHandler = {
  canHandle (handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
              handlerInput.requestEnvelope.request.intent.name === 'PokemonStatIntent'
  },
  handle (handlerInput) {
    return (async function () {
      const requestAttributes = handlerInput.attributesManager.getRequestAttributes()
      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes()

      const pokemonName = utils.slotValue(handlerInput.requestEnvelope.request.intent.slots.PokemonName)
      const statName = utils.slotValue(handlerInput.requestEnvelope.request.intent.slots.StatName)
      const statType = utils.slotValue(handlerInput.requestEnvelope.request.intent.slots.StatType)

      const cardTitle = requestAttributes.t('DISPLAY_CARD_TITLE', requestAttributes.t('SKILL_NAME'), pokemonName)
      let speakOutput = ''

      try {
        let lookupItem, lookupData

        if (pokemonName && statType === 'strong') throw new CustomError(requestAttributes.t('NO_POKEMON_STRENGTHS'))

        if (pokemonName) {
          lookupItem = pokemonName
          lookupData = await P.getPokemonByName(pokemonName)
          lookupData = lookupData.types
          let typeStr = utils.getTypeString(lookupData)
          speakOutput += `${pokemonName}. ${typeStr} type. `
        } else if (statName) {
          lookupItem = statName
          lookupData = { name: lookupItem }
          speakOutput += `${lookupItem} type. `
        } else {
          throw new CustomError(requestAttributes.t('NOT_FOUND'))
        }

        if (!lookupData) throw new Error(requestAttributes.t('DATA_ERROR'), lookupItem)
        let damages = await pokemon.lookupType(lookupData)
        if (!damages) throw new Error(requestAttributes.t('DATA_ERROR'))

        let damage, prefix
        if (statType === 'weak') {
          damage = damages.from
          prefix = 'WEAK_'
        } else if (statType === 'strong') {
          damage = damages.to
          prefix = 'STRONG_'
        } else {
          throw new CustomError(requestAttributes.t('NOT_FOUND'))
        }

        let doubSuperEff = utils.getKeyByValue(damage, 4)
        if (doubSuperEff.length > 0) speakOutput += requestAttributes.t(prefix + 'DOUBLE_SUPER', doubSuperEff.join(', ').replace(/,(?!.*,)/gmi, ' and'))
        let superEff = utils.getKeyByValue(damage, 2)
        if (superEff.length > 0) speakOutput += requestAttributes.t(prefix + 'SUPER', superEff.join(', ').replace(/,(?!.*,)/gmi, ' and'))
        let halfEff = utils.getKeyByValue(damage, 0.5)
        if (halfEff.length > 0) speakOutput += requestAttributes.t(prefix + 'HALF', halfEff.join(', ').replace(/,(?!.*,)/gmi, ' and'))
        let zeroEff = utils.getKeyByValue(damage, 0)
        if (zeroEff.length > 0) speakOutput += requestAttributes.t(prefix + 'NO', zeroEff.join(', ').replace(/,(?!.*,)/gmi, ' and'))

        sessionAttributes.speakOutput = speakOutput
        // sessionAttributes.repromptSpeech = requestAttributes.t('RECIPE_REPEAT_MESSAGE');
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes)

        return handlerInput.responseBuilder
          .speak(sessionAttributes.speakOutput) // .reprompt(sessionAttributes.repromptSpeech)
          .withSimpleCard(cardTitle, speakOutput)
          .getResponse()
      } catch (err) {
        console.log(err)
        if (err) speakOutput = err.msg
        // speakOutput = requestAttributes.t('RECIPE_NOT_FOUND_MESSAGE')
        const repromptSpeech = requestAttributes.t('NOT_FOUND_REPROMPT')
        speakOutput += repromptSpeech

        sessionAttributes.speakOutput = speakOutput
        sessionAttributes.repromptSpeech = repromptSpeech

        handlerInput.attributesManager.setSessionAttributes(sessionAttributes)

        return handlerInput.responseBuilder
          .speak(sessionAttributes.speakOutput)
          .reprompt(sessionAttributes.repromptSpeech)
          .getResponse()
      }
    })()
  }
}

module.exports = {
  PokemonStatHandler
}
