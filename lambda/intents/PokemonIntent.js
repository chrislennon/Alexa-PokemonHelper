const utils = require('../helpers/utils')
const pokemon = require('../helpers/pokemon')

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
      const cardTitle = requestAttributes.t('DISPLAY_CARD_TITLE', requestAttributes.t('SKILL_NAME'), pokemonName)
      let speakOutput = ''

      try {
        speakOutput = await pokemon.getPokemonTextByName(pokemonName)

        sessionAttributes.speakOutput = speakOutput
        // sessionAttributes.repromptSpeech = requestAttributes.t('RECIPE_REPEAT_MESSAGE');
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes)

        return handlerInput.responseBuilder
          .speak(sessionAttributes.speakOutput) // .reprompt(sessionAttributes.repromptSpeech)
          // .addAudioPlayerPlayDirective('REPLACE_ENQUEUED', s3mp3URL, '0')
          .withSimpleCard(cardTitle, speakOutput)
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
