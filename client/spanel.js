import R from 'ramda';
console.log('spanel file');


Template.search_panel.onCreated(function(){
  console.log('search_panel created')
  this.hlist = new ReactiveVar([]);
  this.q = new ReactiveVar('q0::Enter your search query.'); //
  this.etime = new ReactiveVar(0);
})

/*
const q_message = [
  'Enter your search query',        // 0
  'Searching in 94307 pages...',    // 1
  'Found results.',                 // 2 // never displayed.
  'No result found.',               // 3
  'System Error or Syntax Error!'   // 4
];
*/

const mk_query = (s) =>{
  const inter = R.intersection('|&<>',s);
  if (!inter) {
    // phraseto_tsquery => replace spaces with <->

  }
  console.log('int:',R.intersection('|&<>',s));

return s;
}


Template.search_panel.events({
  'keyup': (ev,tp)=>{
    //console.log('search_panel.keyup');
    tp.q.set('q0::keep typing then - CR to search.'); // Enter you search query.
    tp.hlist.set([]);
    if (ev.keyCode == 13) {
//      Meteor.call('search',ev.target.value)
      Session.set('tsquery',ev.target.value)
      console.log(`ENTER: ${ev.target.value}`);
      const _q = mk_query(ev.target.value);

      tp.hlist.set([]);
      tp.q.set('q1::Searching in 94307 pages - please wait...'); // Searching
      const etime = new Date().getTime();
      Meteor.call('search',_q, (err,data)=>{
        tp.etime.set(new Date().getTime() - etime);
        if (err) {
          console.log('ERROR:', err);
          tp.q.set('q4::Syntax or System Error! retype your query.') // system or syntax error
          return;
        }

        if (!data || data.length <= 0) {
          tp.q.set('q3::No result for this query.');
          return
        }
        //console.log('data:',data)
        tp.hlist.set(data);
        tp.q.set(`q2::Found ${data.length} pages.`)
      })
    }
  },
});




Template.search_panel.helpers({
  results() {
    const tp = Template.instance()
    //console.log('tp.hlist:',tp.hlist)
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
  status: ()=>{
    const tp = Template.instance()
    return tp.q.get().split('::')[1];
  },
  etime: ()=>{
    const tp = Template.instance()
    const q = tp.q.get().split('::')[0];
    switch(q) {
      case 'q0': case 'q1':
        return '';
      default:
      return `(${tp.etime.get()} ms.)`
    }
  }
})
