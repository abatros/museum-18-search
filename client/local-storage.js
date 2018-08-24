import { ClientStorage } from 'meteor/ostrio:cstorage';

/*
    Persist an array into the localStorage.

    Implementation:
    - the data (array) is stored as a main array, and recent contributions.
    - main array is identified with a key.
    - recent contributions are identified with key-tmp-iSeq.

    How it works:
    (1) main array is serialized - JSON.stringify()
    (2) recent contributions are identified as 'key-tmp-%d'
    (3) recents contributions are added, a new array is saved, then removed.
*/


function History(key) {
  this.key = key;
  this.irc = 0; // iSeq for RC

  this.list = function(options) {
    const etime = new Date().getTime();
    const data = ClientStorage.get(key) || "[]";
    const verbose = (options && options.verbose) || 0;
    if (verbose > 0) {
      console.log(`localStorage:main-array(${key})=>`,data)
    }
    const max_length = (options && options.limit) || 100;
    const v = JSON.parse(data).slice(-max_length); // to be loaded from dataStore.
    if (verbose > 0) {
      console.log(`localStorage:list(${key})=>`,v)
    }
    const localKeys = ClientStorage.keys();
    if (verbose > 0) {
      console.log(`localStorage:localKeys=>`,localKeys)
    }
    irc = 0;
    localKeys.sort().forEach(it=>{
      const re = new RegExp(key+'-rc(\d+)')
      const m = it.match(/query-history-rc([0-9]+)/)
      console.log('--',m)
      if (m) {
        v.push(JSON.parse(ClientStorage.get(it)));
        irc = Math.max(irc,m[1]);
        if (verbose > 0) {
          console.log(`${it} irc:${irc}`);
        }
      }
    })
    irc += 1;
    return v;
  }

  this.compact = function () {
    const v = this.list();
    ClientStorage.set(key, JSON.stringify(v));
    const localKeys = ClientStorage.keys();
    localKeys.forEach(it=>{
      if (it.startsWith(key+'-rc')) {
        ClientStorage.remove(it);
      }
    })

    return v; // main array + recent contributions.
  }


  this.push = function(o) {
    ClientStorage.set(`${key}-rc${irc++}`,JSON.stringify(o))
  }

  this.reset = function() {
    const localKeys = ClientStorage.keys();
    localKeys.forEach(it=>{
      if (it.startsWith('query-history-rc')) {
        ClientStorage.remove(it);
      }
    })
    ClientStorage.set('query-history',"[]"); // empty array
    return [];
  }

}






module.exports = History;
