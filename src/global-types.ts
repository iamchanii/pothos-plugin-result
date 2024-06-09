import type {
	FieldKind,
	FieldRef,
	InputFieldMap,
	SchemaTypes,
} from '@pothos/core';
import type {
	ResultFieldOptions,
	ResultPlugin,
	default as ResultPluginName,
	ResultTypeParam,
	ShapeFromTypeParam,
} from './index.js';

declare global {
	export namespace PothosSchemaTypes {
		export interface Plugins<Types extends SchemaTypes> {
			[ResultPluginName]: ResultPlugin<Types>;
		}

		export interface MutationFieldBuilder<
			Types extends SchemaTypes,
			ParentShape,
			Kind extends FieldKind = FieldKind,
		> {
			result: <
				Type extends ResultTypeParam<Types>,
				Nullable extends boolean,
				Args extends InputFieldMap,
				ResolveReturnShape,
			>(
				options: ResultFieldOptions<
					Types,
					Type,
					Nullable,
					Args,
					ResolveReturnShape
				>,
			) => FieldRef<ShapeFromTypeParam<Types, Type, Nullable>>;
		}
	}
}
