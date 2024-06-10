import SchemaBuilder from '@pothos/core';
import { expect, test } from 'vitest';
import ResultPlugin from './index.js';
import WithInputPlugin from '@pothos/plugin-with-input';
import { printSchema } from 'graphql/index.js';

const builder = new SchemaBuilder({
	plugins: [ResultPlugin, WithInputPlugin],
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

		world: t.resultWithInput({
			type: {
				updatedPost: PostRef,
			},
			input: {
				id: t.input.id({ required: true }),
				title: t.input.string({ required: true }),
			},
			resolve: (_root, { input }) => {
				return {
					updatedPost: {
						id: input.id.toString(),
						title: input.title,
					},
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
		  world(input: MutationWorldInput!): MutationWorldResult!
		}

		type MutationHelloResult {
		  affectedPosts: [Post]
		  currentUser: User
		}

		input MutationWorldInput {
		  id: ID!
		  title: String!
		}

		type MutationWorldResult {
		  updatedPost: Post
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
