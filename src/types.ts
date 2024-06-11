import type {
	FieldKind,
	FieldNullability,
	InputFieldMap,
	InputFieldRef,
	InputShapeFromFields,
	OutputShape,
	OutputType,
	Resolver,
	SchemaTypes,
} from '@pothos/core';

export type Nullable<T> = T | null | undefined;

export type ResultTypeParam<Types extends SchemaTypes> = Record<
	string,
	OutputType<Types> | [OutputType<Types>]
>;

export type ResultOutputShape<
	Types extends SchemaTypes,
	Param extends ResultTypeParam<Types>,
> = {
	[Key in keyof Param]: Param[Key] extends [infer T]
		? Nullable<OutputShape<Types, T>[]>
		: Nullable<OutputShape<Types, Param[Key]>>;
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

export type ResultOptions<
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

export type ResultWithInputOptions<
	Types extends SchemaTypes,
	Type extends ResultTypeParam<Types>,
	Nullable extends boolean,
	Args extends Record<string, InputFieldRef<unknown, 'Arg'>>,
	ResolveReturnShape,
	Fields extends Record<string, InputFieldRef<unknown, 'InputObject'>>,
	InputName extends string,
	ArgRequired extends boolean,
> = Omit<
	ResultOptions<
		Types,
		Type,
		Nullable,
		Args & {
			[K in InputName]:
				| InputFieldRef<InputShapeFromFields<Fields>>
				| (true extends ArgRequired ? never : null | undefined);
		},
		ResolveReturnShape
	>,
	'args'
> &
	// @ts-ignore
	PothosSchemaTypes.FieldWithInputBaseOptions<
		Types,
		Args & {
			[K in InputName]:
				| InputFieldRef<InputShapeFromFields<Fields>>
				| (true extends ArgRequired ? never : null | undefined);
		},
		Fields,
		InputName,
		ArgRequired
	>;
