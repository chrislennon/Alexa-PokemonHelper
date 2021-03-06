
function getRandomItem (arrayOfItems) {
  let i = 0
  i = Math.floor(Math.random() * arrayOfItems.length)
  return (arrayOfItems[i])
};

function getKeyByValue (object, value) {
  let keyArr = Object.keys(object).map(key => {
    if (object[key] === value) {
      return key
    }
  })
  keyArr = keyArr.filter(el => el != null)
  return keyArr
}

function slotValue (slot, useId) {
  let value = slot.value
  let resolution = (slot.resolutions && slot.resolutions.resolutionsPerAuthority && slot.resolutions.resolutionsPerAuthority.length > 0) ? slot.resolutions.resolutionsPerAuthority[0] : null
  if (resolution && resolution.status.code === 'ER_SUCCESS_MATCH') {
    let resolutionValue = resolution.values[0].value
    console.log(`seen slot lookup match ${resolution.values[0].value} == ${resolutionValue.name} == ${slot.value}`)
    value = resolutionValue.id && useId ? resolutionValue.id : resolutionValue.name
    console.log('using ' + value)
  } else {
    value = false
  }
  return value
}

function dynamicSort (property) {
  var sortOrder = 1
  if (property[0] === '-') {
    sortOrder = -1
    property = property.substr(1)
  }
  return function (a, b) {
    var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0
    return result * sortOrder
  }
}

function getTypeString (types) {
  let sortedTypes = types.sort(dynamicSort('slot'))
  let typeStr = ''
  let i = 1
  for (const slot of sortedTypes) {
    typeStr += slot.type.name
    if (i < sortedTypes.length) typeStr += ', '
    i++
  }
  return typeStr
}

function getEvolveString (chain) {
  // console.log(chain)

  // let evolve0Baby = chain.is_baby
  let evolve0Name = chain.species.name
  let evolve0Chain = chain.evolves_to

  let evolveStr = ''
  let evolve1Details, evolve2Details

  if (evolve0Chain.length > 0) {
    for (let evolve1 of chain.evolves_to) {
      evolveStr += `${evolve0Name} `
      if (evolve1) {
        let evolve1Name = evolve1.species.name
        evolve1Details = evolve1.evolution_details[0]
        // console.log('evolve1Deails', evolve1Details)
        // let evolve1Baby = evolve1.species.is_baby
        evolveStr += `evolves into ${evolve1Name} `
        evolveStr += evolutionStrings(evolve1Details)
        evolveStr += '.<break time="500ms"/> '

        for (let evolve2 of evolve1.evolves_to) {
          if (evolve2) {
            let evolve2Name = evolve2.species.name
            evolve2Details = evolve2.evolution_details[0]
            // console.log('eveolve2Deails', evolve2Details)
            // let evolve2Baby = evolve2.species.is_baby
            evolveStr += `${evolve1Name} then evolves to ${evolve2Name} `
            evolveStr += evolutionStrings(evolve2Details)
            evolveStr += '.<break time="500ms"/> '
          }
        }
      }
    }
  } else {
    evolveStr += 'does not evolve. <break time="500ms"/> '
  }
  return evolveStr
}

function evolutionStrings (details) {
  let evolveStr = ''
  if (details.min_level) evolveStr += `at level ${details.min_level} `
  if (details.gender) evolveStr += `with gender ${details.gender} `
  if (details.held_item) evolveStr += `by holding a ${details.held_item.name} `
  if (details.item) evolveStr += `by using a ${details.item.name} `
  if (details.known_move) evolveStr += `when it knows the move ${details.known_move.name} `
  if (details.known_move_type) evolveStr += `when it knows a ${details.known_move_type.name} type move `
  if (details.location) evolveStr += `when in ${details.location.name} `
  if (details.min_affection) evolveStr += `with a bond of ${details.min_affection} hearts `
  if (details.min_beauty) evolveStr += `when it's beautiful `
  if (details.min_happiness) evolveStr += `when it's happy `
  if (details.needs_overworld_rain) evolveStr += `when it's raining `
  if (details.party_species) evolveStr += `with a ${details.party_species.name} in your party `
  if (details.party_type) evolveStr += `with a ${details.party_type.name} type pokemon in your party `
  if (details.relative_physical_stats === 0) {
    evolveStr += `when its attack stat is the same as its defense stat `
  } else if (details.relative_physical_stats === 1) {
    evolveStr += `when its attack stat is greater than its defense stat `
  } else if (details.relative_physical_stats === -1) {
    evolveStr += `when its attack stat is less than its defense stat `
  }
  if (details.time_of_day !== '') evolveStr += `at ${details.time_of_day} `
  if (details.trade_species) evolveStr += ` when traded for a ${details.trade_species.name} `
  if (details.turn_upside_down) evolveStr += `and holding the 3DS upside down ` // lol wat

  if (details.trigger.name === 'level-up' && !details.min_level) evolveStr += `and levels up `
  if (details.trigger.name === 'trade' && !details.trade_species) evolveStr += `when traded `

  return evolveStr
}

module.exports = {
  getRandomItem,
  getKeyByValue,
  slotValue,
  getTypeString,
  getEvolveString
}
