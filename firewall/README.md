# 🔥 Firewall 

A Python-based **port scan honeypot and auto-blocking tool** that detects TCP SYN scans in real time, taunts the scanner with a `"try harder"` response, and automatically blocks repeat offenders via `iptables` — unblocking them after a configurable cooldown.

> ⚠️ **Disclaimer:** This tool is for **educational purposes only**, intended for use in safe, controlled environments. Misuse is strictly prohibited. The author assumes no responsibility for illegal or unethical use. Always comply with applicable laws and ethical guidelines.

---

## 📋 Table of Contents

- [How It Works](#how-it-works)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [Cheatsheet](#cheatsheet)

---

## ⚙️ How It Works

```
Incoming TCP Packet
        │
        ▼
  SYN flag detected?
        │
   Yes  │
        ▼
  Track scan count for source IP
        │
        ├── Count ≤ 5 ──────────────────────────────────────────────────┐
        │                                                                │
        └── Count > 5                                              Send SYN-ACK
                │                                                        │
                ▼                                                        ▼
       Block IP via iptables                             Send "try harder" data packet
                │
                ▼
       Schedule unblock after 10 minutes
```

1. **Packet sniffing** — Scapy listens for all TCP traffic.
2. **SYN detection** — Every TCP SYN packet (port scan probe) from a unique IP is counted and timestamped.
3. **Taunt response** — For each SYN under the threshold, the tool sends back a valid SYN-ACK followed by a TCP data packet containing the message `"try harder"`.
4. **Auto-block** — If an IP sends more than **5 SYN packets**, it is blocked via `iptables -A INPUT -s <ip> -j DROP`.
5. **Auto-unblock** — A background loop checks every 5 seconds and removes the `iptables` rule after the block duration expires (default: 10 minutes).

---

## ✨ Features

- 🕵️ Real-time TCP SYN scan detection using Scapy
- 😈 Sends a `"try harder"` taunt back to the scanner
- 🚫 Automatically blocks IPs that exceed a scan threshold via `iptables`
- ⏱️ Timed auto-unblock — IPs are released after a configurable duration
- 🔄 Duplicate-block protection — skips `iptables` insertion if rule already exists
- 🧵 Multithreaded — sniffing runs in a background thread while the main thread manages unblock scheduling

---

## 🧰 Prerequisites

- Linux (requires `iptables`)
- Python 3.7+
- `sudo` / root privileges (required for raw socket sniffing and `iptables` manipulation)
- Scapy

---

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/firewall_try_harder.git
   cd firewall_try_harder
   ```

2. **Install dependencies**
   ```bash
   pip install scapy
   ```

---

## ▶️ Usage

Run with `sudo` (required for raw packet capture and `iptables`):

```bash
sudo python3 firewall_try_harder.py
```

**Example output:**
```
Scan detected on port 80 from 192.168.1.42
Sent SYN-ACK to 192.168.1.42 on port 80
Sent data packet with message 'try harder' to 192.168.1.42 on port 80
Scan detected on port 443 from 192.168.1.42
...
IP 192.168.1.42 exceeded scan limit, blocking for 10 minutes...
Blocking IP: 192.168.1.42
IP 192.168.1.42 will be unblocked at 2024-12-31 19:40:00
```

Stop the tool with `Ctrl+C`.

---

## 🔧 Configuration

Edit these constants at the top of `firewall_try_harder.py` to customize behaviour:

| Constant | Default | Description |
|---|---|---|
| `BLOCK_DURATION` | `timedelta(minutes=10)` | How long an IP stays blocked |
| Scan threshold | `5` (hardcoded in `handle_packet`) | Number of SYNs before blocking |

---

## 🗂️ Project Structure

```
firewall_try_harder-main/
├── firewall_try_harder.py   # Main script — sniffing, taunting, blocking
├── cheatsheet.md            # Quick reference for tcpdump & iptables commands
├── LICENSE                  # MIT License
└── README.md                # This file
```

---

## 📖 Cheatsheet

Useful commands for monitoring and managing the firewall manually (from `cheatsheet.md`):

### tcpdump

```bash
# Show packets with SYN flags
tcpdump -i eth0 'tcp[tcpflags] & tcp-syn != 0'

# Exclude SSH traffic (port 22)
sudo tcpdump -i any tcp and not port 22 -X

# Filter traffic from a specific IP
tcpdump -i any src host <specific-ip> -X
```

### iptables

```bash
# Block an IP
iptables -A INPUT -s <ip> -j DROP

# Unblock an IP
iptables -D INPUT -s <ip> -j DROP

# List active rules
iptables -L -n -v

# Flush all rules
iptables -F
```

---

## 📄 License

@ all Right Reserved by Rahul Sharma