"use strict";

function get_poisson_rv(mean){

  let L = Math.exp(-mean);

  let p = 1.0;
  let k = 0;

  do {
      k++;
      p *= Math.random();
  } while (p > L);

  return k - 1;
}
