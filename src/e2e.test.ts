import SchemaBuilder from '@pothos/core';
import ErrorsPlugin from '@pothos/plugin-errors';
import WithInputPlugin from '@pothos/plugin-with-input';
import { execute, parse, printSchema } from 'graphql/index.js';
import { expect, test } from 'vitest';
import ResultPlugin from './index.js';

const builder = new SchemaBuilder({
	plugins: [ResultPlugin, WithInputPlugin, ErrorsPlugin],
});

const ErrorInterface = builder.interfaceRef<Error>('Error').implement({
	fields: (t) => ({
		message: t.exposeString('message'),
	}),
});

builder.objectType(Error, {
	name: 'BaseError',
	interfaces: [ErrorInterface],
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

		deletePost: t.result({
			type: {
				deletePostId: 'ID',
			},
			args: {
				postId: t.arg.id({ required: true }),
			},
			errors: {
				types: [Error],
			},
			resolve: (_root, { postId }) => {
				throw new Error(`Post with ID ${postId} not found`);
			},
		}),
	}),
});

test('print schema', () => {
	const schema = builder.toSchema();

	expect(printSchema(schema)).toMatchInlineSnapshot(`
		"type BaseError implements Error {
		  message: String!
		}

		type DeletePostResult {
		  deletePostId: ID
		}

		interface Error {
		  message: String!
		}

		type Mutation {
		  createPost(title: String!): MutationCreatePostResult!
		  deletePost(postId: ID!): MutationDeletePostResult!
		  updatePost(input: MutationUpdatePostInput!): MutationUpdatePostResult!
		}

		type MutationCreatePostResult {
		  createdPost: Post
		}

		union MutationDeletePostResult = BaseError | MutationDeletePostSuccess

		type MutationDeletePostSuccess {
		  data: DeletePostResult!
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

test('execute', async () => {
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
			deletePost(postId: "1") {
				... on BaseError {
					message
				}
			}
		}
	`);

	const result = await execute({ schema, document });

	expect(result).toMatchInlineSnapshot(`
		{
		  "data": {
		    "createPost": {
		      "createdPost": {
		        "id": "1",
		        "title": "Hello World",
		      },
		    },
		    "deletePost": {
		      "message": "Post with ID 1 not found",
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
