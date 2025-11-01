# Running Backend API on Network IP Address

## 🌐 Problem
When using Expo Go on a physical phone, `localhost` doesn't work because the phone can't reach your laptop's localhost. You need to use your laptop's IP address instead.

## 🔍 Step 1: Find Your Laptop's IP Address

### On Windows:
```cmd
ipconfig
```
Look for "IPv4 Address" under your active network adapter (WiFi or Ethernet).
Example: `192.168.1.100`

### On macOS/Linux:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```
Or:
```bash
ipconfig getifaddr en0
```

### Quick PowerShell Command (Windows):
```powershell
(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias Wi-Fi).IPAddress
```

## 🚀 Step 2: Start Backend with IP Address

### Option 1: Direct Command (Recommended)
```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**What this does:**
- `--host 0.0.0.0` - Binds to all network interfaces (allows external connections)
- `--port 8000` - Uses port 8000
- `--reload` - Auto-reloads on code changes

### Option 2: Using Your IP Directly
```bash
cd backend
python -m uvicorn main:app --reload --host YOUR_IP_ADDRESS --port 8000
```
Replace `YOUR_IP_ADDRESS` with your actual IP (e.g., `192.168.1.100`)

## 🔧 Step 3: Configure Firewall

### Windows Firewall:
1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Select "Port" → Next
5. Select "TCP" and enter port `8000` → Next
6. Select "Allow the connection" → Next
7. Check all profiles → Next
8. Name it "Python Backend" → Finish

### Quick PowerShell Command (Windows - Run as Administrator):
```powershell
New-NetFirewallRule -DisplayName "Python Backend" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
```

### macOS Firewall:
Usually macOS doesn't block by default, but if needed:
1. System Preferences → Security & Privacy → Firewall
2. Click "Firewall Options"
3. Click "+" and add Python
4. Select "Allow incoming connections"

## 📱 Step 4: Update App Configuration

Create a configuration file for easy IP management:

### Create `config/api.ts`:
```typescript
import { Platform } from 'react-native';

// 🔥 CHANGE THIS to your laptop's IP address
const LAPTOP_IP = '192.168.1.100'; // ← Update this!

export const API_CONFIG = {
  // Use different URLs based on platform
  BASE_URL: Platform.select({
    ios: __DEV__ 
      ? `http://${LAPTOP_IP}:8000`  // Physical device
      : 'http://localhost:8000',      // Simulator
    android: __DEV__
      ? `http://${LAPTOP_IP}:8000`  // Physical device
      : 'http://10.0.2.2:8000',       // Emulator
    default: 'http://localhost:8000',
  }),
  
  TIMEOUT: 10000, // 10 seconds
};

// Helper function to get full endpoint URL
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};
```

## 🔄 Step 5: Update Your App Files

I'll update the login and register screens to use the config file.

## ✅ Step 6: Verify Connection

### Test Backend is Accessible:

#### From Browser (on your laptop):
```
http://YOUR_IP_ADDRESS:8000/docs
```

#### From Browser (on your phone):
1. Connect phone to same WiFi
2. Open browser on phone
3. Navigate to: `http://YOUR_IP_ADDRESS:8000/docs`
4. If you see FastAPI docs, it's working!

### Test with cURL (on laptop):
```bash
curl http://YOUR_IP_ADDRESS:8000/
```

## 🔍 Troubleshooting

### Issue: "Network request failed"

**Solutions:**
1. ✅ Verify both devices on same WiFi network
2. ✅ Check firewall allows port 8000
3. ✅ Backend is running with `--host 0.0.0.0`
4. ✅ IP address is correct in app config
5. ✅ No VPN interfering with connection

### Issue: "Connection refused"

**Check:**
```bash
# On laptop, verify backend is listening on all interfaces
netstat -an | findstr :8000    # Windows
netstat -an | grep :8000       # macOS/Linux
```

Should show: `0.0.0.0:8000` or your IP address

### Issue: "Timeout"

**Solutions:**
1. Check antivirus/security software
2. Try disabling Windows Firewall temporarily (for testing)
3. Verify router isn't blocking communication
4. Check if port 8000 is already in use

### Issue: "ERR_CONNECTION_TIMED_OUT"

**Try:**
1. Ping laptop from phone (use network tools app)
2. Check WiFi isolation is disabled on router
3. Use different port (e.g., 8080)

## 📋 Quick Setup Checklist

- [ ] Found laptop's IP address
- [ ] Updated `config/api.ts` with IP
- [ ] Started backend with `--host 0.0.0.0`
- [ ] Configured firewall to allow port 8000
- [ ] Phone and laptop on same WiFi
- [ ] Tested backend URL in phone browser
- [ ] Updated app files (login, register)
- [ ] Restarted Expo app
- [ ] Tested login/register

## 🎯 Common WiFi Network IPs

Your IP will typically be in one of these ranges:

- **192.168.1.x** - Most home routers
- **192.168.0.x** - Some home routers
- **10.0.0.x** - Some routers
- **172.16.x.x to 172.31.x.x** - Less common

## 🔐 Security Note

**Important:** Running with `--host 0.0.0.0` makes your backend accessible to anyone on your network. This is fine for development but:

1. ⚠️ Don't use this in production
2. ⚠️ Don't use on public WiFi
3. ⚠️ Add authentication to your API
4. ⚠️ Use HTTPS in production

## 🚀 Production Setup (Future)

For production, you'll want to:

1. Deploy backend to a cloud service (AWS, Heroku, DigitalOcean)
2. Use HTTPS with SSL certificate
3. Use environment variables for API URL
4. Implement proper authentication
5. Set up CORS properly

## 📱 Network Commands Reference

### Find all devices on network (Windows):
```cmd
arp -a
```

### Test connectivity to backend:
```bash
# From phone terminal app or laptop
curl -v http://YOUR_IP:8000/

# Or use ping
ping YOUR_IP
```

### Check port is open:
```bash
# Windows
Test-NetConnection -ComputerName YOUR_IP -Port 8000

# macOS/Linux
nc -zv YOUR_IP 8000
```

## 💡 Pro Tips

1. **Use Static IP:** Configure your laptop to use a static IP on your router so it doesn't change
2. **QR Code:** Expo will show QR code with correct IP automatically
3. **Environment Files:** Use `.env` files to manage different environments
4. **Network Tools:** Install network scanner apps on phone to verify connectivity

## 🔄 Alternative: Using Expo Tunnel

If IP setup is problematic, use Expo's tunnel feature:

```bash
npx expo start --tunnel
```

**Pros:**
- No IP configuration needed
- Works through firewalls
- Works on different networks

**Cons:**
- Slower than LAN
- Requires internet connection
- May have latency

---

**Next:** I'll update your app files to use the configuration properly!
