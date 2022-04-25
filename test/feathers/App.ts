import Feathers, { Service } from '@feathersjs/feathers';

const services = {
    'tests': require('feathers-memory')({ multi: true }) as Service<{}>,
    'users': require('feathers-memory')({ multi: true }) as Service<{
        id: string;
        username: string;
    }>,
    'articles': require('feathers-memory')({ multi: true }) as Service<{
        id: string;
        userId: string;
    }>,
    'comments': require('feathers-memory')({ multi: true }) as Service<{
        id: string;
        userId: string;
        articleId: string;
        content: string;
    }>,
};

const App = Feathers<typeof services>();

for (const [name, service] of Object.entries(services)) {
    App.use(name, service);
}

export default App;