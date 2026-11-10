
# 🎣 Northforge Phishing Attack Demo

An interactive, client-side educational simulation designed to teach users how to identify and defend against phishing attacks. This project provides a side-by-side comparison of a legitimate university login portal and a malicious attacker's clone, demonstrating common social engineering tactics in a safe, controlled environment.

> ⚠️ **DISCLAIMER**: This project is strictly for **educational and awareness-training purposes**. No data is ever transmitted over the network. All "captured" credentials are stored temporarily in the browser's `sessionStorage` and are destroyed when the tab is closed.

---

## 🌟 Features

- **Legitimate Portal Simulation**: A realistic login page (`index.html`) featuring proper email domain validation, rate-limiting (account lockout after 5 failed attempts), and anti-enumeration security practices.
- **Phishing Clone**: A lookalike page (`indx.html`) that mimics the legitimate site but employs real-world attacker tactics like typosquatting, false urgency ("Session Expired"), and shallow validation to harvest credentials.
- **Interactive Debrief**: A post-simulation breakdown (`debrief.html`) that reveals exactly what data would have been stolen and highlights the red flags of the attack.
- **Complete User Flows**: Includes simulated registration, password recovery, and dashboard pages to make the training scenario highly realistic.
- **100% Client-Side**: Built with vanilla HTML, CSS, and JavaScript. No backend, no database, and no network requests required.

---

## 📂 Project Structure

```text
Northforge-Phishing-Attack-Demo/
├── index.html            # Legitimate login portal entry point
├── indx.html             # Phishing clone entry point (typosquatting demo)
├── dashboard.html        # Legitimate post-login dashboard
├── dashbord.html         # Fake post-login dashboard (attacker clone)
├── register.html         # Account creation page
├── forgot-password.html  # Password recovery page
├── debrief.html          # Educational breakdown of the phishing attempt
├── legit.css             # Styling for the legitimate portal
├── legit.js              # Secure logic (validation, rate-limiting, mock auth)
├── phishing.css          # Styling for the attacker clone
├── phishing.js           # Malicious logic (credential harvesting simulation)
├── validation.js         # Shared utility for input sanitization and validation
└── style.css             # Global/shared styles
```

---

## 🚀 How to Run

Since this is a static, client-side application, you don't need any servers or build tools.

1. **Clone or download** this repository to your local machine.
   ```bash
   git clone https://github.com/icedkley/Northforge-Phishing-Attack-Demo.git
   ```
2. **Navigate** into the project folder.
3. **Open `index.html`** in any modern web browser (Chrome, Firefox, Edge, Safari).
4. **Follow the simulation**: 
   - Try logging into the legitimate portal with the demo account:  
     **Email**: `student@northfield.edu`  
     **Password**: `demo1234`
   - Click the link to open the attacker's clone (`indx.html`) and observe the differences.
   - Submit credentials on the clone and proceed to the **Debrief** page to see the educational breakdown.

---

## 🚩 Educational Takeaways: Red Flags Covered

The debrief module teaches users to spot these common phishing indicators:

1. **URL Discrepancies**: The clone uses `indx.html` instead of `index.html` (simulating typosquatting).
2. **False Urgency**: Attackers use messages like "Your session has expired" to rush victims into making mistakes.
3. **Fake Success States**: The clone shows a fake dashboard to keep the victim calm after stealing their data.
4. **Missing Security Indicators**: The clone's "Secure" badge is just static text, not a real browser HTTPS indicator.
5. **Harvesting Secondary Flows**: The clone also imitates the "Forgot Password" flow to collect additional email addresses.
6. **Weaker Validation**: The real site enforces password strength; the clone accepts *any* input because the attacker just wants to capture what the user types.

---

## 🛡️ Best Practices Reinforced

- Always type university/corporate URLs directly or use trusted bookmarks.
- Carefully inspect the domain name for subtle misspellings or extra subdomains.
- Enable Multi-Factor Authentication (MFA) wherever possible.
- Use a password manager (it will refuse to autofill credentials on mismatched domains).
- Never enter credentials after clicking links in unsolicited emails or SMS messages.

---

## 🛠️ Technologies Used

- **HTML5** (51%)
- **JavaScript** (33.6%)
- **CSS3** (15.4%)

---

## 📜 License

This project is intended for educational use. Feel free to fork, modify, and use this simulation for internal security awareness training within your organization or educational institution. 

*Built for Northforge Security Awareness Training.*

