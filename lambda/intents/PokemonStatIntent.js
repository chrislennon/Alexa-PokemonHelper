
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
      console.log('PokemonName', pokemonName)

      const statName = utils.slotValue(handlerInput.requestEnvelope.request.intent.slots.StatName)
      console.log('statName', statName)

      const statType = utils.slotValue(handlerInput.requestEnvelope.request.intent.slots.StatType)
      console.log('statType', statType)

      const cardTitle = requestAttributes.t('DISPLAY_CARD_TITLE', requestAttributes.t('SKILL_NAME'), pokemonName)
      let speakOutput = ''

      try {
        let lookupItem, lookupData
        let speech = ''

        if (pokemonName && statType === 'strong') {
          let e = new CustomError(requestAttributes.t('NO_POKEMON_STRENGTHS'))
          throw e
        }

        if (pokemonName) {
          console.log('lookup by name: ' + pokemonName)
          lookupItem = pokemonName
          lookupData = await P.getPokemonByName(pokemonName)
          if (!lookupData) {
            let e = new Error(requestAttributes.t('DATA_ERROR'), lookupItem)
            throw e
          }
          lookupData = lookupData.types
          let types = utils.getTypeString(lookupData)

          speech += `${pokemonName}. ${types} type. `
        } else if (statName) {
          console.log('lookup by type: ' + statName)
          lookupItem = statName
          lookupData = { name: lookupItem }
          speech += `${lookupItem} type. `
        } else {
          let e = new CustomError(requestAttributes.t('NOT_FOUND'))
          throw e
        }

        let damages = await lookupType(lookupData)

        let damage, prefix
        if (statType === 'weak') {
          damage = damages.from
          prefix = 'WEAK_'
        } else if (statType === 'strong') {
          damage = damages.to
          prefix = 'STRONG_'
        } else {
          let e = new CustomError(requestAttributes.t('NOT_FOUND'))
          throw e
        }

        console.log('damages', damages)

        let doubSuperEff = utils.getKeyByValue(damage, 4)
        if (doubSuperEff.length > 0) speech += requestAttributes.t(prefix + 'DOUBLE_SUPER', doubSuperEff.join(', ').replace(/,(?!.*,)/gmi, ' and'))
        let superEff = utils.getKeyByValue(damage, 2)
        if (superEff.length > 0) speech += requestAttributes.t(prefix + 'SUPER', superEff.join(', ').replace(/,(?!.*,)/gmi, ' and'))
        let halfEff = utils.getKeyByValue(damage, 0.5)
        if (halfEff.length > 0) speech += requestAttributes.t(prefix + 'HALF', halfEff.join(', ').replace(/,(?!.*,)/gmi, ' and'))
        let zeroEff = utils.getKeyByValue(damage, 0)
        if (zeroEff.length > 0) speech += requestAttributes.t(prefix + 'NO', zeroEff.join(', ').replace(/,(?!.*,)/gmi, ' and'))

        sessionAttributes.speakOutput = speech
        // sessionAttributes.repromptSpeech = requestAttributes.t('RECIPE_REPEAT_MESSAGE');
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes)

        return handlerInput.responseBuilder
          .speak(sessionAttributes.speakOutput) // .reprompt(sessionAttributes.repromptSpeech)
          .withSimpleCard(cardTitle, speech)
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

async function lookupType (types) {
  let damages = {}
  damages.to = {}
  damages.from = {}

  console.log('filtering types', types)
  console.log('number of types', types.length)
  if (!Array.isArray(types)) {
    types = [ { slot: 1, type: types } ]
  }

  for (const slot of types) {
    let typeData = await P.getTypeByName(slot.type.name)
    let dam2xTo = typeData.damage_relations.double_damage_to
    let dam05xTo = typeData.damage_relations.half_damage_to
    let dam0xTo = typeData.damage_relations.no_damage_to
    for (const i of dam2xTo) {
      damages.to[i.name] = (typeof damages.to[i.name] === 'undefined') ? 2 : damages.to[i.name] * 2
    }
    for (const i of dam05xTo) {
      damages.to[i.name] = (typeof damages.to[i.name] === 'undefined') ? 0.5 : damages.to[i.name] * 0.5
    }
    for (const i of dam0xTo) {
      damages.to[i.name] = (typeof damages.to[i.name] === 'undefined') ? 0 : damages.to[i.name] * 0
    }

    let dam2xFrom = typeData.damage_relations.double_damage_from
    let dam05xFrom = typeData.damage_relations.half_damage_from
    let dam0xFrom = typeData.damage_relations.no_damage_from
    for (const i of dam2xFrom) {
      damages.from[i.name] = (typeof damages.from[i.name] === 'undefined') ? 2 : damages.from[i.name] * 2
    }
    for (const i of dam05xFrom) {
      damages.from[i.name] = (typeof damages.from[i.name] === 'undefined') ? 0.5 : damages.from[i.name] * 0.5
    }
    for (const i of dam0xFrom) {
      damages.from[i.name] = (typeof damages.from[i.name] === 'undefined') ? 0 : damages.from[i.name] * 0
    }
  }
  return damages
}

module.exports = {
  PokemonStatHandler
}
