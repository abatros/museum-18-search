const massive = require('massive');
const monitor = require('pg-monitor');
import R from 'ramda';

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

const search = async function(_query) {
  console.log(`search for <${_query}>`)
  try {
  var data = await db.query(`
    select id, fn, pageno,
      body as h1,
        ts_rank_cd(tsv,to_tsquery($(lang),$(query))) as rank
    from pdf_pages
      where tsv @@ to_tsquery($(lang),$(query))
     ORDER BY rank DESC, fn
      LIMIT 50;
      `,{
  //      query:'dimensions<2>tuyaux'
  //        query: 'dimension<->de<->tuyaux'
  //        query: 'VACUOMÈTRE'
  //        query: 'alliage<2>cuivre'
//          query: 'raccord<2>laiton',
        lang: 'french',
//        query: 'normalized<->lexeme',
//        query: 'stop<->word',
//          query: '64-bit'
//          query: 'vacuum<->freeze | relfrozenxid'
          query: _query
      }

  );//.then(r=>{console.log(r)})
  //data.h1 = data.h1.replace(/[ \.][ \.]+/g,' ')

  if (false)
  data.forEach(it=>{
    console.log(`\n\n=======================\n<${it.filename}>::${it.pageno+1}::${it.rank}`)
    console.log(`data:`,it.h1.replace(/[ \.][ \.]+/g,' ').replace(/\s\s+/g,' ').replace(/<!>/g,' (...) '));
//    console.log('body:\n============\n',it.body);
  })

  return data;
} catch (e){
  console.log('ERROR:', JSON.stringify(e))
  console.log('e.message:', e.message);
  Session.set('e.message',e.message)
//  console.log('db.QueryResultError:', db.QueryResultError())
}
}


// -----------------------------------------------------------------------

const search_rank_cd = async function(_query) {
  console.log(`search_rank_async for <${_query}>`)
  const etime = new Date().getTime();
//  const retv = await db.query(`select * from pdf__search_rank_cd($(query)::text)`,{query:_query});
  const data = await db.pdf__search_rank_cd(_query);
  console.log(`search_rank_cd(${_query}) etime:${new Date().getTime()-etime}`);
  console.log(`=>data.length:`,data.length)
  return data;
}


// -----------------------------------------------------------------------

const search2 = async function(_query) {
  const etime = new Date().getTime();
  console.log(`search for <${_query}>`)
  try {
    var data = await db.query(`
    select id, fn, pageno, rank,
      ts_headline($(lang),body,
        to_tsquery($(lang),$(query)),
        'StartSel ="<em>", StopSel ="</em>", MaxWords = 50, MinWords = 19, HighlightAll = false, MaxFragments = 99, FragmentDelimiter = "\n<!>"')
        as h1

    from (
      select id, fn, pageNo, body,
        ts_rank_cd(tsv,qqq) as rank
      from pdf_pages, to_tsquery($(lang),$(query)) as qqq
      where tsv @@ qqq
     ORDER BY rank DESC, fn
      LIMIT 5000
    ) as top10;
      `,{
  //      query:'dimensions<2>tuyaux'
  //        query: 'dimension<->de<->tuyaux'
  //        query: 'VACUOMÈTRE'
  //        query: 'alliage<2>cuivre'
//          query: 'raccord<2>laiton',
        lang: 'french',
//        query: 'normalized<->lexeme',
//        query: 'stop<->word',
//          query: '64-bit'
//          query: 'vacuum<->freeze | relfrozenxid'
          query: _query
      }

  );//.then(r=>{console.log(r)})
  //data.h1 = data.h1.replace(/[ \.][ \.]+/g,' ')




  if (false)
  data.forEach(it=>{
    console.log(`\n\n=======================\n<${it.filename}>::${it.pageno+1}::${it.rank}`)
    console.log(`data:`,it.h1.replace(/[ \.][ \.]+/g,' ').replace(/\s\s+/g,' ').replace(/<!>/g,' (...) '));
//    console.log('body:\n============\n',it.body);
  })

  return data;
} catch (e){
  console.log('ERROR:', JSON.stringify(e))
  console.log('e.message:', e.message);
  Session.set('e.message',e.message)
//  console.log('db.QueryResultError:', db.QueryResultError())
}
}


const format_tsquery = (s) =>{
  const inter = R.intersection('|&<>',s);
  if (!inter.length) {
    // phraseto_tsquery => replace spaces with <->
    console.log('int:',R.intersection('|&<>',s));
    return s.split(' ').join('<->');
  }

return s;
}

// ---------------------------------------------------------------------------


Meteor.methods({
  'search': (query) => {
    try {
//      const data = search_rank_cd(mk_query(tsquery)); // a promise
      const data = db.pdf__search_rank_cd(format_tsquery(query));
      console.log('data:',data)
      return data; // a promise : async - non blocking.
    } catch (e) {
      console.log('ERROE',e);
    }
/*
    return new Promise(resolve => {
//      resolve(['a','b']);
      return search();
    })
    */
  }
})
