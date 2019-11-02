# Uncertainty around star rating

_Work in Progress and experimental - Feedback welcome_

## Problem

You have a system where users can rate items on a 5 star scale. You then would like to list all those items sorted by rating, but the problem is: how do you deal with items that have only been rated by a few users.

For example:
A restaurant with one 5 star rating has a mean rating of 5. Is this better than the restaurant that has 5,000 ratings at an average rating of 4.8?  Probably not. There is way more evidence that the latter's retaurants _true_ mean rating is indeed around 4.8.

## Solution

Compute a uncertainty intervals around the _mean_ rating of a restaurant to give a sense about how reliable that estimate is.

The method is inspired by the blog post of [Evan Miller](https://www.evanmiller.org/ranking-items-with-star-ratings.html), but relies on simple random sampling from the posterior dirichlet distribution for the intervals.

```js
// a rating is an array of the sum of stars your item received
// in the below example you have just one rating of 5 stars
const item = [0, 0, 0, 0, 1] 

// the second ingredient is a so called prior
// a rating that you believe is probably true for the general item
// here we define a prior of 5 votes: 1 vote per star
// this gives an average rating of 3
const prior = [1, 1, 1, 1, 1]

// the result of this method is now a combination of your observed rating
// and the prior. The more votes you observe, the less the prior plays a role
// this allows you to also display mean ratings even for items with very few votes
const rating = require("dirichlet-rating")
console.log(rating(item, prior))

// this results in the following output
{
  lowerInterval: 2.273630700081006,
  pointEstimate: 3.333333333333333,
  upperInterval: 4.4033090113600615,
  alpha: 0.05 
}

// in 95% of the time your mean rating for this item is
// between `lowerInterval` and `upperInterval`
// the mean value is the `pointEstimate`
// you notice that there is a lot of uncertainty around the items true rating

// now if you observe 10 more 5 star ratings
console.log(rating(item.map(x => x * 10), prior))
{
  lowerInterval: 3.6782580809383103,
  pointEstimate: 4.333333333333333,
  upperInterval: 4.814010758536736,
  alpha: 0.05
}
// we can for example state that the item's mean rating is probably
// not less that 3.2
```

### API

```js
rating(
  observed, // an array of observed rating
  prior, // an array of the same length of prior ratings
  randomSamples = 1000, // the more samples the better the estimate
  alpha = 0.05 // control the width of the uncertainty intervals
)
```

### How to use it?

For ranking purposes one can either use the `pointEstimate` or one of the interval bounds. The question remains what the prior should be.

### Ze Math

We assume the rating originates from a multinomial distribution with probabilities from a dirichlet distribution. Given a user specified-prior for the dirichlet distribution, we derive the posterior distribution by simply adding the prior and the observed counts. We then sample from the posterior dirichlet distribution to calculate a set of expected ratings.

The the two intervals are the $\alpha / 2$ and $1 - \alpha / 2$ quantiles of the random sample of generated mean ratings.

... TODO

# References

* https://en.wikipedia.org/wiki/Multinomial_distribution
* https://en.wikipedia.org/wiki/Dirichlet_distribution
* https://www.evanmiller.org/ranking-items-with-star-ratings.html