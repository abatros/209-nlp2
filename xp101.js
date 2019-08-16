#! /usr/bin/env node

const fr = require('dictionary-fr')
const fs = require('fs')
var path = require('path')

/*
fr(function (err, result) {
  console.log(err || result)
});
*/

var base = require.resolve('dictionary-fr')
console.log('base:',base)
const vdic = fs.readFileSync(path.join(base, '../index.dic'), 'utf-8')
  .split('\n')
  .filter(w => (!w.match(/[0-9\-\/]/)))
  .filter(w => (w.length >4))
  .map(w =>(w.toLowerCase().trim()))

console.log(`fr-dico ${vdic.length} words`)


const _hh ={};
vdic.forEach(w =>{
  const w2 = xnor1(w)
  _hh[w2] = _hh[w2] || new Set();
  _hh[w2].add(w);
  if (_hh[w2].size >1) {
    console.log(`${Object.keys(_hh).length} collision [${w2}] : (${Array.from(_hh[w2]).join(', ')})`)
  }
})



///fs.readFileSync(path.join(base, '../index.aff'), 'utf-8')

const sli = [
  'viens ici',
  'donne moi la fourchette',
  'ouvre la porte',
  "je vais a l'ecole",
]

sli.forEach(s =>{
  const s2 = xnor1(s);
  console.log(`${s} => ${s2}`)
})


function xnor1(s) {
  const s2 = s.replace(/[aeiouy]/g, '')
  return s2;
}
