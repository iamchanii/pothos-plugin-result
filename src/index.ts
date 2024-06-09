import SchemaBuilder, { BasePlugin, type SchemaTypes } from '@pothos/core';
import './field-builder.js';
import './global-types.js';

const pluginName = 'result';

export default pluginName;

export class ResultPlugin<
	Types extends SchemaTypes,
> extends BasePlugin<Types> {}

SchemaBuilder.registerPlugin(pluginName, ResultPlugin);

export * from './types.js';
