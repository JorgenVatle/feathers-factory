import Feathers from '@feathersjs/feathers';

const FeathersMemory = require('feathers-memory');

const App = Feathers();

App.use('/users', FeathersMemory());
App.use('/posts', FeathersMemory());

export default App;