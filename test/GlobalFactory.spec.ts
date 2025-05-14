import { Service } from '@feathersjs/feathers';
import { beforeAll, describe, expect, it } from 'vitest';

import { Factory, GlobalFactories } from '../src';
import Feathers from './feathers/App';

let _service: Service<any>;

beforeAll(() => {
    _service = Feathers.service('/tests')
});

describe('Global Feathers Factory', () => {
    type ServiceType = {
        id: string,
        property: string,
        method: string;
        function: string,
        getter: string,
        async: string,
        selfReference: Record<string, string>,
    }
    const service = {
        async create(data: ServiceType) {
            await _service.create(data);
            return data;
        },
        get(id: string) {
            return _service.get(id);
        }
    }
    
    const factory = new Factory(service, {
        id: () => process.hrtime().join('-'),
        property: 'ok',
        function: () => 'ok',
        method() { return 'ok' },
        get getter() { return 'ok' },
        async: async () => 'ok',
        async selfReference() {
            const checkSelf = async <T extends keyof ServiceType>(key: T): Promise<[T, ServiceType[T]]> => {
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
    })
    
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
            expect(dbEntry.selfReference).toBe('ok');
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
            expect(entry[key]).toBe('ok');
            expect(dbEntry[key]).toBe('ok');
        };

        Object.keys(entry).map(validateContent);
        Object.keys(dbEntry).map(validateContent);
    });

});