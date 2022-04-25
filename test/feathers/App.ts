import Feathers from '@feathersjs/feathers';

const App = Feathers();

App.use('/tests', require('feathers-memory')({ multi: true }));
App.use('/users', require('feathers-memory')({ multi: true }));
App.use('/articles', require('feathers-memory')({ multi: true }));

export default App;