const CFIRPokemonIntentHandler = {
  canHandle (handlerInput) {
    return handlerInput.requestEnvelope.request.type === `CanFulfillIntentRequest` &&
       handlerInput.requestEnvelope.request.intent.name === 'PokemonIntent'
  },
  handle (handlerInput) {
    const intentName = handlerInput.requestEnvelope.request.intent.name
    const filledSlots = handlerInput.requestEnvelope.request.intent.slots
    const slotValues = getSlotValues(filledSlots)
    console.log('in CFIR PokemonIntentHandler ' + JSON.stringify(slotValues))

    if (slotValues.PokemonName.isValidated) {
      console.log('in CFIR PokemonIntentHandler YES')
      return handlerInput.responseBuilder
        .withCanFulfillIntent(
          {
            'canFulfill': 'YES',
            'slots': {
              'PokemonName': {
                'canUnderstand': 'YES',
                'canFulfill': 'YES'
              }
            }
          })
        .getResponse()
    } else {
      console.log('in CFIR PokemonIntentHandler canFulfill == NO')
      return handlerInput.responseBuilder
        .withCanFulfillIntent(
          {
            'canFulfill': 'YES',
            'slots': {
              'PokemonName': {
                'canUnderstand': 'YES',
                'canFulfill': 'NO'
              }
            }
          })
        .getResponse()
    }

    return handlerInput.responseBuilder
      .speak(speechoutput)
      .reprompt(speechoutput)
      .getResponse()
  }
}

function getSlotValues (filledSlots) {
  const slotValues = {}

  console.log(`The filled slots: ${JSON.stringify(filledSlots)}`)
  Object.keys(filledSlots).forEach((item) => {
    const name = filledSlots[item].name

    if (filledSlots[item] &&
        filledSlots[item].resolutions &&
        filledSlots[item].resolutions.resolutionsPerAuthority[0] &&
        filledSlots[item].resolutions.resolutionsPerAuthority[0].status &&
        filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
      switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
        case 'ER_SUCCESS_MATCH':
          slotValues[name] = {
            synonym: filledSlots[item].value,
            value: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
            id: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.id,
            isValidated: true
          }
          break
        case 'ER_SUCCESS_NO_MATCH':
          slotValues[name] = {
            synonym: filledSlots[item].value,
            value: filledSlots[item].value,
            id: null,
            isValidated: false
          }
          break
        default:
          break
      }
    } else {
      slotValues[name] = {
        synonym: filledSlots[item].value,
        value: filledSlots[item].value,
        id: filledSlots[item].id,
        isValidated: false
      }
    }
  }, this)

  return slotValues
}

module.exports = {
  CFIRPokemonIntentHandler
}
