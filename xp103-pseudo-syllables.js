#! /usr/bin/env node

const fr = require('dictionary-fr')
const fs = require('fs')
var path = require('path')

function split_word(w) {
  return w
  //.replace(/([^aeiouy\(\)])([aeiouy]{3,})([^aeiouy\(\)])/g,'($1)($2)($3)')
  //.replace(/([^aeiouy])([aeiouy]{2,})([^aeiouy])/g,'[($1)($2)]($3)')
  .replace(/nt/g,'n--t')
  .replace(/([^aeiouy])([aeiouy]{1,1})([^aeiouy])/g,'$1$2--$3')
//  return w;
}

// 3 voyels between 2 consonnes
// 2 voyels between 2 consonnes
// 1 voyel between 2 consonnes


var base = require.resolve('dictionary-fr')
console.log('base:',base)
const vdic = fs.readFileSync(path.join(base, '../index.dic'), 'utf-8')
  .split('\n')
  .filter(w => (!w.match(/[0-9\-\/]/)))
  .filter(w => (w.length >4))
  .map(w =>(w.toLowerCase().trim()))

console.log(`fr-dico ${vdic.length} words`)

const _hh = {};

vdic.forEach(w =>{
  console.log(`${w} => ${split_word(w)}`)
})

process.exit(-1)

vdic.forEach(w =>{
  const vs = syllabify(w);
  vs && vs.forEach(s =>{
    _hh[s] = _hh[s] || 0;
    _hh[s]++;
  })
  console.log(`${w} => `,vs)
//  console.log(`${w} => ${syllabify(w).join('--')}`)
})

console.log(`found ${Object.keys(_hh).length} syllables.`)

const f = Object.keys(_hh)
  .sort((a,b)=>(_hh[b]-_hh[a]))
  .map(s => ({s,count:_hh[s]}))

f.forEach(it =>{console.log(it)})

console.log(`found ${Object.keys(_hh).length} syllables.`)

// !!!!! console.log(['away', 'hair', 'halter', 'hairspray', 'father', 'lady', 'kid'].map(syllabify))

/*
var nlp_compromise = require('nlp_compromise');
var nlpSyllables = require('nlp-syllables');

nlp_compromise.plugin(nlpSyllables);
console.log(`nlp_compromise:`,nlp_compromise)

var t2 = nlp_compromise.text('houston texas');
console.log(t2.syllables());
*/
