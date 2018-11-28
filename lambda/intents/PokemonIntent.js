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

const PokemonHandler = {
  canHandle (handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
              handlerInput.requestEnvelope.request.intent.name === 'PokemonIntent'
  },
  handle (handlerInput) {
    return (async function () {
      const requestAttributes = handlerInput.attributesManager.getRequestAttributes()
      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes()

      const pokemonName = utils.slotValue(handlerInput.requestEnvelope.request.intent.slots.PokemonName)
      console.log('PokemonName', pokemonName)

      const cardTitle = requestAttributes.t('DISPLAY_CARD_TITLE', requestAttributes.t('SKILL_NAME'), pokemonName)
      let speakOutput = ''

      try {
        // Get Pokemon types
        let response = await P.getPokemonByName(pokemonName)
        let types = utils.getTypeString(response.types)
        let s3mp3URL = `https://s3-eu-west-1.amazonaws.com/pokemon-cries/${response.id}.wav`
        let intro = `${pokemonName}, ${types} type. <break time="500ms"/> `

        // Get Pokemon description
        let species = await P.getPokemonSpeciesByName(pokemonName)
        let textEntry = species.flavor_text_entries.filter(o => o.language.name === 'en').filter(o => o.version.name === 'alpha-sapphire')
        let description = `${textEntry[0].flavor_text} <break time="500ms"/> `

        // Get Pokemon evolution chain id
        let speciesEvolve = species.evolution_chain.url
        let speciesMatch = /.*\/([^\\]+)\//
        let speciesId = speciesEvolve.match(speciesMatch)[1]

        // Get Pokemon evolution chain
        let evolve = await P.getEvolutionChainById(speciesId)

        console.log(evolve)
        let evolveStr = utils.getEvolveString(evolve.chain)
        console.log(evolveStr)

        let speech = intro + evolveStr + description

        console.log(speech)

        sessionAttributes.speakOutput = speech
        // sessionAttributes.repromptSpeech = requestAttributes.t('RECIPE_REPEAT_MESSAGE');
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes)

        return handlerInput.responseBuilder
          .speak(sessionAttributes.speakOutput) // .reprompt(sessionAttributes.repromptSpeech)
          .addAudioPlayerPlayDirective('REPLACE_ENQUEUED', s3mp3URL, '0')
          .withSimpleCard(cardTitle, speech)
          .getResponse()
      } catch (error) {
        console.log('There was an ERROR: ', error)
        speakOutput = requestAttributes.t('RECIPE_NOT_FOUND_MESSAGE')
        const repromptSpeech = requestAttributes.t('NOT_FOUND_REPROMPT')
        if (pokemonName) {
          speakOutput += requestAttributes.t('RECIPE_NOT_FOUND_WITH_ITEM_NAME', pokemonName)
        } else {
          speakOutput += requestAttributes.t('RECIPE_NOT_FOUND_WITHOUT_ITEM_NAME')
        }
        speakOutput += repromptSpeech

        sessionAttributes.speakOutput = speakOutput // saving speakOutput to attributes, so we can use it to repeat
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
  PokemonHandler
}
