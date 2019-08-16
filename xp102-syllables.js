#! /usr/bin/env node

/*
6003472da510@truehisp
password: 'mike-delta' Morning-Dew.
*/

const fr = require('dictionary-fr')
const fs = require('fs')
var path = require('path')
const assert = require('assert')
//const AutoComplete = require('trie-autocomplete');
//var Triejs = require('triejs');
var Trie = require('trie-prefix-tree');
const writeJsonFile = require('write-json-file');


const argv = require('yargs')
  .alias('v','verbose').count('verbose')
  .options({
    'pg-monitor': {default:false},
    'limit': {default:99999}, // stop when error, if --no-stop, show error.
//    'zero-auteurs': {default:false}, //
  }).argv;

const {verbose} = argv;


const csv=require("csvtojson");
const csv_fpath = './Lexique-query-2019-06-13 03_12_45.csv';

main();

async function main() {
  const _hh ={};
//  const trie = new AutoComplete();
  const json = await csv().fromFile(csv_fpath);

  console.log(`json.length:${json.length} words from csv base.`)

  const _gIndex={};
  let ierr =0;

  for (let [i,row] of json.entries()) {
//    console.log(`${i} :`,row);
//    console.log(`${i} ${row.ortho} [${row.syll}] (${row.orthosyll}) ${row.cgramortho}`);
    if (row.ortho.includes('-')) continue;
    if (row.ortho.includes(' ')) continue;
    // Add this word to a good index.
    _gIndex[row.ortho] = row;
    const vo = row.orthosyll.split('-');
    //const vs = row.syll.split('-');

    vo.forEach(s =>{
      if (s.length < 6) {
        _hh[s] = _hh[s] || 0;
        _hh[s]++;
      } else {
//        console.log(`syllabe (${s}) ignored from (${row.ortho})=>(${row.orthosyll})`,)
      }
    })
  }

  console.log(`found ${Object.keys(_hh).length} syllables.`)
  console.log(`found ${Object.keys(_gIndex).length} gIndex (good-words).`)

  var trie = new Trie(Object.keys(_hh));

  trie.removeWord('ara');
  trie.removeWord('s');
  trie.removeWord('t');
  trie.removeWord('r');
  trie.removeWord('x');
  trie.removeWord('d');
  trie.addWord('fflent')
  trie.addWord('leur')
  trie.addWord('di')
  trie.addWord('man')

  console.log(`found ${Object.keys(_hh).length} syllables.`)

  const gIndex = Object.keys(_gIndex);
  for (let i=0; i<0; i++) {
    const iz =  Math.floor(Math.random() * Math.floor(gIndex.length));
    //console.log(`[${gIndex[iz]}]`)
    const word = gIndex[iz];
    const routes = split(word)
    console.log(`random-word:[${word}]=>`);
    //console.log(routes)
    routes.forEach(route =>{
      console.log(`##${route.v.length} ${route.v.join('.')}`)
    })
  }


  function hyphenate(word) {
    const {routes, dump_routes} = split(word, {verbose})
    console.log(`hyphenate:[${word}]=>`);
    //dump_routes(routes)
    console.log(`hyphenate: found ${routes.length} routes`)
  }


const phrase2 = `Ce dimanche, les enfants fêteront les pères,
en leur offrant poèmes et menus cadeaux
`

const phrase3 = `
this is a new day with a lot of exiting things
`;

hyphenate(phrase2.toString().toLowerCase().replace(/[\s\n,\.’]/g,''));


//console.log('trie.find=>',trie.getPrefix('pa'))

  function split(w, options) {
    options = options||{};
    const {verbose} = options;
    const pat_len =2;
    let routes =[]; // rebuilt at each generation: filter deleted.
    const _km ={}; // records all the partial routes of length X. _km[len] => {routes,min_penalty}
    let igen =0;

    function add_route(x) {
      const {len, v, pat} = x;
      _km[len] = _km[len] ||{min_penalty:99999, routes:[]};
      const {min_penalty} = _km[len];
      if ((_km[len].routes.length>0)&&(min_penalty>=99999)) throw 'fatal@162'
      x.penalty = v.filter(pat=>('aeiou'.includes(pat.slice(0,1)))).length;
      verbose &&
      console.log(`add-route pat:(${pat}) new penalty:${x.penalty}`);
      verbose &&
      console.log(`add-route context: @len:${len} routes:${_km[len].routes.length} min_penalty:${min_penalty}`)
      _km[len].routes.push(x);

      /*********************************
      add a route or modify an existing
      find-out if this is the first route added to parent.
      what is the parent ?
      parent is at (len - pat.len)
      *********************************/

      const parent_len = len - pat.length;
      if (parent_len <=0) {
        routes.push(x)
        return;
      }

      const parent = _km[len - pat.length];
      _assert(parent, _km, `Missing parent _km[${len - pat.length}]`)

      if (_km[len].routes.length >1) {
        if (x.penalty < _km[len].min_penalty) {
          //verbose &&
          console.log(`add_route @len:${len} penalty ${min_penalty}->${x.penalty} replace.`)
          _km[len].min_penalty = x.penalty;
          // merge those 2 routes.
          // or better say: ignore this new node (it is recorded here in _km)
          // find the route to replace....
          // it's a route from routes that ends at (len) : only one...
          const ii = routes.findIndex(it => (it.len == len));
          routes[ii] = x;
          return null;
        } else {
          // no need to replace the route.
        }
      } else {
        // this is the first route[len]
        // we need to add in the routes array.
        console.log(`add_first_route @len:${len} penalty ${min_penalty}->${x.penalty}`)
        _km[len].min_penalty = x.penalty;
        routes.push(x)
      }
      if ((_km[len].routes.length>0)&&(_km[len].min_penalty>=99999)) {
        console.log(`_km[${len}]:`,_km[len])
        throw 'fatal@181'
      }
      return x;
    }

    /**************************
    FIRST ROUND
    ***************************/

    const vpat = find_patterns(w, pat_len);
    console.log(vpat)

    // bootstrap phase.
    vpat.forEach((pat,j) =>{
      const route = {
          pat:pat,
          len: pat.length,
          parent: null,
          v: [pat],
          penalty:0
      };
      routes.push(route);
      _km[pat.length] = {routes:[route]};
    })

    dump_routes(routes)

    for (let i=0; i<40; i++) {
      console.log(`generation:${i} routes:${routes.length}`)
      next_gen();
      const max = Math.max(routes.map(r=>r.len))
      const min = Math.min(routes.map(r=>r.len))
      if (min >=w.length) break;
    }

    return {routes, dump_routes};

// --------------------------------------------------------------------------

    function find_patterns(target, pat_len) {
      assert(pat_len)
      const s3 = target.slice(0, pat_len);
      if (!s3 || s3.length<=0) {
        console.log(`
          target:${target}
          pat_len:${pat_len}
          `)
        throw 'stop@138'
      }
//        const v3 = trie.find(s3);
      const v3 = trie.getPrefix(s3,false);
      (verbose>1) &&
      console.log(`${v3.length} suggestions for target:(${target})`);
      //verbose &&
      //console.log(`suggestions(${s3}) ${v3.length}=>`, v3);
      if (!v3) return null;
      const vpat = v3.filter(pat =>(target.startsWith(pat)));
      (verbose>1) &&
      console.log(`${vpat.length} only good-suggestions for target:(${target})`);
      return (vpat.length>0)?vpat:null;
    }
    /*************************
      v3.forEach((pat2,jj) =>{
        if (target.startsWith(pat2)) {
          ic ++;
          const v2 = v.slice(0);
    //      if (!Array.isArray(v2)) throw 'NOT AN ARRAY'
          v2.push(pat2);

          const new_route = {
            pat:pat2,
            len: len + pat2.length,
            parent: route,
            v: v2
          };
          new_route.penalty = v.filter(pat=>('aeiou'.includes(pat.slice(0,1)))).length;
          new_routes.push(new_route);
        } else {
          verbose &&
          console.log(`pat[${jj}:${v3.length}]:(${pat2}) not fit in ${target}`)
        }
      })


    }
    ****************/

    // ---------------------------------------------------------------------

    function next_gen() {
      verbose &&
      console.log(`*******************************************`)
      igen ++;
      let nodes_added =0;
      verbose &&
      console.log(`next-gen(${igen}) routes:${routes.length}`);
      const new_routes =[];

      for (const [ix,route] of routes.entries()) {
        const {len, pat, v, parent, penalty} = route;
        //console.log(route)

        /************
        end of target => do not look for patterns.
        *************/

        const to_go = w.slice(len); // for this route.
        if (to_go.length <=0) {
          console.log(`destination reached : do-nothing`)
          continue;
        }

        const vpat = find_patterns(w.slice(len), pat_len);
        (verbose) &&
        console.log(`next-steps:`,vpat);

        if (!vpat) {
          verbose &&
          console.log(`This route has no next step => mark-it deleted`)
          route.deleted =true;
          continue;
        }
        // extends this route (reassign the route)
        // or create a new route if mutiple suggestions.
        vpat.forEach((pat,j) =>{
          const v2 = v.slice(0);
    //      if (!Array.isArray(v2)) throw 'NOT AN ARRAY'
          v2.push(pat);
          const new_route = {
            pat,
            len: len + pat.length,
            parent: route,
            v: v2
          };
//            new_route.penalty = v.filter(pat=>('aeiou'.includes(pat.slice(0,1)))).length;
          new_routes.push(new_route);
          route.deleted = true;

        }) // each pattern (suggestion).
      } // each existing route

      /************************************************
       ADD ALL THE NEW ROUTES NOW, for the entire generation.
      *************************************************/
      new_routes.forEach(route =>{
        // mark parent for deletion.
        routes.push(route);
        _km[route.len] = _km[route.len] ||{routes:[]}
        _km[route.len].routes.push(route)
      })

      routes = routes.filter(route =>(!route.deleted))
      const max = Math.max(routes.map(r=>r.len))
      const min = Math.min(routes.map(r=>r.len))

      verbose &&
      console.log(`Leaving next_gen(${igen}) with the following routes:`)
      verbose &&
      dump_routes(routes);
      return {min,max}
    }

    // ---------------------------------------------------------------------

    function dump_routes(routes) {
      console.log(`---------dump-routes----------------`)
      for (const [ix,route] of routes.entries()) {
        const {len, pat, v, parent, penalty, deleted} = route;
        console.log(`--${ix+1}:${routes.length} km_${len} (${v.join('.')})${(deleted)?' (deleted)':''} #routes:${_km[len] && _km[len].routes.length}`)
      }
      console.log(`------------------------------------`)
    }

    function dump_routes_at_km(len) {
      if (!_km[len]) {
        console.log(`There is no routes for station_${len}`)
        return;
      }
      console.log(`--------- routes at station_${len} ----------------`)
      _km[len].routes.forEach((route,ix) =>{
        const {len, pat, v, parent, penalty} = route;
        console.log(`--${ix} station_${len} (${v.join('.')})`)
      })
      console.log(`-------------------------------------------------`)
    }

    throw 'WE-SHOULD-NOT-BE-HERE'
  } // split
} // main


// --------------------------------------------------------------------------

function _assert (b, o, err_message) {
  if (!b) {
    console.log(`######[${err_message}]_ASSERT=>`,o);
    console.trace(`######[${err_message}]_ASSERT`);
    throw {
      message: err_message // {message} to be compatible with other exceptions.
    }
  }
}
