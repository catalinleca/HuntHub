# ArrayInput System

## Why?

React Hook Form's `useFieldArray` is powerful but requires boilerplate for common patterns:

- Passing `swap`/`remove` actions through props (prop drilling)
- Tracking array length for first/last item logic
- Repeating move up/down/remove UI in every array item

## Problems Solved

1. **Prop drilling elimination** - Context provides array actions to any nested child
2. **Encapsulated item logic** - `useArrayInputItem` handles isFirst/isLast/onMove/onRemove
3. **Consistent UI** - `ArrayInputElement` provides standard action buttons
4. **Type safety** - Generic types flow through the entire system
5. **Flexibility** - Use the hooks directly or compose with provided components

## Architecture

```
useArrayInput (wraps useFieldArray)
       ↓
ArrayInput (provides context + renders items)
       ↓
ArrayInputElement (UI wrapper with actions)
       ↓
useArrayInputItem (item-specific state/actions)
```

## Usage

### Basic - Full Component Approach

```tsx
import { useArrayInput, ArrayInput, ArrayInputElement, FormInput } from '@/components/form';

const QuizOptions = () => {
  const { fields, arrayActions, append } = useArrayInput<QuizOption>('options');

  return (
    <Stack spacing={2}>
      <ArrayInput
        fields={fields}
        {...arrayActions}
        render={({ index }) => (
          <ArrayInputElement index={index} title={`Option ${index + 1}`}>
            <FormInput name={`options.${index}.text`} label="Option text" />
          </ArrayInputElement>
        )}
      />

      <Button onClick={() => append({ text: '', isCorrect: false })}>Add Option</Button>
    </Stack>
  );
};
```

### Custom UI - Hooks Only

```tsx
import { useArrayInput, ArrayInput, useArrayInputItem } from '@/components/form';

const CustomItem = ({ index }: { index: number }) => {
  const { isFirst, isLast, onRemove, onMoveUp, onMoveDown } = useArrayInputItem(index);

  return (
    <Stack direction="row" spacing={1}>
      <FormInput name={`items.${index}.value`} />
      <IconButton onClick={onMoveUp} disabled={isFirst}>
        <ArrowUpIcon />
      </IconButton>
      <IconButton onClick={onMoveDown} disabled={isLast}>
        <ArrowDownIcon />
      </IconButton>
      <IconButton onClick={onRemove}>
        <TrashIcon />
      </IconButton>
    </Stack>
  );
};

const ItemList = () => {
  const { fields, arrayActions, append } = useArrayInput<Item>('items');

  return <ArrayInput fields={fields} {...arrayActions} render={({ index }) => <CustomItem index={index} />} />;
};
```

### Minimal - No Action Buttons

```tsx
<ArrayInputElement index={index} showActions={false}>
  <FormInput name={`tags.${index}.name`} />
</ArrayInputElement>
```

## Exports

| Export                 | Type      | Purpose                                            |
| ---------------------- | --------- | -------------------------------------------------- |
| `useArrayInput`        | Hook      | Wraps useFieldArray, returns fields + arrayActions |
| `ArrayInput`           | Component | Provides context, renders items with render prop   |
| `ArrayInputElement`    | Component | UI wrapper with move/remove buttons                |
| `useArrayInputItem`    | Hook      | Gets isFirst/isLast/onMove/onRemove for an index   |
| `ArrayInputProvider`   | Component | Context provider (used internally)                 |
| `useArrayInputContext` | Hook      | Access context directly (advanced)                 |

## Types

```typescript
// Field item with RHF's internal _id
type FieldArrayItem<T> = T & { readonly _id: string };

// Actions passed to ArrayInput
interface ArrayActions {
  swap: (indexA: number, indexB: number) => void;
  remove: (index: number) => void;
  move: (from: number, to: number) => void;
}

// Item state from useArrayInputItem
interface ArrayInputItemState {
  index: number;
  length: number;
  isFirst: boolean;
  isLast: boolean;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}
```
