import { useEffect, useState, type ReactNode } from 'react';
import { getJson } from '../api/client.js';

type LoadState<T> =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; items: T[] };

type Props<T> = {
  title: string;
  description: string;
  path: string;
  dataKey: string;
  emptyMessage: string;
  getKey: (item: T, index: number) => string;
  renderItem: (item: T) => ReactNode;
};

export function CapabilityCard<T>({ title, description, path, dataKey, emptyMessage, getKey, renderItem }: Props<T>) {
  const [state, setState] = useState<LoadState<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    getJson<Record<string, T[]>>(path)
      .then((response) => {
        const items = response[dataKey];
        if (!Array.isArray(items)) throw new Error('API response did not contain a list');
        if (active) setState({ status: 'success', items });
      })
      .catch(() => {
        if (active) setState({ status: 'error' });
      });
    return () => {
      active = false;
    };
  }, [path, dataKey]);

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
