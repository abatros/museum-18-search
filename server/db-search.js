const massive = require('massive');
const monitor = require('pg-monitor');
import R from 'ramda';
const nspell = require('./nspell.js')
console.log(`nspell.vdico:`,nspell.vdico);

const conn = {
  host: 'inhelium.com',
  port: 5433,
  database: 'museum-v2',
  user: 'postgres',
  password: 'sandeep'
};

console.log('db-search.js')
export var db ; //= massive(conn); // a promise

/*
export const db_init = async function(){
  db = await massive(conn);
  console.log(`db-search.js:init1`);
  monitor.attach(db.driverConfig);
  console.log(`db-search.js:init2`);
//  return ['b','c'];
//  return db;
}
*/

(async ()=>{
  db = await massive(conn);
  console.log(`db-search.js:init11`);
  monitor.attach(db.driverConfig);
  console.log(`db-search.js:init12`);
})();


// -----------------------------------------------------------------------

const format_tsquery = (s) =>{
  if (s.match(/[\|\&\<\>]/)) {
    // do nothing
    return s;
  }
  s = s.trim();
  if (s.startsWith('"') && (s.endsWith('"'))) {
    return s.replace(/"/g,'').split(' ').join('<->');
  }

  s = s.replace(/"/g,' ').replace(/\s+/g,' ')
    .split(' ').join(' & ');
  /*
  const inter = R.intersection('|&<>',s);
  if (!inter.length) {
    //
    console.log('int:',R.intersection('|&<>',s));
    return s.split(' ').join('<->');
  }
  */
return s;
}

// ---------------------------------------------------------------------------

async function search_v1(query) {
  const vdico = nspell.vdico();
  //console.log(`nspell.vdico:`,vdico);

  query = query.replace(/"/g,' ')
  const audit = [];

    // check if there is logical operators in the query, if so execute.
  if (query.match(/[<>\&\|]/)) {
    let etime = new Date().getTime();
    const data = await db.pdf__search_rank_cd(query)
    etime = new Date().getTime() - etime;
    console.log(`q1:(${etime} ms.) ${data.length} results for: ${query}`)
    audit.push(`q1: (${etime} ms.) ${data.length} results for: ${query}`)
    return {etime, audit, hlist: data}
  }
  // --- here, we don't have logic.

  const vq = query.split(' ');

  // try the phraseto_tsquery
  if (true) {
    const _query = vq.join('<->');
    let etime = new Date().getTime();
    const data = await db.pdf__search_rank_cd(_query)
    etime = new Date().getTime() - etime;
    console.log(`q20:(${etime} ms.) ${data.length} results for: ${_query}`)
    audit.push(`q20: (${etime} ms.) ${data.length} results for: ${_query}`)
    if (data.length > 0) {
      return {etime, audit, hlist: data}
    }
  }

  if (true) { // try suggestions same length ()<->()<->()
    const _query = vq.map(w => {
      if (w.length > 2)
        w =vdico[0].suggest(w).filter(it=>(it.length == w.length)).concat([w]).join(' | ')
      return `(${w})`;
    }).join('<->')
    let etime = new Date().getTime();
    const data = await db.pdf__search_rank_cd(_query)
    etime = new Date().getTime() - etime;
    console.log(`q21:(${etime} ms.) ${data.length} results for: ${_query}`)
    audit.push(`q21: (${etime} ms.) ${data.length} results for: ${_query}`)
    if (data.length > 0) {
      return {etime, audit, hlist: data}
    }
  }

  if (true) { // try suggestions same length ()<->()<->()
    const _query = vq.map(w => {
      if (w.length > 2)
        w =vdico[0].suggest(w)
              .filter(it=>((it.length <= w.length+1)&&(it.length >= w.length-1)))
              .concat([w]).join(' | ')
      return `(${w})`;
    }).join('<->')
    let etime = new Date().getTime();
    const data = await db.pdf__search_rank_cd(_query)
    etime = new Date().getTime() - etime;
    console.log(`q22:(${etime} ms.) ${data.length} results for: ${_query}`)
    audit.push(`q22: (${etime} ms.) ${data.length} results for: ${_query}`)
    if (data.length > 0) {
      return {etime, audit, hlist: data}
    }
  }


  // in & and | mode, ignore 1,2 letters words.
  const vq3 = vq.filter(it => (it.length>2));

  if (true) { // try the AND
    const _query = vq3.join(' & ');
    let etime = new Date().getTime();
    const data = await db.pdf__search_rank_cd(_query)
    etime = new Date().getTime() - etime;
    console.log(`q30:(${etime} ms.) ${data.length} results for: ${_query}`)
    audit.push(`q30: (${etime} ms.) ${data.length} results for: ${_query}`)
    if (data.length > 0) {
      return {etime, audit, hlist: data}
    }
  }



  if (true) { // try the AND
    const _query = vq3.join(' | ');
    let etime = new Date().getTime();
    const data = await db.pdf__search_rank_cd(_query)
    etime = new Date().getTime() - etime;
    console.log(`q40:(${etime} ms.) ${data.length} results for: ${_query}`)
    audit.push(`q40: (${etime} ms.) ${data.length} results for: ${_query}`)
//    if (data.length > 0) {
      return {etime, audit, hlist: data}
//    }
  }


}

// ---------------------------------------------------------------------------

Meteor.methods({
  'search': (query) =>{
    return search_v1(query);
  },
  'search2': (query) => {
    try {
      const etime = new Date().getTime();
      const audit = [];
      let _query = format_tsquery(query);
console.log('_query:',_query)
      return db.pdf__search_rank_cd(_query)
      .then(data =>{
        let _etime = new Date().getTime() - etime;
        console.log(`1:(${_etime} ms.) ${data.length} results for: ${_query}`)
        audit.push(`(${_etime} ms.) ${data.length} results for: ${_query}`)
        if (!data || data.length <=0) {
          _query = nspell.mk_suggestions1(query);
          console.log('_query:',_query)
          const etime = new Date().getTime();
          return db.pdf__search_rank_cd(_query)
          .then(data=>{
            _etime = new Date().getTime() - etime;
            console.log(`2:(${_etime} ms.) ${data.length} results for: ${_query}`)
            audit.push(`(${_etime} ms.) ${data.length} results for: ${_query}`)
            if (data.length > 0)
              return data;
            else {
              _query = nspell.mk_suggestions2(query);
              console.log('_query:',_query)
              const etime = new Date().getTime();
              return db.pdf__search_rank_cd(_query)
              .then(data=>{
                _etime = new Date().getTime() - etime;
                console.log(`3:(${_etime} ms.) ${data.length} results for: ${_query}`)
                audit.push(`(${_etime} ms.) ${data.length} results for: ${_query}`)
                return data
              });
            }
          })
        }
        else
          return data;
      })
      .then(data=>{
        return{
          audit,
          hlist:data
        }
      })
    } catch (e) {
      console.log('ERROR',e);
    }
/*
    return new Promise(resolve => {
//      resolve(['a','b']);
      return search();
    })
    */
  }
})
