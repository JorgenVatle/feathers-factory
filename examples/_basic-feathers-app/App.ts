import { AdapterService } from '@feathersjs/adapter-commons';
import Feathers, { type Params } from '@feathersjs/feathers';

const services = {
    'tests': createService<{}>(),
    'users': createService<{
        id: string;
        username: string;
    }>(),
    'articles': createService<{
        id: string;
        userId: string;
    }>(),
    'comments': createService<{
        id: string;
        userId: string;
        articleId: string;
        content: string;
    }>(),
    'adapter-service': createService() as AdapterService<{
        id: string;
    }>,
};

function createService<TSchema = unknown>() {
    return require('feathers-memory')({ multi: true }) as ServiceWrapper<TSchema>;
}

interface ServiceWrapper<TSchema> extends AdapterService<TSchema> {
    create(data: TSchema, params?: Params): Promise<TSchema>;
}

const App = Feathers<typeof services>();

for (const [name, service] of Object.entries(services)) {
    App.use(name, service);
}

export default App;