import R from 'ramda';
console.log('spanel file');

import { ClientStorage } from 'meteor/ostrio:cstorage';

const History = require('./local-storage.js')
query_History = new History('query-history');
query_History.compact();


Template.search_panel.onCreated(function(){
  console.log('search_panel created')
  this.audit = new ReactiveVar([]);
  this.hlist = new ReactiveVar([]);
  this.q = new ReactiveVar('q0::Enter your search query.'); //
  this.etime = new ReactiveVar(0);
  this.reset = function(){
    console.log('reset');
    this.q.set('q0::Enter your search query.'); //
  }
  this.reset();

  this.execute_query = function(_query) {
    const tp = this;
    Session.set('tsquery', _query)
    console.log(`ENTER: ${_query}`);

    tp.hlist.set([]);
    tp.audit.set([])
    tp.q.set('q2::Searching in 94307 pages - please wait...'); // Searching
    const etime = new Date().getTime();
    Meteor.call('search',_query, (err,data)=>{
      tp.etime.set(new Date().getTime() - etime);
      if (err) {
        console.log('ERROR:', err);
        tp.q.set('q4::Syntax or System Error! retype your query.') // system or syntax error
        return;
      }

      console.log(`data.etime:${data.audit}`);
      console.log(`data.length:${data && data.hlist && data.hlist.length}`)
      if (!data) {
        tp.q.set('q3::No result for this query BAD!.');
        return
      }

      const v = query_History.push({query:_query, pages:data.hlist.length});
      //Session.set('history',v);

      if (!data.hlist || data.hlist.length <= 0) {
        tp.q.set('q3::No result for this query.');
        tp.audit.set(data.audit);
        return
      }

      //console.log('data:',data)
      /*
        Sort the data according to mode.
      */

      if (_query.trim().indexOf(' ')<0) {
        console.log(`Single Word Mode (${_query}). Sorting...`)
        // single word search: check if word found in headline
        // sort if (flag,filename, pageno)
        data.hlist.forEach(it => {
          it.sflag = (it.h1.toLowerCase().indexOf(_query.toLowerCase())<0) ? 1:0
          if (it.sflag == 0) console.log(`(${it.sflag}) ${it.h1}`);
        })
        data.hlist = data.hlist.sort((a,b)=>{
          if (a.sflag != b.sflag) return a.sflag - b.sflag;
          if (a.filename != b.filename) return (a.filename.localeCompare(b.filename));
          return (a.pageno - b.pageno)
        });
      }

      tp.hlist.set(data.hlist);
      tp.q.set(`q3:: .`)
      tp.audit.set(data.audit);
    })
  }


})


Template.search_panel.events({
  'click .js-search-history': (ev,tp)=>{
    Session.set('history-timeStamp', new Date())
    const bg = document.getElementById('search-history-modal');
    console.log('bg:',bg);
    bg.style.display = 'block';
  },
  'click .js-clear-history': (ev,tp)=>{
    query_History.reset();
  },

});

Template.search_panel.events({
  'click .js-search': (ev,tp)=>{
    // get query from input, not event.
    console.log('js-search:',tp.find('input'));
    const query = tp.find('input').value;
    tp.execute_query(query);
  },
  'keyup': (ev,tp)=>{
    //console.log('search_panel.keyup');
    tp.q.set('q1::keep typing then - CR to search.'); // button is displayed.
    tp.hlist.set([]); // results
    if (ev.keyCode == 13) {
      tp.execute_query(ev.target.value);
    }
  },
});



Template.search_panel.helpers({
  audit() {
    const tp = Template.instance()
    //console.log('tp.hlist:',tp.hlist.get())
    return tp.audit.get();
  },
  results() {
    const tp = Template.instance()
    //console.log('tp.hlist:',tp.hlist.get())
    return tp.hlist.get();
  },
  err_message: ()=>{
    return Session.get('e.message')
  },
  rCount: ()=>{
    const tp = Template.instance()
    return tp.hlist.get().length;
  },
  trimfn: (fn)=>{
    return fn.replace(/[0-9]*\.pdf$/,'')
  },
  statusIs: (a)=>{
    const tp = Template.instance()
    return (tp.q.get().split('::')[0] == a);
  },
  status: ()=>{
    const tp = Template.instance()
    return tp.q.get().split('::')[1];
  },
  etime: ()=>{
    const tp = Template.instance()
    const q = tp.q.get().split('::')[0];
    return q;
    /*
    switch(q) {
      case 'q0': // type...
      case 'q1': // CR to start search
        return '';
      default:
      return `(${tp.etime.get()} ms.)`
    }
    */
  }
})


Template.search_panel.helpers({
  query: ()=>{
    const tp = Template.instance();
    tp.q.set('q1::')
    // also clear the results...
    tp.hlist.set([]);
    // and clear the report
    tp.audit.set([])
    return Session.get('query');
  }
});
