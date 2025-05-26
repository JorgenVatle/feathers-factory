import { Service } from '@feathersjs/feathers';
import { beforeAll, describe, expect, it } from 'vitest';

import { Factory, FactoryTemplate, GlobalFactories } from '../src';
import type { InferOutput } from '../src/Template/Template';
import Feathers from './feathers/App';

let _service: Service<any>;

beforeAll(() => {
    _service = Feathers.service('/tests')
});

describe('Global Feathers Factory', () => {
    const factory = new Factory(service, ServiceTemplate);
    
    
    it('can define() factories', () => {
        GlobalFactories.define('test', factory);
    });

    it('can create() defined factories', async () => {
        const entry = await GlobalFactories.create('test');
        await expect(service.get(entry.id)).resolves.toBeTruthy();
    });

    it('can get() a factory\'s data.', async () => {
        const entry = await GlobalFactories.get('test');
        expect(entry.selfReference.property).toBe('ok');
        await expect(service.get(entry.id)).rejects.toBeTruthy();
    });

    it('can createMany()', async () => {
        let count = 0;
        let quantity = 5;

        const entries = await GlobalFactories.createMany(quantity, 'test');

        await Promise.all(entries.map(async (entry) => {
            const dbEntry = await service.get(entry.id);
            Object.keys(dbEntry.selfReference).forEach((key) => {
                expect(dbEntry.selfReference).toHaveProperty(key, 'ok')
            })
            count++;
        }));

        expect(count).toBe(quantity);
    });

    it('can override data within predefined factories', async () => {
        const entry = await GlobalFactories.create('test', {
            method: 'overridden',
        });
        const dbEntry = await service.get(entry.id);

        expect(entry.method).toBe('overridden');
        expect(dbEntry.method).toBe('overridden');
    });

    it('resolves data as expected', async () => {
        const entry = await GlobalFactories.create('test');
        const dbEntry = await service.get(entry.id);

        const validateContent = (key: string) => {
            if (key === 'id') return;
            if (key === 'selfReference') return;
            expect(entry).toHaveProperty(key, 'ok');
            expect(dbEntry).toHaveProperty(key, 'ok');
        };

        Object.keys(entry).map(validateContent);
        Object.keys(dbEntry).map(validateContent);
    });

});

const ServiceTemplate = new FactoryTemplate({
    id: () => process.hrtime().join('-'),
    property: 'ok',
    // @ts-expect-error Todo: fix circular reference
    function: () => 'ok',
    method() { return 'ok' },
    get getter() { return 'ok' },
    // @ts-expect-error Todo: fix circular reference
    async: async () => 'ok',
    async selfReference() {
        const checkSelf = async <T>(key: T): Promise<[T, [T]]> => {
            // @ts-expect-error path type mismatch
            return [key, await this.get(key)] as const
        }
        
        const entries = [
            checkSelf('property'),
            checkSelf('function'),
            checkSelf('method'),
            checkSelf('getter'),
            checkSelf('async')
        ];
        
        return Object.fromEntries(await Promise.all(entries));
    }
});

const service = {
    async create(data: InferOutput<typeof ServiceTemplate>) {
        await _service.create(data);
        return data;
    },
    get(id: string): Promise<InferOutput<typeof ServiceTemplate>> {
        return _service.get(id);
    }
}
