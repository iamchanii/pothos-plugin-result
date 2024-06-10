import SchemaBuilder from '@pothos/core';
import { expect, test } from 'vitest';
import ResultPlugin from './index.js';
import WithInputPlugin from '@pothos/plugin-with-input';
import { executeSync, parse, printSchema } from 'graphql/index.js';

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

builder.queryType({
	fields: (t) => ({
		post: t.field({
			type: PostRef,
			resolve: () => ({ id: '1', title: 'Hello World' }),
		}),
	}),
});

builder.mutationType({
	fields: (t) => ({
		createPost: t.result({
			type: {
				createdPost: PostRef,
			},
			args: {
				title: t.arg.string({ required: true }),
			},
			resolve: (_root, { title }) => {
				return {
					createdPost: {
						id: '1',
						title,
					},
				};
			},
		}),

		updatePost: t.resultWithInput({
			type: {
				updatedPost: PostRef,
			},
			input: {
				postId: t.input.id({ required: true }),
				title: t.input.string({ required: true }),
			},
			resolve: (_root, { input }) => {
				return {
					updatedPost: {
						id: input.postId.toString(),
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
		  createPost(title: String!): MutationCreatePostResult!
		  updatePost(input: MutationUpdatePostInput!): MutationUpdatePostResult!
		}

		type MutationCreatePostResult {
		  createdPost: Post
		}

		input MutationUpdatePostInput {
		  postId: ID!
		  title: String!
		}

		type MutationUpdatePostResult {
		  updatedPost: Post
		}

		type Post {
		  id: ID!
		  title: String!
		}

		type Query {
		  post: Post!
		}"
	`);
});

test('execute', () => {
	const schema = builder.toSchema();
	const document = parse(/* GraphQL */ `
		mutation {
			createPost(title: "Hello World") {
				createdPost {
					id
					title
				}
			}
			updatePost(input: { postId: "1", title: "Hello World 2" }) {
				updatedPost {
					id
					title
				}
			}
		}
	`);

	const result = executeSync({ schema, document });

	expect(result).toMatchInlineSnapshot(`
		{
		  "data": {
		    "createPost": {
		      "createdPost": {
		        "id": "1",
		        "title": "Hello World",
		      },
		    },
		    "updatePost": {
		      "updatedPost": {
		        "id": "1",
		        "title": "Hello World 2",
		      },
		    },
		  },
		}
	`);
});
