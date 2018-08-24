//const app = require('../client-app.js');
import { Template } from 'meteor/templating';
import './search-history-modal.html';

const TP = Template.search_history;

Session.set('query','')

/****************************
TP.onCreated(function(){
  this.autorun(()=>{
    const history = Session.get('history');
    console.log('>>>>> history:',history);
  })
})
***************************/


TP.events({
  'click .js-quit': (ev,tp)=>{
    console.log('Quit!');
    // close this Modal

    const bg = tp.find('#search-history-modal');
//    const bg = document.getElementById('search-history-modal');
    console.log('bg:',bg);
    bg.style.display = 'none';
  },
  'click .js-select-from-history': (ev,tp)=>{
    const query = ev.currentTarget.innerText;
    // set reactively, then quit this panel.
    Session.set('query',query); // the
    tp.find('#search-history-modal').style.display = 'none'; // quit.
//    Session.set('query',query); // the
  }
})

TP.helpers({
  history: ()=>{
    const ts = Session.get('history-timeStamp');
    console.log('helper:histry ts:',ts);
    const h = query_History.list({verbose:1});
    console.log('--- h:',h)
    return h
  }
})
