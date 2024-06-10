# pothos-plugin-result

A Pothos plugin for easily creating GraphQL schemas that reflect the results of specific actions.

## Usage

### Install

```
$ yarn add pothos-plugin-result
```

### Setup

```typescript
import ResultPlugin from "pothos-plugin-result";

const builder = new SchemaBuilder({
  plugins: [ResultPlugin],
});
```

### Example

```typescript
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
            id: 1,
            title,
          },
        };
      },
    }),
  }),
});
```

## Integrations

### With-Input Plugin

```typescript
builder.mutationType({
  fields: (t) => ({
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
            id: input.id.toString(),
            title: input.title,
          },
        };
      },
    }),
  }),
});
```

## Limitation

- Only can be used in mutation type.
- The types that can be created are limited to objects. Array types are not supported. Fields contained in the type are nullable.

## License

MIT
