export { default as Factory } from './Factory';
export { FactoryService } from './ServiceTypes';
export { TemplateContext } from './TemplateContext';
export { FactoryTemplate } from './FactoryTemplate';

import * as TemplateTypes from './FactoryTemplate';

export { default as GlobalFactories } from './GlobalFactories';

export namespace Template {
    export import InferFieldType = TemplateTypes.InferFieldType;
    export import InferOutput = TemplateTypes.InferOutput;
    export import Overrides = TemplateTypes.TemplateOverrides;
    export import Result = TemplateTypes.TemplateResult;
    export import Schema = TemplateTypes.TemplateSchema;
}