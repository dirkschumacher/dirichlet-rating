"use strict"

const {Gamma, Multinomial,  rng: { MersenneTwister, timeseed, normal: { AhrensDieter } }} = require("lib-r-math.js")

const quantile = require("quantile")

const sum = (x) => {
  return x.reduce((acc, el) => acc + el)
}

/**
 * Generates random numbers from a dirichlet distribution
 * Based on this: https://en.wikipedia.org/wiki/Dirichlet_distribution#Random_number_generation
 * 
 * @param {any} gamma gamma distribution random generator
 * @param {Array<number>} alpha
 * @return {Array<number>}
 */
const randomDirichlet = (gamma, alpha) => {
  const randGammas = alpha.map((x) => gamma.rgamma(1, x, 1)) 
  const gammaSum = sum(randGammas)
  return randGammas.map(x => x / gammaSum)
}

const meanRating = (rating) => {
  return sum(rating.map((x, i) => (i + 1) * x)) / sum(rating)
}

/**
 * Generates an uncertainity interval around a count based rating
 * 
 * @param {Array<number>} observed 
 * @param {Array<number>} alphaPrior 
 * @param {number} randomSamples > 0
 * @param {number} alpha 0 <= alpha <= 1
 * @return {Array<number>}
 */
const dirichletRating = (observed, alphaPrior, randomSamples = 1000, alpha = 0.05) => {
  let alphaPost = alphaPrior.slice(0)
  for (let i = 0; i < alphaPost.length; i++) {
    alphaPost[i] += observed[i]
  }
  const totalN = sum(alphaPost)

  // super slow
  // but now we always have the same seed
  //const rng = new MersenneTwister(timeseed())
  //const ad = new AhrensDieter(rng)
  const g = Gamma()
  const mn = Multinomial()
  let ratings = []
  for (let i = 0; i < randomSamples; i++) {
    const rndDirichlet = randomDirichlet(g, alphaPost)
    const rating = meanRating(mn.rmultinom(1, totalN, rndDirichlet))
    ratings.push(rating)
  }
  ratings.sort()
  const qs = [alpha / 2.0, 0.5, 1.0 - alpha / 2.0].map(p => quantile(ratings, p))
  return {
    lowerInterval: qs[0],
    pointEstimate: qs[1],
    upperInterval: qs[2],
    alpha: alpha
  }
}

module.exports = dirichletRating
