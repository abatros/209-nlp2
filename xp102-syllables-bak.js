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
//        if (_hh[s] ==1) trie.add(s);
      } else {
//        console.log(`syllabe (${s}) ignored from (${row.ortho})=>(${row.orthosyll})`,)
      }
    })

/*
    if (vo.length != vs.length) {
      // console.log(`corrupted:`,row);
      ierr ++;
      // console.log(`${ierr}:${i} corrupted: ${row.orthosyll}=>${row.syll}`);
    }
    */
//    if (i>1000) break;
  }


  console.log(`found ${Object.keys(_hh).length} syllables.`)
  console.log(`found ${Object.keys(_gIndex).length} gIndex (good-words).`)

  /*
  Object.keys(_hh).forEach(pat =>{
    trie.add(pat)
  })
  */

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
//process.exit(-1)

//  assert(trie.hasWord('man'))

/*
  const f = Object.keys(_hh)
//    .sort((a,b)=>(_hh[b]-_hh[a]))
    .sort((a,b)=>(_hh[a]-_hh[b]))
    .map(s => ({s,count:_hh[s]}))
*/

// writeJsonFile.sync('patterns.json',Object.keys(_hh).sort(),'utf8')

/*
  f.forEach((it,j) =>{
    console.log(`${j} `,it)
    if ()
  })
*/
  console.log(`found ${Object.keys(_hh).length} syllables.`)

  //console.log(`suggest(flex)=>`, trie.find('flex'))

if (false) {


;`

bien.veil.lan.ce
en.veill.an.bi
con.si.de.rer.re
ap.part.ment app.art
`.replace(/[\s\n]+/g,'.').split('.').forEach(pat =>{trie.add(pat)});
}


  //split('bienveillance')
  //split('considerer')
  //split('appartement')

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
    const routes = split(word, {verbose})
    console.log(`hyphenate:[${word}]=>`);
    //console.log(routes)
    routes.forEach(route =>{
      console.log(`>>${route.v.length} ${route.v.join('.')} (penalty:${route.penalty})`)
    })
    console.log(`hyphenate: found ${routes.length} routes`)
  }

/*
const phrase = `Ce dimanche, les enfants fêteront les pères, en leur offrant poèmes et menus cadeaux.
Et pourtant, cette année comme les précédentes, les papas auront été moins présents
que les mamans auprès d’eux. Pour des raisons culturelles, certes, mais aussi professionnelles.
`.toString().toLowerCase().replace(/[\s\n,\.’]/g,'').slice(0,100)
//hyphenate('ousontcesserpentsquisifflent')
hyphenate(phrase)
*/

/*
const phrase = `Ce dimanche, les enfants fêteront les pères, en leur offrant poèmes et menus cadeaux.
`.toString().toLowerCase().replace(/[\s\n,\.’]/g,'').slice(0,100)
//hyphenate('ousontcesserpentsquisifflent')
*/

const phrase = `Ce dimanche, les enfants fêteront les pères.
`.toString().toLowerCase().replace(/[\s\n,\.’]/g,'').slice(0,100)

hyphenate(phrase)

