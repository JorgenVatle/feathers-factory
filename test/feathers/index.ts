import Feathers from '@feathersjs/feathers';

const App = Feathers();

App.use('/tests', require('feathers-memory'));

export default App;