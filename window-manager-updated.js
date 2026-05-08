/**
 * AetherNode Desktop - Window Manager UPDATED
 * Mit Terminal-Style Guide
 */

// Die getGuideHTML() Funktion mit Terminal-Stil ersetzen
const updatedGetGuideHTML = function() {
    return `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AETHERNODE MANUAL // v2.0</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-primary: #020608;
            --bg-secondary: #080f14;
            --bg-tertiary: #0d1a22;
            --text-primary: #b8f0c8;
            --text-secondary: #4a8a5e;
            --text-dim: #2a4a35;
            --accent: #00ff88;
            --accent-dim: rgba(0, 255, 136, 0.12);
            --accent-glow: rgba(0, 255, 136, 0.35);
            --accent-border: rgba(0, 255, 136, 0.22);
            --note: #38bdf8;
            --note-dim: rgba(56, 189, 248, 0.12);
            --note-border: rgba(56, 189, 248, 0.25);
            --danger: #ff3355;
            --danger-dim: rgba(255, 51, 85, 0.12);
            --danger-border: rgba(255, 51, 85, 0.3);
            --warn: #f0a020;
            --warn-dim: rgba(240, 160, 32, 0.12);
            --warn-border: rgba(240, 160, 32, 0.25);
            --mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            background: var(--bg-primary);
            background-image:
                radial-gradient(ellipse at 20% 50%, rgba(0, 40, 25, 0.15) 0%, transparent 60%),
                radial-gradient(ellipse at 80% 20%, rgba(0, 20, 40, 0.1) 0%, transparent 50%);
            color: var(--text-primary);
            font-family: var(--mono);
            line-height: 1.6;
            margin: 0;
            padding: 0;
            min-height: 100vh;
        }
        
        .terminal-container {
            background: var(--bg-secondary);
            border: 1px solid var(--accent-border);
            box-shadow: 0 0 0 1px rgba(0, 255, 136, .05), 0 0 60px rgba(0, 0, 0, .8);
            margin: 20px;
            min-height: calc(100vh - 40px);
        }
        
        .terminal-header {
            padding: 10px 20px;
            background: rgba(0, 255, 136, .04);
            border-bottom: 1px solid var(--accent-border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            font-size: .8rem;
            font-weight: 700;
            color: var(--accent);
            text-transform: uppercase;
            letter-spacing: 3px;
            text-shadow: 0 0 10px var(--accent-glow);
        }
        
        .logo::before { content: '> '; opacity: .5; }
        
        .terminal-controls { display: flex; gap: 8px; }
        .control { width: 11px; height: 11px; border-radius: 50%; border: 1px solid rgba(255, 255, 255, .1); }
        .red { background: #ff5f56; }
        .yellow { background: #ffbd2e; }
        .green { background: #27c93f; }
        
        .content { padding: 24px; }
        
        .section {
            margin-bottom: 32px;
            padding: 20px;
            background: rgba(0, 255, 136, .02);
            border-left: 2px solid var(--accent-border);
        }
        
        .section-title {
            font-size: .9rem;
            color: var(--accent);
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 16px;
            text-shadow: 0 0 10px var(--accent-glow);
        }
        
        .section-title::before { content: '> '; color: var(--accent); opacity: .7; }
        
        .step-list {
            list-style: none;
            counter-reset: step-counter;
        }
        
        .step-item {
            counter-increment: step-counter;
            margin-bottom: 12px;
            padding: 10px 14px;
            background: rgba(0, 255, 136, .03);
            border-left: 2px solid var(--accent-border);
            position: relative;
        }
        
        .step-item::before {
            content: counter(step-counter);
            position: absolute;
            left: -8px;
            top: 50%;
            transform: translateY(-50%);
            background: var(--accent);
            color: var(--bg-primary);
            width: 16px;
            height: 16px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: .6rem;
            font-weight: bold;
        }
        
        .step-content { margin-left: 16px; }
        .step-title { font-size: .8rem; color: var(--accent); font-weight: 500; margin-bottom: 4px; }
        .step-desc { font-size: .7rem; color: var(--text-secondary); line-height: 1.5; }
        
        .code-inline {
            background: rgba(0, 0, 0, .4);
            color: var(--accent);
            padding: 2px 6px;
            font-family: var(--mono);
            font-size: .65rem;
            border-radius: 3px;
            letter-spacing: .5px;
        }
        
        .warning-box {
            background: var(--warn-dim);
            border: 1px solid var(--warn-border);
            padding: 12px;
            margin: 12px 0;
            border-radius: 4px;
        }
        
        .warning-box::before {
            content: '⚠ WARNING: ';
            color: var(--warn);
            font-weight: bold;
            font-size: .65rem;
            letter-spacing: 1px;
        }
        
        .warning-text { color: var(--warn); font-size: .7rem; line-height: 1.4; }
        
        .success-box {
            background: var(--accent-dim);
            border: 1px solid var(--accent-border);
            padding: 12px;
            margin: 12px 0;
            border-radius: 4px;
        }
        
        .success-box::before {
            content: '✓ SUCCESS: ';
            color: var(--accent);
            font-weight: bold;
            font-size: .65rem;
            letter-spacing: 1px;
        }
        
        .success-text { color: var(--accent); font-size: .7rem; line-height: 1.4; }
        
        .info-box {
            background: var(--note-dim);
            border: 1px solid var(--note-border);
            padding: 12px;
            margin: 12px 0;
            border-radius: 4px;
        }
        
        .info-box::before {
            content: 'ℹ INFO: ';
            color: var(--note);
            font-weight: bold;
            font-size: .65rem;
            letter-spacing: 1px;
        }
        
        .info-text { color: var(--note); font-size: .7rem; line-height: 1.4; }
        
        .app-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 14px;
            margin: 16px 0;
        }
        
        .app-item {
            background: var(--bg-tertiary);
            border: 1px solid var(--accent-border);
            padding: 14px;
            position: relative;
        }
        
        .app-item::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, var(--accent), transparent);
            opacity: .6;
        }
        
        .app-icon { font-size: 1.5rem; margin-bottom: 8px; }
        .app-name {
            font-size: .7rem;
            color: var(--accent);
            font-weight: 500;
            margin-bottom: 4px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .app-desc { font-size: .6rem; color: var(--text-secondary); line-height: 1.4; }
        
        .highlight {
            background: var(--accent-dim);
            color: var(--accent);
            padding: 1px 4px;
            font-weight: bold;
            font-size: .65rem;
            letter-spacing: .5px;
        }
        
        .bullet-list { list-style: none; margin: 8px 0; }
        .bullet-item {
            position: relative;
            padding-left: 16px;
            margin-bottom: 6px;
            font-size: .7rem;
            color: var(--text-secondary);
        }
        .bullet-item::before {
            content: '▸';
            position: absolute;
            left: 0;
            color: var(--accent);
            font-size: .8rem;
        }
        
        .terminal-prompt {
            font-family: var(--mono);
            background: var(--bg-primary);
            color: var(--accent);
            padding: 8px 12px;
            border-left: 3px solid var(--accent);
            margin: 12px 0;
            font-size: .7rem;
            letter-spacing: .5px;
        }
        .terminal-prompt::before { content: '$ '; color: var(--accent); opacity: .7; }
        
        .main-title {
            text-align: center;
            font-size: 1.2rem;
            color: var(--accent);
            text-transform: uppercase;
            letter-spacing: 4px;
            margin-bottom: 8px;
            text-shadow: 0 0 20px var(--accent-glow);
        }
        
        .subtitle {
            text-align: center;
            font-size: .6rem;
            color: var(--text-secondary);
            letter-spacing: 2px;
            margin-bottom: 32px;
            text-transform: uppercase;
        }
        
        .access-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 16px 0; }
        .access-mode { background: var(--bg-tertiary); border: 1px solid var(--accent-border); padding: 12px; text-align: center; }
        .access-mode.local::before { content: '🖥️'; display: block; font-size: 1.2rem; margin-bottom: 6px; }
        .access-mode.sync::before { content: '☁️'; display: block; font-size: 1.2rem; margin-bottom: 6px; }
        .access-mode.team::before { content: '👥'; display: block; font-size: 1.2rem; margin-bottom: 6px; }
        
        .access-title {
            font-size: .65rem;
            color: var(--accent);
            font-weight: bold;
            margin-bottom: 4px;
            text-transform: uppercase;
        }
        .access-desc { font-size: .6rem; color: var(--text-secondary); line-height: 1.3; }
        
        @media (max-width: 600px) {
            .terminal-container { margin: 0; border: none; min-height: 100vh; }
            .access-grid { grid-template-columns: 1fr; }
            .app-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="terminal-container">
        <header class="terminal-header">
            <div class="logo">AETHERNODE_MANUAL // v2.0</div>
            <div class="terminal-controls">
                <div class="control red"></div>
                <div class="control yellow"></div>
                <div class="control green"></div>
            </div>
        </header>
        
        <div class="content">
            <div class="main-title">🔒 AUTHENTICATION_GUIDE</div>
            <div class="subtitle">ZERO-KNOWLEDGE · LOCAL-FIRST · ENCRYPTED_SYNC</div>
            
            <div class="section">
                <div class="section-title">SYSTEM_OVERVIEW</div>
                <div class="info-box">
                    <div class="info-text">
                        AetherNode applications use a <span class="highlight">ZERO-KNOWLEDGE</span> authentication system. 
                        No registration required. Data stored <span class="highlight">LOCALLY</span> by default.
                    </div>
                </div>
                
                <div class="warning-box">
                    <div class="warning-text">
                        All data is stored in your <span class="highlight">BROWSER ONLY</span>. 
                        Clearing browser data will <span class="highlight">DELETE ALL CONTENT</span>.
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">AUTHENTICATION_PROTOCOL</div>
                
                <div class="terminal-prompt">INITIAL ACCESS SEQUENCE</div>
                <ol class="step-list">
                    <li class="step-item">
                        <div class="step-content">
                            <div class="step-title">LAUNCH_APPLICATION</div>
                            <div class="step-desc">Open any AetherNode app (Notes, Calendar, Projects, Tools)</div>
                        </div>
                    </li>
                    <li class="step-item">
                        <div class="step-content">
                            <div class="step-title">INPUT_MASTER_PASSWORD</div>
                            <div class="step-desc">Enter <span class="highlight">ANY PASSWORD</span>: <span class="code-inline">test123</span>, <span class="code-inline">mypassword</span>, etc.</div>
                        </div>
                    </li>
                    <li class="step-item">
                        <div class="step-content">
                            <div class="step-title">EXECUTE_LOGIN</div>
                            <div class="step-desc">Press <span class="highlight">ENTER</span>. Local vault created automatically.</div>
                        </div>
                    </li>
                </ol>
                
                <div class="success-box">
                    <div class="success-text">Authentication successful. Application access granted.</div>
                </div>
                
                <div class="terminal-prompt">SUBSEQUENT ACCESS PROTOCOL</div>
                <ul class="bullet-list">
                    <li class="bullet-item">Use <span class="highlight">IDENTICAL PASSWORD</span> from setup</li>
                    <li class="bullet-item">Case-sensitive authentication required</li>
                    <li class="bullet-item">All stored data restored automatically</li>
                </ul>
                
                <div class="warning-box">
                    <div class="warning-text">Password is <span class="highlight">UNRECOVERABLE</span>. Store securely.</div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">STORAGE_PROTOCOLS</div>
                
                <div class="access-grid">
                    <div class="access-mode local">
                        <div class="access-title">LOCAL_ONLY</div>
                        <div class="access-desc">Browser storage encryption. No network deps. Maximum privacy.</div>
                    </div>
                    <div class="access-mode sync">
                        <div class="access-title">CLOUD_SYNC</div>
                        <div class="access-desc">Encrypted remote backup. Cross-device access. Requires VAULT_ID.</div>
                    </div>
                    <div class="access-mode team">
                        <div class="access-title">COLLABORATION</div>
                        <div class="access-desc">Multi-user projects. Shared keys. Requires TEAM_SECRET.</div>
                    </div>
                </div>
                
                <div class="terminal-prompt">SYNC ACTIVATION SEQUENCE</div>
                <ol class="step-list">
                    <li class="step-item">
                        <div class="step-content">
                            <div class="step-title">LOCATE_SYNC_CONTROL</div>
                            <div class="step-desc">Find <span class="highlight">[SYNC]</span> button in app interface</div>
                        </div>
                    </li>
                    <li class="step-item">
                        <div class="step-content">
                            <div class="step-title">ENCRYPT_AND_UPLOAD</div>
                            <div class="step-desc">Data encrypted client-side before transmission</div>
                        </div>
                    </li>
                    <li class="step-item">
                        <div class="step-content">
                            <div class="step-title">RECORD_VAULT_ID</div>
                            <div class="step-desc">System generates <span class="highlight">VAULT_ID</span>. <span class="code-inline">SAVE THIS IMMEDIATELY</span></div>
                        </div>
                    </li>
                </ol>
                
                <div class="info-box">
                    <div class="info-text">Cross-device access: <span class="highlight">PASSWORD + VAULT_ID</span></div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">APPLICATION_MATRIX</div>
                
                <div class="app-grid">
                    <div class="app-item">
                        <div class="app-icon">📝</div>
                        <div class="app-name">NOTES_&_TASKS</div>
                        <div class="app-desc">Personal productivity. Task management. Local + Sync modes.</div>
                    </div>
                    
                    <div class="app-item">
                        <div class="app-icon">📅</div>
                        <div class="app-name">CALENDAR_SYSTEM</div>
                        <div class="app-desc">Event scheduling. Cross-device sync. Encrypted backup.</div>
                    </div>
                    
                    <div class="app-item">
                        <div class="app-icon">📊</div>
                        <div class="app-name">PROJECT_VAULT</div>
                        <div class="app-desc">Team collaboration. Multi-user management. Advanced security.</div>
                    </div>
                    
                    <div class="app-item">
                        <div class="app-icon">🛠️</div>
                        <div class="app-name">UTILITY_SUITE</div>
                        <div class="app-desc">Developer tools. Productivity utilities. Standalone apps.</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">COLLABORATION_PROTOCOL</div>
                <div class="terminal-prompt">Available in PROJECT applications only</div>
                
                <ul class="bullet-list">
                    <li class="bullet-item">Additional <span class="highlight">TEAM_SECRET</span> generated</li>
                    <li class="bullet-item">Share secret with authorized team members</li>
                    <li class="bullet-item">All members need: <span class="highlight">PASSWORD + VAULT_ID + TEAM_SECRET</span></li>
                </ul>
                
                <div class="warning-box">
                    <div class="warning-text">TEAM_SECRET grants <span class="highlight">FULL PROJECT ACCESS</span>. Share carefully.</div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">TROUBLESHOOTING_MATRIX</div>
                
                <div class="terminal-prompt">ACCESS DENIED - Check password case sensitivity</div>
                <div class="terminal-prompt">DATA LOST - Use PASSWORD + VAULT_ID to restore</div>
                <div class="terminal-prompt">TEAM SYNC FAILED - Verify all credentials match</div>
                
                <div class="info-box">
                    <div class="info-text">
                        Common issues: Password case mismatch, missing VAULT_ID, incorrect TEAM_SECRET
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">EXAMPLE_WORKFLOW</div>
                
                <div class="terminal-prompt">Complete setup sequence</div>
                <ol class="step-list">
                    <li class="step-item">
                        <div class="step-content">
                            <div class="step-title">INITIAL_SETUP</div>
                            <div class="step-desc">Password: <span class="code-inline">mysecurepass2024</span></div>
                        </div>
                    </li>
                    <li class="step-item">
                        <div class="step-content">
                            <div class="step-title">CREATE_CONTENT</div>
                            <div class="step-desc">Add notes, tasks, events, projects</div>
                        </div>
                    </li>
                    <li class="step-item">
                        <div class="step-content">
                            <div class="step-title">ENABLE_SYNC</div>
                            <div class="step-desc">Click [SYNC] → VAULT_ID: <span class="code-inline">a1b2c3-d4e5f6</span></div>
                        </div>
                    </li>
                    <li class="step-item">
                        <div class="step-content">
                            <div class="step-title">BACKUP_CREDENTIALS</div>
                            <div class="step-desc">Store PASSWORD + VAULT_ID securely</div>
                        </div>
                    </li>
                    <li class="step-item">
                        <div class="step-content">
                            <div class="step-title">CROSS_DEVICE_ACCESS</div>
                            <div class="step-desc">Use credentials on any device</div>
                        </div>
                    </li>
                </ol>
            </div>
        </div>
    </div>
</body>
</html>
    `;
};

// Das ist das Update für den WindowManager
console.log('Terminal-Style Guide HTML bereit für Integration');