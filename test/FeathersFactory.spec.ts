import { Service } from '@feathersjs/feathers';

import FeathersFactory from '../src/FeathersFactory';
import Feathers from './feathers';

let service: Service<any>;

before(() => {
    service = Feathers.service('/')
});

describe('Feathers Factory', () => {

    it('can define() factories', () => {
        FeathersFactory.define('test', service, {
            property: 'ok',
            function: () => 'ok',
            method() { return 'ok' },
            get getter() { return 'ok' },
            async: async () => 'ok',
            selfReference() {
                const properties = [this.property, this.function, this.method, this.getter, this.async];

                return properties.length === properties.filter((value) => value === 'ok').length;
            }
        });
    });

});