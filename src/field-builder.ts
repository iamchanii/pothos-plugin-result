import {
	MutationFieldBuilder,
	type FieldKind,
	type FieldRef,
	type ImplementableObjectRef,
	type SchemaTypes,
} from '@pothos/core';
import type { ResultTypeParam } from './types.js';

const fieldBuilderProto =
	MutationFieldBuilder.prototype as PothosSchemaTypes.MutationFieldBuilder<
		SchemaTypes,
		unknown,
		FieldKind
	>;

function capitalize(s: string) {
	return `${s.slice(0, 1).toUpperCase()}${s.slice(1)}`;
}

function associateResultType(
	this: typeof fieldBuilderProto,
	fieldRef: FieldRef<unknown>,
	resultTypeRef: ImplementableObjectRef<SchemaTypes, unknown, unknown>,
	type: ResultTypeParam<SchemaTypes>,
) {
	this.builder.configStore.onFieldUse(fieldRef, (fieldConfig) => {
		const resultTypeName = `${this.typename}${capitalize(fieldConfig.name)}Result`;

		this.builder.objectRef(resultTypeName).implement({
			fields: (t) => {
				const fields: Record<string, FieldRef> = {};

				for (const [fieldName, fieldRef] of Object.entries(type)) {
					fields[fieldName] = t.expose(fieldName as never, {
						type: fieldRef,
						nullable: Array.isArray(fieldRef)
							? { items: true, list: true }
							: true,
					});
				}

				return fields;
			},
		});

		this.builder.configStore.associateRefWithName(
			resultTypeRef,
			resultTypeName,
		);
	});
}

fieldBuilderProto.result = function (options) {
	const resultTypeRef = this.builder.objectRef('Unnamed result type');

	const fieldRef = this.field({
		...options,
		type: resultTypeRef as never,
	} as never);

	associateResultType.call(this, fieldRef, resultTypeRef, options.type);

	return fieldRef;
};

// @ts-ignore
fieldBuilderProto.resultWithInput = function resultWithInput(options) {
	const resultTypeRef = this.builder.objectRef('Unnamed result type');

	// @ts-ignore
	const fieldRef = this.fieldWithInput({
		...options,
		type: resultTypeRef as never,
	} as never);

	associateResultType.call(this, fieldRef, resultTypeRef, options.type);

	return fieldRef;
};
