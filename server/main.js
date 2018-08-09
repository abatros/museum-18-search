import { Meteor } from 'meteor/meteor';

import {db} from './db-search.js';

Meteor.startup(() => {
  console.log('main.js startup db:',db);
});
