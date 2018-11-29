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

async function getPokemonTextByName (pokemonName) {
  // Get Pokemon types
  let response = await P.getPokemonByName(pokemonName)
  let types = utils.getTypeString(response.types)
  let pokemonId = response.id
  // let s3mp3URL = `https://s3-eu-west-1.amazonaws.com/pokemon-cries/${response.id}.wav`

  // Get Pokemon description
  let species = await P.getPokemonSpeciesByName(pokemonName)
  let descriptionText = species.flavor_text_entries.filter(o => o.language.name === 'en').filter(o => o.version.name === 'alpha-sapphire')[0].flavor_text
  let genusText = species.genera.filter(o => o.language.name === 'en')[0].genus

  // Get Pokemon evolution chain id
  let speciesEvolve = species.evolution_chain.url
  let speciesMatch = /.*\/([^\\]+)\//
  let speciesId = speciesEvolve.match(speciesMatch)[1]

  // Get Pokemon evolution chain
  let evolve = await P.getEvolutionChainById(speciesId)

  console.log(evolve)
  let evolveStr = utils.getEvolveString(evolve.chain)
  console.log(evolveStr)

  let speech = `${pokemonName}. <break time="300ms"/> 
  Number ${pokemonId}. <break time="300ms"/> 
  ${genusText}. <break time="300ms"/> 
  ${types} type. <break time="300ms"/> 
  ${descriptionText} <break time="300ms"/> 
  ${evolveStr} <break time="300ms"/> `

  console.log(speech)

  return speech
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
  getPokemonTextByName,
  lookupType
}
