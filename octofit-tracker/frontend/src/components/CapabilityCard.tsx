import { useEffect, useState, type ReactNode } from 'react';

export type LoadState<T> =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; items: T[] };

export function useApiData<T>(load: () => Promise<T[]>) {
  const [state, setState] = useState<LoadState<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    load()
      .then((items) => {
        if (!Array.isArray(items)) throw new Error('API response did not contain a list');
        if (active) setState({ status: 'success', items });
      })
      .catch(() => {
        if (active) setState({ status: 'error' });
      });
    return () => {
      active = false;
    };
  }, [load]);

  return state;
}

type Props<T> = {
  title: string;
  description: string;
  state: LoadState<T>;
  emptyMessage: string;
  getKey: (item: T, index: number) => string;
  renderItem: (item: T) => ReactNode;
};

export function CapabilityCard<T>({ title, description, state, emptyMessage, getKey, renderItem }: Props<T>) {
  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {state.status === 'loading' ? (
          <p role="status">Loading {title.toLowerCase()}...</p>
        ) : state.status === 'error' ? (
          <p role="alert">Unable to load {title.toLowerCase()}.</p>
        ) : state.items.length === 0 ? (
          <p role="status">{emptyMessage}</p>
        ) : (
          <ul className="list-group">
            {state.items.map((item, index) => (
              <li className="list-group-item" key={getKey(item, index)}>{renderItem(item)}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
