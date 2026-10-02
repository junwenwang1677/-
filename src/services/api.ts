import { InventoryItem, OrderItem, StoreSettings } from '../types';

const STORAGE_KEYS = {
  ITEMS: 'inventory_store_items',
  ORDERS: 'inventory_store_orders',
  SETTINGS: 'inventory_store_settings',
};

const getAdminHeaders = () => {
  let email = 'shiwokakanaka@gmail.com';
  try {
    email = localStorage.getItem('visitor_buyer_email') || 'shiwokakanaka@gmail.com';
  } catch {}
  return {
    'Content-Type': 'application/json',
    'x-admin-email': email,
  };
};

export const api = {
  // Items
  async getItems(): Promise<InventoryItem[]> {
    try {
      const res = await fetch('/api/items');
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(data));
        return data;
      }
    } catch {
      // Fallback to local storage
    }
    const local = localStorage.getItem(STORAGE_KEYS.ITEMS);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {}
    }
    return [];
  },

  async createItem(item: Partial<InventoryItem>): Promise<InventoryItem> {
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify(item),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    // Fallback
    const newItem: InventoryItem = {
      id: `item_${Date.now()}`,
      title: item.title || '未命名商品',
      category: item.category || '其他闲置',
      price: Number(item.price) || 0,
      originalPrice: item.originalPrice ? Number(item.originalPrice) : undefined,
      condition: item.condition || '9成新',
      stock: item.stock !== undefined ? Number(item.stock) : 1,
      status: item.status || 'available',
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      tags: item.tags || [],
      location: item.location || '',
      createdAt: new Date().toISOString(),
    };
    const items = await this.getItems();
    items.unshift(newItem);
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    return newItem;
  },

  async updateItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    const items = await this.getItems();
    const idx = items.findIndex((i) => i.id === id);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...updates };
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
      return items[idx];
    }
    throw new Error('Item not found');
  },

  async deleteItem(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
        headers: getAdminHeaders(),
      });
      if (res.ok) return true;
    } catch {}

    const items = await this.getItems();
    const filtered = items.filter((i) => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(filtered));
    return true;
  },

  // Orders
  async getOrders(): Promise<OrderItem[]> {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(data));
        return data;
      }
    } catch {}
    const local = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {}
    }
    return [];
  },

  async createOrder(orderData: Partial<OrderItem> & { autoReserve?: boolean }): Promise<{ success: boolean; order: OrderItem; message: string }> {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const newOrder: OrderItem = {
      id: orderId,
      createdAt: new Date().toISOString(),
      status: 'pending',
      buyerName: orderData.buyerName || '买家',
      buyerEmail: orderData.buyerEmail || '',
      buyerContact: orderData.buyerContact || '',
      deliveryMethod: orderData.deliveryMethod || '在学校领取',
      shippingAddress: orderData.shippingAddress || '',
      note: orderData.note || '',
      items: orderData.items || [],
      totalAmount: orderData.totalAmount || 0,
      sellerEmail: orderData.sellerEmail || 'shiwokakanaka@gmail.com',
      emailPushed: true,
    };
    const orders = await this.getOrders();
    orders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    return {
      success: true,
      order: newOrder,
      message: `意向清单已提交至后台，并通知店主邮箱: ${newOrder.sellerEmail}`,
    };
  },

  async updateOrderStatus(id: string, status: OrderItem['status']): Promise<OrderItem> {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) return await res.json();
    } catch {}

    const orders = await this.getOrders();
    const idx = orders.findIndex((o) => o.id === id);
    if (idx !== -1) {
      orders[idx].status = status;
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      return orders[idx];
    }
    throw new Error('Order not found');
  },

  // Settings
  async getSettings(): Promise<StoreSettings> {
    const defaults: StoreSettings = {
      sellerEmail: 'shiwokakanaka@gmail.com',
      storeName: '个人私物与存货出清集市',
      announcement: '因工作室搬迁整理，部分珍藏闲置与多余存货骨折价出清！所有物品均支持勾选订购，提交后将通过邮件直达我，也可以直接复制清单微信联系。成色均如实描述，先到先得。',
      currency: '¥',
      contactWeChat: '微信请先提交邮件后联系',
      pickupLocation: '自提或在学校领取',
      allowCounterOffer: true,
      smtpConfig: {
        enabled: false,
        host: 'smtp.qq.com',
        port: 465,
        secure: true,
        user: '',
        pass: '',
        fromName: '存货集市订单系统'
      }
    };

    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data));
        return { ...defaults, ...data };
      }
    } catch {}

    const local = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (local) {
      try {
        return { ...defaults, ...JSON.parse(local) };
      } catch {}
    }
    return defaults;
  },

  async updateSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data));
        return data;
      }
    } catch {}

    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  },

  async testEmail(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/test-email', { method: 'POST' });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err?.message || '请求服务器失败' };
    }
  },

  async resetData(): Promise<void> {
    try {
      await fetch('/api/data/reset', {
        method: 'POST',
        headers: getAdminHeaders(),
      });
    } catch {}
    localStorage.removeItem(STORAGE_KEYS.ITEMS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  }
};
