# pothos-plugin-result

A Pothos plugin for easily creating GraphQL schemas that reflect the results of specific actions.

## Usage

### Install

```
$ yarn add pothos-plugin-result
```

### Setup

```typescript
import ResultPlugin from 'pothos-plugin-result';

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
        allPosts: [PostRef],
        currentUser: UserRef,
      },
      nullable: true,
      resolve: () => ({
        createdPost: { id: 2, /* ... */ },
        allPosts: [{ id: 1, /* ... */ }, { id: 2, /* ... */ }],
        currentUser: { id: 1, /* ... */ }
      }),
    }),
  });
});
```

## Limitation

- The types that can be created with `t.result` are limited to objects. Array types are not supported.

## License

MIT
