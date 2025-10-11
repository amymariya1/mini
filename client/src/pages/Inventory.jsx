import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminListProducts } from '../services/api';
import { formatINR } from '../utils/currency';

export default function Inventory() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setError('');
      setLoading(true);
      try {
        const data = await adminListProducts();
        if (!alive) return;
        setProducts(data.products || []);
      } catch (err) {
        if (!alive) return;
        setError(err.message || 'Failed to load inventory');
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    );
  }, [products, query]);

  function calcSuggestedReorderPoint(p) {
    // Simple heuristic: reorder when stock drops below 5 or 10% of a nominal max of 100
    const nominalMax = 100; // placeholder, ideally from historical sales or config
    const threshold = Math.max(5, Math.ceil(nominalMax * 0.1));
    const current = typeof p.stock === 'number' ? p.stock : 0;
    return { threshold, status: current <= threshold ? 'Reorder soon' : 'Sufficient' };
  }

  function calcInventoryTurnover(p) {
    // Placeholder: requires COGS and average inventory over period.
    // If not available, show N/A and a helper tooltip.
    return { turnover: null, note: 'Not available: requires sales/COGS and avg inventory history.' };
  }

  // Dashboard metrics
  const metrics = useMemo(() => {
    const total = products.length;
    let inStock = 0, outOfStock = 0, lowStock = 0;
    let value = 0;
    for (const p of products) {
      const qty = typeof p.stock === 'number' ? p.stock : 0;
      const price = Number(p.price || 0);
      value += qty * price;
      if (p.inStock) inStock += 1; else outOfStock += 1;
      const threshold = Math.max(5, Math.ceil(100 * 0.1));
      if (qty <= threshold) lowStock += 1;
    }
    return { total, inStock, outOfStock, lowStock, value };
  }, [products]);

  const stockByCategory = useMemo(() => {
    const map = new Map();
    for (const p of products) {
      const cat = p.category || 'General';
      const qty = typeof p.stock === 'number' ? p.stock : 0;
      const prev = map.get(cat) || { items: 0, qty: 0 };
      map.set(cat, { items: prev.items + 1, qty: prev.qty + qty });
    }
    return Array.from(map.entries()).map(([category, data]) => ({ category, ...data })).sort((a,b) => b.qty - a.qty);
  }, [products]);

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="container">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--primary-900)' }}>Inventory Management</h1>
              <p className="text-sm" style={{ color: 'var(--primary-600)', marginTop: 'var(--space-1)' }}>
                Product Details, Stock Visibility, Reorder Points, Inventory Turnover (FIFO-ready), and Quality Checks
              </p>
            </div>
            <div className="flex gap-4 items-center">
              <Link to="/admin/dashboard" className="btn btn-secondary btn-sm">Back to Dashboard</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 'var(--space-8)' }}>
        {/* Alerts */}
        {error && (
          <div className="card" style={{ marginBottom: 'var(--space-4)', borderColor: 'var(--error)', backgroundColor: 'var(--error-light)' }}>
            <div className="card-body"><div style={{ color: 'var(--error)' }}>{error}</div></div>
          </div>
        )}
        {info && (
          <div className="card" style={{ marginBottom: 'var(--space-4)', borderColor: 'var(--success)', backgroundColor: 'var(--success-light)' }}>
            <div className="card-body"><div style={{ color: 'var(--success)' }}>{info}</div></div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0,1fr))', gap: 12, marginBottom: 16 }}>
          <div className="card"><div className="card-body text-center"><div className="subtle">Total SKUs</div><div style={{ fontWeight: 800, fontSize: 22 }}>{metrics.total}</div></div></div>
          <div className="card"><div className="card-body text-center"><div className="subtle">In Stock</div><div style={{ fontWeight: 800, fontSize: 22, color: '#065f46' }}>{metrics.inStock}</div></div></div>
          <div className="card"><div className="card-body text-center"><div className="subtle">Low Stock</div><div style={{ fontWeight: 800, fontSize: 22, color: '#b45309' }}>{metrics.lowStock}</div></div></div>
          <div className="card"><div className="card-body text-center"><div className="subtle">Out of Stock</div><div style={{ fontWeight: 800, fontSize: 22, color: '#991b1b' }}>{metrics.outOfStock}</div></div></div>
          <div className="card"><div className="card-body text-center"><div className="subtle">Inventory Value</div><div style={{ fontWeight: 800, fontSize: 22 }}>{formatINR(metrics.value)}</div></div></div>
        </div>

        {/* Summary Panels */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 12, marginBottom: 16 }}>
          <div className="card">
            <div className="card-body">
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Stock by Category</div>
              {stockByCategory.length === 0 ? (
                <div className="subtle">No data</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, alignItems: 'center' }}>
                  <div className="subtle" style={{ fontWeight: 600 }}>Category</div>
                  <div className="subtle" style={{ fontWeight: 600 }}>Items</div>
                  <div className="subtle" style={{ fontWeight: 600 }}>Total Qty</div>
                  {stockByCategory.map(row => (
                    <>
                      <div key={row.category + '-name'}>{row.category}</div>
                      <div key={row.category + '-items'} style={{ textAlign: 'right' }}>{row.items}</div>
                      <div key={row.category + '-qty'} style={{ textAlign: 'right', fontWeight: 700 }}>{row.qty}</div>
                    </>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Low Stock Alerts</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                  <thead>
                    <tr>
                      {['Product','Stock','Threshold','Status'].map(h => (
                        <th key={h} style={{ textAlign:'left', padding: '8px 8px', borderBottom: '1px solid var(--border)', background:'#fafafa' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products
                      .map(p => ({ p, thresh: Math.max(5, Math.ceil(100 * 0.1)), qty: typeof p.stock === 'number' ? p.stock : 0 }))
                      .filter(({ qty, thresh }) => qty <= thresh)
                      .sort((a, b) => a.qty - b.qty)
                      .slice(0, 10)
                      .map(({ p, qty, thresh }) => (
                        <tr key={(p._id || p.id) + '-low'} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '8px 8px', fontWeight: 600 }}>{p.name || '-'}</td>
                          <td style={{ padding: '8px 8px' }}>{qty}</td>
                          <td style={{ padding: '8px 8px' }}>{thresh}</td>
                          <td style={{ padding: '8px 8px', color: '#b45309', fontWeight: 700 }}>Low</td>
                        </tr>
                      ))}
                    {products.filter(p => (typeof p.stock === 'number' ? p.stock : 0) <= Math.max(5, Math.ceil(100 * 0.1))).length === 0 && (
                      <tr><td colSpan={4} style={{ padding: 12, textAlign: 'center' }} className="subtle">No low stock items</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Top Controls */}
        <div className="card-pro" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div style={{ fontWeight: 800 }}>Inventory Overview</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input className="input" placeholder="Search products or categories..." value={query} onChange={e => setQuery(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Inventory List (one per row) */}
        {filtered.length === 0 && !loading && (
          <div className="card" style={{ padding: 16, textAlign: 'center' }}>No products</div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((p) => {
            const currentStock = typeof p.stock === 'number' ? p.stock : 0;
            const reorder = calcSuggestedReorderPoint(p);
            const turnover = calcInventoryTurnover(p);
            const pid = p._id || p.id || String(p.name || '') + String(p.createdAt || '');
            const isOpen = expandedId === pid;
            return (
              <div key={pid} className="card" style={{ display: 'grid', gridTemplateColumns: isOpen ? 'minmax(260px, 360px) 1fr' : '1fr', gap: 12 }}>
                {/* Left: Product Summary */}
                <div style={{ display: 'flex', gap: 12, cursor: 'pointer' }} onClick={() => setExpandedId(isOpen ? null : pid)}>
                  <div style={{ width: 96, height: 96, borderRadius: 8, overflow: 'hidden', background: '#f7f7f7', flexShrink: 0 }}>
                    {String(p.image || '').trim() ? (
                      <img alt={p.name} src={String(p.image).trim()} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    ) : null}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name || '-'}</div>
                      <span className="subtle" style={{ whiteSpace: 'nowrap' }}>{isOpen ? 'Hide details ▲' : 'Show details ▼'}</span>
                    </div>
                    <div style={{ fontWeight: 700, marginTop: 4 }}>{formatINR(Number(p.price || 0))}</div>
                    <div className="subtle" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                      <span className="chip small">{p.category || 'General'}</span>
                      <span className="chip small" style={{ background: p.inStock ? '#ecfdf5' : '#fee2e2', color: p.inStock ? '#065f46' : '#991b1b' }}>{p.inStock ? 'In Stock' : 'Out of Stock'}</span>
                    </div>
                    {p.description && (
                      <div style={{ color: '#334155', fontSize: 13, lineHeight: 1.4, marginTop: 8 }}>{p.description}</div>
                    )}
                  </div>
                </div>

                {/* Right: Details */}
                {isOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {/* Stock Visibility */}
                  <div className="card" style={{ background: '#fafafa' }}>
                    <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 8 }}>
                      <div>
                        <div className="subtle">Current Stock</div>
                        <div style={{ fontWeight: 700 }}>{currentStock}</div>
                      </div>
                      <div>
                        <div className="subtle">Status</div>
                        <div style={{ fontWeight: 700, color: p.inStock ? '#065f46' : '#991b1b' }}>{p.inStock ? 'Available' : 'Out of Stock'}</div>
                      </div>
                      <div>
                        <div className="subtle">Created</div>
                        <div>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '-'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Reorder Points */}
                  <div className="card" style={{ background: '#fff' }}>
                    <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div>
                        <div className="subtle">Suggested Reorder Threshold</div>
                        <div style={{ fontWeight: 700 }}>{reorder.threshold} units</div>
                        <div className="subtle" style={{ marginTop: 4, color: reorder.status === 'Reorder soon' ? '#991b1b' : '#065f46' }}>{reorder.status}</div>
                      </div>
                    </div>
                  </div>

                  {/* Inventory Turnover (FIFO-ready) */}
                  <div className="card" style={{ background: '#fff' }}>
                    <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 8 }}>
                      <div>
                        <div className="subtle">Inventory Turnover</div>
                        <div style={{ fontWeight: 700 }}>{turnover.turnover == null ? 'N/A' : turnover.turnover}</div>
                      </div>
                      <div>
                        <div className="subtle">Costing Method</div>
                        <div style={{ fontWeight: 700 }}>FIFO</div>
                      </div>
                    </div>
                  </div>

                  {/* FIFO Batches (Placeholder) */}
                  <div className="card" style={{ background: '#fafafa' }}>
                    <div className="card-body">
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>FIFO Batches</div>
                    </div>
                  </div>

                  {/* Quality Checks */}
                  <div className="card" style={{ background: '#fff' }}>
                    <div className="card-body">
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>Quality Checks</div>
                      <ul style={{ paddingLeft: 18, lineHeight: 1.6 }}>
                        <li>Packaging intact</li>
                        <li>Expiry date valid (if applicable)</li>
                        <li>Labeling correct</li>
                        <li>Stored at appropriate conditions</li>
                      </ul>
                      <div className="subtle">Note: Track QC status per batch for compliance.</div>
                    </div>
                  </div>
                </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
