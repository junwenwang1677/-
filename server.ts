import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const ITEMS_FILE = path.join(DATA_DIR, 'inventory.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Default initial items
const DEFAULT_ITEMS = [
  {
    id: 'item_1',
    title: '富士胶片旁轴复古机械相机（99新收藏级）',
    category: '数码摄影',
    price: 1680,
    originalPrice: 3200,
    condition: '99新 (仅拆封试机)',
    stock: 1,
    status: 'available', // available | reserved | sold
    description: '私人收藏出清。全金属机械质感，快门声音清脆干脆，外观成色极佳无任何磕碰掉漆。原厂配件、背带、双电池与皮套齐全，箱说全。成色如图，欢迎自提或在学校面交验机。',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    tags: ['复古胶片', '箱说全', '极品成色'],
    location: '自提或在学校领取',
    createdAt: new Date('2026-09-20').toISOString()
  },
  {
    id: 'item_2',
    title: '客制化铝坨坨机械键盘 75配列（润轴+消音棉）',
    category: '电脑外设',
    price: 490,
    originalPrice: 980,
    condition: '95新 (正常轻度使用)',
    stock: 2,
    status: 'available',
    description: '阳极氧化深空灰铝合金上盖，全键热插拔，搭配厂润线性轴体，手感扎实如雨滴声。双模无线连接，Type-C编制线材与备用键帽俱在。桌面换风格低价让给有缘人。',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    tags: ['客制化', '铝合金', '热插拔'],
    location: '自提或在学校领取',
    createdAt: new Date('2026-09-22').toISOString()
  },
  {
    id: 'item_3',
    title: '手工植树头层牛皮双肩背包 经典马鞍棕',
    category: '箱包服饰',
    price: 360,
    originalPrice: 850,
    condition: '9成新 (自然皮质养色)',
    stock: 1,
    status: 'available',
    description: '进口意大利植鞣皮，做工扎实，五金无氧化。可轻松放下15寸笔记本电脑及多本厚重书本。包身已经养出漂亮的温润包浆，无破损无油渍，定期上貂油保养。',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    tags: ['真皮复古', '植鞣牛皮', '大容量'],
    location: '自提或在学校领取',
    createdAt: new Date('2026-09-25').toISOString()
  },
  {
    id: 'item_4',
    title: '日本原产磨砂陶瓷手冲咖啡滤杯套装 + 耐热玻璃分享壶',
    category: '生活美学',
    price: 180,
    originalPrice: 380,
    condition: '全新未拆封',
    stock: 3,
    status: 'available',
    description: '极简哑光白陶瓷锥形滤杯，导流肋骨设计优秀，萃取风味均衡。附送50张进口原色滤纸和原装木托。多买了一套全新闲置出清，适合日常手冲爱好者。',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    tags: ['全新未拆', '手冲咖啡', '极简生活'],
    location: '自提或在学校领取',
    createdAt: new Date('2026-09-26').toISOString()
  },
  {
    id: 'item_5',
    title: '实木胡桃木桌面收纳架 & 监听音箱防震减震脚垫',
    category: '家居好物',
    price: 120,
    originalPrice: 280,
    condition: '95新',
    stock: 1,
    status: 'available',
    description: '北美黑胡桃木整木切割，木蜡油涂装，质感温润厚重。可垫高4-5寸桌面音箱，避免共振，下方可收纳声卡或小物件，桌面理线神器。',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    tags: ['黑胡桃木', '桌面美学', '防震脚架'],
    location: '自提或在学校领取',
    createdAt: new Date('2026-09-28').toISOString()
  },
  {
    id: 'item_6',
    title: '头戴式主动降噪蓝牙无线耳机 (石墨黑 配件齐全)',
    category: '数码摄影',
    price: 680,
    originalPrice: 1599,
    condition: '9成新 (耳罩完好)',
    stock: 1,
    status: 'available',
    description: '音质纯净，降噪深度优秀，日常通勤与办公神物。电池健康度90%以上，单次满电可用25小时。包含原装便携收纳硬包与3.5mm音频线。',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    tags: ['主动降噪', '长续航', '成色极佳'],
    location: '自提或在学校领取',
    createdAt: new Date('2026-09-29').toISOString()
  }
];

const DEFAULT_SETTINGS = {
  sellerEmail: 'shiwokakanaka@gmail.com',
  storeName: '个人私物与存货出清集市',
  announcement: '因个人搬家与闲置整理，部分珍藏好物与多余存货好价出清！所有物品支持勾选订购，提交后将通过邮件直达我并同步录入后台，成色如实说明，自提或在学校领取均可。',
  currency: '¥',
  contactWeChat: '月月鸟 (美国)',
  contactWeChatName: '月月鸟',
  contactWeChatQr: '/wechat_qr.jpg',
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

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Ensure updated location in existing inventory if needed
if (!fs.existsSync(ITEMS_FILE)) {
  writeJsonFile(ITEMS_FILE, DEFAULT_ITEMS);
} else {
  // Update location in existing items if they still have old text
  const currentItems = readJsonFile<any[]>(ITEMS_FILE, DEFAULT_ITEMS);
  const updatedItems = currentItems.map(it => ({
    ...it,
    location: '自提或在学校领取'
  }));
  writeJsonFile(ITEMS_FILE, updatedItems);
}

if (!fs.existsSync(ORDERS_FILE)) {
  writeJsonFile(ORDERS_FILE, []);
}

if (!fs.existsSync(SETTINGS_FILE)) {
  writeJsonFile(SETTINGS_FILE, DEFAULT_SETTINGS);
} else {
  const currentSettings = readJsonFile<any>(SETTINGS_FILE, DEFAULT_SETTINGS);
  currentSettings.pickupLocation = '自提或在学校领取';
  writeJsonFile(SETTINGS_FILE, currentSettings);
}

// Mailer helper
async function sendNotificationEmail(settings: any, order: any): Promise<{ success: boolean; error?: string }> {
  const smtp = settings?.smtpConfig;
  if (!smtp?.enabled || !smtp?.user || !smtp?.pass) {
    return { success: false, error: 'SMTP 发信服务未配置' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtp.host || 'smtp.qq.com',
      port: Number(smtp.port) || 465,
      secure: smtp.secure !== false,
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
    });

    const itemsListHtml = order.items.map((it: any, idx: number) =>
      `<tr>
        <td style="padding: 10px 8px; border-bottom: 1px solid #f0f0f0;">
          <div style="font-weight: 600; color: #18181b;">${idx + 1}. ${it.title}</div>
          <div style="font-size: 12px; color: #71717a; margin-top: 2px;">成色: ${it.condition || '良好'}</div>
        </td>
        <td style="padding: 10px 8px; border-bottom: 1px solid #f0f0f0; text-align: center; font-family: monospace;">×${it.quantity}</td>
        <td style="padding: 10px 8px; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: 600; font-family: monospace; color: #b45309;">${settings.currency || '¥'}${it.price * it.quantity}</td>
      </tr>`
    ).join('');

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #e4e4e7; border-radius: 16px; background-color: #ffffff; color: #18181b;">
        <div style="border-bottom: 2px solid #f4f4f5; padding-bottom: 16px; margin-bottom: 20px;">
          <span style="font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: #d97706; background: #fef3c7; padding: 3px 8px; rounded: 4px;">新存货认购推送</span>
          <h2 style="font-size: 20px; font-weight: 700; margin: 8px 0 0 0; color: #09090b;">订单编号：${order.id}</h2>
        </div>

        <div style="background-color: #fafaf9; border: 1px solid #f5f5f4; border-radius: 12px; padding: 16px; margin-bottom: 24px; font-size: 13px; line-height: 1.6;">
          <div style="margin-bottom: 6px;"><strong>买家称呼：</strong> ${order.buyerName}</div>
          <div style="margin-bottom: 6px;"><strong>买家邮箱：</strong> <a href="mailto:${order.buyerEmail}" style="color: #2563eb; text-decoration: underline;">${order.buyerEmail || '未填写'}</a></div>
          <div style="margin-bottom: 6px;"><strong>电话 / 微信：</strong> <span style="font-family: monospace; background: #f4f4f5; padding: 2px 6px; border-radius: 4px;">${order.buyerContact || '未填写'}</span></div>
          <div style="margin-bottom: 6px;"><strong>交付方式：</strong> <span style="color: #047857; font-weight: 600;">${order.deliveryMethod}</span> ${order.shippingAddress ? `(${order.shippingAddress})` : ''}</div>
          ${order.note ? `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #e7e5e4; color: #92400e;"><strong>买家留言：</strong> ${order.note}</div>` : ''}
        </div>

        <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 12px; color: #27272a;">认购商品明细 (${order.items.length}件)</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 16px;">
          <thead>
            <tr style="background: #f4f4f5; color: #52525b; font-size: 12px;">
              <th style="padding: 8px; text-align: left;">物品</th>
              <th style="padding: 8px; text-align: center; width: 60px;">数量</th>
              <th style="padding: 8px; text-align: right; width: 90px;">小计</th>
            </tr>
          </thead>
          <tbody>
            ${itemsListHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 14px 8px; text-align: right; font-weight: 600; font-size: 15px;">合计总额：</td>
              <td style="padding: 14px 8px; text-align: right; font-weight: 700; font-size: 18px; font-family: monospace; color: #b45309;">${settings.currency || '¥'}${order.totalAmount}</td>
            </tr>
          </tfoot>
        </table>

        <div style="border-top: 1px solid #f4f4f5; padding-top: 16px; margin-top: 24px; font-size: 12px; color: #71717a;">
          <p style="margin: 0;">此邮件已由存货集市自动投递至您的通知邮箱：<strong>${settings.sellerEmail}</strong>。</p>
          <p style="margin: 4px 0 0 0;">您也可以随时登录系统管理后台查看订单处理状态并核销存货。</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"${smtp.fromName || settings.storeName || '存货集市'}" <${smtp.user}>`,
      to: settings.sellerEmail,
      subject: `[新存货订单] ${order.buyerName} 订购了 ${order.items.length} 件物品 (总额 ${settings.currency || '¥'}${order.totalAmount})`,
      text: `订单编号: ${order.id}\n买家: ${order.buyerName}\n联系方式: ${order.buyerContact || order.buyerEmail}\n交付方式: ${order.deliveryMethod}\n总额: ${settings.currency || '¥'}${order.totalAmount}`,
      html: htmlContent,
    });

    return { success: true };
  } catch (err: any) {
    console.error('SMTP send error:', err);
    return { success: false, error: err?.message || '发送失败' };
  }
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json({ limit: '25mb' }));

  // API Endpoints
  const OWNER_EMAIL = 'shiwokakanaka@gmail.com';

  const requireOwnerAuth = (req: Request, res: Response, next: () => void) => {
    const adminHeader = (req.headers['x-admin-email'] as string || '').toLowerCase().trim();
    const rawCookies = req.headers.cookie || '';
    let cookieEmail = '';
    rawCookies.split(';').forEach((c) => {
      const parts = c.split('=');
      const k = parts[0]?.trim();
      const v = parts.slice(1).join('=').trim();
      if (k === 'visitor_buyer_email') cookieEmail = decodeURIComponent(v).toLowerCase().trim();
    });

    if (adminHeader === OWNER_EMAIL.toLowerCase() || cookieEmail === OWNER_EMAIL.toLowerCase()) {
      return next();
    }

    return res.status(403).json({
      error: '权限受限',
      message: `后台管理功能仅限店主 (${OWNER_EMAIL}) 访问与操作`
    });
  };

  // 1. Items API
  app.get('/api/items', (req: Request, res: Response) => {
    const items = readJsonFile<any[]>(ITEMS_FILE, DEFAULT_ITEMS);
    res.json(items);
  });

  app.post('/api/items', requireOwnerAuth, (req: Request, res: Response) => {
    const items = readJsonFile<any[]>(ITEMS_FILE, DEFAULT_ITEMS);
    const newItem = {
      ...req.body,
      id: req.body.id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: req.body.createdAt || new Date().toISOString(),
      status: req.body.status || 'available',
      stock: req.body.stock !== undefined ? Number(req.body.stock) : 1,
      price: Number(req.body.price) || 0,
      originalPrice: req.body.originalPrice ? Number(req.body.originalPrice) : undefined,
      location: req.body.location || '自提或在学校领取'
    };
    items.unshift(newItem);
    writeJsonFile(ITEMS_FILE, items);
    res.status(201).json(newItem);
  });

  app.put('/api/items/:id', requireOwnerAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const items = readJsonFile<any[]>(ITEMS_FILE, DEFAULT_ITEMS);
    const index = items.findIndex((i: any) => i.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }
    items[index] = {
      ...items[index],
      ...req.body,
      price: Number(req.body.price) || items[index].price,
      stock: req.body.stock !== undefined ? Number(req.body.stock) : items[index].stock
    };
    writeJsonFile(ITEMS_FILE, items);
    res.json(items[index]);
  });

  app.delete('/api/items/:id', requireOwnerAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const items = readJsonFile<any[]>(ITEMS_FILE, DEFAULT_ITEMS);
    const filtered = items.filter((i: any) => i.id !== id);
    writeJsonFile(ITEMS_FILE, filtered);
    res.json({ success: true, id });
  });

  // 2. Orders / Inquiries API
  app.get('/api/orders', (req: Request, res: Response) => {
    const orders = readJsonFile<any[]>(ORDERS_FILE, []);
    res.json(orders);
  });

  app.post('/api/orders', async (req: Request, res: Response) => {
    const orders = readJsonFile<any[]>(ORDERS_FILE, []);
    const items = readJsonFile<any[]>(ITEMS_FILE, DEFAULT_ITEMS);
    const settings = readJsonFile<any>(SETTINGS_FILE, DEFAULT_SETTINGS);

    const orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const newOrder = {
      id: orderId,
      createdAt: new Date().toISOString(),
      status: 'pending', // pending | contacted | confirmed | completed | cancelled
      buyerName: req.body.buyerName || '匿名买家',
      buyerEmail: req.body.buyerEmail || '',
      buyerContact: req.body.buyerContact || '',
      deliveryMethod: req.body.deliveryMethod || '在学校领取',
      shippingAddress: req.body.shippingAddress || '',
      note: req.body.note || '',
      items: req.body.items || [], // array of { id, title, price, quantity, imageUrl }
      totalAmount: req.body.totalAmount || 0,
      sellerEmail: settings.sellerEmail || 'shiwokakanaka@gmail.com',
      emailPushed: true,
      smtpDelivered: false,
      smtpError: null as string | null
    };

    // Attempt automatic server SMTP send if configured
    if (settings.smtpConfig?.enabled) {
      const emailResult = await sendNotificationEmail(settings, newOrder);
      newOrder.smtpDelivered = emailResult.success;
      if (!emailResult.success) {
        newOrder.smtpError = emailResult.error || '发信失败';
      }
    }

    orders.unshift(newOrder);
    writeJsonFile(ORDERS_FILE, orders);

    res.status(201).json({
      success: true,
      order: newOrder,
      message: `意向邮件信息已生成`
    });
  });

  app.patch('/api/orders/:id', requireOwnerAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const orders = readJsonFile<any[]>(ORDERS_FILE, []);
    const index = orders.findIndex((o: any) => o.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }
    orders[index] = { ...orders[index], ...req.body };
    writeJsonFile(ORDERS_FILE, orders);
    res.json(orders[index]);
  });

  // 3. Settings API
  app.get('/api/settings', (req: Request, res: Response) => {
    const settings = readJsonFile<any>(SETTINGS_FILE, DEFAULT_SETTINGS);
    res.json(settings);
  });

  app.post('/api/settings', requireOwnerAuth, (req: Request, res: Response) => {
    const current = readJsonFile<any>(SETTINGS_FILE, DEFAULT_SETTINGS);
    const updated = { ...current, ...req.body };
    writeJsonFile(SETTINGS_FILE, updated);
    res.json(updated);
  });

  // 4. Test Email API
  app.post('/api/test-email', async (req: Request, res: Response) => {
    const settings = readJsonFile<any>(SETTINGS_FILE, DEFAULT_SETTINGS);
    const testOrder = {
      id: `TEST-${Date.now().toString().slice(-4)}`,
      buyerName: '测试买家 (张同学)',
      buyerEmail: 'buyer-test@example.com',
      buyerContact: '微信: test_buyer_wx',
      deliveryMethod: '在学校领取',
      shippingAddress: '学生公寓3号楼前',
      note: '这是一条自动测试邮件，用于验证发信功能是否正常。',
      items: [
        { title: '测试物品：富士相机', condition: '99新', quantity: 1, price: 1680 }
      ],
      totalAmount: 1680
    };

    const result = await sendNotificationEmail(settings, testOrder);
    if (result.success) {
      res.json({ success: true, message: `测试邮件已成功发送至 ${settings.sellerEmail}，请检查收件箱（或垃圾箱）` });
    } else {
      res.status(400).json({ success: false, error: result.error || '测试发信失败，请检查 SMTP 账号与授权码' });
    }
  });

  // 5. Visitor Cookie Session API (Long-lived 365 days)
  app.get('/api/visitor/session', (req: Request, res: Response) => {
    const rawCookies = req.headers.cookie || '';
    let email = '';
    let name = '';
    rawCookies.split(';').forEach((c) => {
      const parts = c.split('=');
      const k = parts[0]?.trim();
      const v = parts.slice(1).join('=').trim();
      if (k === 'visitor_buyer_email') email = decodeURIComponent(v);
      if (k === 'visitor_buyer_name') name = decodeURIComponent(v);
    });
    res.json({ email, name });
  });

  app.post('/api/visitor/session', (req: Request, res: Response) => {
    const { email, name } = req.body;
    if (email) {
      const maxAgeSeconds = 365 * 24 * 60 * 60;
      res.setHeader('Set-Cookie', [
        `visitor_buyer_email=${encodeURIComponent(email)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax`,
        `visitor_buyer_name=${encodeURIComponent(name || '')}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax`,
      ]);
    }
    res.json({ success: true, email, name });
  });

  app.delete('/api/visitor/session', (req: Request, res: Response) => {
    res.setHeader('Set-Cookie', [
      `visitor_buyer_email=; Max-Age=0; Path=/; SameSite=Lax`,
      `visitor_buyer_name=; Max-Age=0; Path=/; SameSite=Lax`,
    ]);
    res.json({ success: true });
  });

  // 6. Reset Data API
  app.post('/api/data/reset', (req: Request, res: Response) => {
    writeJsonFile(ITEMS_FILE, DEFAULT_ITEMS);
    writeJsonFile(ORDERS_FILE, []);
    writeJsonFile(SETTINGS_FILE, DEFAULT_SETTINGS);
    res.json({ success: true, message: '数据已恢复默认初始状态' });
  });

  // Serve static assets from public directory
  app.use(express.static(path.join(__dirname, 'public')));

  // Setup Vite in middleware mode for dev
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
