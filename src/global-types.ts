import type {
	FieldKind,
	FieldRef,
	InputFieldMap,
	PluginName,
	SchemaTypes,
} from '@pothos/core';
import type {
	ResultOptions,
	ResultPlugin,
	default as ResultPluginName,
	ResultTypeParam,
	ResultWithInputOptions,
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
				options: ResultOptions<Types, Type, Nullable, Args, ResolveReturnShape>,
			) => FieldRef<Types, ShapeFromTypeParam<Types, Type, Nullable>>;

			resultWithInput: 'withInput' extends PluginName
				? <
						Type extends ResultTypeParam<Types>,
						Nullable extends boolean,
						Args extends InputFieldMap,
						ResolveReturnShape,
						Fields extends InputFieldMap,
						InputName extends string,
						ArgRequired extends boolean,
					>(
						options: ResultWithInputOptions<
							Types,
							Type,
							Nullable,
							Args,
							ResolveReturnShape,
							Fields,
							InputName,
							ArgRequired
						>,
					) => FieldRef<Types, ShapeFromTypeParam<Types, Type, Nullable>>
				: '@pothos/plugin-with-input is required to use this method';
		}

		interface FieldWithInputBaseOptions<
			Types extends SchemaTypes,
			Args extends InputFieldMap,
			Fields extends InputFieldMap,
			InputName extends string,
			ArgRequired extends boolean,
		> {}
	}
}