//console.log('trie.find=>',trie.getPrefix('pa'))

  function split(w, options) {
    options = options||{};
    const {verbose} = options;
    const pat_len =2;
    const routes =[];
    const _route ={}; // records all the partial routes of length X. _route[len] => {routes,min_penalty}
    let igen =0;

    function add_route(x) {
      const {len, v, pat} = x;
      _route[len] = _route[len] ||{min_penalty:99999, routes:[]};
      const {min_penalty} = _route[len];
      if ((_route[len].routes.length>0)&&(min_penalty>=99999)) throw 'fatal@162'
      x.penalty = v.filter(pat=>('aeiou'.includes(pat.slice(0,1)))).length;
      verbose &&
      console.log(`add-route pat:(${pat}) new penalty:${x.penalty}`);
      verbose &&
      console.log(`add-route context: @len:${len} routes:${_route[len].routes.length} min_penalty:${min_penalty}`)
      _route[len].routes.push(x);

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

      const parent = _route[len - pat.length];
      _assert(parent, _route, `Missing parent _route[${len - pat.length}]`)

      if (_route[len].routes.length >1) {
        if (x.penalty < _route[len].min_penalty) {
          //verbose &&
          console.log(`add_route @len:${len} penalty ${min_penalty}->${x.penalty} replace.`)
          _route[len].min_penalty = x.penalty;
          // merge those 2 routes.
          // or better say: ignore this new node (it is recorded here in _route)
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
        _route[len].min_penalty = x.penalty;
        routes.push(x)
      }
      if ((_route[len].routes.length>0)&&(_route[len].min_penalty>=99999)) {
        console.log(`_route[${len}]:`,_route[len])
        throw 'fatal@181'
      }
      return x;
    }

    routes.push({
      len:0, // starting position
      pat:null,
      parent:null,
      // debug.
      v:[], // an array of pat.
//      target:w // still to parse.
    });
    //while (routes.length >0)
    for (let i=0; i<30; i++) {
      console.log(`generation:${i} routes:${routes.length}`)
      const {nodes_added} = next_gen();
//      if (!nodes_added) break;
      const max = Math.max(routes.map(r=>r.len))
      const min = Math.min(routes.map(r=>r.len))
      if (max >=w.length) break;
    }
    return routes;

    function next_gen() {
      verbose &&
      console.log(`*******************************************`)
      igen ++;
      let nodes_added =0;
      verbose &&
      console.log(`next-gen(${igen}) routes:${routes.length}`);
      /*
        Each route has a target
      */

      console.log(`------------------------------`)
      for (const [ix,route] of routes.entries()) {
        const {len, pat, v, parent, penalty} = route;
        console.log(`--${ix} route[len:${len}] (${v.join('.')})`)
      }
      console.log(`------------------------------`)


      /*
        ATTN DO NOT change routes[]..... now.
      */

      const new_routes =[];

      for (const [ix,route] of routes.entries()) {
        const {len, pat, v, parent, penalty} = route;
        const target = w.slice(len);
        if (!target || target.length<=0) {
          continue;
        }
        //console.log(route)
        verbose && (len>0) &&
        console.log(`
          --${ix} route[len:${len}] status (${v.join('.')}) penalty:${penalty}
          alternative routes:${_route[len].routes.length} min_penalty:${_route[len].min_penalty}
          `)
        /***********************************
          what are the suggestions ?
        ************************************/
//        const s3 = w.slice(len,len+pat_len);
        const s3 = target.slice(0,pat_len);
        if (!s3 || s3.length<=0) {
          console.log(`
            target:${target}
            pat_len:${pat_len}
            `)
          throw 'stop@138'
        }
//        const v3 = trie.find(s3);
        const v3 = trie.getPrefix(s3,false);
        verbose &&
        console.log(`suggestions for target:(${target})`);
        verbose &&
        console.log(`suggestions(${s3}) ${v3.length}=>`, v3);
        if (!v3) return null;

        let ic =0; // for counting children.
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


        //console.log(`leaving pat2 with ${ic} routes.`)
        if (ic <=0) {
          verbose &&
          console.log(`dead route (${route.v.join('.')}) for s3:(${s3}) at generation:${route.v.length} #routes:${routes.length} Removing this route.`)
          // remove this route: just remove this node from routes.
          const ii = routes.findIndex(it => (it === route));
          //console.log('routes before dead')
          //dump_routes()
          routes.splice(ii,1);
          //console.log('routes after dead')
          //dump_routes()
          verbose &&
          console.log(`dead route(2) ${route.v.join('.')} at generation:${route.v.length} #routes:${routes.length}`)
        }
      }; // each route


      new_routes.forEach((new_route,ix) =>{
        const {len, pat, v, parent, penalty} = new_route;
        console.log(`new-route[${ix}] status len:${len} (${v.join('.')}) penalty:${penalty}`);

        /************************************************
        If route with same length already exists ex; _route[16]
        the route is simply pushed onto _route[16].routes
        ... An another route to reach km[16].
        If this new route has a lesser penalty, the node is replaced.
        Else, a new route is added both in routes[] and _route

        *************************************************/

        console.log('before add-route'); dump_routes();
        add_route(new_route);
        console.log('after add-route'); dump_routes();

        /**************
        if (add_route(new_route)) {
          nodes_added ++;
          if (ic <=1) {
            // extend the route: replace latest node with this new-one.
              routes[ix] = new_route;
          } else {
            // create a new route.
            routes.push(new_route);
          }
        } *************/

      })

      verbose &&
      console.log(`>> leaving gen:${igen} with ${routes.length} routes`)
      //console.log(`>> w.length:${w.length} routes:[${routes.map(it=>(it.pat)).join(':')}]`)
      //console.log(`>> w.length:${w.length} routes:[${routes.map(it=>(it.len)).join(':')}]`)
//      console.log(routes)
      routes.forEach(route =>{
        // generation is also v.length
        verbose &&
        console.log(`>> ###${route.v.length} ${route.v.join('.')}`)
      })

      /********************************************************
        optimization : keep only 1 route for each point
      *********************************************************/

      //select_best_routes();


      /*****************************
        should return number of incomplete routes
      ******************************/
      return {nodes_added};
    } // next_gen

    function select_best_routes_Obsolete() {
      // keep only 1 route for each point reached (len) on the sentence.
      // in fact, here, we merge 2+ routes having same end point.
      // each new node (route) is registered in _route.
      const _ii={};
      for (const [ix,route] of routes.entries()) {
        const {len, pat, v, parent} = route;
        // for each route compute penalty: here number of voyels starting a pattern
        route.penalty = v.filter(pat=>('aeiou'.includes(pat.slice(0,1)))).length;
        _ii[len] = _ii[len] ||[];
        _ii[len].push(route)
      }
      console.log(`select_best_routes:`,_ii);
      Object.values(_ii).forEach(it =>{
      })
    }

    function dump_routes() {
      console.log(`---------dump-routes----------------`)
      for (const [ix,route] of routes.entries()) {
        const {len, pat, v, parent, penalty} = route;
        console.log(`-- routes[${ix}] len:${len} (${v.join('.')}) _route[${len}]:${_route[len] && _route[len].routes.length}`)
      }
      console.log(`------------------------------------`)
    }


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
