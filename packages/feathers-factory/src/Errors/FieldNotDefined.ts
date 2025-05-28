import { Error } from './Error';

export class FieldNotDefined extends Error {
    constructor(
        message: string,
        public readonly field: { key: string },
        options?: ErrorOptions,
    ) {
        super(message, options);
    }
}