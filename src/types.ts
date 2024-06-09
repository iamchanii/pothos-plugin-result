import type {
	FieldNullability,
	InputFieldMap,
	InputShapeFromFields,
	OutputShape,
	OutputType,
	Resolver,
	SchemaTypes,
} from '@pothos/core';

export type ResultTypeParam<Types extends SchemaTypes> = Record<
	string,
	OutputType<Types> | [OutputType<Types>]
>;

export type ResultOutputShape<
	Types extends SchemaTypes,
	Param extends ResultTypeParam<Types>,
> = {
	[Key in keyof Param]: Param[Key] extends [infer T]
		? OutputShape<Types, T>[]
		: OutputShape<Types, Param[Key]>;
};

export type ShapeFromTypeParam<
	Types extends SchemaTypes,
	Param extends ResultTypeParam<Types>,
	Nullable extends FieldNullability<Param>,
> = FieldNullability<Param> extends Nullable
	? Types['DefaultFieldNullability'] extends true
		? ResultOutputShape<Types, Param> | null | undefined
		: ResultOutputShape<Types, Param>
	: Nullable extends true
		? ResultOutputShape<Types, Param> | null | undefined
		: ResultOutputShape<Types, Param>;

export type ResultFieldOptions<
	Types extends SchemaTypes,
	Type extends ResultTypeParam<Types>,
	Nullable extends boolean,
	Args extends InputFieldMap,
	ResolveReturnShape,
> = Omit<
	PothosSchemaTypes.QueryFieldOptions<
		Types,
		never,
		Nullable,
		Args,
		ResolveReturnShape
	>,
	'type' | 'resolve'
> & {
	type: Type;
	resolve: Resolver<
		Types['Root'],
		InputShapeFromFields<Args>,
		Types['Context'],
		ShapeFromTypeParam<Types, Type, Nullable>,
		ResolveReturnShape
	>;
};
