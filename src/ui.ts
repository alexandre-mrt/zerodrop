function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

function layout(title: string, content: string): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | ZeroDrop</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0a;
      color: #e5e5e5;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container { max-width: 520px; width: 100%; padding: 2rem; }
    .logo {
      text-align: center;
      margin-bottom: 2rem;
    }
    .logo h1 {
      font-size: 2rem;
      font-weight: 800;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .logo p { color: #737373; font-size: 0.875rem; margin-top: 0.25rem; }
    .card {
      background: #171717;
      border: 1px solid #262626;
      border-radius: 1rem;
      padding: 2rem;
    }
    .dropzone {
      border: 2px dashed #404040;
      border-radius: 0.75rem;
      padding: 3rem 1.5rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .dropzone:hover, .dropzone.active { border-color: #3b82f6; background: #1a1a2e; }
    .dropzone svg { width: 48px; height: 48px; color: #525252; margin-bottom: 1rem; }
    .dropzone p { color: #737373; font-size: 0.875rem; }
    .dropzone .highlight { color: #3b82f6; font-weight: 600; }
    .options { margin-top: 1.5rem; }
    .options label {
      display: block;
      font-size: 0.75rem;
      color: #a3a3a3;
      margin-bottom: 0.25rem;
      margin-top: 0.75rem;
    }
    .options input, .options select {
      width: 100%;
      background: #262626;
      border: 1px solid #404040;
      border-radius: 0.5rem;
      padding: 0.5rem 0.75rem;
      color: #e5e5e5;
      font-size: 0.875rem;
    }
    .btn {
      display: inline-block;
      width: 100%;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      color: white;
      border: none;
      border-radius: 0.5rem;
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 1.5rem;
      text-align: center;
      text-decoration: none;
    }
    .btn:hover { opacity: 0.9; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .result {
      margin-top: 1.5rem;
      background: #1a2e1a;
      border: 1px solid #2a5a2a;
      border-radius: 0.75rem;
      padding: 1rem;
      display: none;
    }
    .result.show { display: block; }
    .result a { color: #4ade80; word-break: break-all; }
    .result .copy-btn {
      background: #2a5a2a;
      border: none;
      color: #4ade80;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      cursor: pointer;
      font-size: 0.75rem;
      margin-left: 0.5rem;
    }
    .file-info {
      text-align: center;
      margin-bottom: 1.5rem;
    }
    .file-info .icon { font-size: 3rem; margin-bottom: 0.5rem; }
    .file-info .name { font-weight: 600; font-size: 1.125rem; word-break: break-all; }
    .file-info .size { color: #737373; font-size: 0.875rem; }
    .file-info .meta { color: #525252; font-size: 0.75rem; margin-top: 0.5rem; }
    .progress {
      width: 100%;
      height: 4px;
      background: #262626;
      border-radius: 2px;
      margin-top: 1rem;
      overflow: hidden;
      display: none;
    }
    .progress.show { display: block; }
    .progress .bar {
      height: 100%;
      background: linear-gradient(90deg, #3b82f6, #8b5cf6);
      width: 0%;
      transition: width 0.3s;
    }
    .error { color: #ef4444; text-align: center; padding: 2rem; }
    .badge {
      display: inline-block;
      background: #262626;
      color: #a3a3a3;
      padding: 0.125rem 0.5rem;
      border-radius: 1rem;
      font-size: 0.75rem;
    }
    .footer {
      text-align: center;
      margin-top: 1.5rem;
      color: #525252;
      font-size: 0.75rem;
    }
    .footer a { color: #737373; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <h1>ZeroDrop</h1>
      <p>Decentralized file sharing on 0G</p>
    </div>
    ${content}
    <div class="footer">
      Powered by <a href="https://0g.ai" target="_blank">0G Storage</a>
    </div>
  </div>
</body>
</html>`;
}

function homePage(): string {
	return layout(
		"Share Files",
		`
    <div class="card">
      <form id="upload-form" enctype="multipart/form-data">
        <div class="dropzone" id="dropzone">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <p><span class="highlight">Click to upload</span> or drag and drop</p>
          <p style="margin-top:0.25rem">Up to 100 MB, stored on 0G decentralized storage</p>
          <input type="file" name="file" id="file-input" style="display:none" />
        </div>

        <div id="file-selected" style="display:none; margin-top:1rem; text-align:center;">
          <p style="font-weight:600" id="selected-name"></p>
          <p style="color:#737373;font-size:0.875rem" id="selected-size"></p>
        </div>

        <div class="options">
          <label>Password protection (optional)</label>
          <input type="password" name="password" placeholder="Leave empty for no password" />

          <label>Expires after</label>
          <select name="expiryHours">
            <option value="24">24 hours</option>
            <option value="168" selected>7 days</option>
            <option value="720">30 days</option>
          </select>

          <label>Max downloads (optional)</label>
          <input type="number" name="maxDownloads" placeholder="Unlimited" min="1" />
        </div>

        <div class="progress" id="progress"><div class="bar" id="progress-bar"></div></div>
        <button type="submit" class="btn" id="upload-btn">Upload & Share</button>
      </form>

      <div class="result" id="result">
        <p style="font-size:0.875rem;margin-bottom:0.5rem">Share this link:</p>
        <div style="display:flex;align-items:center">
          <a href="#" id="share-link" target="_blank"></a>
          <button class="copy-btn" onclick="navigator.clipboard.writeText(document.getElementById('share-link').href)">Copy</button>
        </div>
      </div>
    </div>

    <script>
      const dropzone = document.getElementById('dropzone');
      const fileInput = document.getElementById('file-input');
      const form = document.getElementById('upload-form');
      const uploadBtn = document.getElementById('upload-btn');
      const progress = document.getElementById('progress');
      const progressBar = document.getElementById('progress-bar');
      const result = document.getElementById('result');

      dropzone.addEventListener('click', () => fileInput.click());
      dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('active'); });
      dropzone.addEventListener('dragleave', () => dropzone.classList.remove('active'));
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('active');
        fileInput.files = e.dataTransfer.files;
        showSelected();
      });
      fileInput.addEventListener('change', showSelected);

      function showSelected() {
        if (fileInput.files.length > 0) {
          const f = fileInput.files[0];
          document.getElementById('selected-name').textContent = f.name;
          document.getElementById('selected-size').textContent = formatBytes(f.size);
          document.getElementById('file-selected').style.display = 'block';
        }
      }

      function formatBytes(b) {
        if (b === 0) return '0 B';
        const k = 1024, s = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(b) / Math.log(k));
        return parseFloat((b / Math.pow(k, i)).toFixed(1)) + ' ' + s[i];
      }

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!fileInput.files.length) return alert('Please select a file');

        uploadBtn.disabled = true;
        uploadBtn.textContent = 'Uploading to 0G...';
        progress.classList.add('show');
        progressBar.style.width = '30%';

        const formData = new FormData(form);

        try {
          progressBar.style.width = '60%';
          const res = await fetch('/api/upload', { method: 'POST', body: formData });
          progressBar.style.width = '90%';
          const data = await res.json();

          if (data.success) {
            progressBar.style.width = '100%';
            const link = document.getElementById('share-link');
            link.href = data.drop.url;
            link.textContent = data.drop.url;
            result.classList.add('show');
            uploadBtn.textContent = 'Upload another';
            uploadBtn.disabled = false;
          } else {
            alert(data.error || 'Upload failed');
            uploadBtn.textContent = 'Upload & Share';
            uploadBtn.disabled = false;
          }
        } catch (err) {
          alert('Upload failed: ' + err.message);
          uploadBtn.textContent = 'Upload & Share';
          uploadBtn.disabled = false;
        }

        progress.classList.remove('show');
      });
    </script>`,
	);
}

function downloadPage(drop: {
	id: string;
	fileName: string;
	fileSize: number;
	hasPassword: boolean;
	downloads: number;
	maxDownloads: number | null;
	expiresAt: number | null;
}): string {
	const expiryText = drop.expiresAt
		? `Expires ${new Date(drop.expiresAt * 1000).toLocaleDateString()}`
		: "No expiry";

	const downloadsText = drop.maxDownloads
		? `${drop.downloads}/${drop.maxDownloads} downloads`
		: `${drop.downloads} downloads`;

	return layout(
		`Download ${drop.fileName}`,
		`
    <div class="card">
      <div class="file-info">
        <div class="icon">📄</div>
        <div class="name">${escapeHtml(drop.fileName)}</div>
        <div class="size">${formatBytes(drop.fileSize)}</div>
        <div class="meta">
          <span class="badge">${downloadsText}</span>
          <span class="badge">${expiryText}</span>
        </div>
      </div>

      ${
				drop.hasPassword
					? `
        <div>
          <label style="display:block;font-size:0.75rem;color:#a3a3a3;margin-bottom:0.25rem">This file is password protected</label>
          <input type="password" id="password" placeholder="Enter password" style="width:100%;background:#262626;border:1px solid #404040;border-radius:0.5rem;padding:0.5rem 0.75rem;color:#e5e5e5;font-size:0.875rem" />
        </div>`
					: ""
			}

      <a href="#" class="btn" id="download-btn" onclick="downloadFile(event)">Download File</a>
    </div>

    <script>
      async function downloadFile(e) {
        e.preventDefault();
        const btn = document.getElementById('download-btn');
        btn.textContent = 'Downloading from 0G...';

        let url = '/api/${drop.id}/download';
        ${
					drop.hasPassword
						? `
        const pw = document.getElementById('password').value;
        if (!pw) { alert('Password required'); btn.textContent = 'Download File'; return; }
        url += '?password=' + encodeURIComponent(pw);`
						: ""
				}

        try {
          const res = await fetch(url);
          if (!res.ok) {
            const data = await res.json();
            alert(data.error || 'Download failed');
            btn.textContent = 'Download File';
            return;
          }

          const blob = await res.blob();
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = '${escapeHtml(drop.fileName)}';
          a.click();
          URL.revokeObjectURL(a.href);
          btn.textContent = 'Downloaded!';
        } catch (err) {
          alert('Download failed');
          btn.textContent = 'Download File';
        }
      }
    </script>`,
	);
}

function errorPage(title: string, message: string): string {
	return layout(
		title,
		`
    <div class="card">
      <div class="error">
        <p style="font-size:3rem;margin-bottom:1rem">😕</p>
        <h2 style="font-size:1.25rem;margin-bottom:0.5rem">${escapeHtml(title)}</h2>
        <p style="color:#737373">${escapeHtml(message)}</p>
        <a href="/" class="btn" style="margin-top:1.5rem;display:inline-block;width:auto;padding:0.5rem 2rem;font-size:0.875rem">Upload a file</a>
      </div>
    </div>`,
	);
}

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

export const html = { homePage, downloadPage, errorPage };
