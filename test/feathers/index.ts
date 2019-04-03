import Feathers from '@feathersjs/feathers';

const App = Feathers();

App.use('/', require('feathers-memory'));

export default App;