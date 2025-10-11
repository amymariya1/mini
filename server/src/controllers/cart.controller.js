import mongoose from 'mongoose';
import Cart from '../models/Cart.js';

// In-memory fallback when no DB connection
const memoryCarts = new Map(); // key: userId, value: { userId, items: [...] }

function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

export async function getCart(req, res) {
  try {
    const userId = String(req.params.userId || '').trim();
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    if (isDbConnected()) {
      const cart = await Cart.findOne({ userId });
      return res.json({ cart: cart || { userId, items: [] } });
    }

    const cart = memoryCarts.get(userId) || { userId, items: [] };
    return res.json({ cart });
  } catch (err) {
    console.error('getCart error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function saveCart(req, res) {
  try {
    const userId = String(req.params.userId || '').trim();
    const { items } = req.body || {};
    if (!userId) return res.status(400).json({ message: 'userId is required' });
    if (!Array.isArray(items)) return res.status(400).json({ message: 'items array is required' });

    const sanitizedItems = items.map((it) => ({
      productId: String(it.productId || it.id || ''),
      name: String(it.name || ''),
      price: Number(it.price || 0),
      image: String(it.image || ''),
      quantity: Math.max(1, Number(it.quantity || 1)),
    })).filter((it) => it.productId && it.name);

    if (isDbConnected()) {
      const updated = await Cart.findOneAndUpdate(
        { userId },
        { $set: { items: sanitizedItems } },
        { upsert: true, new: true }
      );
      return res.json({ cart: updated });
    }

    const cart = { userId, items: sanitizedItems };
    memoryCarts.set(userId, cart);
    return res.json({ cart });
  } catch (err) {
    console.error('saveCart error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function updateCart(req, res) {
  try {
    const userId = String(req.params.userId || '').trim();
    const { items } = req.body || {};
    if (!userId) return res.status(400).json({ message: 'userId is required' });
    if (!Array.isArray(items)) return res.status(400).json({ message: 'items array is required' });

    if (isDbConnected()) {
      const existing = await Cart.findOne({ userId });
      const current = existing ? existing.items : [];

      // Merge by productId
      const byId = new Map(current.map(i => [String(i.productId), i]));
      for (const it of items) {
        const pid = String(it.productId || it.id || '');
        if (!pid) continue;
        const qty = Math.max(0, Number(it.quantity || 0));
        if (qty === 0) { byId.delete(pid); continue; }
        byId.set(pid, {
          productId: pid,
          name: String(it.name || (byId.get(pid)?.name || '')),
          price: Number(it.price ?? (byId.get(pid)?.price ?? 0)),
          image: String(it.image ?? (byId.get(pid)?.image ?? '')),
          quantity: qty,
        });
      }

      const merged = Array.from(byId.values());
      const updated = await Cart.findOneAndUpdate(
        { userId },
        { $set: { items: merged } },
        { upsert: true, new: true }
      );
      return res.json({ cart: updated });
    }

    const current = memoryCarts.get(userId)?.items || [];
    const byId = new Map(current.map(i => [String(i.productId), i]));
    for (const it of items) {
      const pid = String(it.productId || it.id || '');
      if (!pid) continue;
      const qty = Math.max(0, Number(it.quantity || 0));
      if (qty === 0) { byId.delete(pid); continue; }
      byId.set(pid, {
        productId: pid,
        name: String(it.name || (byId.get(pid)?.name || '')),
        price: Number(it.price ?? (byId.get(pid)?.price ?? 0)),
        image: String(it.image ?? (byId.get(pid)?.image ?? '')),
        quantity: qty,
      });
    }
    const merged = Array.from(byId.values());
    const cart = { userId, items: merged };
    memoryCarts.set(userId, cart);
    return res.json({ cart });
  } catch (err) {
    console.error('updateCart error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function clearCart(req, res) {
  try {
    const userId = String(req.params.userId || '').trim();
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    if (isDbConnected()) {
      const updated = await Cart.findOneAndUpdate(
        { userId },
        { $set: { items: [] } },
        { upsert: true, new: true }
      );
      return res.json({ cart: updated });
    }

    const cart = { userId, items: [] };
    memoryCarts.set(userId, cart);
    return res.json({ cart });
  } catch (err) {
    console.error('clearCart error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}