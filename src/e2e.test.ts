import SchemaBuilder from '@pothos/core';
import { expect, test } from 'vitest';
import ResultPlugin from './index.js';
import { printSchema } from 'graphql/index.js';

const builder = new SchemaBuilder({
	plugins: [ResultPlugin],
});

const PostRef = builder.objectRef<{ id: string; title: string }>('Post');

PostRef.implement({
	fields: (t) => ({
		id: t.exposeID('id'),
		title: t.exposeString('title'),
	}),
});

const UserRef = builder
	.objectRef<{ id: string; name: string }>('User')
	.implement({
		fields: (t) => ({
			id: t.exposeID('id'),
			name: t.exposeString('name'),
		}),
	});

builder.mutationType({
	fields: (t) => ({
		hello: t.result({
			type: {
				currentUser: UserRef,
				affectedPosts: [PostRef],
			},
			resolve: () => {
				return {
					currentUser: {
						id: '1',
						name: '',
					},
					affectedPosts: [
						{ id: '1', title: '' },
						{ id: '2', title: '' },
					],
				};
			},
		}),
	}),
});

test('print schema', () => {
	const schema = builder.toSchema();

	expect(printSchema(schema)).toMatchInlineSnapshot(`
		"type Mutation {
		  hello: MutationHelloResult!
		}

		type MutationHelloResult {
		  affectedPosts: [Post]
		  currentUser: User
		}

		type Post {
		  id: ID!
		  title: String!
		}

		type User {
		  id: ID!
		  name: String!
		}"
	`);
});
