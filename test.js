"use strict"

const rating = require(".")
const test = require("tape")

test("some basic assertions", (t) => {
  const prior = [1, 1, 1, 1, 1]

  const res = rating([0, 0, 0, 0, 0], prior)
  t.true(res.lowerInterval < res.pointEstimate)
  t.true(res.pointEstimate < res.upperInterval)
  t.equal(res.alpha, 0.05)
  t.true(Math.abs(res.pointEstimate - 3) < 0.1)

  t.end()
})

test("more evidence mean narrower CIs", (t) => {
  const prior = [1, 1, 1, 1, 1]
  const res1 = rating(prior, prior)
  const res2 = rating(prior.map(x => x * 100), prior)
  t.true(res1.lowerInterval < res2.lowerInterval)
  t.true(res1.upperInterval > res2.upperInterval)
  t.true(res1.lowerInterval < res2.lowerInterval)
  t.true(Math.abs(res1.pointEstimate - res2.pointEstimate) < 0.1)
  t.end()
})

test("some checks against R", (t) => {

  const res1 = rating([0, 1, 1, 0, 9], [1, 1, 1, 1, 1])
  const res2 = rating([0, 1, 1, 0, 9], [10, 1, 1, 5, 10])

  t.true(Math.abs(res1.lowerInterval - 3.1250) < 0.1)
  t.true(Math.abs(res1.pointEstimate - 4.1250) < 0.1)
  t.true(Math.abs(res1.upperInterval - 4.8125) < 0.1)

  t.true(Math.abs(res2.lowerInterval - 2.789474) < 0.1)
  t.true(Math.abs(res2.pointEstimate - 3.552632) < 0.1)
  t.true(Math.abs(res2.upperInterval - 4.210526 ) < 0.1)

  t.end()
})

test("alpha controls the CIs", (t) => {
  const res1 = rating([0, 1, 1, 0, 9], [1, 1, 1, 1, 1], 1000, 0.1)
  const res2 = rating([0, 1, 1, 0, 9], [1, 1, 1, 1, 1], 1000, 0.05)

  t.equal(res1.alpha, 0.1)
  t.equal(res2.alpha, 0.05)

  t.true(res1.lowerInterval > res2.lowerInterval)
  t.true(res1.upperInterval < res2.upperInterval)

  t.end()
})