const functions = require('firebase-functions');

Array.prototype.flatMap = function (lambda) {
  return Array.prototype.concat.apply([], this.map(lambda));
};

function bwPowerSet(originalSet) {
  const subSets = [];

  const numberOfCombinations = 2 ** originalSet.length;

  for (let combinationIndex = 0; combinationIndex < numberOfCombinations; combinationIndex += 1) {
    const subSet = [];

    for (let setElementIndex = 0; setElementIndex < originalSet.length; setElementIndex += 1) {
      if (combinationIndex & (1 << setElementIndex)) {
        subSet.push(originalSet[setElementIndex]);
      }
    }

    subSets.push(subSet);
  }

  return subSets;
}

function permutateWithoutRepetitions(permutationOptions) {
  if (permutationOptions.length === 1) {
    return [permutationOptions];
  }

  const permutations = [];

  const smallerPermutations = permutateWithoutRepetitions(permutationOptions.slice(1));

  const firstOption = permutationOptions[0];

  for (let permIndex = 0; permIndex < smallerPermutations.length; permIndex += 1) {
    const smallerPermutation = smallerPermutations[permIndex];

    for (let positionIndex = 0; positionIndex <= smallerPermutation.length; positionIndex += 1) {
      const permutationPrefix = smallerPermutation.slice(0, positionIndex);
      const permutationSuffix = smallerPermutation.slice(positionIndex);
      permutations.push(permutationPrefix.concat([firstOption], permutationSuffix));
    }
  }
  return permutations;
}

exports.generateKeywords = functions.firestore.document('items/{id}')
  .onCreate((snap, context) => {
    const regexp = /[a-zA-Zа-яА-Я]{2,}/ig;
    const data = snap.data();
    const words = data.name.match(regexp).slice(0, 4);
    const combinations = bwPowerSet(words)
      .filter(x => x.length !== 0)
      .flatMap(x => permutateWithoutRepetitions(x))
      .map(x => x.join(' '))
      .map(x => x.toLocaleLowerCase());
    data.keywords = combinations;
    return snap.ref.set(data);
  });
