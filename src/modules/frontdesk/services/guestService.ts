
import type { Guest } from '../types/guest';

const STORAGE_KEY = 'guests';

export const guestApi = {
  async getAll(): Promise<Guest[]> {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  },

  async create(newGuest: Guest): Promise<void> {
    const all = await guestApi.getAll();
    all.push(newGuest);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  },

  async update(updatedGuest: Guest): Promise<void> {
    const all = await guestApi.getAll();
    const updated = all.map(g => g.id === updatedGuest.id ? updatedGuest : g);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  async delete(id: string): Promise<void> {
    const all = await guestApi.getAll();
    const filtered = all.filter(g => g.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  async findById(id: string): Promise<Guest | undefined> {
    const all = await guestApi.getAll();
    return all.find(g => g.id === id);
  }
};
